const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let filePath = null;
let fileWatcher = null;

const recentFilesPath = path.join(app.getPath('userData'), 'recent-files.json');

function getRecentFiles() {
  try {
    if (fs.existsSync(recentFilesPath)) {
      const data = fs.readFileSync(recentFilesPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading recent files:', error);
  }
  return [];
}

function addRecentFile(filePath) {
  try {
    let recent = getRecentFiles();
    recent = recent.filter(f => f !== filePath);
    recent.unshift(filePath);
    recent = recent.slice(0, 5);
    fs.writeFileSync(recentFilesPath, JSON.stringify(recent, null, 2));
    return recent;
  } catch (error) {
    console.error('Error saving recent file:', error);
    return [];
  }
}

autoUpdater.logger = console;
autoUpdater.autoDownload = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    const distPath = path.join(__dirname, '../../dist/index.html');
    mainWindow.loadFile(distPath);
  }

  mainWindow.on('closed', () => {
    if (fileWatcher) {
      fileWatcher.close();
    }
    mainWindow = null;
  });
}

function loadMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function watchFile(filePath) {
  if (fileWatcher) {
    fileWatcher.close();
  }

  fileWatcher = chokidar.watch(filePath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });

  fileWatcher.on('change', () => {
    const result = loadMarkdownFile(filePath);
    if (result.success && mainWindow) {
      mainWindow.webContents.send('markdown-updated', result.content);
    }
  });
}

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `A new version ${info.version} is available. Do you want to download it now?`,
    buttons: ['Yes', 'No']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.setProgressBar(progressObj.percent / 100);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.setProgressBar(-1);
  }

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: `Version ${info.version} has been downloaded. Restart the application to apply the update?`,
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
});

function checkForUpdates() {
  if (process.argv.includes('--dev')) {
    return;
  }

  autoUpdater.checkForUpdates();
}

app.whenReady().then(() => {
  const args = process.argv.slice(1);

  const fileArg = args.find(arg => !arg.startsWith('--') && arg.endsWith('.md'));

  if (fileArg) {
    filePath = path.resolve(fileArg);

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      filePath = null;
    }
  }

  createWindow();

  setTimeout(() => {
    checkForUpdates();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-markdown-file', () => {
  if (!filePath) {
    return { success: false, error: 'No file path provided', hasFile: false };
  }

  const result = loadMarkdownFile(filePath);

  if (result.success) {
    watchFile(filePath);
    addRecentFile(filePath);
  }

  return { ...result, hasFile: true };
});

ipcMain.handle('navigate-to-file', (event, targetPath) => {
  const currentDir = filePath ? path.dirname(filePath) : process.cwd();

  const pathWithoutAnchor = targetPath.split('#')[0];

  let newFilePath;

  if (path.isAbsolute(pathWithoutAnchor)) {
    newFilePath = pathWithoutAnchor;
  } else {
    newFilePath = path.resolve(currentDir, pathWithoutAnchor);
  }

  if (!fs.existsSync(newFilePath)) {
    return { success: false, error: `File not found: ${newFilePath}` };
  }

  filePath = newFilePath;

  const result = loadMarkdownFile(filePath);

  if (result.success) {
    watchFile(filePath);
    addRecentFile(filePath);
  }

  return result;
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  const selectedPath = result.filePaths[0];
  filePath = selectedPath;

  const fileResult = loadMarkdownFile(filePath);

  if (fileResult.success) {
    watchFile(filePath);
    addRecentFile(filePath);
  }

  return fileResult;
});

ipcMain.handle('get-recent-files', () => {
  return getRecentFiles().filter(f => fs.existsSync(f));
});

ipcMain.handle('add-recent-file', (event, file) => {
  return addRecentFile(file);
});

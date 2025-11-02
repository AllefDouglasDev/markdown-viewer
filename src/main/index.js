const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { autoUpdater } = require('electron-updater');
const { spawn, exec } = require('child_process');
const config = require('./config');

let mainWindow;
let filePath = null;
let fileWatcher = null;
let directoryWatcher = null;

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
    if (directoryWatcher) {
      directoryWatcher.close();
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

function findDefaultFile(tree, rootPath) {
  const readmePath = path.join(rootPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    return readmePath;
  }

  function findFirstMarkdown(items) {
    for (const item of items) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        return item.path;
      }
    }
    for (const item of items) {
      if (item.type === 'directory' && item.children) {
        const found = findFirstMarkdown(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  return findFirstMarkdown(tree);
}

function readDirectoryTree(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return { success: false, error: 'Directory not found' };
    }

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      return { success: false, error: 'Path is not a directory' };
    }

    function buildTree(currentPath) {
      const items = fs.readdirSync(currentPath);
      const tree = [];

      for (const item of items) {
        if (item.startsWith('.')) continue;

        const itemPath = path.join(currentPath, item);
        const itemStats = fs.statSync(itemPath);

        if (itemStats.isDirectory()) {
          const children = buildTree(itemPath);

          if (children.length > 0) {
            tree.push({
              name: item,
              path: itemPath,
              type: 'directory',
              children
            });
          }
        } else if (itemStats.isFile() && item.endsWith('.md')) {
          tree.push({
            name: item,
            path: itemPath,
            type: 'file'
          });
        }
      }

      return tree.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    }

    const tree = buildTree(dirPath);
    const defaultFile = findDefaultFile(tree, dirPath);
    return { success: true, tree, rootPath: dirPath, defaultFile };
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

function watchDirectory(dirPath) {
  if (directoryWatcher) {
    directoryWatcher.close();
  }

  directoryWatcher = chokidar.watch('**/*.md', {
    cwd: dirPath,
    persistent: true,
    ignoreInitial: true,
    depth: 5,
    ignored: /(^|[\/\\])\.|node_modules|\.git/,
    usePolling: false,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });

  let updateTimeout;
  const updateTree = () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      const result = readDirectoryTree(dirPath);
      if (result.success && mainWindow) {
        mainWindow.webContents.send('directory-tree-updated', result.tree);
      }
    }, 500);
  };

  directoryWatcher.on('add', updateTree);
  directoryWatcher.on('addDir', updateTree);
  directoryWatcher.on('unlink', updateTree);
  directoryWatcher.on('unlinkDir', updateTree);
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

autoUpdater.on('error', (_err) => {
	if (mainWindow) {
		mainWindow.setProgressBar(-1);
	}
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

ipcMain.handle('navigate-to-file', (_event, targetPath) => {
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

ipcMain.handle('add-recent-file', (_event, file) => {
  return addRecentFile(file);
});

ipcMain.handle('get-directory-tree', (_event, rootPath) => {
  let dirPath = rootPath;

  if (!dirPath && filePath) {
    dirPath = path.dirname(filePath);
  } else if (!dirPath) {
    dirPath = process.cwd();
  }

  const result = readDirectoryTree(dirPath);

  if (result.success) {
    watchDirectory(dirPath);
  }

  return result;
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  const selectedPath = result.filePaths[0];
  const treeResult = readDirectoryTree(selectedPath);

  if (treeResult.success) {
    watchDirectory(selectedPath);
    addRecentFile(selectedPath);
  }

  return treeResult;
});

ipcMain.handle('open-in-explorer', async (_event, targetPath) => {
  try {
    shell.showItemInFolder(targetPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-in-editor', async (_event, targetPath, line, editorType) => {
  try {
    const editorConfig = config.readConfig();
    const editorKey = editorType || editorConfig.editor.type;
    const preset = editorConfig.editorPresets[editorKey];

    if (!preset) {
      return { success: false, error: 'Editor preset not found' };
    }

    if (preset.useShell) {
      await shell.openPath(targetPath);
      return { success: true };
    }

    const lineNumber = line || 1;
    const args = preset.args.map(arg =>
      arg.replace('{file}', targetPath).replace('{line}', lineNumber)
    );

    if (preset.terminal) {
      if (process.platform === 'darwin') {
        const command = `${preset.command} ${args.join(' ')}`;
        exec(`osascript -e 'tell app "Terminal" to do script "${command}"'`);
      } else if (process.platform === 'win32') {
        spawn('cmd.exe', ['/c', 'start', preset.command, ...args]);
      } else {
        spawn('x-terminal-emulator', ['-e', preset.command, ...args]);
      }
    } else {
      spawn(preset.command, args, { detached: true, stdio: 'ignore' });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-editor-config', () => {
  try {
    return { success: true, config: config.readConfig() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-config-file', async () => {
  try {
    const configPath = config.getConfigPath();
    await shell.openPath(configPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('detect-available-editors', async () => {
  try {
    const editors = await config.detectAvailableEditors();
    return { success: true, editors };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

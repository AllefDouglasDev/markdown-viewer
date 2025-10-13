const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let filePath = null;
let fileWatcher = null;

// Configure auto-updater
autoUpdater.logger = console;
autoUpdater.autoDownload = false; // Don't auto-download, ask user first

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // In development, load from webpack-dev-server
  // In production, load the built file
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // Load from dist directory (webpack output)
    const distPath = path.join(__dirname, '../../dist/index.html');
    console.log('Loading file from:', distPath);
    mainWindow.loadFile(distPath).catch(err => {
      console.error('Failed to load file:', err);
    });
  }

  // Debug: log when window is shown
  mainWindow.on('show', () => {
    console.log('Window is now visible');
  });

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
  // Close previous watcher if exists
  if (fileWatcher) {
    fileWatcher.close();
  }

  console.log('Watching file for changes:', filePath);

  // Watch for file changes using chokidar (more reliable than fs.watch)
  fileWatcher = chokidar.watch(filePath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });

  fileWatcher.on('change', () => {
    console.log('File changed! Reloading content...');
    const result = loadMarkdownFile(filePath);
    if (result.success && mainWindow) {
      mainWindow.webContents.send('markdown-updated', result.content);
      console.log('Content sent to renderer');
    }
  });

  fileWatcher.on('error', (error) => {
    console.error('Watcher error:', error);
  });
}

// Auto-updater event handlers
autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);

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
  console.log('No updates available');
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);

  if (mainWindow) {
    mainWindow.setProgressBar(progressObj.percent / 100);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);

  if (mainWindow) {
    mainWindow.setProgressBar(-1); // Remove progress bar
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
  console.error('Update error:', err);
});

function checkForUpdates() {
  // Don't check for updates in development mode
  if (process.argv.includes('--dev')) {
    console.log('Skipping update check in development mode');
    return;
  }

  console.log('Checking for updates...');
  autoUpdater.checkForUpdates().catch(err => {
    console.log('Update check failed:', err);
  });
}

app.whenReady().then(() => {
  // Get file path from command line arguments
  const args = process.argv.slice(1);
  console.log('Command line args:', args);

  const fileArg = args.find(arg => !arg.startsWith('--') && arg.endsWith('.md'));

  if (fileArg) {
    filePath = path.resolve(fileArg);
    console.log('Markdown file to load:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Error: File not found:', filePath);
      app.quit();
      return;
    }
  } else {
    console.log('No markdown file specified');
  }

  createWindow();

  // Check for updates after window is created (wait 3 seconds)
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

// IPC handlers
ipcMain.handle('get-markdown-file', () => {
  if (!filePath) {
    return { success: false, error: 'No file path provided' };
  }

  const result = loadMarkdownFile(filePath);

  if (result.success) {
    watchFile(filePath);
  }

  return result;
});

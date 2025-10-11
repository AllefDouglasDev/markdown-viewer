const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let mainWindow;
let filePath = null;
let fileWatcher = null;

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

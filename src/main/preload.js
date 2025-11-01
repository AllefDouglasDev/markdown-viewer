const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMarkdownFile: () => ipcRenderer.invoke('get-markdown-file'),
  onMarkdownUpdated: (callback) => ipcRenderer.on('markdown-updated', (event, content) => callback(content)),
  navigateToFile: (targetPath) => ipcRenderer.invoke('navigate-to-file', targetPath),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  addRecentFile: (filePath) => ipcRenderer.invoke('add-recent-file', filePath),
  getDirectoryTree: (rootPath) => ipcRenderer.invoke('get-directory-tree', rootPath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
});

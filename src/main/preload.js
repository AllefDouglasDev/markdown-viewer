const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMarkdownFile: () => ipcRenderer.invoke('get-markdown-file'),
  onMarkdownUpdated: (callback) => ipcRenderer.on('markdown-updated', (event, content) => callback(content)),
  navigateToFile: (targetPath) => ipcRenderer.invoke('navigate-to-file', targetPath),
});

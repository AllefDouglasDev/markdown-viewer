const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMarkdownFile: () => ipcRenderer.invoke('get-markdown-file'),
  onMarkdownUpdated: (callback) => ipcRenderer.on('markdown-updated', (event, content) => callback(content)),
  onDirectoryTreeUpdated: (callback) => ipcRenderer.on('directory-tree-updated', (event, tree) => callback(tree)),
  navigateToFile: (targetPath) => ipcRenderer.invoke('navigate-to-file', targetPath),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  addRecentFile: (filePath) => ipcRenderer.invoke('add-recent-file', filePath),
  getDirectoryTree: (rootPath) => ipcRenderer.invoke('get-directory-tree', rootPath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openInExplorer: (filePath) => ipcRenderer.invoke('open-in-explorer', filePath),
  openInEditor: (filePath, line, editorType) => ipcRenderer.invoke('open-in-editor', filePath, line, editorType),
  getEditorConfig: () => ipcRenderer.invoke('get-editor-config'),
  openConfigFile: () => ipcRenderer.invoke('open-config-file'),
  detectAvailableEditors: () => ipcRenderer.invoke('detect-available-editors'),
  openHowToUse: () => ipcRenderer.invoke('open-how-to-use'),
});

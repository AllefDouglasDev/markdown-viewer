import React, { useState, useEffect } from 'react';
import { FileText, Folder, Settings } from 'lucide-react';

function WelcomeScreen({ onFileSelected, onFolderSelected }) {
  const [recentFiles, setRecentFiles] = useState([]);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    const files = await window.electronAPI.getRecentFiles();
    setRecentFiles(files);
  };

  const handleOpenFile = async () => {
    const result = await window.electronAPI.openFileDialog();
    if (result.success) {
      onFileSelected(result);
    }
  };

  const handleOpenFolder = async () => {
    const result = await window.electronAPI.openFolderDialog();
    if (result.success && onFolderSelected) {
      onFolderSelected(result);
    }
  };

  const handleRecentFileClick = async (filePath) => {
    const isDirectory = !filePath.endsWith('.md');

    if (isDirectory) {
      const result = await window.electronAPI.getDirectoryTree(filePath);
      if (result.success && onFolderSelected) {
        onFolderSelected(result);
      }
    } else {
      const result = await window.electronAPI.navigateToFile(filePath);
      if (result.success) {
        onFileSelected(result);
      }
    }
  };

  const formatRecentPath = (fullPath) => {
    const pathParts = fullPath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const parentFolder = pathParts[pathParts.length - 2] || '';
    return { fileName, parentFolder };
  };

  const handleOpenConfigFile = async () => {
    await window.electronAPI.openConfigFile();
  };

  return (
    <div className="welcome-screen">
      <button
        className="welcome-config-button"
        onClick={handleOpenConfigFile}
        title="Configure Editors"
      >
        <Settings size={20} />
      </button>
      <div className="welcome-content">
        <img
          src="../../build/icon.svg"
          alt="Markify Logo"
          className="welcome-logo"
        />
        <h1 className="welcome-title">Markify</h1>
        <p className="welcome-subtitle">Open a file or folder to start viewing Markdown</p>

        <div className="welcome-buttons">
          <button className="welcome-button" onClick={handleOpenFile}>
            <FileText size={20} /> Open File
          </button>
          <button className="welcome-button" onClick={handleOpenFolder}>
            <Folder size={20} /> Open Folder
          </button>
        </div>

        {recentFiles.length > 0 && (
          <div className="recent-files">
            <h3>Recently Opened</h3>
            <ul className="recent-files-list">
              {recentFiles.map((file, index) => {
                const { fileName, parentFolder } = formatRecentPath(file);
                return (
                  <li key={index} className="recent-file-item">
                    <button
                      className="recent-file-button"
                      onClick={() => handleRecentFileClick(file)}
                      title={file}
                    >
                      <span className="recent-file-icon">
                        {file.endsWith('.md') ? <FileText size={16} /> : <Folder size={16} />}
                      </span>
                      <div className="recent-file-info">
                        <span className="recent-file-name">{fileName}</span>
                        {parentFolder && <span className="recent-file-folder">{parentFolder}</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeScreen;

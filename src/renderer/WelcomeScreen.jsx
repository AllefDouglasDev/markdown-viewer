import React, { useState, useEffect } from 'react';
import { FileText, Folder } from 'lucide-react';

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
    const result = await window.electronAPI.navigateToFile(filePath);
    if (result.success) {
      onFileSelected(result);
    }
  };

  return (
    <div className="welcome-screen">
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
            <h3>Recent Files</h3>
            <ul className="recent-files-list">
              {recentFiles.map((file, index) => (
                <li key={index} className="recent-file-item">
                  <button
                    className="recent-file-button"
                    onClick={() => handleRecentFileClick(file)}
                  >
                    <span className="recent-file-icon"><FileText size={16} /></span>
                    <span className="recent-file-path">{file}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeScreen;

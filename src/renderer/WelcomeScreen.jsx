import React, { useState, useEffect } from 'react';

function WelcomeScreen({ onFileSelected }) {
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

  const handleRecentFileClick = async (filePath) => {
    const result = await window.electronAPI.navigateToFile(filePath);
    if (result.success) {
      onFileSelected(result);
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">Markdown Viewer</h1>
        <p className="welcome-subtitle">Open a markdown file to get started</p>

        <button className="open-file-button" onClick={handleOpenFile}>
          📂 Open Markdown File
        </button>

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
                    <span className="recent-file-icon">📄</span>
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

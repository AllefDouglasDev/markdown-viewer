import React, { useState } from 'react';

const FileTreeItem = ({ item, selectedFile, onFileSelect, expandedFolders, toggleFolder, level = 0 }) => {
  const isExpanded = expandedFolders.has(item.path);
  const isSelected = selectedFile === item.path;

  const handleClick = () => {
    if (item.type === 'directory') {
      toggleFolder(item.path);
    } else {
      onFileSelect(item.path);
    }
  };

  return (
    <div className="file-tree-item-container">
      <div
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="file-tree-icon">
          {item.type === 'directory' ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="file-tree-name">{item.name}</span>
      </div>
      {item.type === 'directory' && isExpanded && item.children && (
        <div className="file-tree-children">
          {item.children.map((child, index) => (
            <FileTreeItem
              key={`${child.path}-${index}`}
              item={child}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ tree, selectedFile, onFileSelect, sidebarOpen, onToggleSidebar }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        style={{ left: sidebarOpen ? '296px' : '16px' }}
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="file-tree">
          {tree && tree.length > 0 ? (
            tree.map((item, index) => (
              <FileTreeItem
                key={`${item.path}-${index}`}
                item={item}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))
          ) : (
            <div className="file-tree-empty">No markdown files found</div>
          )}
        </div>
      </div>
    </>
  );
};

export default FileTree;

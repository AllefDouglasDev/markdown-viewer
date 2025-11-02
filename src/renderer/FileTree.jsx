import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileText, Menu, ChevronLeft, ChevronRight, Home, FolderIcon, Settings } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const FileTreeItem = ({ item, selectedFile, onFileSelect, expandedFolders, toggleFolder, level = 0, availableEditors }) => {
  const isExpanded = expandedFolders.has(item.path);
  const isSelected = selectedFile === item.path;

  const handleClick = () => {
    if (item.type === 'directory') {
      toggleFolder(item.path);
    } else {
      onFileSelect(item.path);
    }
  };

  const handleOpenInExplorer = async (e) => {
    if (e) e.preventDefault();
    await window.electronAPI.openInExplorer(item.path);
  };

  const handleOpenInEditor = async (editorKey) => {
    await window.electronAPI.openInEditor(item.path, 1, editorKey);
  };

  const handleOpenConfigFile = async () => {
    await window.electronAPI.openConfigFile();
  };

  if (item.type === 'file') {
    return (
      <div className="file-tree-item-container">
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`file-tree-item ${isSelected ? 'selected' : ''}`}
              onClick={handleClick}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <span className="file-tree-icon">
                <FileText size={16} />
              </span>
              <span className="file-tree-name">{item.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleOpenInExplorer}>
              <FolderIcon size={16} />
              Open in File Explorer
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FileText size={16} />
                Open in...
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {availableEditors.length > 0 ? (
                  availableEditors.map((editor) => (
                    <ContextMenuItem key={editor.key} onClick={() => handleOpenInEditor(editor.key)}>
                      {editor.name}
                    </ContextMenuItem>
                  ))
                ) : (
                  <ContextMenuItem disabled>No editors available</ContextMenuItem>
                )}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleOpenConfigFile}>
              <Settings size={16} />
              Configure Editors...
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    );
  }

  return (
    <div className="file-tree-item-container">
      <div
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="file-tree-icon">
          {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
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
              availableEditors={availableEditors}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ tree, selectedFile, onFileSelect, sidebarOpen, onToggleSidebar, onNavigatePrev, onNavigateNext, onExitPreview, canNavigatePrev, canNavigateNext }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [availableEditors, setAvailableEditors] = useState([]);

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

  useEffect(() => {
    const loadAvailableEditors = async () => {
      const result = await window.electronAPI.detectAvailableEditors();
      if (result.success) {
        setAvailableEditors(result.editors);
      }
    };
    loadAvailableEditors();
  }, []);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        style={{ left: sidebarOpen ? '280px' : '0px' }}
      >
        <Menu size={20} />
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-nav-buttons">
            <button
              className="sidebar-nav-button"
              onClick={onNavigatePrev}
              disabled={!canNavigatePrev}
              title="Previous file"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="sidebar-nav-button"
              onClick={onNavigateNext}
              disabled={!canNavigateNext}
              title="Next file"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
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
                availableEditors={availableEditors}
              />
            ))
          ) : (
            <div className="file-tree-empty">No markdown files found</div>
          )}
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-exit-button" onClick={onExitPreview}>
            <Home size={18} />
            <span>Exit Preview</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FileTree;

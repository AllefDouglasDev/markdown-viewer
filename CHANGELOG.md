# Changelog

All notable changes to Markify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-11-01

### Added
- **Modular Documentation System**: Complete reorganization of documentation into the `docs/` folder
  - New documentation index at `docs/README.md` with categorized navigation
  - Separate guides for each feature:
    - Getting Started
    - Navigation
    - Live Reload
    - Context Menu
    - Editor Configuration
    - Markdown Features
    - Interface
    - Keyboard Shortcuts
    - CLI Usage
    - Tips & Tricks
- **In-App Documentation Access**: "How to Use" button on welcome screen now opens the documentation folder with file tree navigation
- **Enhanced User Experience**: Users can now browse and navigate through comprehensive guides within the application

### Changed
- Documentation structure: Moved from single `HOW_TO_USE.md` to modular `docs/` folder
- "How to Use" button now opens documentation folder instead of single file
- Updated README.md to reference new documentation structure

### Improved
- Better organization for finding specific feature documentation
- Easier maintenance and updates for individual topics
- Enhanced navigation between related guides
- All documentation accessible in-app with live reload support

## [1.2.0] - 2025-10-31

### Added
- **Recent Files Display Improvements**: Shows only filename and parent folder instead of full path
- **Header and Sidebar Alignment**: Fixed alignment to both be 48px height for consistent UI
- **Tooltips**: Added tooltips to all buttons for better UX
- **Folder Support in Recently Opened**: Clicking folders in recently opened now properly opens them

### Fixed
- Folders not opening when clicked in recently opened list
- Header and sidebar toggle button misalignment
- Missing tooltips on navigation buttons

## [1.1.0] - 2025-10-30

### Added
- **Context Menu**: Right-click files in file tree for quick actions
  - Open in File Explorer (reveals file in system file manager)
  - Open in... submenu with all detected editors
  - Configure Editors... option
- **Editor Configuration System**: JSON-based editor configuration
  - Auto-detection of installed editors (VS Code, Cursor, Vim, Neovim, etc.)
  - Support for custom editor commands
  - Line number support for jumping to specific lines
- **Settings Button**: Quick access to configuration file
  - Available on welcome screen
  - Available in file view header
- **Editor Integration**: Open files in external editors with line number support

### Changed
- Navigation tracking: Only explicitly opened files/folders appear in recently opened
- Internal navigation (links, file tree clicks) no longer tracked in recently opened

## [1.0.0] - 2025-10-15

### Added
- **Initial Release**: First stable version of Markify
- **File Tree Navigation**: Browse and navigate Markdown files in folders
- **Live Reload**: Automatic file watching and preview updates
- **GitHub Flavored Markdown**: Full GFM support
  - Tables
  - Task lists
  - Strikethrough
  - Autolinks
- **Emoji Support**: Shortcode emoji rendering (`:rocket:` → 🚀)
- **Syntax Highlighting**: 100+ programming languages
- **Mermaid Diagrams**: Support for flowcharts, sequence diagrams, and more
- **Dark Theme**: Optimized dark mode for comfortable reading
- **History Navigation**: Back/forward buttons
- **CLI Support**: Open files from terminal with `md` command
- **Cross-Platform**: macOS, Windows, and Linux support
- **Recently Opened**: Track recently opened files and folders
- **Sidebar Toggle**: Show/hide file tree
- **Update Indicator**: Visual feedback when files change

[1.3.0]: https://github.com/AllefDouglasDev/markdown-viewer/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AllefDouglasDev/markdown-viewer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AllefDouglasDev/markdown-viewer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AllefDouglasDev/markdown-viewer/releases/tag/v1.0.0

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Electron application for rendering Markdown files with live reload. Invoked from CLI (e.g., `md ./file.md`) and displays rendered Markdown in a native window with automatic updates when the file changes.

## Tech Stack

- **Electron 38**: Desktop framework
- **React 19**: UI library
- **shadcn/ui**: Component library for UI elements (Context Menu, Dialog, etc.)
- **Tailwind CSS**: Utility-first CSS framework (required for shadcn/ui)
- **lucide-react**: Icon library
- **react-markdown 10**: Markdown renderer (safe, extensible, 116k+ users)
- **remark-gfm**: GitHub Flavored Markdown support
- **remark-gemoji**: Emoji shortcode support (`:rocket:` → 🚀)
- **rehype-highlight**: Syntax highlighting for code blocks
- **Mermaid 11**: Diagram and chart rendering (loaded via CDN)
- **chokidar**: Reliable cross-platform file watching
- **Webpack 5**: Bundler for renderer process

## Development Commands

```bash
# Install dependencies
npm install

# Development (requires 2 terminals)
# Terminal 1: Build renderer in watch mode
npx webpack --watch

# Terminal 2: Run Electron with dev tools
npm run dev

# Test with example file
./bin/md example.md

# Install globally (creates 'md' command)
npm link
md example.md
```

## Project Structure

```
src/
├── main/
│   ├── index.js       # Electron main process, CLI args, file watching
│   ├── preload.js     # IPC bridge (contextBridge)
│   └── config.js      # Configuration management for editor settings
├── renderer/
│   ├── index.html     # HTML template with Mermaid CDN
│   ├── index.jsx      # React entry point
│   ├── App.jsx        # Main component with markdown state
│   ├── MermaidChart.jsx # Mermaid diagram renderer component
│   ├── FileTree.jsx   # File tree sidebar with context menus
│   ├── WelcomeScreen.jsx # Welcome screen for file selection
│   ├── styles.css     # Dark theme styles
│   └── components/
│       └── ui/        # shadcn/ui components
bin/
└── md                 # CLI wrapper script
```

## Architecture

### Main Process (src/main/index.js)
- Parses CLI arguments to get file path
- Creates BrowserWindow with preload script
- Reads file content and sends to renderer via IPC
- Watches file with `fs.watch()` and sends updates on change
- Handles app lifecycle (window close, quit)

### Preload Script (src/main/preload.js)
- Exposes secure IPC API via `contextBridge`
- `electronAPI.getMarkdownFile()`: Request file content
- `electronAPI.onMarkdownUpdated()`: Listen for file changes

### Renderer Process (src/renderer/)
- React app that requests file on mount
- Displays markdown with react-markdown
- Updates content automatically when file changes
- Shows loading/error states

### CLI Wrapper (bin/md)
- Node script that spawns Electron process
- Passes file path as argument
- Can be globally installed via `npm link`

## Webpack Configuration

- Entry: `src/renderer/index.jsx`
- Target: `electron-renderer`
- Babel transpiles React JSX
- CSS loaded via style-loader/css-loader
- Dev server on port 8080 for hot reload
- Outputs to `dist/bundle.js`

## Neovim Integration

Add to `init.vim`:
```vim
nnoremap <leader>mp :!md %<CR>
```

Or `init.lua`:
```lua
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', { desc = 'Markdown Preview' })
```

## Key Features

- Live reload with `chokidar` (more reliable than fs.watch, works with all editors)
- GitHub Flavored Markdown (tables, task lists, strikethrough)
- Emoji support with shortcodes (`:rocket:` → 🚀)
- Syntax highlighting for code blocks (highlight.js)
- **Mermaid diagram support** (flowcharts, sequence diagrams, class diagrams, state diagrams, Gantt charts, pie charts, git graphs, ER diagrams)
- Visual update indicator (shows "✓ Updated at [time]" when file changes)
- Dark theme optimized for readability
- Secure IPC with context isolation
- File path displayed in header

## Mermaid Diagrams

To create a Mermaid diagram in your Markdown file, use a code block with the `mermaid` language identifier:

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
\`\`\`

Supported diagram types:
- **Flowcharts**: `graph TD`, `graph LR`
- **Sequence Diagrams**: `sequenceDiagram`
- **Class Diagrams**: `classDiagram`
- **State Diagrams**: `stateDiagram-v2`
- **Gantt Charts**: `gantt`
- **Pie Charts**: `pie`
- **Git Graphs**: `gitGraph`
- **Entity Relationship Diagrams**: `erDiagram`

See `mermaid-example.md` for comprehensive examples of all diagram types.

## UI Components (shadcn/ui)

This project uses **shadcn/ui** for UI components. Always prefer shadcn/ui components over custom implementations.

### Installation

Add components individually using the shadcn CLI:
```bash
npx shadcn@latest add context-menu
npx shadcn@latest add dialog
npx shadcn@latest add button
```

### Available Components

Browse all components at **https://ui.shadcn.com/**

Commonly used components:
- **Context Menu**: Right-click menus for files
- **Dialog**: Modal windows
- **Button**: Styled buttons
- **Dropdown Menu**: Click-triggered menus
- **Popover**: Floating content
- **Toggle**: On/off switches

### Usage Pattern

```jsx
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from '@/components/ui/context-menu'

<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Action 1</ContextMenuItem>
    <ContextMenuItem>Action 2</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Styling

- Components use Tailwind CSS classes
- Dark theme configured via CSS variables
- Customize in `src/renderer/styles.css` or component files

**IMPORTANT**

- **NEVER** add comments to the code
- **NEVER** add comments to the code unless explicitly requested
- **ALWAYS** search and use shadcn/ui components when building UI features
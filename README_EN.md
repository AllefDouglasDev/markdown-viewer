# Markdown Electron Viewer

⚡ Lightweight Electron app for live Markdown preview from CLI with auto-reload, emoji support, and syntax highlighting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-38-47848F?logo=electron)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

## ✨ Features

- 🔄 **Live Reload** - Automatically updates when file changes (works with all editors)
- 🎨 **Beautiful Dark Theme** - Optimized for readability
- 🚀 **Emoji Support** - Render GitHub-style emoji shortcodes (`:rocket:` → 🚀)
- 💻 **Syntax Highlighting** - Beautiful code blocks with highlight.js
- ✅ **GitHub Flavored Markdown** - Full GFM support (tables, task lists, strikethrough)
- 📱 **Visual Update Indicator** - See when your file refreshes
- ⌨️ **CLI Integration** - Launch from terminal or Neovim
- 🔒 **Secure** - Context isolation and secure IPC

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/markdown-electron-viewer.git
cd markdown-electron-viewer

# Install dependencies
npm install

# Build the renderer
npm run webpack

# Install globally
npm link
```

### Usage

```bash
# Open any markdown file
md README.md

# Or use full path
md /path/to/document.md
```

## 📖 Usage Modes

### 1. Global Command (Recommended)

After `npm link`:

```bash
md myfile.md
```

### 2. Direct Execution

```bash
npm start myfile.md
```

### 3. Development Mode

**Terminal 1** - Webpack watch mode:
```bash
npm run webpack:watch
```

**Terminal 2** - Electron with dev tools:
```bash
npm run dev example.md
```

## 🎮 Neovim Integration

Add to your `init.vim`:

```vim
" Markdown preview
nnoremap <leader>mp :!md %<CR>
```

Or `init.lua`:

```lua
-- Markdown preview
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', { desc = 'Markdown Preview' })
```

Now press `<leader>mp` to preview the current file!

## 🔧 Development

### Project Structure

```
markdown-electron-viewer/
├── bin/
│   └── md              # CLI wrapper script
├── src/
│   ├── main/
│   │   ├── index.js    # Electron main process
│   │   └── preload.js  # Preload script (IPC bridge)
│   └── renderer/
│       ├── index.html  # HTML template
│       ├── index.jsx   # React entry point
│       ├── App.jsx     # Main React component
│       └── styles.css  # Styles
├── webpack.config.js   # Webpack configuration
└── package.json
```

### Available Scripts

```bash
# Build renderer bundle
npm run webpack

# Watch mode (auto-rebuild)
npm run webpack:watch

# Test with example file
npm test

# Start app
npm start <file.md>

# Development mode (with DevTools)
npm run dev <file.md>

# Update global installation
npm run update
```

### Tech Stack

- **Electron 38** - Desktop framework
- **React 19** - UI library
- **react-markdown 10** - Markdown renderer
- **remark-gfm** - GitHub Flavored Markdown
- **remark-gemoji** - Emoji shortcode support
- **rehype-highlight** - Code syntax highlighting
- **chokidar** - Cross-platform file watching
- **Webpack 5** - Module bundler

## 🎨 Supported Markdown Features

- ✅ Headings (H1-H6)
- ✅ **Bold**, *Italic*, ~~Strikethrough~~
- ✅ Links and images
- ✅ Code blocks with syntax highlighting
- ✅ Inline code
- ✅ Blockquotes
- ✅ Ordered and unordered lists
- ✅ Tables
- ✅ Task lists (`- [x]`)
- ✅ Horizontal rules
- ✅ Emoji shortcodes (`:smile:`, `:rocket:`, etc.)
- ✅ Native emojis (🚀 ✨ 🔥)

## 🐛 Troubleshooting

### Window doesn't appear

1. Make sure you're running **locally** (not via SSH)
2. Ensure webpack was built: `npm run webpack`
3. Check terminal for errors

### Live reload not working

1. The app uses `chokidar` which is more reliable than `fs.watch()`
2. Check terminal for "Watching file for changes..." message
3. Try saving the file again

### Blank screen

1. Open DevTools: Menu → View → Toggle Developer Tools
2. Check console for errors
3. Verify `dist/bundle.js` exists

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Markdown rendering by [react-markdown](https://github.com/remarkjs/react-markdown)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)
- Icons from [GitHub's Gemoji](https://github.com/github/gemoji)

---

Made with ❤️ for developers who love Markdown

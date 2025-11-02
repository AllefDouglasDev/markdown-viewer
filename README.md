# Markify - Markdown Viewer

A lightweight, elegant Electron application for rendering and previewing Markdown files with live reload, file navigation, and powerful features.

> 📖 **New to Markify?** Click the "How to Use" button on the welcome screen or browse the [complete documentation](./docs/README.md) for detailed guides on all features.

![Version](https://img.shields.io/badge/version-1.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

## 📸 Screenshots

### Welcome Screen
Beautiful welcome screen with recently opened files and quick access to settings.

### File Navigation
- File tree sidebar for easy navigation
- Context menu with "Open in File Explorer" and "Open in Editor" options
- History navigation (back/forward buttons)

### Live Preview
- Real-time markdown rendering
- Syntax highlighting for code blocks
- Mermaid diagram support
- Update indicator when file changes

### Editor Integration
- Right-click any file to open in your favorite editor
- Support for VS Code, Cursor, Vim, Neovim, and more
- Configurable via JSON file
- Auto-detection of installed editors

## Tech Stack

- **Electron 38**: Desktop framework
- **React 19**: UI library with modern hooks
- **shadcn/ui**: Component library for elegant UI elements
- **Tailwind CSS**: Utility-first CSS framework
- **react-markdown 10**: Markdown renderer with plugin support
- **remark-gfm**: GitHub Flavored Markdown support
- **remark-gemoji**: Emoji shortcode support (`:rocket:` → 🚀)
- **rehype-highlight**: Syntax highlighting for code blocks
- **Mermaid 11**: Diagram and chart rendering
- **chokidar**: Reliable cross-platform file watching
- **lucide-react**: Beautiful icon library
- **Webpack 5**: Module bundler

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/AllefDouglasDev/markdown-viewer.git
cd markdown-viewer

# Install dependencies
npm install

# Build the application
npm run webpack
```

### Usage

#### 1. Quick Test
```bash
npm test
# Opens example.md
```

#### 2. CLI Usage
```bash
./bin/md path/to/your/file.md
```

#### 3. Global Installation (Recommended)
```bash
npm link
md ~/Documents/README.md
```

#### 4. From Neovim
Add to your `init.vim` or `init.lua`:
```lua
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', { desc = 'Markdown Preview' })
```

### Development Mode

**Terminal 1** - Webpack watcher:
```bash
npm run webpack:watch
```

**Terminal 2** - Electron with DevTools:
```bash
npm run dev
```

This opens the app with DevTools for debugging.

## Troubleshooting

### Janela não aparece

1. Verifique se você está executando **localmente** (não via SSH)
2. Certifique-se de que compilou o webpack: `npm run webpack`
3. Teste com: `npm test`
4. Verifique os logs no terminal

### Erro "Cannot find module"

Execute `npm install` novamente.

### Tela branca

1. Abra o DevTools (menu View → Toggle Developer Tools)
2. Verifique erros no console
3. Certifique-se de que `dist/bundle.js` existe

## Estrutura do Projeto

```
markdown/
├── bin/
│   └── md                   # CLI script
├── src/
│   ├── main/
│   │   ├── index.js         # Electron main process
│   │   └── preload.js       # Preload script (IPC bridge)
│   └── renderer/
│       ├── index.html       # HTML template (Mermaid CDN)
│       ├── index.jsx        # React entry point
│       ├── App.jsx          # Main React component
│       ├── MermaidChart.jsx # Componente de diagramas Mermaid
│       └── styles.css       # Styles
├── webpack.config.js        # Webpack configuration
└── package.json
```

## ✨ Features

### Core Functionality
- ✅ **Live Reload**: Instant updates when files change
- ✅ **File Tree Navigation**: Browse and open multiple markdown files
- ✅ **History Navigation**: Back/forward through opened files
- ✅ **Internal Links**: Navigate between markdown files seamlessly
- ✅ **External Links**: Opens in browser with `target="_blank"`
- ✅ **CLI Support**: Open files from terminal (`md file.md`)

### Markdown Rendering
- ✅ **GitHub Flavored Markdown**: Tables, task lists, strikethrough
- ✅ **Syntax Highlighting**: 100+ programming languages
- ✅ **Emoji Support**: Shortcodes like `:rocket:` → 🚀
- ✅ **Mermaid Diagrams**: Flowcharts, sequence diagrams, Gantt charts, etc.
- ✅ **Math Support**: (Coming soon)

### User Interface
- ✅ **Dark Theme**: Beautiful, readable dark mode
- ✅ **Context Menu**: Right-click files for quick actions
- ✅ **Recently Opened**: Quick access to recent files and folders
- ✅ **Sidebar Toggle**: Show/hide file tree
- ✅ **Update Indicator**: Visual feedback when file changes
- ✅ **Settings Button**: Quick access to configuration
- ✅ **In-App Guide**: Complete "How to Use" guide accessible from welcome screen

### Editor Integration
- ✅ **Open in File Explorer**: Right-click to reveal in Finder/Explorer
- ✅ **Open in Editor**: Launch files in your favorite editor
- ✅ **Multiple Editor Support**: VS Code, Cursor, Vim, Neovim, and more
- ✅ **Custom Editors**: Add your own via JSON configuration
- ✅ **Line Number Support**: Jump to specific lines in editors
- ✅ **Auto-Detection**: Automatically finds installed editors

### Advanced Features
- ✅ **Directory Watching**: Monitors folder changes in real-time
- ✅ **Neovim Integration**: Cursor position sync
- ✅ **Cross-Platform**: macOS, Windows, Linux
- ✅ **Auto-Update**: Built-in update checker (via GitHub Releases)

> 📖 For detailed usage instructions, see [HOW_TO_USE.md](./HOW_TO_USE.md)

## Diagramas Mermaid

Para criar diagramas Mermaid, use um bloco de código com a linguagem `mermaid`:

~~~markdown
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
```
~~~

### Tipos de Diagramas Suportados

- **Flowcharts**: Diagramas de fluxo (`graph TD`, `graph LR`)
- **Sequence Diagrams**: Diagramas de sequência (`sequenceDiagram`)
- **Class Diagrams**: Diagramas de classe (`classDiagram`)
- **State Diagrams**: Diagramas de estado (`stateDiagram-v2`)
- **Gantt Charts**: Gráficos de Gantt (`gantt`)
- **Pie Charts**: Gráficos de pizza (`pie`)
- **Git Graphs**: Gráficos Git (`gitGraph`)
- **ER Diagrams**: Diagramas entidade-relacionamento (`erDiagram`)

Veja exemplos completos em `mermaid-example.md`.

## ⚙️ Configuration

### Editor Settings

Markify stores editor preferences in a JSON configuration file:

**Location:**
- macOS: `~/Library/Application Support/Markify/markify-config.json`
- Windows: `%APPDATA%/Markify/markify-config.json`
- Linux: `~/.config/Markify/markify-config.json`

**Access:**
- Click the ⚙️ settings button on the welcome screen
- Click the ⚙️ button in the header when viewing a file
- Right-click a file → "Configure Editors..."

**Default Configuration:**
```json
{
  "version": "1.0",
  "editor": {
    "type": "system",
    "supportLineNumbers": true
  },
  "editorPresets": {
    "vscode": {
      "command": "code",
      "args": ["--goto", "{file}:{line}"],
      "name": "VS Code"
    },
    "vim": {
      "command": "vim",
      "args": ["+{line}", "{file}"],
      "terminal": true,
      "name": "Vim"
    }
  }
}
```

### Adding Custom Editors

Add your favorite editor to the configuration:

```json
{
  "editorPresets": {
    "sublime": {
      "command": "subl",
      "args": ["{file}:{line}"],
      "name": "Sublime Text"
    }
  }
}
```

**Placeholders:**
- `{file}` - Full path to the file
- `{line}` - Line number (defaults to 1)

See [HOW_TO_USE.md](./HOW_TO_USE.md#5-editor-configuration) for complete configuration details.

## 🔗 Context Menu Features

Right-click any file in the file tree sidebar to:

1. **Open in File Explorer** - Reveals the file in Finder/Explorer
2. **Open in...** - Submenu with all detected editors:
   - System Default
   - VS Code
   - Cursor
   - Vim/Neovim
   - And more...
3. **Configure Editors...** - Opens the configuration file

All editors are automatically detected on your system!

## Build e Distribuição

### Gerar Executáveis

O aplicativo usa `electron-builder` para criar executáveis distribuíveis:

```bash
# Build para a plataforma atual
npm run build

# Build específico por plataforma
npm run build:mac    # macOS (.dmg e .zip)
npm run build:win    # Windows (.exe e portable)
npm run build:linux  # Linux (.AppImage e .deb)

# Build para todas as plataformas (requer configuração adicional)
npm run build:all
```

Os executáveis serão gerados na pasta `release/`.

### Sistema de Atualização Automática

O aplicativo inclui atualização automática via GitHub Releases:

1. **Publicação de Releases**: Use `npm run release` para fazer build e publicar
2. **Verificação Automática**: O app verifica atualizações ao iniciar (após 3 segundos)
3. **Download Manual**: Usuário decide se quer baixar a atualização
4. **Instalação**: Após download, usuário decide quando reiniciar para aplicar

**Requisitos para Auto-Update:**
- Releases publicados no GitHub
- Token de acesso configurado (`GH_TOKEN` env var)
- App assinado digitalmente (macOS/Windows para distribuição pública)

### Ícones do Aplicativo

Coloque os ícones na pasta `build/`:
- `icon.icns` - macOS (1024x1024px)
- `icon.ico` - Windows (256x256px)
- `icon.png` - Linux (512x512px ou maior)

Veja `build/README.md` para mais detalhes sobre geração de ícones.

## 🔥 Neovim Integration

Markify has special integration with Neovim for an enhanced workflow:

### Basic Setup

Add to your `init.vim`:
```vim
nnoremap <leader>mp :!md %<CR>
```

Or `init.lua`:
```lua
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', { desc = 'Markdown Preview' })
```

### Advanced: Cursor Position Sync

Markify can read Neovim metadata to jump to the cursor position:

```vim
" Save cursor position in markdown metadata
function! SaveMarkdownMetadata()
  let l:line = line('.')
  let l:path = expand('%:p')
  call writefile([
        \ '<!-- nvim-metadata',
        \ 'cursor-line: ' . l:line,
        \ 'real-path: ' . l:path,
        \ '-->',
        \ ''], expand('%'), 'b')
endfunction

autocmd BufWritePre *.md call SaveMarkdownMetadata()
```

Now when you open a file from Markify in Neovim, it will:
- Jump to the cursor position
- Scroll to the relevant section

## 📚 Documentation

### User Documentation (In-App)

Access comprehensive guides directly from Markify by clicking the **"How to Use"** button on the welcome screen.

**Available Guides:**
- [Getting Started](./docs/getting-started.md) - Opening files, folders, and basics
- [Navigation](./docs/navigation.md) - File tree, history, and link navigation
- [Live Reload](./docs/live-reload.md) - Real-time preview and auto-updates
- [Context Menu](./docs/context-menu.md) - Quick actions and editor integration
- [Editor Configuration](./docs/editor-configuration.md) - Customize external editors
- [Markdown Features](./docs/markdown-features.md) - GFM, emoji, syntax highlighting, Mermaid
- [Interface](./docs/interface.md) - UI features and dark theme
- [Keyboard Shortcuts](./docs/keyboard-shortcuts.md) - Available shortcuts
- [CLI Usage](./docs/cli-usage.md) - Command-line interface and shell integration
- [Tips & Tricks](./docs/tips-and-tricks.md) - Best practices and pro tips

**[📖 Browse All Documentation](./docs/README.md)**

### Developer Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Technical documentation for developers
- **[mermaid-example.md](./mermaid-example.md)** - Mermaid diagram examples

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Markdown rendering by [react-markdown](https://github.com/remarkjs/react-markdown)

---

**Made with ❤️ by [Allef Douglas](https://github.com/AllefDouglasDev)**

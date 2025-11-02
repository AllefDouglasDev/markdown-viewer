# Editor Configuration

Customize how Markify integrates with your favorite text editors.

---

## Configuration File

Markify stores all editor settings in a JSON configuration file called `markify-config.json`.

### File Location:

**macOS:**
```
~/Library/Application Support/Markify/markify-config.json
```

**Windows:**
```
%APPDATA%\Markify\markify-config.json
```

**Linux:**
```
~/.config/Markify/markify-config.json
```

### How to Access:

There are three ways to open the configuration file:

1. **From Welcome Screen**: Click the ⚙️ settings button (top-right)
2. **From Context Menu**: Right-click any file → "Configure Editors..."
3. **From Header**: Click the ⚙️ button when viewing a file

The file will open in your system's default editor for `.json` files.

---

## Default Configuration

When you first run Markify, it creates a default configuration:

```json
{
  "version": "1.0",
  "editor": {
    "type": "system",
    "supportLineNumbers": true
  },
  "editorPresets": {
    "vim": {
      "command": "vim",
      "args": ["+{line}", "{file}"],
      "terminal": true,
      "name": "Vim"
    },
    "nvim": {
      "command": "nvim",
      "args": ["+{line}", "{file}"],
      "terminal": true,
      "name": "Neovim"
    },
    "vscode": {
      "command": "code",
      "args": ["--goto", "{file}:{line}"],
      "terminal": false,
      "name": "VS Code"
    },
    "cursor": {
      "command": "cursor",
      "args": ["--goto", "{file}:{line}"],
      "terminal": false,
      "name": "Cursor"
    },
    "system": {
      "useShell": true,
      "name": "System Default"
    }
  }
}
```

---

## Configuration Structure

### Root Level:

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Configuration version (currently "1.0") |
| `editor` | object | Default editor settings |
| `editorPresets` | object | Map of editor configurations |

### Editor Object:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Default editor key (e.g., "system", "vscode") |
| `supportLineNumbers` | boolean | Whether to pass line numbers to editor |

### Editor Preset Object:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | Yes* | Executable name or path |
| `args` | array | Yes* | Command-line arguments |
| `terminal` | boolean | No | Open in terminal (for CLI editors) |
| `name` | string | Yes | Display name in menu |
| `useShell` | boolean | No | Use system shell to open |
| `platform` | string | No | Platform restriction ("darwin", "win32", "linux") |

\* Not required if `useShell` is `true`

---

## Supported Editors

### Visual Studio Code

```json
{
  "vscode": {
    "command": "code",
    "args": ["--goto", "{file}:{line}"],
    "terminal": false,
    "name": "VS Code"
  }
}
```

**Requirements:**
- Install [VS Code](https://code.visualstudio.com/)
- Enable CLI tool: Open VS Code → Cmd+Shift+P → "Shell Command: Install 'code' command in PATH"

**Features:**
- Opens file at specific line
- Uses `--goto` flag
- No terminal needed

---

### Cursor

```json
{
  "cursor": {
    "command": "cursor",
    "args": ["--goto", "{file}:{line}"],
    "terminal": false,
    "name": "Cursor"
  }
}
```

**Requirements:**
- Install [Cursor](https://cursor.sh/)
- CLI tool should be available automatically

**Features:**
- Same syntax as VS Code
- Opens at specific line
- Direct execution (no terminal)

---

### Vim

```json
{
  "vim": {
    "command": "vim",
    "args": ["+{line}", "{file}"],
    "terminal": true,
    "name": "Vim"
  }
}
```

**Requirements:**
- Vim pre-installed on macOS/Linux
- Windows: Install via [Vim website](https://www.vim.org/)

**Features:**
- Opens in Terminal/Command Prompt
- Jumps to line with `+line` syntax
- Terminal mode required

---

### Neovim

```json
{
  "nvim": {
    "command": "nvim",
    "args": ["+{line}", "{file}"],
    "terminal": true,
    "name": "Neovim"
  }
}
```

**Requirements:**
- Install via package manager or [Neovim website](https://neovim.io/)

**Features:**
- Modern Vim fork
- Same syntax as Vim
- Better plugin support
- Terminal mode required

---

### Sublime Text

```json
{
  "sublime": {
    "command": "subl",
    "args": ["{file}:{line}"],
    "terminal": false,
    "name": "Sublime Text"
  }
}
```

**Requirements:**
- Install [Sublime Text](https://www.sublimetext.com/)
- Add `subl` to PATH (usually done during installation)

**Features:**
- Fast and lightweight
- Opens at specific line
- Direct execution

---

### Atom (Deprecated but Supported)

```json
{
  "atom": {
    "command": "atom",
    "args": ["{file}:{line}"],
    "terminal": false,
    "name": "Atom"
  }
}
```

**Note:** Atom is sunset but still supported if you have it installed.

---

### Emacs

```json
{
  "emacs": {
    "command": "emacs",
    "args": ["+{line}", "{file}"],
    "terminal": false,
    "name": "Emacs"
  }
}
```

**Requirements:**
- Install Emacs via package manager or [official website](https://www.gnu.org/software/emacs/)

---

### System Default

```json
{
  "system": {
    "useShell": true,
    "name": "System Default"
  }
}
```

**How it works:**
- Uses Node's `shell.openPath()`
- Opens with whatever app is registered for `.md` files
- No line number support
- Simplest option

---

## Custom Editor Configuration

### Adding a New Editor:

1. Open `markify-config.json`
2. Add a new entry to `editorPresets`
3. Define the command, args, and name
4. Save the file
5. Restart Markify (or it will reload automatically)

### Example: Adding TextMate:

```json
{
  "editorPresets": {
    "textmate": {
      "command": "mate",
      "args": ["-l", "{line}", "{file}"],
      "terminal": false,
      "name": "TextMate"
    }
  }
}
```

### Example: Adding Notepad++ (Windows):

```json
{
  "editorPresets": {
    "notepadpp": {
      "command": "notepad++",
      "args": ["-n{line}", "{file}"],
      "terminal": false,
      "name": "Notepad++",
      "platform": "win32"
    }
  }
}
```

---

## Placeholders

Use these placeholders in the `args` array:

### `{file}`
Replaced with the **full absolute path** to the file.

**Example:**
```
/Users/username/Documents/notes/README.md
```

### `{line}`
Replaced with the **line number** to jump to.

**Example:**
```
42
```

**Default:** If no line number is available, defaults to `1`.

### Usage Examples:

```json
// VS Code style
"args": ["--goto", "{file}:{line}"]
// Becomes: --goto /path/to/file.md:42

// Vim style
"args": ["+{line}", "{file}"]
// Becomes: +42 /path/to/file.md

// Sublime style
"args": ["{file}:{line}"]
// Becomes: /path/to/file.md:42
```

---

## Platform-Specific Configuration

Restrict editors to specific operating systems:

### Platform Values:
- `"darwin"` - macOS only
- `"win32"` - Windows only
- `"linux"` - Linux only

### Example:

```json
{
  "editorPresets": {
    "textedit": {
      "command": "open",
      "args": ["-a", "TextEdit", "{file}"],
      "terminal": false,
      "name": "TextEdit",
      "platform": "darwin"
    },
    "notepad": {
      "command": "notepad",
      "args": ["{file}"],
      "terminal": false,
      "name": "Notepad",
      "platform": "win32"
    }
  }
}
```

**Result:** TextEdit only appears on macOS, Notepad only on Windows.

---

## Terminal Mode

For CLI editors like Vim, Neovim, and Emacs (terminal version):

```json
{
  "terminal": true
}
```

### How It Works:

**macOS:**
```bash
osascript -e 'tell app "Terminal" to do script "vim +42 /path/to/file.md"'
```

**Windows:**
```cmd
start cmd /c vim +42 C:\path\to\file.md
```

**Linux:**
```bash
x-terminal-emulator -e vim +42 /path/to/file.md
```

### Use Cases:
- Vim
- Neovim
- Emacs (terminal mode)
- Nano
- Micro
- Any CLI editor

---

## Advanced Examples

### Opening in Specific VS Code Workspace:

```json
{
  "vscode-workspace": {
    "command": "code",
    "args": ["--goto", "{file}:{line}", "/path/to/workspace.code-workspace"],
    "terminal": false,
    "name": "VS Code (Workspace)"
  }
}
```

### Using a Wrapper Script:

```json
{
  "custom-editor": {
    "command": "/usr/local/bin/my-editor-wrapper.sh",
    "args": ["{file}", "{line}"],
    "terminal": false,
    "name": "Custom Editor"
  }
}
```

**Wrapper script example:**
```bash
#!/bin/bash
FILE=$1
LINE=$2
code --goto "$FILE:$LINE" --new-window
```

### Remote Editor (SSH):

```json
{
  "remote-vim": {
    "command": "ssh",
    "args": ["user@host", "vim", "+{line}", "{file}"],
    "terminal": true,
    "name": "Remote Vim"
  }
}
```

---

## Changing the Default Editor

Set your preferred editor as the default:

```json
{
  "editor": {
    "type": "vscode",  // Change this to your preferred editor key
    "supportLineNumbers": true
  }
}
```

This affects:
- Quick open from header button
- Keyboard shortcuts (when implemented)
- Default selection in menus

---

## Troubleshooting

### Editor Not Detected?

**Check if command is in PATH:**
```bash
# macOS/Linux
which code

# Windows
where code
```

**If not found:**
- Install the editor's CLI tool
- Add to PATH manually
- Use full path in configuration

### Editor Opens But Wrong Line?

**Check syntax:**
- VS Code/Cursor: `{file}:{line}`
- Vim/Neovim: `+{line}` before `{file}`
- Sublime: `{file}:{line}`

**Verify with:**
```bash
# Test manually in terminal
code --goto /path/to/file.md:42
vim +42 /path/to/file.md
```

### Terminal Editors Not Working?

**Ensure `terminal: true` is set:**
```json
{
  "terminal": true
}
```

**Platform-specific issues:**
- macOS: Requires Terminal.app
- Windows: Uses cmd.exe
- Linux: Requires x-terminal-emulator

---

## Best Practices

### Organization:
- Group similar editors together
- Use descriptive names
- Add comments (JSON5 if you enable it)
- Keep platform-specific editors separate

### Performance:
- Only add editors you actually use
- Remove unused presets
- Use `platform` restriction when appropriate

### Maintenance:
- Backup your config before major changes
- Test new editors before committing to them
- Document custom configurations

---

## Next Steps

- Learn about [Context Menu](./context-menu.md) usage
- Set up [CLI Integration](./cli-usage.md)
- Explore [Interface Features](./interface.md)

---

[← Back to Documentation Index](./README.md)

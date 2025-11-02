# Keyboard Shortcuts

Keyboard shortcuts in Markify (currently limited, more coming soon!).

---

## Current Status

Markify currently focuses on **mouse/trackpad interaction** for simplicity and cross-platform compatibility.

**Full keyboard shortcut support is planned for a future release.**

---

## Available Shortcuts

### System-Level:

These shortcuts are provided by the operating system and Electron:

**macOS:**
- `Cmd + Q` - Quit Markify
- `Cmd + W` - Close window
- `Cmd + M` - Minimize window
- `Cmd + H` - Hide Markify
- `Cmd + Tab` - Switch to/from Markify

**Windows/Linux:**
- `Ctrl + Q` or `Alt + F4` - Quit Markify
- `Ctrl + W` - Close window
- `Alt + Tab` - Switch to/from Markify

### Context Menu:

When the context menu is open:

- **Arrow Keys** - Navigate menu items
- **Enter** - Select item
- **Esc** - Close menu
- **Right Arrow** - Open submenu
- **Left Arrow** - Close submenu

---

## Planned Shortcuts

These shortcuts are planned for future releases:

### Navigation:
- `Cmd/Ctrl + [` - Go back in history
- `Cmd/Ctrl + ]` - Go forward in history
- `Cmd/Ctrl + \` - Toggle sidebar
- `Cmd/Ctrl + P` - Quick file opener
- `Cmd/Ctrl + Shift + F` - Search in files

### File Operations:
- `Cmd/Ctrl + O` - Open file dialog
- `Cmd/Ctrl + Shift + O` - Open folder dialog
- `Cmd/Ctrl + R` - Reload current file
- `Cmd/Ctrl + W` - Close current file (return to welcome)

### Editor Integration:
- `Cmd/Ctrl + E` - Open in default editor
- `Cmd/Ctrl + Shift + E` - Open in editor menu
- `Cmd/Ctrl + Shift + R` - Reveal in file explorer

### View:
- `Cmd/Ctrl + +` - Zoom in
- `Cmd/Ctrl + -` - Zoom out
- `Cmd/Ctrl + 0` - Reset zoom
- `Cmd/Ctrl + Shift + P` - Command palette

### Search:
- `Cmd/Ctrl + F` - Find in page
- `Cmd/Ctrl + G` - Find next
- `Cmd/Ctrl + Shift + G` - Find previous

---

## Workarounds for Power Users

Until keyboard shortcuts are implemented, here are some workarounds:

### Quick File Opening:

**Option 1: CLI Alias**
```bash
# Add to .bashrc, .zshrc, or .profile
alias mdp='md'  # Shorter alias

# Usage
mdp README.md
```

**Option 2: Shell Function**
```bash
# Open and automatically switch to Markify
mdopen() {
  md "$1" && open -a Markify
}

# Usage
mdopen README.md
```

### Editor Integration (Neovim):

```lua
-- Open in Markify from Neovim
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', { desc = 'Markdown Preview' })

-- Open and focus Markify window (macOS)
vim.keymap.set('n', '<leader>mf', ':!md % && open -a Markify<CR>', { desc = 'Markdown Preview + Focus' })
```

### Editor Integration (VS Code):

**tasks.json:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Preview in Markify",
      "type": "shell",
      "command": "md",
      "args": ["${file}"],
      "problemMatcher": []
    }
  ]
}
```

**Keybindings:**
```json
{
  "key": "ctrl+shift+m",
  "command": "workbench.action.tasks.runTask",
  "args": "Preview in Markify"
}
```

---

## Navigation Tips (Without Shortcuts)

### Mouse-Based Workflow:

**Efficient clicking:**
1. Use **middle-click** to open links in background (browser only)
2. **Right-click** for context menu actions
3. **Click and drag** to select text
4. **Double-click** headings to select

**Trackpad gestures (macOS):**
1. **Two-finger scroll** to navigate content
2. **Three-finger swipe** to switch spaces
3. **Pinch to zoom** (coming soon)

---

## Browser DevTools Shortcuts

For debugging (when DevTools is open):

**macOS:**
- `Cmd + Option + I` - Toggle DevTools
- `Cmd + R` - Reload app
- `Cmd + Option + J` - Jump to Console

**Windows/Linux:**
- `Ctrl + Shift + I` - Toggle DevTools
- `Ctrl + R` - Reload app
- `Ctrl + Shift + J` - Jump to Console

**Note:** DevTools are only available in development mode (`npm run dev`).

---

## Feature Request

Want to suggest a keyboard shortcut?

1. Open an issue on [GitHub](https://github.com/AllefDouglasDev/markdown-viewer/issues)
2. Tag it with `enhancement` and `keyboard-shortcuts`
3. Describe the shortcut and its use case
4. Propose the key combination

We're collecting feedback to design the best keyboard experience!

---

## Custom Shortcuts (Advanced)

For advanced users who want custom shortcuts now:

### Using Karabiner-Elements (macOS):

Create custom shortcuts that execute shell commands:

```json
{
  "title": "Open Markify with file",
  "rules": [
    {
      "description": "Cmd+Shift+M to open current file in Markify",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "m",
            "modifiers": {
              "mandatory": ["command", "shift"]
            }
          },
          "to": [
            {
              "shell_command": "md /path/to/file.md"
            }
          ]
        }
      ]
    }
  ]
}
```

### Using AutoHotkey (Windows):

```ahk
; Ctrl+Shift+M to open Markify
^+m::
Run, md "C:\path\to\file.md"
return
```

---

## Accessibility

### For users who rely on keyboard navigation:

**Current limitations:**
- Some actions require mouse clicks
- File tree navigation is mouse-only
- No keyboard shortcuts for most actions

**Planned improvements:**
- Full keyboard navigation
- Tab order optimization
- Focus management
- ARIA keyboard patterns

### Workarounds:
- Use **Tab** to navigate buttons
- Use **Enter** to click buttons
- Use **context menu key** (Windows) for right-click
- Use **Cmd+O** in file dialogs to type paths

---

## Next Steps

- Check out [CLI Usage](./cli-usage.md) for terminal workflows
- Learn about [Tips & Tricks](./tips-and-tricks.md)
- See [Interface Features](./interface.md)

---

[← Back to Documentation Index](./README.md)

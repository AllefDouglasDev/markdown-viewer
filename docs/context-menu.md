# Context Menu

Access powerful quick actions by right-clicking files in the file tree.

---

## How to Open the Context Menu

1. Ensure you have a **folder opened** (file tree visible)
2. **Right-click** any file in the file tree sidebar
3. The context menu appears with available actions

**Note:** The context menu only works on **files**, not folders (yet).

---

## Available Actions

### 1. Open in File Explorer

Reveals the selected file in your system file manager.

**What it does:**
- Opens **Finder** (macOS)
- Opens **File Explorer** (Windows)
- Opens **File Manager** (Linux)
- **Highlights the selected file**

**Use cases:**
- Quickly locate a file on disk
- Access file properties
- Rename or move files
- Open the containing folder
- Use system-level file operations

**Icon:** 📁 Folder icon

---

### 2. Open in... (Submenu)

Launch the file in your preferred external editor.

**Features:**
- Shows all **detected editors** on your system
- **Auto-detection**: Markify finds installed editors automatically
- **Line number support**: Opens at the current cursor position (when available)
- **Multiple options**: Choose the right editor for the task

**Default Options:**

#### System Default
- Opens with your **OS default application**
- Usually a text editor or IDE
- No special configuration needed

#### VS Code
- Opens in **Visual Studio Code**
- Uses `code --goto file:line` syntax
- Jumps to specific line number
- Requires VS Code installed with CLI tool

#### Cursor
- Opens in **Cursor editor**
- Uses `cursor --goto file:line` syntax
- Jumps to specific line number
- Requires Cursor installed with CLI tool

#### Vim
- Opens in **Vim** in Terminal
- Uses `vim +line file` syntax
- Opens in a new Terminal window/tab
- Requires Vim installed

#### Neovim
- Opens in **Neovim** in Terminal
- Uses `nvim +line file` syntax
- Opens in a new Terminal window/tab
- Requires Neovim installed

**Icon:** 📄 Document icon with arrow (→)

---

### 3. Configure Editors...

Opens the editor configuration file for customization.

**What it does:**
- Opens `markify-config.json` in your default editor
- Allows you to add custom editors
- Modify existing editor commands
- Configure default editor

**Configuration file location:**
- **macOS**: `~/Library/Application Support/Markify/markify-config.json`
- **Windows**: `%APPDATA%/Markify/markify-config.json`
- **Linux**: `~/.config/Markify/markify-config.json`

**Icon:** ⚙️ Settings gear

---

## Editor Auto-Detection

Markify automatically detects which editors are installed on your system.

### How Detection Works:
1. Checks if editor command exists in PATH
2. Uses `which` (macOS/Linux) or `where` (Windows)
3. Adds detected editors to context menu
4. Only shows editors that are actually available

### Supported Editor Commands:
- `code` - Visual Studio Code
- `cursor` - Cursor
- `vim` - Vim
- `nvim` - Neovim
- `subl` - Sublime Text
- `atom` - Atom
- `emacs` - Emacs

**Note:** If an editor isn't detected, check that its CLI tool is installed and in your PATH.

---

## Line Number Support

When opening files in editors, Markify can pass the line number.

### How It Works:
1. Markify tracks cursor position (from Neovim metadata)
2. Passes line number to editor when opening
3. Editor jumps to that line automatically

### Supported Editors:
✅ **VS Code**: `code --goto file:42`
✅ **Cursor**: `cursor --goto file:42`
✅ **Vim**: `vim +42 file`
✅ **Neovim**: `nvim +42 file`
✅ **Sublime Text**: `subl file:42`

### Not Supported:
❌ **System Default**: No line number
❌ **Custom editors**: Depends on configuration

---

## Workflow Examples

### Quick Edit Workflow:
1. Browse files in Markify file tree
2. Find the file you want to edit
3. Right-click → **"Open in..."** → Select your editor
4. Edit and save
5. Changes appear instantly in Markify (live reload)

### File Management Workflow:
1. Right-click a file
2. Select **"Open in File Explorer"**
3. Rename, move, or organize files
4. Return to Markify
5. File tree updates automatically

### Multi-Editor Workflow:
1. Right-click → Open in **Vim** for quick edits
2. Right-click → Open in **VS Code** for larger refactoring
3. Right-click → Open in **System Default** to view in another app
4. All changes tracked by live reload

---

## Context Menu Tips

### Keyboard Navigation:
- **Arrow keys**: Navigate menu items
- **Enter**: Select item
- **Esc**: Close menu
- **Right arrow**: Open submenu
- **Left arrow**: Close submenu

### Quick Access:
- Right-click is **faster** than opening editor manually
- No need to remember file paths
- Editor opens **exactly** the file you clicked
- Line numbers preserved when supported

### Organizing Your Workflow:
1. Set your **most-used editor** as default
2. Use **"Open in..."** for occasional editor switches
3. Use **"Open in File Explorer"** for file operations
4. Keep **"Configure Editors..."** for customization

---

## Troubleshooting

### Context Menu Not Appearing?

**Possible causes:**
- Clicking on a **folder** (not yet supported)
- Clicking on **empty space** in file tree
- Not in a folder view (open a folder first)

**Solution:**
- Ensure you've opened a **folder** in Markify
- Right-click directly on a **file** name
- Make sure file tree is visible (sidebar not collapsed)

### Editor Not in List?

**Possible causes:**
- Editor not installed
- CLI tool not in PATH
- Editor not configured

**Solution:**
- Install the editor
- Add editor CLI to PATH
- Or manually add to `markify-config.json`

### Line Numbers Not Working?

**Possible causes:**
- Editor doesn't support line number syntax
- Custom editor not configured correctly
- Neovim metadata not available

**Solution:**
- Check [Editor Configuration](./editor-configuration.md) guide
- Verify editor command syntax
- Set up Neovim integration if using Neovim

### Editor Opens But Wrong File?

**This shouldn't happen, but if it does:**
- Check that file paths don't have special characters
- Ensure file hasn't been moved/renamed recently
- Restart Markify

---

## Advanced Configuration

For custom editor setups, see the [Editor Configuration](./editor-configuration.md) guide.

### Adding Custom Editors:
- Define command and arguments
- Set up line number placeholders
- Configure terminal mode
- Platform-specific commands

### Examples:
- Emacs with line numbers
- Custom IDE integration
- Scripts that process files
- Remote editor setups

---

## Next Steps

- Learn about [Editor Configuration](./editor-configuration.md) in detail
- Set up [Neovim Integration](./cli-usage.md#neovim-integration)
- Explore [Interface Features](./interface.md)

---

[← Back to Documentation Index](./README.md)

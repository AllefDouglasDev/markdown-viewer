# Live Reload

Experience real-time Markdown preview with automatic file watching and instant updates.

---

## How Live Reload Works

Markify automatically watches your Markdown files for changes and updates the preview instantly.

### The Process:
1. **Open a file** in Markify
2. **Edit the file** in your preferred editor (VS Code, Vim, etc.)
3. **Save the changes**
4. **Markify updates automatically** - no refresh needed!

### Technology:
- Uses **chokidar** library for reliable file watching
- Works on **all platforms** (macOS, Windows, Linux)
- Handles **all editors** (no special configuration needed)
- **Debounced updates** prevent excessive reloading

---

## Visual Indicators

### Update Notification

When a file changes, you'll see a **green indicator** in the header:

```
✓ Updated at 14:32:45
```

### Features:
- **Green color** (✓ checkmark)
- **Timestamp** shows when the update occurred
- **Fades out** after 2 seconds
- **Slide-in animation** for smooth appearance

### What Triggers an Update:
- Saving the file in any editor
- File modified by another process
- File moved or renamed (triggers reload)
- File content changed externally

---

## Perfect Use Cases

### 1. Writing and Previewing Simultaneously

**Setup:**
- **Left monitor**: Your editor (VS Code, Vim, etc.)
- **Right monitor**: Markify with live preview

**Workflow:**
1. Write Markdown in your editor
2. Save frequently (or enable auto-save)
3. See changes instantly in Markify
4. Iterate quickly without switching windows

### 2. Iterating on Documentation

**Great for:**
- Refining table layouts
- Adjusting heading hierarchy
- Testing link navigation
- Previewing code snippets
- Verifying Mermaid diagrams

### 3. Testing Markdown Rendering

**Use to verify:**
- How tables render
- Task list formatting
- Code block syntax highlighting
- Emoji appearance
- Link behavior

### 4. Real-Time Collaboration

**Scenario:**
- Multiple team members editing the same file
- Changes appear automatically in Markify
- No manual refresh needed
- Great for pair programming/writing sessions

---

## File Watching Details

### What is Watched:
- The **currently open file** only
- Not the entire directory (for performance)
- Switches automatically when you open a new file

### What Triggers Reload:
✅ File content changes
✅ File saved in any editor
✅ File modified by scripts
✅ File updated via git pull

### What Doesn't Trigger Reload:
❌ File permissions changes
❌ File metadata only changes
❌ Temporary/swap files (`.swp`, `~`, etc.)
❌ Hidden files

### Debouncing:
- **300ms stability threshold**: Waits for file to stop changing
- **100ms poll interval**: Checks for changes
- Prevents multiple reloads during rapid saves
- Ensures complete file writes

---

## Cross-Platform Support

### macOS:
- Uses **FSEvents** API for native file watching
- Instant updates with low CPU usage
- Handles moved/renamed files correctly

### Windows:
- Uses **ReadDirectoryChangesW** API
- Reliable watching across all file systems
- Works with network drives

### Linux:
- Uses **inotify** for file system events
- Efficient watching with low overhead
- Supports all major file systems (ext4, btrfs, etc.)

---

## Working with Different Editors

Markify's live reload works seamlessly with all editors:

### Visual Studio Code:
- ✅ Auto-save support
- ✅ Manual save (Cmd/Ctrl + S)
- ✅ Save all files
- ✅ File watchers enabled

### Vim / Neovim:
- ✅ `:w` (write) command
- ✅ `:wa` (write all)
- ✅ Auto-save plugins
- ✅ Backup file handling

### Sublime Text:
- ✅ Save (Cmd/Ctrl + S)
- ✅ Save all
- ✅ Auto-save on focus lost

### Atom:
- ✅ Manual save
- ✅ Auto-save package
- ✅ Save on blur

### Emacs:
- ✅ `C-x C-s` (save)
- ✅ Auto-save mode
- ✅ Backup file handling

### JetBrains IDEs:
- ✅ Auto-save (default)
- ✅ Manual save
- ✅ Save all

---

## Troubleshooting

### Updates Not Appearing?

**Check these:**
1. Did you **save the file**? (Check your editor)
2. Is the file **still open** in Markify?
3. Are you editing the **correct file**?
4. Is your editor creating **backup files** instead of modifying the original?

### Too Many Updates?

**If live reload feels excessive:**
- Disable auto-save in your editor
- Save only when you want to preview
- The 300ms debounce should handle most cases

### File System Issues?

**If watching doesn't work:**
- Check file **permissions** (must be readable)
- Ensure file is on a **local drive** (network drives may have delays)
- Restart Markify if you moved/renamed the file externally

---

## Performance Considerations

### CPU Usage:
- **Minimal** when file is not changing
- **Brief spike** when file changes (rendering)
- **No continuous polling** thanks to native file watchers

### Memory Usage:
- One watcher per open file
- Watchers are **cleaned up** when you switch files
- Old watchers are **properly disposed**

### Best Practices:
- Don't open extremely large files (>10MB)
- Keep Markdown files reasonably sized
- Split large documents into multiple files

---

## Advanced Features

### Metadata Support (Neovim Integration)

Markify can read special metadata comments:

```markdown
<!-- nvim-metadata
cursor-line: 42
real-path: /path/to/file.md
-->

# Your Document
```

**What this does:**
- Stores cursor position from Neovim
- Allows Markify to scroll to the cursor location
- Updates automatically when you save in Neovim

**Setup in Neovim:**
```vim
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

---

## Tips for Optimal Live Reload Experience

### Dual Monitor Setup:
1. **Left screen**: Editor (full screen)
2. **Right screen**: Markify (full screen)
3. Save frequently or enable auto-save
4. Watch changes appear instantly

### Single Monitor Workflow:
1. Use **split screen** (editor + Markify side by side)
2. Editor on the **left** (60% width)
3. Markify on the **right** (40% width)
4. Or use virtual desktops and swipe between them

### Keyboard-Driven Workflow:
1. Focus on editor
2. Write content
3. Press **Cmd/Ctrl + S** to save
4. **Cmd/Ctrl + Tab** to switch to Markify
5. Review changes
6. **Cmd/Ctrl + Tab** back to editor

---

## Next Steps

- Learn about [Context Menu](./context-menu.md) actions
- Set up [Editor Integration](./editor-configuration.md)
- Explore [Markdown Features](./markdown-features.md)

---

[← Back to Documentation Index](./README.md)

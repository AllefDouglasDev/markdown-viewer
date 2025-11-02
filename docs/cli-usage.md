# CLI Usage

Use Markify from the command line for quick file opening and integration with your development workflow.

---

## Basic Usage

### Opening a File:

```bash
md path/to/file.md
```

### Examples:

```bash
# Relative path
md ./README.md
md ../docs/guide.md

# Absolute path
md /Users/username/Documents/notes.md
md ~/Documents/project/README.md

# With spaces in path (use quotes)
md "My Documents/My Notes.md"
```

---

## Installation

### Local Usage (npm link):

From the project directory:

```bash
# Install dependencies
npm install

# Build the renderer
npm run webpack

# Create global symlink
npm link

# Now 'md' command is available globally
md ~/Documents/README.md
```

### Manual Installation:

```bash
# Make the CLI script executable
chmod +x /path/to/markdown/bin/md

# Add to PATH
export PATH="/path/to/markdown/bin:$PATH"

# Add to shell profile for persistence
echo 'export PATH="/path/to/markdown/bin:$PATH"' >> ~/.bashrc  # or ~/.zshrc
```

---

## Development Mode

### Running with DevTools:

```bash
# Terminal 1: Build renderer in watch mode
npm run webpack:watch

# Terminal 2: Run Electron with DevTools
npm run dev
```

### Testing:

```bash
# Test with example file
npm test
# Equivalent to: electron . example.md
```

---

## CLI Options

### File Path:

The first non-flag argument is treated as the file path:

```bash
md file.md                    # Opens file.md
md --dev file.md              # Opens in dev mode
md file.md --dev              # Also works (position flexible)
```

### Dev Mode Flag:

```bash
md --dev                      # Opens without file (dev mode)
md --dev README.md            # Opens README.md with DevTools
```

**Dev mode features:**
- Opens DevTools automatically
- Hot reload from webpack dev server (if running)
- Better error messages
- Console logging enabled

---

## Shell Integration

### Bash:

Add to `~/.bashrc`:

```bash
# Quick alias
alias mdp='md'

# Function to open and focus
mdopen() {
  md "$1"
  sleep 0.5
  # macOS: Focus Markify window
  osascript -e 'tell application "Markify" to activate'
}

# Open current directory's README
alias mdhere='md README.md'
```

### Zsh:

Add to `~/.zshrc`:

```zsh
# Same as bash
alias mdp='md'

# With error handling
mdopen() {
  if [[ -f "$1" ]]; then
    md "$1"
  else
    echo "Error: File not found: $1"
    return 1
  fi
}

# Completion for .md files
compdef '_files -g "*.md"' md
```

### Fish:

Add to `~/.config/fish/config.fish`:

```fish
# Alias
alias mdp='md'

# Function
function mdopen
  if test -f $argv[1]
    md $argv[1]
  else
    echo "Error: File not found: $argv[1]"
    return 1
  end
end

# Completion
complete -c md -a '(__fish_complete_suffix .md)'
```

---

## Neovim Integration

### Basic Preview:

Add to `init.vim`:

```vim
" Open current file in Markify
nnoremap <leader>mp :!md %<CR>

" Open and focus Markify (macOS)
nnoremap <leader>mf :!md % && open -a Markify<CR>
```

Or `init.lua`:

```lua
-- Open current file in Markify
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', {
  desc = 'Markdown Preview'
})

-- Open and focus Markify
vim.keymap.set('n', '<leader>mf', ':!md % && open -a Markify<CR>', {
  desc = 'Markdown Preview + Focus'
})
```

### Advanced: Cursor Position Sync

Save cursor position to Markdown file:

```vim
function! SaveMarkdownMetadata()
  let l:line = line('.')
  let l:path = expand('%:p')
  let l:content = readfile(expand('%'))

  " Remove old metadata
  call filter(l:content, 'v:val !~ "^<!--\\s*nvim-metadata"')
  call filter(l:content, 'v:val !~ "^cursor-line:"')
  call filter(l:content, 'v:val !~ "^real-path:"')
  call filter(l:content, 'v:val !~ "^-->\\s*$"')

  " Add new metadata at the top
  call insert(l:content, '<!-- nvim-metadata', 0)
  call insert(l:content, 'cursor-line: ' . l:line, 1)
  call insert(l:content, 'real-path: ' . l:path, 2)
  call insert(l:content, '-->', 3)
  call insert(l:content, '', 4)

  " Write back
  call writefile(l:content, expand('%'))
endfunction

" Auto-save metadata before writing
autocmd BufWritePre *.md call SaveMarkdownMetadata()
```

**What this does:**
- Saves cursor position in Markdown comment
- Markify reads it and scrolls to that position
- Perfect sync between Neovim and Markify
- Updates automatically on save

### Lua Version:

```lua
local function save_markdown_metadata()
  local line = vim.fn.line('.')
  local path = vim.fn.expand('%:p')
  local lines = vim.fn.readfile(vim.fn.expand('%'))

  -- Remove old metadata
  lines = vim.tbl_filter(function(l)
    return not (l:match('^%s*<!%-%-') or
                l:match('^cursor%-line:') or
                l:match('^real%-path:') or
                l:match('^%-%->'))
  end, lines)

  -- Add new metadata
  table.insert(lines, 1, '<!-- nvim-metadata')
  table.insert(lines, 2, 'cursor-line: ' .. line)
  table.insert(lines, 3, 'real-path: ' .. path)
  table.insert(lines, 4, '-->')
  table.insert(lines, 5, '')

  -- Write back
  vim.fn.writefile(lines, vim.fn.expand('%'))
end

-- Auto-save metadata
vim.api.nvim_create_autocmd('BufWritePre', {
  pattern = '*.md',
  callback = save_markdown_metadata,
})
```

---

## VS Code Integration

### Tasks:

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Preview in Markify",
      "type": "shell",
      "command": "md",
      "args": ["${file}"],
      "problemMatcher": [],
      "presentation": {
        "reveal": "never",
        "panel": "shared"
      }
    }
  ]
}
```

### Keybindings:

Create `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+m",
    "command": "workbench.action.tasks.runTask",
    "args": "Preview in Markify",
    "when": "editorLangId == markdown"
  }
]
```

Now press `Ctrl+Shift+M` to preview Markdown files!

---

## Git Hooks

### Pre-commit: Validate Markdown

`.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check all staged .md files
for file in $(git diff --cached --name-only --diff-filter=ACM | grep '\.md$'); do
  # Open in Markify for quick review (optional)
  # md "$file"

  # Validate Markdown (requires markdownlint)
  if command -v markdownlint &> /dev/null; then
    markdownlint "$file" || exit 1
  fi
done
```

### Post-merge: Update Documentation

`.git/hooks/post-merge`:

```bash
#!/bin/bash

# If README.md changed, open it in Markify
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q 'README.md'; then
  md README.md &
fi
```

---

## Scripts and Automation

### Batch Convert:

```bash
#!/bin/bash
# convert-all-md.sh - Open all .md files

find . -name "*.md" -type f | while read file; do
  echo "Opening: $file"
  md "$file"
  sleep 1  # Wait between opens
done
```

### Watch Directory:

```bash
#!/bin/bash
# watch-md.sh - Watch for .md changes and auto-open

fswatch -o . | while read change; do
  # Find .md files modified in last 5 seconds
  find . -name "*.md" -type f -mtime -5s | while read file; do
    md "$file"
  done
done
```

### Project Documentation Browser:

```bash
#!/bin/bash
# docs-browser.sh - Open project docs folder

DOCS_DIR="./docs"

if [ -d "$DOCS_DIR" ]; then
  if [ -f "$DOCS_DIR/README.md" ]; then
    md "$DOCS_DIR/README.md"
  else
    # Find first .md file
    first_md=$(find "$DOCS_DIR" -name "*.md" -type f | head -1)
    md "$first_md"
  fi
else
  echo "Error: $DOCS_DIR not found"
  exit 1
fi
```

---

## CI/CD Integration

### GitHub Actions:

While Markify is a desktop app, you can use it in CI for validation:

```yaml
name: Validate Markdown

on: [push, pull_request]

jobs:
  validate:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install Markify
        run: |
          npm install -g markdown-electron-viewer

      - name: Validate docs
        run: |
          # This would need headless mode (future feature)
          # md --validate docs/**/*.md
          echo "Validation would run here"
```

---

## Troubleshooting

### Command not found?

```bash
# Check if md is in PATH
which md

# Check npm global bin location
npm bin -g

# Add to PATH if needed
export PATH="$(npm bin -g):$PATH"
```

### Permission denied?

```bash
# Make script executable
chmod +x $(which md)

# Or reinstall with npm link
cd /path/to/markdown
npm link
```

### Wrong file opens?

```bash
# Check what 'md' resolves to
type md

# If it's aliased to something else, remove the alias
unalias md

# Or use full path
/path/to/markdown/bin/md file.md
```

---

## Advanced Tips

### Multiple Instances:

```bash
# Open multiple files (separate windows)
md file1.md &
md file2.md &
md file3.md &
wait
```

### Error Handling:

```bash
# Check if file exists before opening
[ -f "README.md" ] && md "README.md" || echo "File not found"

# With better error messages
if [ ! -f "$1" ]; then
  echo "Error: $1 not found" >&2
  exit 1
fi
md "$1"
```

### Piping (Future Feature):

```bash
# This doesn't work yet but is planned:
cat file.md | md -
echo "# Hello" | md -
```

---

## Next Steps

- Learn about [Neovim Integration](./cli-usage.md#neovim-integration)
- Explore [Tips & Tricks](./tips-and-tricks.md)
- Check out [Editor Configuration](./editor-configuration.md)

---

[← Back to Documentation Index](./README.md)

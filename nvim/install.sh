#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
NVIM_CONFIG_DIR="${NVIM_CONFIG_DIR:-$HOME/.config/nvim}"

echo "🚀 Installing Markdown Preview for NeoVim..."
echo ""

echo "📦 Installing markdown globally..."
cd "$PROJECT_DIR"
npm link

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 To use in NeoVim, add this to your init.lua:"
echo ""
echo "  -- Option 1: Add to runtimepath and require"
echo "  vim.opt.runtimepath:append('$PROJECT_DIR')"
echo "  local markdown_preview = require('nvim.markdown-preview')"
echo "  markdown_preview.setup()"
echo ""
echo "  -- Option 2: Copy to your config directory"
echo "  cp $SCRIPT_DIR/markdown-preview.lua $NVIM_CONFIG_DIR/lua/markdown-preview.lua"
echo "  local markdown_preview = require('markdown-preview')"
echo "  markdown_preview.setup()"
echo ""
echo "🎯 Usage:"
echo "  <leader>md - Toggle preview"
echo "  :MarkdownPreview - Open preview"
echo "  :MarkdownPreviewStop - Close preview"
echo ""

if command -v md &> /dev/null; then
    echo "✓ Command 'md' is available at: $(which md)"
else
    echo "⚠️  Warning: 'md' command not found in PATH"
    echo "   Make sure your shell is configured to use NVM:"
    echo "   export NVM_DIR=\"\$HOME/.nvm\""
    echo "   [ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\""
fi

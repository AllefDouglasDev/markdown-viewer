# Navigation

Master all the ways to navigate through your Markdown documents in Markify.

---

## File Tree Navigation

When a folder is open, use the **sidebar** to navigate between files.

### Features:
- **Click a file** to open it instantly
- **Click a folder** to expand or collapse it
- **Current file** is highlighted in blue
- **Files are sorted** alphabetically
- **Folders appear first**, then files
- **Nested structure** shows folder hierarchy

### Visual Indicators:
- 📂 **Folder (closed)**: Click to expand
- 📁 **Folder (open)**: Click to collapse
- 📄 **File**: Click to open
- 🔵 **Blue highlight**: Currently open file

### Tips:
- Use folders to organize related documents
- Collapse folders you're not working with to reduce clutter
- The file tree updates automatically when files are added/removed

---

## History Navigation

Navigate through your browsing history with back/forward buttons.

### Location:
The navigation buttons are in the **sidebar header** (top of the file tree).

### Buttons:
- **← Previous file**: Go back to the previous file
- **→ Next file**: Go forward to the next file

### How It Works:
1. Open File A
2. Click a link to File B
3. Click back (←) to return to File A
4. Click forward (→) to return to File B

### Behavior:
- **History persists** during the current session
- **Buttons are disabled** when you can't go back/forward
- **History resets** when you exit preview or close the app
- **All file opens** are tracked (clicks, links, tree navigation)

---

## Internal Links

Click links to other Markdown files to navigate within the app.

### Supported Formats:

**Relative Links:**
```markdown
[Link to file in same directory](./other-file.md)
[Link to file in parent directory](../file.md)
[Link to file in subdirectory](./docs/guide.md)
```

**Absolute Links:**
```markdown
[Link with absolute path](/path/to/file.md)
```

**Links with Anchors:**
```markdown
[Link to section](file.md#section-heading)
[Link to section in same file](#local-section)
```

### Behavior:
- ✅ Opens the file **in the same window**
- ✅ **Updates** the file tree selection
- ✅ **Adds to** navigation history
- ✅ **Scrolls to anchor** if specified
- ✅ **Resolves relative paths** correctly
- ✅ Shows **error banner** if file not found

### Best Practices:
- Use **relative paths** for portability
- Keep files **in the same project** for easy linking
- Use **lowercase** filenames with hyphens
- Test links by clicking them in Markify

### Example Project Structure:
```
docs/
├── README.md
├── getting-started.md
└── advanced/
    └── configuration.md
```

**In README.md:**
```markdown
- [Getting Started](./getting-started.md)
- [Configuration](./advanced/configuration.md)
```

---

## External Links

Links starting with `http://` or `https://` open in your default web browser.

### Behavior:
- ✅ Opens in **default web browser**
- ✅ Opens in **new window/tab**
- ✅ Does **not navigate** away from Markify
- ✅ Uses `target="_blank"` attribute
- ✅ Includes `rel="noopener noreferrer"` for security

### Examples:
```markdown
[Google](https://google.com)
[GitHub](https://github.com)
[Documentation](https://docs.example.com)
```

### Auto-linking:
Bare URLs are automatically converted to links:
```markdown
https://example.com
user@example.com
```

---

## Anchor Links

Navigate to specific sections within a document.

### How to Use:

**1. Create a heading:**
```markdown
## My Section
```

**2. Link to it:**
```markdown
[Go to My Section](#my-section)
```

### Anchor Formatting Rules:
- Convert to **lowercase**
- Replace **spaces** with hyphens (`-`)
- Remove **special characters**
- Keep **letters, numbers, and hyphens** only

### Examples:
| Heading | Anchor |
|---------|--------|
| `## Getting Started` | `#getting-started` |
| `## API Reference` | `#api-reference` |
| `## FAQ: Common Questions` | `#faq-common-questions` |

### Cross-File Anchors:
```markdown
[Installation Guide](./setup.md#installation)
[API Docs](./api.md#authentication)
```

---

## Sidebar Toggle

Control the visibility of the file tree sidebar.

### Toggle Button:
- Located in **top-left corner** (☰ menu icon)
- Click to **show/hide** the sidebar
- Hover shows tooltip: "Hide sidebar" or "Show sidebar"

### Behavior:
- **Sidebar state** is remembered during the session
- When **closed**, content expands to full width
- When **open**, sidebar is 280px wide
- Smooth **animation** when toggling

### Keyboard Shortcut:
Currently not available - coming soon!

---

## Exit Preview

Return to the welcome screen from any file.

### How to Exit:
1. Click the **"Exit Preview"** button in the sidebar footer
2. Or close the window and reopen Markify

### What Happens:
- Returns to the **welcome screen**
- Shows **recently opened** files and folders
- **Clears navigation history**
- Allows you to open a new file or folder

### Icon:
🏠 **Home icon** with "Exit Preview" text

---

## Navigation Tips

### For Documentation Projects:
1. Create a **README.md** as the main entry point
2. Link to other documents from README
3. Use **breadcrumb-style** navigation at the bottom
4. Add "← Back to Index" links

### For Note-Taking:
1. Use **date-based** or **topic-based** folders
2. Link related notes together
3. Maintain an **index file** with all note links
4. Use tags in filenames for easy searching

### For Multi-Chapter Documents:
1. Create a **table of contents** file
2. Use **Next/Previous** links at the bottom
3. Number chapters for clear ordering
4. Link back to the table of contents

---

## Next Steps

- Learn about [Live Reload](./live-reload.md)
- Explore [Context Menu](./context-menu.md) actions
- Check out [Markdown Features](./markdown-features.md)

---

[← Back to Documentation Index](./README.md)

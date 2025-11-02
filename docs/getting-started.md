# Getting Started with Markify

Learn the basics of opening and navigating Markdown files in Markify.

---

## Opening Files

There are three ways to open a Markdown file in Markify:

### 1. From Welcome Screen

Click the **"Open File"** button and select a `.md` file from the file dialog.

**Steps:**
1. Launch Markify
2. Click "Open File" button
3. Navigate to your Markdown file
4. Click "Open"

### 2. From Command Line

Run the `md` command in your terminal:

```bash
md path/to/file.md
```

**Examples:**
```bash
# Relative path
md ./README.md

# Absolute path
md /Users/username/Documents/notes.md

# From anywhere (after global installation)
md ~/Documents/project/docs/guide.md
```

### 3. From Recently Opened

Click any file in the **"Recently Opened"** section on the welcome screen.

---

## Opening Folders

To browse and navigate multiple Markdown files:

### Steps:
1. Click **"Open Folder"** on the welcome screen
2. Select a directory containing Markdown files
3. Markify will display all `.md` files in a file tree sidebar

### What Happens Next:
- Markify automatically opens `README.md` if it exists
- Otherwise, it opens the first `.md` file found
- The file tree shows all Markdown files in the directory
- You can click any file in the tree to open it

### Use Cases:
- Documentation projects with multiple files
- Note-taking folders
- Project documentation
- Blog posts or articles

---

## Recently Opened

The welcome screen shows your **recently opened** files and folders for quick access.

### Features:
- **Tracks only explicit opens**: Items you opened via "Open File" or "Open Folder"
- **Does not track navigation**: Files accessed via links or file tree clicks
- **Shows up to 5 items**: Most recent first
- **Clean display**: Filename and parent folder only
- **Full path on hover**: Tooltip shows complete path
- **Quick reopening**: Single click to reopen

### Display Format:
```
📄 README.md
   my-project

📁 documentation
   projects
```

### Icons:
- 📄 File icon for `.md` files
- 📁 Folder icon for directories

---

## First Steps

### After Opening a File:

1. **View the rendered Markdown** in the main content area
2. **Check the header** for the current file path
3. **Use the file tree** (if folder is open) to navigate
4. **Click links** to navigate to related files
5. **Right-click files** in the tree for quick actions

### After Opening a Folder:

1. **Browse the file tree** on the left sidebar
2. **Click files** to open them
3. **Expand/collapse folders** by clicking folder names
4. **Use navigation buttons** (← →) in the sidebar header
5. **Toggle the sidebar** with the menu button (☰)

---

## Tips for Beginners

### Organizing Your Markdown Files:
- Create a `README.md` as the main entry point
- Use folders to organize related documents
- Link between files using relative paths
- Keep files in a project-specific directory

### Recommended Structure:
```
my-project/
├── README.md (main overview)
├── getting-started.md
├── guides/
│   ├── installation.md
│   └── configuration.md
└── api/
    └── reference.md
```

### Next Steps:
- Learn about [Navigation](./navigation.md) features
- Set up [Editor Integration](./editor-configuration.md)
- Explore [Markdown Features](./markdown-features.md)

---

[← Back to Documentation Index](./README.md)

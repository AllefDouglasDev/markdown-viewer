# Interface Features

Explore Markify's clean, dark-themed interface designed for comfortable reading and efficient navigation.

---

## Dark Theme

Markify features a carefully crafted dark theme optimized for readability.

### Color Scheme:

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Gray | `#1e1e1e` |
| Text | Light Gray | `#d4d4d4` |
| Accent | Blue | `#58a6ff` |
| Code Background | Darker Gray | `#2d2d2d` |
| Borders | Medium Gray | `#3c3c3c` |
| Success | Green | `#3fb950` |
| Error | Red | `#f85149` |

### Typography:

- **System Font Stack**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Code Font**: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace
- **Optimized**: For both macOS and Windows
- **Readable**: High contrast without eye strain

---

## Layout Structure

### Main Components:

```
┌─────────┬──────────────────────────┐
│         │ Header                   │
│ Sidebar ├──────────────────────────┤
│         │                          │
│ (File   │   Content                │
│  Tree)  │   Area                   │
│         │                          │
└─────────┴──────────────────────────┘
```

### Header:
- **File path** display
- **Update indicator** (when file changes)
- **Open in Editor** button (external link icon)
- **Settings** button (gear icon)

### Sidebar:
- **Navigation buttons** (back/forward)
- **File tree** (files and folders)
- **Exit Preview** button (bottom)

### Content Area:
- **Rendered Markdown** with styling
- **Scrollable** content
- **Syntax-highlighted** code blocks
- **Interactive** Mermaid diagrams

---

## Sidebar Toggle

Control the file tree sidebar visibility.

### Toggle Button:
- **Location**: Top-left corner
- **Icon**: ☰ (hamburger menu)
- **Tooltip**: "Hide sidebar" / "Show sidebar"
- **Sticky**: Stays visible when scrolling

### Behavior:
- **Click** to show/hide
- **Smooth animation** when toggling
- **Content reflows** when sidebar hidden
- **State preserved** during session

### Dimensions:
- **Sidebar width**: 280px when open
- **Button size**: 48px × 48px
- **Z-index**: Above content, below menus

---

## Navigation Buttons

Located in the sidebar header for history navigation.

### Buttons:
- **← Previous**: Go back in history
- **→ Next**: Go forward in history

### States:
- **Enabled**: Dark background, clickable
- **Disabled**: Faded, not clickable
- **Hover**: Lighter background, blue border

### Layout:
- **Centered** in sidebar header
- **Equal width**: Each button takes 50% of width
- **Gap**: 8px between buttons

---

## Settings Button

Quick access to editor configuration.

### Locations:

**1. Welcome Screen:**
- **Position**: Top-right corner
- **Icon**: ⚙️ gear icon
- **Tooltip**: "Configure Editors"

**2. File View Header:**
- **Position**: Right side of header
- **Icon**: ⚙️ gear icon
- **Tooltip**: "Configure Editors"

### Behavior:
- **Click**: Opens `markify-config.json`
- **Opens in**: System default editor
- **Hover**: Blue border, slight scale up

---

## Exit Preview Button

Return to the welcome screen.

### Location:
- **Sidebar footer** (bottom of sidebar)
- **Always visible** when sidebar is open

### Features:
- **Icon**: 🏠 Home icon
- **Text**: "Exit Preview"
- **Full width**: Spans sidebar width
- **Tooltip**: "Return to welcome screen"

### Behavior:
- **Click**: Returns to welcome screen
- **Clears**: Navigation history
- **Preserves**: Recently opened list
- **Animation**: Smooth transition

---

## File Tree

Visual representation of your Markdown files and folders.

### Features:
- **Hierarchical** folder structure
- **Expandable/collapsible** folders
- **Selected file** highlighted in blue
- **Hover states** for better UX

### Icons:
- 📂 **Folder (closed)**
- 📁 **Folder (open)**
- 📄 **File**

### Indentation:
- **16px** per nesting level
- **8px** base padding
- Clear visual hierarchy

### Styling:
- **Selected**: Blue background (`#1c3a5f`)
- **Hover**: Dark background (`#2d2d2d`)
- **Font size**: 14px
- **Padding**: 6px 8px

---

## Header Elements

### File Path Display:
- **Color**: Gray (`#858585`)
- **Font size**: 14px
- **Weight**: Regular (400)
- **Flex**: Takes available space
- **Word break**: All (for long paths)

### Update Indicator:
- **Color**: Green (`#3fb950`)
- **Font size**: 12px
- **Icon**: ✓ checkmark
- **Animation**: Fade in/slide down
- **Duration**: Visible for 2 seconds
- **Background**: Semi-transparent green

### Button Group:
- **Layout**: Flex with 8px gap
- **Alignment**: Right side
- **Size**: 32px × 32px (icon buttons)
- **Hover**: Scale 1.05, blue border

---

## Content Area

### Styling:
- **Padding**: 20px
- **Line height**: 1.6
- **Width**: 100% (with sidebar), full width (without)
- **Overflow**: Scroll vertically

### Headings:
- **H1**: 2em, bottom border
- **H2**: 1.5em, bottom border
- **H3**: 1.25em
- **Margin**: 24px top, 16px bottom

### Code Blocks:
- **Background**: `#2d2d2d`
- **Padding**: 16px
- **Border radius**: 6px
- **Overflow**: Auto horizontal scroll
- **Syntax highlighting**: Enabled

### Links:
- **Color**: Blue (`#58a6ff`)
- **Text decoration**: None
- **Hover**: Underline

### Tables:
- **Border**: 1px solid `#3c3c3c`
- **Padding**: 6px 13px
- **Header**: Dark background
- **Striped rows**: Every other row

---

## Scrolling

### Custom Scrollbars:

**Content Area:**
- **Width**: 10px
- **Track**: Transparent
- **Thumb**: Gray (`#5a5a5a`)
- **Hover**: Lighter gray (`#6a6a6a`)
- **Border radius**: 5px

**Sidebar:**
- **Width**: 8px
- **Track**: Dark (`#1a1a1a`)
- **Thumb**: Gray (`#3c3c3c`)
- **Hover**: Lighter (`#555555`)
- **Border radius**: 4px

### Smooth Scrolling:
- **Behavior**: Smooth
- **Anchor jumps**: Smooth scroll to section
- **Cursor position**: Centers in viewport

---

## Responsive Design

### Sidebar:
- **Fixed width**: 280px
- **Not responsive** (desktop-focused app)
- **Collapsible**: Manual toggle only

### Content:
- **Adapts**: To sidebar state
- **Full width**: When sidebar closed
- **Margin**: Accounts for sidebar and toggle button

### Future:
- Tablet/mobile views (planned)
- Window resize handling
- Zoom support

---

## Accessibility

### Keyboard Navigation:
- Tab through interactive elements
- Enter to activate buttons
- Arrow keys in file tree (coming soon)

### Visual Indicators:
- Clear hover states
- Focus outlines (context menus)
- Disabled state for buttons

### Screen Readers:
- Semantic HTML structure
- ARIA labels where needed
- Alt text for icons (via title attributes)

---

## Tips

### Customizing Layout:
- Collapse sidebar for distraction-free reading
- Use dual monitors: editor + Markify
- Adjust window size to preference

### Performance:
- Sidebar stays fixed (no reflow on scroll)
- Hardware-accelerated animations
- Efficient re-renders

---

## Next Steps

- Learn about [Context Menu](./context-menu.md)
- Explore [Keyboard Shortcuts](./keyboard-shortcuts.md)
- Check out [Tips & Tricks](./tips-and-tricks.md)

---

[← Back to Documentation Index](./README.md)

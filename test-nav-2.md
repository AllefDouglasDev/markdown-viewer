# Test Navigation - Page 2

Welcome to the second page! The navigation worked! 🎉

## Going Back

Click here to return to the first page: [Back to Page 1](./test-nav-1.md)

## What Just Happened?

When you clicked the link from Page 1:

1. The renderer intercepted the click event
2. Detected it was a `.md` file link
3. Sent the path to the main process via IPC
4. Main process resolved the relative path
5. Loaded the new file content
6. Updated the file watcher to watch the new file
7. Renderer updated the display with the new content

## Testing the File Watcher

Try editing this file in your text editor. The preview should update automatically to reflect your changes!

## Another External Link

Just to confirm external links still work: [Anthropic](https://www.anthropic.com)

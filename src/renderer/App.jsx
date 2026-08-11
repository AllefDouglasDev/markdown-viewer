import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import { Check, AlertTriangle, ChevronLeft, Settings, ExternalLink, Search, X } from 'lucide-react';
import Mark from 'mark.js';
import MermaidChart from './MermaidChart';
import WelcomeScreen from './WelcomeScreen';
import FileTree from './FileTree';
import CodeBlock from './CodeBlock';
import ImageLightbox from './ImageLightbox';
import './styles.css';

function remarkLineNumbers() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.position && node.position.start) {
        if (!node.data) node.data = {};
        if (!node.data.hProperties) node.data.hProperties = {};
        node.data.hProperties['data-source-line'] = node.position.start.line;
      }
    });
  };
}

const TASK_ITEM_PATTERN = /^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+\[)([ xX])(\])/;
const CELL_CHECKBOX_PATTERN = /^([ \t]*)\[([ xX])\]/;
const ANY_CHECKBOX_PATTERN = /\[[ xX]\]/g;

function remarkTableTaskCheckboxes() {
  return (tree) => {
    visit(tree, 'table', (table) => {
      (table.children || []).forEach((row, rowIndex) => {
        if (rowIndex === 0) return;

        let checkboxIndex = 0;

        for (const cell of row.children || []) {
          const first = cell.children?.[0];
          if (!first || first.type !== 'text' || !first.position) continue;

          const match = first.value.match(CELL_CHECKBOX_PATTERN);
          if (!match) continue;

          const checkbox = {
            type: 'tableTaskCheckbox',
            data: {
              hName: 'input',
              hProperties: {
                type: 'checkbox',
                checked: match[2].toLowerCase() === 'x',
                'data-checkbox-line': first.position.start.line,
                'data-checkbox-column': first.position.start.column + match[1].length,
                'data-checkbox-index': checkboxIndex,
              },
            },
          };

          const rest = first.value.slice(match[0].length).replace(/^[ \t]+/, '');

          if (rest) {
            first.value = rest;
            cell.children.unshift(checkbox);
          } else {
            cell.children.splice(0, 1, checkbox);

            if (!cell.data) cell.data = {};
            if (!cell.data.hProperties) cell.data.hProperties = {};
            cell.data.hProperties.className = ['task-cell'];
          }

          checkboxIndex++;
        }
      });
    });
  };
}

function rehypeTaskCheckboxLines() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'li') return;

      const line = node.position?.start?.line;
      if (!line) return;

      visit(node, 'element', (child) => {
        if (child.tagName === 'input' && child.properties?.type === 'checkbox') {
          child.properties['data-checkbox-line'] = line;
          return false;
        }
      });
    });
  };
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (!node.children) return '';
  return node.children.map(nodeText).join('');
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-');
}

function rehypeHeadingSlugs() {
  return (tree) => {
    const used = new Map();

    visit(tree, 'element', (node) => {
      if (!HEADING_TAGS.has(node.tagName)) return;
      if (!node.properties) node.properties = {};
      if (node.properties.id) return;

      const base = slugify(nodeText(node)) || 'section';
      const seen = used.get(base) || 0;
      used.set(base, seen + 1);
      node.properties.id = seen === 0 ? base : `${base}-${seen}`;
    });
  };
}

function findCheckbox(node) {
  let found = null;

  visit(node, 'element', (child) => {
    if (child.tagName === 'input' && child.properties?.type === 'checkbox') {
      found = child;
      return false;
    }
  });

  return found;
}

function countTasks(node) {
  let total = 0;
  let done = 0;

  for (const child of node.children || []) {
    if (child.tagName !== 'li') continue;

    const className = child.properties?.className;
    if (!Array.isArray(className) || !className.includes('task-list-item')) continue;

    const checkbox = findCheckbox(child);
    if (!checkbox) continue;

    total++;
    if (checkbox.properties.checked) done++;
  }

  return { total, done };
}

function countCellTasks(node) {
  let total = 0;
  let done = 0;

  visit(node, 'element', (child) => {
    if (child.tagName !== 'input') return;
    if (child.properties?.['data-checkbox-column'] === undefined) return;

    total++;
    if (child.properties.checked) done++;
  });

  return { total, done };
}

function toggleCheckboxInSource(source, line, checked) {
  const lines = source.split('\n');
  const index = line - 1;

  if (index < 0 || index >= lines.length) return source;
  if (!TASK_ITEM_PATTERN.test(lines[index])) return source;

  lines[index] = lines[index].replace(TASK_ITEM_PATTERN, `$1${checked ? 'x' : ' '}$3`);
  return lines.join('\n');
}

function toggleCellCheckboxInSource(source, line, cell, checked) {
  const lines = source.split('\n');
  const index = line - 1;

  if (index < 0 || index >= lines.length) return source;

  const text = lines[index];
  const mark = checked ? 'x' : ' ';
  const start = Number(cell?.column) - 1;

  if (start >= 0 && /^\[[ xX]\]$/.test(text.slice(start, start + 3))) {
    lines[index] = `${text.slice(0, start)}[${mark}]${text.slice(start + 3)}`;
    return lines.join('\n');
  }

  const fallback = [...text.matchAll(ANY_CHECKBOX_PATTERN)][Number(cell?.index)];
  if (!fallback) return source;

  lines[index] = `${text.slice(0, fallback.index)}[${mark}]${text.slice(fallback.index + 3)}`;
  return lines.join('\n');
}

function App() {
  const [markdown, setMarkdown] = useState('');
  const [filePath, setFilePath] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cursorLine, setCursorLine] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasFile, setHasFile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [directoryTree, setDirectoryTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(true);
  const [outline, setOutline] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [contentScale, setContentScale] = useState(() => {
    const stored = Number(window.localStorage.getItem('markify-content-scale'));
    return stored >= 0.7 && stored <= 2 ? stored : 1;
  });
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const scrollPositionsRef = useRef({});
  const pendingScrollRef = useRef(null);
  const pendingAnchorRef = useRef(null);
  const searchInputRef = useRef(null);
  const markInstanceRef = useRef(null);
  const matchesRef = useRef([]);
  const lastSearchQueryRef = useRef('');

  const parseContent = (content) => {
    const metadataMatch = content.match(/^<!--\s*nvim-metadata\s*\ncursor-line:\s*(\d+)\s*\nreal-path:\s*(.+?)\s*\n-->\n/);
    if (metadataMatch) {
      const cursorLine = parseInt(metadataMatch[1], 10);
      const realPath = metadataMatch[2];
      const cleanContent = content.replace(/^<!--\s*nvim-metadata\s*\n.*?\n-->\n/, '');
      return { content: cleanContent, cursorLine, realPath };
    }
    return { content, cursorLine: null, realPath: null };
  };

  useEffect(() => {
    if (contentRef.current && !markInstanceRef.current) {
      markInstanceRef.current = new Mark(contentRef.current);
    }
  }, [markdown]);

  useEffect(() => {
    if (searchMode && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [searchMode]);

  const updateCurrentMatch = useCallback((index) => {
    matchesRef.current.forEach((mark, i) => {
      if (i === index) {
        mark.classList.add('search-highlight-current');
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        mark.classList.remove('search-highlight-current');
      }
    });
  }, []);

  const performSearch = useCallback((query) => {
    if (!markInstanceRef.current || !query) return;

    markInstanceRef.current.unmark();
    matchesRef.current = [];

    markInstanceRef.current.mark(query, {
      separateWordSearch: false,
      caseSensitive: false,
      className: 'search-highlight',
      done: (totalMarks) => {
        const marks = contentRef.current?.querySelectorAll('mark.search-highlight');
        if (marks) {
          matchesRef.current = Array.from(marks);
          setTotalMatches(marks.length);
          if (marks.length > 0) {
            setCurrentMatchIndex(0);
            updateCurrentMatch(0);
          } else {
            setTotalMatches(0);
            setCurrentMatchIndex(0);
          }
        }
      }
    });
  }, [updateCurrentMatch]);

  const navigateToNextMatch = useCallback(() => {
    if (matchesRef.current.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % matchesRef.current.length;
      setCurrentMatchIndex(nextIndex);
      updateCurrentMatch(nextIndex);
    }
  }, [currentMatchIndex, updateCurrentMatch]);

  const navigateToPreviousMatch = useCallback(() => {
    if (matchesRef.current.length > 0) {
      const prevIndex = currentMatchIndex === 0
        ? matchesRef.current.length - 1
        : currentMatchIndex - 1;
      setCurrentMatchIndex(prevIndex);
      updateCurrentMatch(prevIndex);
    }
  }, [currentMatchIndex, updateCurrentMatch]);

  useEffect(() => {
    if (markInstanceRef.current) {
      markInstanceRef.current.unmark();
      matchesRef.current = [];
      setTotalMatches(0);
      setCurrentMatchIndex(0);

      if (searchQuery) {
        lastSearchQueryRef.current = searchQuery;
        performSearch(searchQuery);
      }
    }
  }, [searchQuery, performSearch]);

  const handleKeyDown = useCallback((e) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

    console.log('Key:', e.key, 'activeElement:', activeElement?.tagName, 'isInputFocused:', isInputFocused);

    if (isInputFocused) {
      if (e.key === 'Enter' && searchMode) {
        e.preventDefault();
        console.log('Confirming search with query:', searchQuery);
        setSearchActive(true);
        setSearchMode(false);
        searchInputRef.current?.blur();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        console.log('Escape pressed while typing');
        if (searchMode) {
          setSearchMode(false);
          searchInputRef.current?.blur();
        }
        return;
      }

      console.log('✅ Typing in input - ignoring all navigation keys');
      return;
    }

    if (e.key === '/' && !searchMode) {
      e.preventDefault();
      console.log('Opening search mode');
      setSearchMode(true);
      return;
    }

    if (e.key === 'Escape') {
      console.log('Escape pressed');
      if (searchMode) {
        setSearchMode(false);
      } else if (searchActive) {
        setSearchQuery('');
        setSearchActive(false);
        if (markInstanceRef.current) {
          markInstanceRef.current.unmark();
        }
        matchesRef.current = [];
        setTotalMatches(0);
        setCurrentMatchIndex(0);
      }
      return;
    }

    if (e.key === 'n') {
      e.preventDefault();
      console.log('Navigate next, searchActive:', searchActive, 'lastQuery:', lastSearchQueryRef.current);
      if (!searchActive && lastSearchQueryRef.current) {
        setSearchQuery(lastSearchQueryRef.current);
        setSearchActive(true);
        performSearch(lastSearchQueryRef.current);
      } else if (matchesRef.current.length > 0) {
        const nextIndex = (currentMatchIndex + 1) % matchesRef.current.length;
        setCurrentMatchIndex(nextIndex);
        updateCurrentMatch(nextIndex);
      }
      return;
    }

    if (e.key === 'p') {
      e.preventDefault();
      console.log('Navigate previous, searchActive:', searchActive, 'lastQuery:', lastSearchQueryRef.current);
      if (!searchActive && lastSearchQueryRef.current) {
        setSearchQuery(lastSearchQueryRef.current);
        setSearchActive(true);
        performSearch(lastSearchQueryRef.current);
      } else if (matchesRef.current.length > 0) {
        const prevIndex = currentMatchIndex === 0
          ? matchesRef.current.length - 1
          : currentMatchIndex - 1;
        setCurrentMatchIndex(prevIndex);
        updateCurrentMatch(prevIndex);
      }
      return;
    }

    if (e.ctrlKey && containerRef.current) {
      const halfPage = containerRef.current.clientHeight / 2;

      if (e.key === 'd') {
        e.preventDefault();
        console.log('Scrolling half page down, halfPage:', halfPage);
        containerRef.current.scrollTop += halfPage;
        return;
      }

      if (e.key === 'u') {
        e.preventDefault();
        console.log('Scrolling half page up, halfPage:', halfPage);
        containerRef.current.scrollTop -= halfPage;
        return;
      }
    }

    if (containerRef.current) {
      const scrollAmount = 100;
      const horizontalScrollAmount = 50;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          console.log('Scrolling down, current scrollTop:', containerRef.current.scrollTop);
          containerRef.current.scrollTop += scrollAmount;
          console.log('New scrollTop:', containerRef.current.scrollTop);
          break;
        case 'k':
          e.preventDefault();
          console.log('Scrolling up, current scrollTop:', containerRef.current.scrollTop);
          containerRef.current.scrollTop -= scrollAmount;
          console.log('New scrollTop:', containerRef.current.scrollTop);
          break;
        case 'h':
          e.preventDefault();
          console.log('Scrolling left');
          containerRef.current.scrollLeft -= horizontalScrollAmount;
          break;
        case 'l':
          e.preventDefault();
          console.log('Scrolling right');
          containerRef.current.scrollLeft += horizontalScrollAmount;
          break;
      }
    } else {
      console.log('containerRef.current is null!');
    }
  }, [searchMode, searchQuery, searchActive, currentMatchIndex, performSearch, updateCurrentMatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const closeSearch = useCallback(() => {
    setSearchMode(false);
    setSearchActive(true);
  }, []);

  useEffect(() => {
    loadMarkdownFile();
    loadDirectoryTree();

    window.electronAPI.onMarkdownUpdated((content) => {
      const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(content);
      setMarkdown(cleanContent);
      setCursorLine(newCursorLine);
      if (realPath) {
        setFilePath(realPath);
      }
      setLastUpdated(new Date().toLocaleTimeString());

      setTimeout(() => setLastUpdated(null), 2000);
    });

    window.electronAPI.onDirectoryTreeUpdated((tree) => {
      setDirectoryTree(tree);
    });
  }, []);

  const loadDirectoryTree = async (rootPath = null) => {
    try {
      const result = await window.electronAPI.getDirectoryTree(rootPath);
      if (result.success) {
        setDirectoryTree(result.tree);
      }
    } catch (err) {
      console.error('Failed to load directory tree:', err);
    }
  };

  useEffect(() => {
    if (cursorLine !== null && contentRef.current && containerRef.current) {
      setTimeout(() => {
        const allElements = contentRef.current.querySelectorAll('[data-source-line]');
        console.log('Total elements with data-source-line:', allElements.length);

        let targetElement = null;
        let closestLine = Infinity;

        allElements.forEach(el => {
          const line = parseInt(el.getAttribute('data-source-line'), 10);
          if (line <= cursorLine && (cursorLine - line) < (cursorLine - closestLine)) {
            closestLine = line;
            targetElement = el;
          }
        });

        console.log('Looking for line:', cursorLine, 'Found closest:', closestLine, 'Element:', targetElement);

        if (targetElement) {
          const elementRect = targetElement.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const offset = elementRect.top - containerRect.top + containerRef.current.scrollTop;
          const centerOffset = window.innerHeight / 2 - 75;

          containerRef.current.scrollTo({
            top: offset - centerOffset,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [cursorLine]);

  const rememberScroll = () => {
    if (containerRef.current && filePath) {
      scrollPositionsRef.current[filePath] = containerRef.current.scrollTop;
    }
  };

  const queueScrollRestore = (path, incomingCursorLine) => {
    pendingScrollRef.current = incomingCursorLine === null
      ? scrollPositionsRef.current[path] ?? 0
      : null;
  };

  const scrollToAnchor = (rawId, behavior = 'auto') => {
    if (!rawId || !contentRef.current || !containerRef.current) return false;

    let target = null;
    try {
      target = contentRef.current.querySelector(`[id="${CSS.escape(decodeURIComponent(rawId))}"]`);
    } catch {
      return false;
    }

    if (!target) return false;

    const offset = target.getBoundingClientRect().top
      - containerRef.current.getBoundingClientRect().top
      + containerRef.current.scrollTop;

    containerRef.current.scrollTo({ top: Math.max(offset - 24, 0), behavior });
    setActiveHeadingId(target.id);
    return true;
  };

  useEffect(() => {
    const anchor = pendingAnchorRef.current;
    const target = pendingScrollRef.current;

    if (anchor === null && target === null) return;

    pendingAnchorRef.current = null;
    pendingScrollRef.current = null;

    const container = containerRef.current;
    if (!container) return;

    const apply = () => {
      if (anchor) {
        scrollToAnchor(anchor);
        return;
      }
      container.scrollTop = target;
    };

    apply();

    const frame = requestAnimationFrame(apply);
    const timer = setTimeout(apply, 150);

    const cancelReapply = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };

    window.addEventListener('wheel', cancelReapply, { passive: true });
    window.addEventListener('keydown', cancelReapply);

    return () => {
      cancelReapply();
      window.removeEventListener('wheel', cancelReapply);
      window.removeEventListener('keydown', cancelReapply);
    };
  }, [filePath, markdown]);

  useEffect(() => {
    if (!contentRef.current) {
      setOutline([]);
      return;
    }

    const headings = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter((element) => element.id)
      .map((element) => ({
        id: element.id,
        text: element.textContent,
        level: Number(element.tagName.slice(1)),
      }));

    setOutline(headings);
    setActiveHeadingId(headings[0]?.id ?? null);
  }, [markdown, filePath]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content || outline.length === 0) return;

    let offsets = [];

    const update = () => {
      const position = container.scrollTop + 80;
      let current = offsets[0]?.id ?? null;

      for (const entry of offsets) {
        if (entry.top <= position) current = entry.id;
      }

      setActiveHeadingId((previous) => (previous === current ? previous : current));
    };

    const measure = () => {
      const containerTop = container.getBoundingClientRect().top;

      offsets = outline.map((heading) => {
        const element = document.getElementById(heading.id);
        return {
          id: heading.id,
          top: element
            ? element.getBoundingClientRect().top - containerTop + container.scrollTop
            : Number.MAX_SAFE_INTEGER,
        };
      });

      update();
    };

    measure();
    container.addEventListener('scroll', update, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => {
      container.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [outline]);

  useEffect(() => {
    window.localStorage.setItem('markify-content-scale', String(contentScale));
  }, [contentScale]);

  useEffect(() => {
    if (!window.electronAPI.onContentZoom) return;

    window.electronAPI.onContentZoom((delta) => {
      setContentScale((previous) => {
        if (delta === 0) return 1;
        return Math.min(2, Math.max(0.7, Math.round((previous + delta * 0.1) * 100) / 100));
      });
    });
  }, []);

  const addToHistory = (path) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleLinkClick = async (href) => {
    const [targetPath, anchor] = href.split('#');

    if (!targetPath) {
      scrollToAnchor(anchor, 'smooth');
      return;
    }

    setError('');
    rememberScroll();
    try {
      const result = await window.electronAPI.navigateToFile(href);

      if (result.success) {
        const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
        setMarkdown(cleanContent);
        setCursorLine(newCursorLine);
        const newPath = realPath || result.filePath;
        setFilePath(newPath);
        setError('');
        addToHistory(newPath);
        queueScrollRestore(newPath, newCursorLine);
        pendingAnchorRef.current = anchor || null;
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to navigate: ${err.message}`);
    }
  };

  const navigateToPrevious = async () => {
    if (historyIndex <= 0) return;

    setError('');
    rememberScroll();
    const prevPath = history[historyIndex - 1];
    const result = await window.electronAPI.navigateToFile(prevPath);

    if (result.success) {
      const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
      setMarkdown(cleanContent);
      setCursorLine(newCursorLine);
      const newPath = realPath || result.filePath;
      setFilePath(newPath);
      setError('');
      setHistoryIndex(historyIndex - 1);
      queueScrollRestore(newPath, newCursorLine);
    } else {
      setError(result.error);
    }
  };

  const navigateToNext = async () => {
    if (historyIndex >= history.length - 1) return;

    setError('');
    rememberScroll();
    const nextPath = history[historyIndex + 1];
    const result = await window.electronAPI.navigateToFile(nextPath);

    if (result.success) {
      const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
      setMarkdown(cleanContent);
      setCursorLine(newCursorLine);
      const newPath = realPath || result.filePath;
      setFilePath(newPath);
      setError('');
      setHistoryIndex(historyIndex + 1);
      queueScrollRestore(newPath, newCursorLine);
    } else {
      setError(result.error);
    }
  };

  const goBack = async () => {
    if (historyIndex > 0) {
      await navigateToPrevious();
    }
  };

  const goToHome = () => {
    rememberScroll();
    setMarkdown('');
    setFilePath('');
    setError('');
    setHistory([]);
    setHistoryIndex(-1);
    setHasFile(false);
    setCursorLine(null);
  };

  const handleOpenConfigFile = async () => {
    await window.electronAPI.openConfigFile();
  };

  const handleOpenInEditor = async () => {
    if (filePath) {
      await window.electronAPI.openInEditor(filePath, cursorLine || 1);
    }
  };

  const loadMarkdownFile = async () => {
    try {
      const result = await window.electronAPI.getMarkdownFile();

      if (result.hasFile === false) {
        setHasFile(false);
        setLoading(false);
        return;
      }

      if (result.success) {
        const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
        setMarkdown(cleanContent);
        setCursorLine(newCursorLine);
        const newPath = realPath || result.filePath;
        setFilePath(newPath);
        setError('');
        setHistory([newPath]);
        setHistoryIndex(0);
        setHasFile(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelected = (result) => {
    const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
    setMarkdown(cleanContent);
    setCursorLine(newCursorLine);
    const newPath = realPath || result.filePath;
    setFilePath(newPath);
    setSelectedFile(newPath);
    setError('');
    setHistory([newPath]);
    setHistoryIndex(0);
    setHasFile(true);
    loadDirectoryTree();
  };

  const handleFolderSelected = async (result) => {
    if (result.success) {
      setDirectoryTree(result.tree);
      setHasFile(true);

      if (result.defaultFile) {
        const fileResult = await window.electronAPI.navigateToFile(result.defaultFile);
        if (fileResult.success) {
          const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(fileResult.content);
          setMarkdown(cleanContent);
          setCursorLine(newCursorLine);
          const newPath = realPath || fileResult.filePath;
          setFilePath(newPath);
          setSelectedFile(newPath);
          setError('');
          setHistory([newPath]);
          setHistoryIndex(0);
        }
      }
    }
  };

  const resolveResource = (src) => {
    if (!src || /^(https?:|data:|file:|blob:)/i.test(src)) return src;
    if (!filePath) return src;

    const directory = filePath.replace(/[\\/][^\\/]*$/, '').replace(/\\/g, '/');
    const normalized = src.replace(/\\/g, '/');
    const absolute = normalized.startsWith('/') ? normalized : `${directory}/${normalized}`;

    return encodeURI(`file://${absolute.startsWith('/') ? '' : '/'}${absolute}`);
  };

  const handleCheckboxToggle = async (line, checked, cell = null) => {
    if (!filePath || !line) return;

    const previous = markdown;
    const next = cell
      ? toggleCellCheckboxInSource(previous, line, cell, checked)
      : toggleCheckboxInSource(previous, line, checked);

    if (next === previous) {
      setError(`No checkbox found at line ${line}`);
      return;
    }

    setMarkdown(next);

    try {
      const result = await window.electronAPI.toggleCheckbox(filePath, line, checked, cell);
      if (!result?.success) {
        setMarkdown(previous);
        setError(result?.error || 'Failed to save checkbox');
      }
    } catch (err) {
      setMarkdown(previous);
      setError(`Failed to save checkbox: ${err.message}`);
    }
  };

  const handleFileSelectFromTree = async (path) => {
    setError('');
    rememberScroll();
    try {
      const result = await window.electronAPI.navigateToFile(path);
      if (result.success) {
        const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
        setMarkdown(cleanContent);
        setCursorLine(newCursorLine);
        const newPath = realPath || result.filePath;
        setFilePath(newPath);
        setSelectedFile(newPath);
        setError('');
        addToHistory(newPath);
        queueScrollRestore(newPath, newCursorLine);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to navigate: ${err.message}`);
    }
  };

  const renderedMarkdown = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkTableTaskCheckboxes, remarkGemoji, remarkLineNumbers]}
      rehypePlugins={[rehypeHighlight, rehypeTaskCheckboxLines, rehypeHeadingSlugs]}
      components={{
        input({ node, type, checked, disabled, ...props }) {
          const line = Number(node?.properties?.['data-checkbox-line']);
          const column = node?.properties?.['data-checkbox-column'];

          if (type !== 'checkbox' || !line) {
            return <input type={type} checked={checked} disabled={disabled} {...props} />;
          }

          const cell = column === undefined
            ? null
            : { column: Number(column), index: Number(node.properties['data-checkbox-index']) };

          return (
            <input
              type="checkbox"
              className="task-checkbox"
              checked={checked === true}
              onChange={(event) => handleCheckboxToggle(line, event.target.checked, cell)}
            />
          );
        },
        table({ node, children, ...props }) {
          const { total, done } = countCellTasks(node);

          if (total < 2) {
            return <table {...props}>{children}</table>;
          }

          return (
            <div className="task-list-block">
              <div className="task-progress">
                <div className="task-progress-track">
                  <div className="task-progress-fill" style={{ width: `${Math.round((done / total) * 100)}%` }} />
                </div>
                <span className="task-progress-label">{done}/{total} done</span>
              </div>
              <table {...props}>{children}</table>
            </div>
          );
        },
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : null;

          if (!inline && lang === 'mermaid') {
            return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        pre({ node, children, ...props }) {
          const codeNode = node?.children?.find((child) => child.tagName === 'code');
          const classNames = codeNode?.properties?.className;
          const languageClass = Array.isArray(classNames)
            ? classNames.find((name) => name.startsWith('language-'))
            : null;

          if (languageClass === 'language-mermaid') {
            return <>{children}</>;
          }

          return (
            <CodeBlock code={nodeText(codeNode)} language={languageClass ? languageClass.slice(9) : ''}>
              <pre {...props}>{children}</pre>
            </CodeBlock>
          );
        },
        ul({ node, className, children, ...props }) {
          const isTaskList = typeof className === 'string' && className.includes('contains-task-list');
          const { total, done } = isTaskList ? countTasks(node) : { total: 0, done: 0 };

          if (!isTaskList || total < 2) {
            return <ul className={className} {...props}>{children}</ul>;
          }

          return (
            <div className="task-list-block">
              <div className="task-progress">
                <div className="task-progress-track">
                  <div className="task-progress-fill" style={{ width: `${Math.round((done / total) * 100)}%` }} />
                </div>
                <span className="task-progress-label">{done}/{total} done</span>
              </div>
              <ul className={className} {...props}>{children}</ul>
            </div>
          );
        },
        img({ node, src, alt, ...props }) {
          const resolved = resolveResource(src);

          return (
            <img
              {...props}
              src={resolved}
              alt={alt || ''}
              className="markdown-image"
              onClick={() => setLightbox({ src: resolved, alt })}
            />
          );
        },
        a({ node, href, children, ...props }) {
          const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
          const isAnchor = href?.startsWith('#');
          const isMdFile = href?.includes('.md');

          if (isAnchor) {
            return (
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToAnchor(href.slice(1), 'smooth');
                }}
                {...props}
              >
                {children}
              </a>
            );
          }

          if (isMdFile && !isExternal) {
            return (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(href);
                }}
                {...props}
              >
                {children}
              </a>
            );
          }

          if (isExternal) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          }

          return (
            <a href={href} {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  ), [markdown, filePath]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!hasFile && !markdown) {
    return <WelcomeScreen onFileSelected={handleFileSelected} onFolderSelected={handleFolderSelected} />;
  }

  return (
    <div className="app-layout">
      <FileTree
        tree={directoryTree}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelectFromTree}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigatePrev={navigateToPrevious}
        onNavigateNext={navigateToNext}
        onExitPreview={goToHome}
        canNavigatePrev={historyIndex > 0}
        canNavigateNext={historyIndex < history.length - 1}
        outline={outline}
        activeHeadingId={activeHeadingId}
        onHeadingSelect={(id) => scrollToAnchor(id, 'smooth')}
      />
      <div className={`container ${sidebarOpen ? 'with-sidebar' : ''}`} ref={containerRef}>
      <div className="header">
        <h3 className="file-path">{filePath}</h3>
        {lastUpdated && (
          <div className="update-indicator">
            <Check size={16} /> Updated at {lastUpdated}
          </div>
        )}
        <div className="header-buttons">
          {contentScale !== 1 && (
            <button
              className="header-button zoom-indicator"
              onClick={() => setContentScale(1)}
              title="Reset zoom"
            >
              {Math.round(contentScale * 100)}%
            </button>
          )}
          <button
            className="header-button"
            onClick={handleOpenInEditor}
            title="Open in Editor"
          >
            <ExternalLink size={16} />
          </button>
          <button
            className="header-button"
            onClick={handleOpenConfigFile}
            title="Configure Editors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
      {error && !markdown ? (
        <div className="error-page">
          <h2>Failed to Open File</h2>
          <p>{error}</p>
          {historyIndex > 0 && (
            <button className="back-button" onClick={goBack}>
              ← Go Back to Previous File
            </button>
          )}
        </div>
      ) : (
        <>
          {error && (
            <div className="error-banner">
              <div className="error-banner-content">
                <strong><AlertTriangle size={16} /> Navigation Error:</strong> {error}
                {historyIndex > 0 && (
                  <button className="back-button-inline" onClick={goBack}>
                    <ChevronLeft size={16} /> Go Back
                  </button>
                )}
              </div>
            </div>
          )}
          {searchMode && (
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to search... (live highlight, Enter to close, n/p to navigate)"
                className="search-input"
              />
              {totalMatches > 0 && (
                <span className="search-counter">
                  {currentMatchIndex + 1}/{totalMatches}
                </span>
              )}
              <button onClick={closeSearch} className="search-close">
                <X size={16} />
              </button>
            </div>
          )}
          <div
            className="markdown-content"
            ref={contentRef}
            style={{ '--content-scale': contentScale }}
          >
            {renderedMarkdown}
          </div>
        </>
      )}
      </div>
      <ImageLightbox image={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

export default App;

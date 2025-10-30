import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import MermaidChart from './MermaidChart';
import WelcomeScreen from './WelcomeScreen';
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

function App() {
  const [markdown, setMarkdown] = useState('');
  const [filePath, setFilePath] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cursorLine, setCursorLine] = useState(null);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasFile, setHasFile] = useState(false);
  const contentRef = React.useRef(null);

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
    loadMarkdownFile();

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
  }, []);

  useEffect(() => {
    if (cursorLine !== null && contentRef.current) {
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
          const containerRect = contentRef.current.getBoundingClientRect();
          const offset = elementRect.top - containerRect.top + contentRef.current.scrollTop;
          const centerOffset = window.innerHeight / 2 - 75;

          contentRef.current.scrollTo({
            top: offset - centerOffset,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [cursorLine]);

  const addToHistory = (path) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleLinkClick = async (href) => {
    setError('');
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

        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
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
    const prevPath = history[historyIndex - 1];
    const result = await window.electronAPI.navigateToFile(prevPath);

    if (result.success) {
      const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
      setMarkdown(cleanContent);
      setCursorLine(newCursorLine);
      setFilePath(realPath || result.filePath);
      setError('');
      setHistoryIndex(historyIndex - 1);

      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } else {
      setError(result.error);
    }
  };

  const navigateToNext = async () => {
    if (historyIndex >= history.length - 1) return;

    setError('');
    const nextPath = history[historyIndex + 1];
    const result = await window.electronAPI.navigateToFile(nextPath);

    if (result.success) {
      const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
      setMarkdown(cleanContent);
      setCursorLine(newCursorLine);
      setFilePath(realPath || result.filePath);
      setError('');
      setHistoryIndex(historyIndex + 1);

      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
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
    setMarkdown('');
    setFilePath('');
    setError('');
    setHistory([]);
    setHistoryIndex(-1);
    setHasFile(false);
    setCursorLine(null);
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
    setError('');
    setHistory([newPath]);
    setHistoryIndex(0);
    setHasFile(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!hasFile && !markdown) {
    return <WelcomeScreen onFileSelected={handleFileSelected} />;
  }

  return (
    <div className="container">
      <div className={`header ${headerCollapsed ? 'collapsed' : ''}`}>
        <div className="header-nav">
          <button
            className="nav-button"
            onClick={navigateToPrevious}
            disabled={historyIndex <= 0}
            title="Previous file"
          >
            ←
          </button>
          <button
            className="nav-button"
            onClick={navigateToNext}
            disabled={historyIndex >= history.length - 1}
            title="Next file"
          >
            →
          </button>
        </div>
        <button
          className="home-button"
          onClick={goToHome}
          title="Go to home screen"
        >
          🏠
        </button>
        <button
          className="header-toggle"
          onClick={() => setHeaderCollapsed(!headerCollapsed)}
          title={headerCollapsed ? 'Expand header' : 'Collapse header'}
        >
          {headerCollapsed ? '▼' : '▲'}
        </button>
        {!headerCollapsed && (
          <>
            <h3 className="file-path">{filePath}</h3>
            {lastUpdated && (
              <div className="update-indicator">
                ✓ Updated at {lastUpdated}
              </div>
            )}
          </>
        )}
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
                <strong>⚠ Navigation Error:</strong> {error}
                {historyIndex > 0 && (
                  <button className="back-button-inline" onClick={goBack}>
                    ← Go Back
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="markdown-content" ref={contentRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkGemoji, remarkLineNumbers]}
          rehypePlugins={[rehypeHighlight]}
          components={{
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
            a({ node, href, children, ...props }) {
              const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
              const isAnchor = href?.startsWith('#');
              const isMdFile = href?.includes('.md');

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
          </div>
        </>
      )}
    </div>
  );
}

export default App;

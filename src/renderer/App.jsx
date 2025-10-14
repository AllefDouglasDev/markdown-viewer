import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import MermaidChart from './MermaidChart';
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

  const loadMarkdownFile = async () => {
    try {
      const result = await window.electronAPI.getMarkdownFile();

      if (result.success) {
        const { content: cleanContent, cursorLine: newCursorLine, realPath } = parseContent(result.content);
        setMarkdown(cleanContent);
        setCursorLine(newCursorLine);
        setFilePath(realPath || result.filePath);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={`header ${headerCollapsed ? 'collapsed' : ''}`}>
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
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default App;

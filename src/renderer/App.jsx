import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import rehypeHighlight from 'rehype-highlight';
import './styles.css';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [filePath, setFilePath] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Load initial markdown file
    loadMarkdownFile();

    // Listen for file updates
    window.electronAPI.onMarkdownUpdated((content) => {
      console.log('File updated! Reloading markdown...');
      setMarkdown(content);
      setLastUpdated(new Date().toLocaleTimeString());

      // Clear the update indicator after 2 seconds
      setTimeout(() => setLastUpdated(null), 2000);
    });
  }, []);

  const loadMarkdownFile = async () => {
    try {
      const result = await window.electronAPI.getMarkdownFile();

      if (result.success) {
        setMarkdown(result.content);
        setFilePath(result.filePath);
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
      <div className="header">
        <h3 className="file-path">{filePath}</h3>
        {lastUpdated && (
          <div className="update-indicator">
            ✓ Updated at {lastUpdated}
          </div>
        )}
      </div>
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkGemoji]}
          rehypePlugins={[rehypeHighlight]}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default App;

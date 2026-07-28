import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language, children }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-actions">
        {language && <span className="code-block-language">{language}</span>}
        <button className="code-block-copy" onClick={copy} title="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {children}
    </div>
  );
}

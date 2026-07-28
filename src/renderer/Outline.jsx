import React from 'react';

export default function Outline({ headings, activeId, onSelect }) {
  if (!headings || headings.length === 0) {
    return <div className="file-tree-empty">No headings in this file</div>;
  }

  const minLevel = Math.min(...headings.map((heading) => heading.level));

  return (
    <div className="outline">
      {headings.map((heading) => (
        <button
          key={heading.id}
          className={`outline-item ${activeId === heading.id ? 'active' : ''}`}
          style={{ paddingLeft: `${(heading.level - minLevel) * 14 + 10}px` }}
          onClick={() => onSelect(heading.id)}
          title={heading.text}
        >
          {heading.text}
        </button>
      ))}
    </div>
  );
}

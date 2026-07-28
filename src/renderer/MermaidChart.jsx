import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Copy, Check } from 'lucide-react';

let chartIdCounter = 0;

const MIN_SCALE = 0.3;
const MAX_SCALE = 6;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function ChartViewport({ svg, fullscreen, view, setView }) {
  const viewportRef = useRef(null);
  const dragRef = useRef(null);

  const zoomAt = useCallback((factor, clientX, clientY) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const originX = clientX - rect.left - rect.width / 2;
    const originY = clientY - rect.top - rect.height / 2;

    setView((prev) => {
      const scale = clampScale(prev.scale * factor);
      const ratio = scale / prev.scale;
      return {
        scale,
        x: originX - (originX - prev.x) * ratio,
        y: originY - (originY - prev.y) * ratio,
      };
    });
  }, [setView]);

  const handleWheel = useCallback((event) => {
    if (!fullscreen && !event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX, event.clientY);
  }, [fullscreen, zoomAt]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = { startX: event.clientX, startY: event.clientY, originX: view.x, originY: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    setView((prev) => ({
      ...prev,
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    }));
  };

  const handlePointerUp = (event) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={viewportRef}
      className="mermaid-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={() => setView({ scale: 1, x: 0, y: 0 })}
    >
      <div
        className="mermaid-stage"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

export default function MermaidChart({ chart }) {
  const [chartId] = useState(() => `mermaid-${++chartIdCounter}`);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    let retry = null;

    const renderChart = async () => {
      if (!window.mermaid) {
        retry = setTimeout(renderChart, 100);
        return;
      }

      try {
        const result = await window.mermaid.render(chartId, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };

    renderChart();

    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
    };
  }, [chart, chartId]);

  useEffect(() => {
    if (!fullscreen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [fullscreen]);

  const reset = () => setView({ scale: 1, x: 0, y: 0 });

  const zoomBy = (factor) => {
    setView((prev) => ({ ...prev, scale: clampScale(prev.scale * factor) }));
  };

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const toggleFullscreen = () => {
    reset();
    setFullscreen((prev) => !prev);
  };

  if (error) {
    return <pre className="mermaid-error">Error rendering diagram: {error}</pre>;
  }

  const toolbar = (
    <div className="mermaid-toolbar">
      <button onClick={() => zoomBy(1.2)} title="Zoom in">
        <ZoomIn size={15} />
      </button>
      <button onClick={() => zoomBy(1 / 1.2)} title="Zoom out">
        <ZoomOut size={15} />
      </button>
      <button onClick={reset} title="Reset zoom">
        <RotateCcw size={15} />
      </button>
      <button onClick={copySource} title="Copy diagram source">
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <button onClick={toggleFullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
    </div>
  );

  return (
    <>
      <div className="mermaid-chart">
        {toolbar}
        {fullscreen ? (
          <div className="mermaid-placeholder">Diagram open in fullscreen</div>
        ) : (
          <ChartViewport svg={svg} fullscreen={false} view={view} setView={setView} />
        )}
        {!fullscreen && view.scale !== 1 && (
          <span className="mermaid-scale">{Math.round(view.scale * 100)}%</span>
        )}
      </div>
      {fullscreen && (
        <div className="mermaid-overlay" onClick={(event) => event.target === event.currentTarget && setFullscreen(false)}>
          <div className="mermaid-overlay-inner">
            {toolbar}
            <ChartViewport svg={svg} fullscreen view={view} setView={setView} />
            <span className="mermaid-scale">{Math.round(view.scale * 100)}%</span>
          </div>
        </div>
      )}
    </>
  );
}

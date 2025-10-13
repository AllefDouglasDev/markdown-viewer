import React, { useEffect, useRef, useState } from 'react';

let chartIdCounter = 0;

export default function MermaidChart({ chart }) {
  const chartRef = useRef(null);
  const [chartId] = useState(() => `mermaid-${++chartIdCounter}-${Date.now()}`);

  useEffect(() => {
    const renderChart = async () => {
      if (!chartRef.current || !chart) return;

      // Wait for mermaid to be available from CDN
      if (!window.mermaid) {
        console.warn('Mermaid not loaded yet, retrying...');
        setTimeout(renderChart, 100);
        return;
      }

      try {
        // Clear previous content
        chartRef.current.innerHTML = '';

        // Render mermaid chart using unique ID
        const { svg } = await window.mermaid.render(chartId, chart);

        // Insert the rendered SVG
        chartRef.current.innerHTML = svg;
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        chartRef.current.innerHTML = `<pre style="color: #ff6b6b;">Error rendering diagram: ${error.message}</pre>`;
      }
    };

    renderChart();
  }, [chart, chartId]);

  return <div ref={chartRef} className="mermaid-chart" />;
}

import React, { useEffect, useRef, useState } from 'react';

let chartIdCounter = 0;

export default function MermaidChart({ chart }) {
  const chartRef = useRef(null);
  const [chartId] = useState(() => `mermaid-${++chartIdCounter}-${Date.now()}`);

  useEffect(() => {
    const renderChart = async () => {
      if (!chartRef.current || !chart) return;

      if (!window.mermaid) {
        setTimeout(renderChart, 100);
        return;
      }

      try {
        chartRef.current.innerHTML = '';

        const { svg } = await window.mermaid.render(chartId, chart);

        chartRef.current.innerHTML = svg;
      } catch (error) {
        chartRef.current.innerHTML = `<pre style="color: #ff6b6b;">Error rendering diagram: ${error.message}</pre>`;
      }
    };

    renderChart();
  }, [chart, chartId]);

  return <div ref={chartRef} className="mermaid-chart" />;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewProps {
  chart: string;
}

export function MermaidView({ chart }: MermaidViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }, []);

  useEffect(() => {
    const render = async () => {
      if (!chart) return;
      try {
        const { svg } = await mermaid.render('mermaid-chart', chart);
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid render failed', e);
      }
    };
    void render();
  }, [chart]);

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ overflow: 'auto', padding: '1rem', background: '#0d1117', borderRadius: '8px' }}
    />
  );
}

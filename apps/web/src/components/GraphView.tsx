'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { ContentEdge } from '@in-midst-my-life/schema';
import type { GraphNode } from '../app/ui/graph-utils';

interface GraphViewProps {
  nodes: GraphNode[];

  edges: ContentEdge[];

  types: string[];

  filter: string[];

  onToggleType: (type: string) => void;

  onResetFilter: () => void;

  nodePositionMap: Map<string, { x: number; y: number }>;

  onNodeClick: (node: GraphNode) => void;
}

export function GraphView({
  nodes,

  edges,

  types,

  filter,

  onToggleType,

  onResetFilter,

  nodePositionMap,

  onNodeClick,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 360, height: 360 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      const size = Math.max(width, 200);
      setDimensions({ width: size, height: size });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const filteredNodes = useMemo(() => {
    if (filter.length === 0) return nodes;

    return nodes.filter((node) => filter.includes(node.type));
  }, [filter, nodes]);

  const filteredEdges = useMemo(() => {
    const available = new Set(filteredNodes.map((node) => node.id));

    return edges.filter((edge) => available.has(edge.fromId) && available.has(edge.toId));
  }, [edges, filteredNodes]);

  return (
    <section className="section">
      <h2 className="section-title">Relationship Graph View</h2>

      <p className="section-subtitle">
        Filter the active node types, then use the graph as a quick pulse on narrative
        relationships.
      </p>

      <div className="chip-row" style={{ marginBottom: '1rem' }}>
        {types.map((type) => (
          <button
            key={type}
            className={`chip ${filter.includes(type) ? 'active' : ''}`}
            onClick={() => onToggleType(type)}
          >
            {type}
          </button>
        ))}

        <button className="chip" onClick={onResetFilter}>
          Reset
        </button>
      </div>

      <div className="graph-canvas" ref={containerRef}>
        {filteredNodes.length === 0 ? (
          <span>Load nodes to render graph.</span>
        ) : (
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            style={{ maxWidth: '100%' }}
          >
            {filteredEdges.map((edge) => {
              const from = nodePositionMap.get(edge.fromId);

              const to = nodePositionMap.get(edge.toId);

              if (!from || !to) return null;

              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#5a5248"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
              );
            })}

            {filteredNodes.map((node) => {
              const pos = nodePositionMap.get(node.id);

              if (!pos) return null;

              return (
                <g key={node.id} onClick={() => onNodeClick(node)} style={{ cursor: 'pointer' }}>
                  <circle cx={pos.x} cy={pos.y} r="16" fill="#f5efe6" stroke="#d36b3c" />

                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="8" fill="#1d1a16">
                    {node.label.slice(0, 12)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <div className="grid three" style={{ marginTop: '1rem' }}>
        {filteredNodes.slice(0, 6).map((node) => (
          <div key={node.id} className="stat-card">
            <div className="stat-label">{node.type}</div>
            <div className="stat-value">{node.label}</div>
            {node.subtitle ? <div className="section-subtitle">{node.subtitle}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

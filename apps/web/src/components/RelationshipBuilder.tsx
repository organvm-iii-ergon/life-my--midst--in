'use client';

import type { DragEvent } from 'react';
import type { ContentEdge } from '@in-midst-my-life/schema';

// Using the same GraphNode definition as shared
interface GraphNodeLocal {
  id: string;
  type: string;
  label: string;
  subtitle?: string;
}

interface RelationshipBuilderProps {
  relationshipStack: GraphNodeLocal[];
  availableNodes: GraphNodeLocal[];
  relationType: string;
  setRelationType: (type: string) => void;
  onDropToStack: (event: DragEvent<HTMLDivElement>, index?: number) => void;
  onRemoveFromStack?: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
  edges: ContentEdge[];
}

export function RelationshipBuilder({
  relationshipStack,
  availableNodes,
  relationType,
  setRelationType,
  onDropToStack,
  onRemoveFromStack,
  onClear,
  onSave,
  edges,
}: RelationshipBuilderProps) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Drag-and-Drop Relationships</h3>
      <div className="section-subtitle">
        Drag nodes into the stack to define a linear narrative relationship chain.
      </div>
      <div
        className="stack"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => onDropToStack(event, undefined)}
      >
        {relationshipStack.length === 0 ? (
          <span className="section-subtitle">Drop nodes here to create a relationship chain.</span>
        ) : (
          relationshipStack.map((node, index) => (
            <div
              key={`${node.id}-${index}`}
              className="stack-item"
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', node.id)}
              onDrop={(event) => onDropToStack(event, index)}
              onDragOver={(event) => event.preventDefault()}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {node.label} <small>({node.type})</small>
              {onRemoveFromStack && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromStack(index);
                  }}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--stone, #8f8376)',
                    fontSize: '1.1rem',
                    lineHeight: 1,
                    padding: '0 0.25rem',
                  }}
                  title="Remove from stack"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <label className="label">Relation Type</label>
        <input
          className="input"
          value={relationType}
          onChange={(event) => setRelationType(event.target.value)}
        />
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <div className="label">Available Nodes</div>
        <div className="stack">
          {availableNodes.slice(0, 12).map((node) => (
            <div
              key={node.id}
              className="stack-item"
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', node.id)}
            >
              {node.label} <small>({node.type})</small>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-actions" style={{ marginTop: '0.75rem' }}>
        <button className="button secondary" onClick={onClear}>
          Clear
        </button>
        <button className="button" onClick={onSave}>
          Save Edges
        </button>
      </div>
      <div className="section-subtitle" style={{ marginTop: '0.75rem' }}>
        Existing edges: {edges.length}
      </div>
    </div>
  );
}

'use client';

/**
 * Aetas Timeline Component
 * 
 * Interactive D3.js Timeline Visualization of Professional Epochs
 * Part of the theatrical metaphor: "Aetas" = ages/seasons of life
 * 
 * Shows temporal progression through career stages:
 * - Initiation → Emergence → Consolidation → Divergence
 * - Mastery → Reinvention → Transmission → Legacy
 * 
 * Features:
 * - Drag-to-explore timeline
 * - Click to focus on specific epoch
 * - Show key milestones and inflection points
 * - Visualize mask activity across epochs
 * - Animated transitions between views
 */

import { useEffect, useRef, useState } from 'react';

export interface Epoch {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  milestones: string[];
  inflectionPoints: string[];
  activeMasks?: string[];
  color?: string;
}

export interface AetasTimelineProps {
  epochs: Epoch[];
  selectedEpoch?: string;
  onEpochSelected?: (epochId: string) => void;
  height?: number;
  animated?: boolean;
}

/**
 * Main component with D3 visualization
 */
export function AetasTimeline({
  epochs,
  selectedEpoch,
  onEpochSelected,
  height = 400,
  animated = true,
}: AetasTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEpoch, setHoveredEpoch] = useState<string | null>(null);

  // TODO: Implement D3.js visualization
  // Steps:
  // 1. Create SVG container
  // 2. Calculate timeline scale (min/max dates)
  // 3. Render epoch blocks with:
  //    - Start/end dates
  //    - Color-coded by epoch type
  //    - Hover tooltips showing milestones
  //    - Click to select
  // 4. Render inflection points as markers
  // 5. Render mask activity indicators
  // 6. Add animations on transition
  // 7. Make responsive to container width

  if (epochs.length === 0) {
    return (
      <div className="aetas-timeline-empty">
        <style jsx>{`
          .aetas-timeline-empty {
            padding: 3rem 1rem;
            text-align: center;
            color: rgba(156, 163, 175, 0.7);
            background: linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(31, 41, 55, 0.3) 100%);
            border-radius: 12px;
            border: 1px dashed rgba(107, 114, 128, 0.3);
          }

          .empty-message {
            margin: 0;
            font-size: 1rem;
          }
        `}</style>
        <p className="empty-message">
          No epochs yet. Start adding life stages to visualize your professional journey.
        </p>
      </div>
    );
  }

  return (
    <div className="aetas-timeline-container" ref={containerRef}>
      <style jsx>{`
        .aetas-timeline-container {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(31, 41, 55, 0.3) 100%);
          border-radius: 12px;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .timeline-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(229, 231, 235, 0.9);
          margin: 0 0 1.5rem 0;
        }

        .timeline-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .epoch-block {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .epoch-block:hover {
          opacity: 1;
          filter: brightness(1.2);
        }

        .epoch-block.active {
          stroke: rgba(59, 130, 246, 0.8);
          stroke-width: 3;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
        }

        .epoch-label {
          font-size: 0.85rem;
          font-weight: 500;
          fill: rgba(229, 231, 235, 0.9);
          pointer-events: none;
        }

        .epoch-date {
          font-size: 0.75rem;
          fill: rgba(156, 163, 175, 0.7);
          pointer-events: none;
        }

        .milestone-marker {
          fill: rgba(34, 197, 94, 0.6);
          stroke: rgba(34, 197, 94, 0.8);
        }

        .inflection-marker {
          fill: rgba(239, 68, 68, 0.6);
          stroke: rgba(239, 68, 68, 0.8);
        }

        .mask-indicator {
          fill: rgba(147, 197, 253, 0.5);
          stroke: rgba(59, 130, 246, 0.7);
          font-size: 0.7rem;
        }

        .timeline-legend {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(107, 114, 128, 0.2);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(156, 163, 175, 0.8);
        }

        .legend-marker {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .detail-panel {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(75, 85, 99, 0.4);
          border-radius: 8px;
          border-left: 3px solid rgba(59, 130, 246, 0.5);
        }

        .detail-title {
          font-weight: 600;
          color: rgba(229, 231, 235, 0.9);
          margin: 0 0 0.75rem 0;
        }

        .detail-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .detail-list li {
          padding: 0.5rem 0;
          color: rgba(156, 163, 175, 0.8);
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(107, 114, 128, 0.1);
        }

        .detail-list li:last-child {
          border-bottom: none;
        }
      `}</style>

      <h2 className="timeline-title">📅 Professional Epochs (Aetas)</h2>

      {/* Placeholder SVG - TODO: Replace with D3 visualization */}
      <svg className="timeline-svg" height={height} viewBox={`0 0 ${epochs.length * 150} ${height}`}>
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(107, 114, 128, 0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Epoch blocks - simplified placeholder rendering */}
        {epochs.map((epoch, index) => {
          const x = index * 150 + 20;
          const y = height / 2 - 30;
          const isSelected = selectedEpoch === epoch.id;
          const color = epoch.color || `hsl(${index * 45}, 70%, 55%)`;

          return (
            <g
              key={epoch.id}
              className={`epoch-block ${isSelected ? 'active' : ''}`}
              onClick={() => onEpochSelected?.(epoch.id)}
              onMouseEnter={() => setHoveredEpoch(epoch.id)}
              onMouseLeave={() => setHoveredEpoch(null)}
            >
              {/* Epoch rectangle */}
              <rect
                x={x}
                y={y}
                width="120"
                height="60"
                fill={color}
                opacity="0.6"
                rx="4"
                stroke={isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(107, 114, 128, 0.4)'}
                strokeWidth={isSelected ? 3 : 1}
              />

              {/* Epoch label */}
              <text x={x + 60} y={y + 25} textAnchor="middle" className="epoch-label">
                {epoch.name}
              </text>

              {/* Date range */}
              <text x={x + 60} y={y + 45} textAnchor="middle" className="epoch-date">
                {epoch.startDate.getFullYear()}
                {epoch.endDate && ` - ${epoch.endDate.getFullYear()}`}
              </text>

              {/* Milestone count indicator */}
              {epoch.milestones.length > 0 && (
                <circle cx={x + 110} cy={y} r="5" className="milestone-marker" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="timeline-legend">
        <div className="legend-item">
          <div className="legend-marker" style={{ background: 'rgba(34, 197, 94, 0.6)' }}></div>
          <span>Milestones</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker" style={{ background: 'rgba(239, 68, 68, 0.6)' }}></div>
          <span>Inflection Points</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker" style={{ background: 'rgba(147, 197, 253, 0.5)' }}></div>
          <span>Mask Activity</span>
        </div>
      </div>

      {/* Detail panel for selected epoch */}
      {selectedEpoch && epochs.find((e) => e.id === selectedEpoch) && (
        <div className="detail-panel">
          <div>
            {(() => {
              const epoch = epochs.find((e) => e.id === selectedEpoch)!;
              return (
                <>
                  <h3 className="detail-title">{epoch.name}</h3>
                  <p style={{ margin: '0 0 1rem 0', color: 'rgba(156, 163, 175, 0.8)', fontSize: '0.9rem' }}>
                    {epoch.description}
                  </p>

                  {epoch.milestones.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'rgba(209, 213, 219, 0.8)' }}>
                        Key Milestones
                      </h4>
                      <ul className="detail-list">
                        {epoch.milestones.map((milestone, idx) => (
                          <li key={idx}>✓ {milestone}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {epoch.inflectionPoints.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'rgba(209, 213, 219, 0.8)' }}>
                        Inflection Points
                      </h4>
                      <ul className="detail-list">
                        {epoch.inflectionPoints.map((point, idx) => (
                          <li key={idx}>⚡ {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {epoch.activeMasks && epoch.activeMasks.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'rgba(209, 213, 219, 0.8)' }}>
                        Active Masks
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {epoch.activeMasks.map((mask) => (
                          <span
                            key={mask}
                            style={{
                              padding: '0.4rem 0.75rem',
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '4px',
                              color: 'rgba(191, 219, 254, 0.8)',
                              fontSize: '0.8rem',
                            }}
                          >
                            {mask}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default AetasTimeline;

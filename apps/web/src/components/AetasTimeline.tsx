'use client';

import { useState } from 'react';
import type { Aetas } from '@in-midst-my-life/schema';

interface AetasTimelineProps {
  canonicalAetas: Aetas[];
  profileAetas?: Aetas[];
  currentAetasId?: string;
  onSelectAetas?: (aetasId: string) => void;
  loading?: boolean;
  editMode?: boolean;
}

/**
 * Aetas (life-stage) timeline visualization.
 * 
 * Displays:
 * - Canonical 8-stage theatrical arc (Initiation → Stewardship)
 * - Profile's current progression through aetas
 * - Capability profiles at each stage
 * - Typical markers and transitions
 * - Optional edit controls
 */
export function AetasTimeline({
  canonicalAetas,
  profileAetas = [],
  currentAetasId,
  onSelectAetas,
  loading = false,
  editMode = false,
}: AetasTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">Life-Stage Progression (Aetas)</h2>
        <p className="section-subtitle">Loading aetas timeline...</p>
      </div>
    );
  }

  // Build a set of profile's aetas IDs for quick lookup
  const profileAetasIds = new Set(profileAetas.map((a) => a.id));

  // Sort canonical aetas by order
  const sortedAetas = [...canonicalAetas].sort((a, b) => a.order - b.order);

  const emojiMap: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🌳',
    4: '🚀',
    5: '👑',
    6: '🔮',
    7: '📖',
    8: '🛡️',
  };

  return (
    <div className="section">
      <h2 className="section-title">Aetas: Theatrical Life Stages</h2>
      <p className="section-subtitle">
        The eight archetypal stages of human capability development. Track your progression
        through each stage.
      </p>

      {/* Timeline visualization */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          padding: '1rem 0',
        }}
      >
        {sortedAetas.map((aetas, index) => {
          const isProfileAetas = profileAetasIds.has(aetas.id);
          const isCurrent = currentAetasId === aetas.id;

          return (
            <div
              key={aetas.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '80px',
              }}
            >
              {/* Circle badge */}
              <div
                onClick={() => {
                  onSelectAetas?.(aetas.id);
                  setExpandedId(isCurrent ? null : aetas.id);
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: isCurrent
                    ? 'var(--accent)'
                    : isProfileAetas
                      ? 'rgba(76, 175, 80, 0.2)'
                      : 'rgba(29, 26, 22, 0.05)',
                  border: isCurrent
                    ? '3px solid var(--accent)'
                    : isProfileAetas
                      ? '2px solid #4CAF50'
                      : '1px solid rgba(29, 26, 22, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {emojiMap[aetas.order] || '◯'}
              </div>

              {/* Order number */}
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--stone)',
                  fontWeight: '600',
                }}
              >
                {aetas.order}
              </div>

              {/* Abbreviated name */}
              <div
                style={{
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  maxWidth: '70px',
                  color: isCurrent ? 'var(--accent)' : 'var(--dark)',
                  fontWeight: isCurrent ? '600' : '400',
                }}
              >
                {aetas.name.substring(0, 5)}
              </div>

              {/* Connection line to next (not for last) */}
              {index < sortedAetas.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '35px',
                    width: '40px',
                    height: '2px',
                    background: isProfileAetas
                      ? 'rgba(76, 175, 80, 0.3)'
                      : 'rgba(29, 26, 22, 0.08)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed cards for each aetas */}
      <div className="stack" style={{ gap: '0.75rem' }}>
        {sortedAetas.map((aetas) => {
          const isExpanded = expandedId === aetas.id;
          const isProfileAetas = profileAetasIds.has(aetas.id);
          const isCurrent = currentAetasId === aetas.id;

          return (
            <div
              key={aetas.id}
              className="stat-card"
              style={{
                border: isCurrent
                  ? '2px solid var(--accent)'
                  : isProfileAetas
                    ? '1px solid rgba(76, 175, 80, 0.3)'
                    : '1px solid rgba(29, 26, 22, 0.08)',
                background: isCurrent
                  ? 'rgba(211, 107, 60, 0.05)'
                  : isProfileAetas
                    ? 'rgba(76, 175, 80, 0.02)'
                    : '#fff',
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : aetas.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.3rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {emojiMap[aetas.order] || '◯'}
                    </span>
                    <div>
                      <div
                        className="stat-label"
                        style={{
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                          margin: 0,
                        }}
                      >
                        {aetas.latin_name}
                      </div>
                      <div
                        className="stat-value"
                        style={{
                          fontSize: '1.2rem',
                          margin: 0,
                          color: isCurrent ? 'var(--accent)' : 'var(--dark)',
                        }}
                      >
                        {aetas.order}. {aetas.name}
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  {isProfileAetas && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span
                        className="chip"
                        style={{
                          background: '#4CAF50',
                          color: '#fff',
                          fontSize: '0.75rem',
                        }}
                      >
                        {isCurrent ? '◈ Current' : '✓ Completed'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expand icon */}
                <div
                  style={{
                    fontSize: '1.2rem',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ⌄
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(29, 26, 22, 0.08)',
                  }}
                >
                  {/* Description */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="label" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                      Overview
                    </div>
                    <p className="section-subtitle" style={{ margin: 0 }}>
                      {aetas.description}
                    </p>
                  </div>

                  {/* Capability Profile */}
                  {aetas.capability_profile && Object.keys(aetas.capability_profile).length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="label" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                        Capability Profile
                      </div>
                      <div className="chip-row" style={{ gap: '0.5rem' }}>
                        {Object.entries(aetas.capability_profile).map(([key, value]) => (
                          <div key={key} style={{ fontSize: '0.85rem' }}>
                            <strong>{key}:</strong> {value as string}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Age Range */}
                  {aetas.typical_age_range && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="label" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                        Typical Age Range
                      </div>
                      <p className="section-subtitle" style={{ margin: 0 }}>
                        {aetas.typical_age_range.min || '?'} –{' '}
                        {aetas.typical_age_range.max || '?'} years old
                      </p>
                    </div>
                  )}

                  {/* Duration */}
                  {aetas.duration_months && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="label" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                        Typical Duration
                      </div>
                      <p className="section-subtitle" style={{ margin: 0 }}>
                        {aetas.duration_months} months (~
                        {Math.round(aetas.duration_months / 12)} years)
                      </p>
                    </div>
                  )}

                  {/* Markers */}
                  {aetas.markers && aetas.markers.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="label" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                        Milestones
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '1.5rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        {aetas.markers.map((marker, idx) => (
                          <li key={idx} style={{ marginBottom: '0.3rem' }}>
                            {marker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Transitions */}
                  {aetas.transitions_to && aetas.transitions_to.length > 0 && (
                    <div>
                      <div className="label" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                        Typical Next Stages
                      </div>
                      <div className="chip-row" style={{ gap: '0.5rem' }}>
                        {aetas.transitions_to.map((nextId) => {
                          const nextAetas = sortedAetas.find((a) => a.id === nextId);
                          return nextAetas ? (
                            <span key={nextId} className="chip" style={{ fontSize: '0.85rem' }}>
                              → {nextAetas.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Edit controls */}
                  {editMode && (
                    <div style={{ marginTop: '1rem' }}>
                      <div className="hero-actions">
                        <button
                          className="button secondary"
                          onClick={() => onSelectAetas?.(aetas.id)}
                        >
                          {isProfileAetas ? 'Update' : 'Mark as Current'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        style={{
          background: 'rgba(63, 81, 181, 0.05)',
          border: '1px solid rgba(63, 81, 181, 0.2)',
          padding: '1.5rem',
          marginTop: '2rem',
          borderRadius: '4px',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>Your Progression</h3>
        {profileAetas.length === 0 ? (
          <p className="section-subtitle">
            You haven't yet mapped your progression through the aetas. Begin by marking which
            life-stages you've completed or are currently in.
          </p>
        ) : (
          <>
            <p className="section-subtitle">
              You've progressed through {profileAetas.length} stage
              {profileAetas.length !== 1 ? 's' : ''}
              {currentAetasId ? ', currently in: ' : '.'}
              {currentAetasId &&
                sortedAetas.find((a) => a.id === currentAetasId)?.name}
            </p>
            <div className="chip-row" style={{ gap: '0.5rem', marginTop: '0.75rem' }}>
              {profileAetas
                .sort((a, b) => a.order - b.order)
                .map((aetas) => (
                  <span
                    key={aetas.id}
                    className="chip"
                    style={{
                      background:
                        aetas.id === currentAetasId
                          ? 'var(--accent)'
                          : 'rgba(76, 175, 80, 0.2)',
                      color: aetas.id === currentAetasId ? '#fff' : '#4CAF50',
                    }}
                  >
                    {aetas.name}
                  </span>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

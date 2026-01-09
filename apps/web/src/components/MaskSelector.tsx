'use client';

import type { MaskType } from '@in-midst-my-life/schema';

interface MaskOption {
  id: MaskType;
  name: string;
  description: string;
}

const MASKS: MaskOption[] = [
  { id: 'analyst', name: 'Analyst', description: 'Precision reasoning and structure' },
  { id: 'artisan', name: 'Artisan', description: 'Craft-level creation' },
  { id: 'architect', name: 'Architect', description: 'Systems composition' },
  { id: 'strategist', name: 'Strategist', description: 'Long-term trajectory planning' },
];

interface MaskSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export function MaskSelector({ value, onChange }: MaskSelectorProps) {
  return (
    <div className="section" style={{ padding: '1.2rem' }}>
      <div className="label" style={{ marginBottom: '1rem' }}>
        Active Mask Identity
      </div>
      <div className="grid two" style={{ gap: '1rem' }}>
        {MASKS.map((mask) => (
          <div
            key={mask.id}
            onClick={() => onChange(mask.id)}
            className={`stat-card ${value === mask.id ? 'active' : ''}`}
            style={{
              cursor: 'pointer',
              border:
                value === mask.id ? '2px solid var(--accent)' : '1px solid rgba(29, 26, 22, 0.08)',
              background: value === mask.id ? 'rgba(211, 107, 60, 0.05)' : '#fff',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              className="stat-label"
              style={{ color: value === mask.id ? 'var(--accent)' : 'var(--stone)' }}
            >
              {mask.id}
            </div>
            <div className="stat-value" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
              {mask.name}
            </div>
            <div className="section-subtitle" style={{ fontSize: '0.85rem', margin: 0 }}>
              {mask.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

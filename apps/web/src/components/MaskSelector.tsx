'use client';

import { useState, useEffect } from 'react';
import { MASK_TAXONOMY } from '@in-midst-my-life/content-model';
import type { Mask } from '@in-midst-my-life/schema';

interface MaskSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

const API_BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

/**
 * Displays identity masks from the taxonomy plus any custom masks
 * fetched from the API. Groups masks by ontology (cognitive, expressive,
 * operational) with a separate "Custom" section and allows selection
 * of the active mask identity.
 */
export function MaskSelector({ value, onChange }: MaskSelectorProps) {
  const ontologies = ['cognitive', 'expressive', 'operational'] as const;
  const [customMasks, setCustomMasks] = useState<Mask[]>([]);

  useEffect(() => {
    const taxonomyIds = new Set(MASK_TAXONOMY.map((m) => m.id));
    fetch(`${API_BASE}/taxonomy/masks?limit=100`)
      .then(async (res) => {
        if (!res.ok) return;
        const data: { data: Mask[] } = await res.json();
        const custom = (data.data || []).filter((m) => !taxonomyIds.has(m.id));
        setCustomMasks(custom);
      })
      .catch(() => {
        /* API unavailable — show taxonomy only */
      });
  }, []);

  return (
    <div className="section" style={{ padding: '1.2rem' }}>
      <div className="label" style={{ marginBottom: '1rem' }}>
        Active Mask Identity
      </div>
      {ontologies.map((ontology) => {
        const masksInOntology = MASK_TAXONOMY.filter((m) => m.ontology === ontology);
        return (
          <div key={ontology} style={{ marginBottom: '1.5rem' }}>
            <div
              className="section-subtitle"
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                color: 'var(--stone)',
              }}
            >
              {ontology}
            </div>
            <div className="grid two" style={{ gap: '0.75rem' }}>
              {masksInOntology.map((mask) => (
                <MaskCard
                  key={mask.id}
                  mask={mask}
                  selected={value === mask.id}
                  onSelect={onChange}
                />
              ))}
            </div>
          </div>
        );
      })}

      {customMasks.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            className="section-subtitle"
            style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              color: 'var(--stone)',
            }}
          >
            Custom
          </div>
          <div className="grid two" style={{ gap: '0.75rem' }}>
            {customMasks.map((mask) => (
              <MaskCard
                key={mask.id}
                mask={mask}
                selected={value === mask.id}
                onSelect={onChange}
              />
            ))}
          </div>
        </div>
      )}

      <a
        href="/admin/masks"
        style={{
          display: 'inline-block',
          marginTop: '0.5rem',
          fontSize: '0.85rem',
          color: 'var(--accent)',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        + Create New Mask
      </a>
    </div>
  );
}

function MaskCard({
  mask,
  selected,
  onSelect,
}: {
  mask: Mask;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(mask.id)}
      className={`stat-card ${selected ? 'active' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(mask.id);
        }
      }}
      aria-pressed={selected}
      style={{
        cursor: 'pointer',
        border: selected ? '2px solid var(--accent)' : '1px solid rgba(29, 26, 22, 0.08)',
        background: selected ? 'rgba(211, 107, 60, 0.05)' : '#fff',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div className="stat-label" style={{ color: selected ? 'var(--accent)' : 'var(--stone)' }}>
        {mask.id}
      </div>
      <div className="stat-value" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
        {mask.name}
      </div>
      <div className="section-subtitle" style={{ fontSize: '0.85rem', margin: 0 }}>
        {mask.functional_scope}
      </div>
    </div>
  );
}

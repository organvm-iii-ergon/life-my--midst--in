'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import type { Mask } from '@in-midst-my-life/schema';
import { MaskEditor } from '../../../components/MaskEditor';

const API_BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

const ontologyColors: Record<string, string> = {
  cognitive: '#6366f1',
  expressive: '#d946ef',
  operational: '#f59e0b',
};

export default function AdminMasksPage() {
  const [masks, setMasks] = useState<Mask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMask, setEditingMask] = useState<Mask | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadMasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/taxonomy/masks?limit=100`);
      if (res.ok) {
        const data: { data: Mask[] } = await res.json();
        setMasks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load masks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMasks();
  }, [loadMasks]);

  const handleDelete = async (maskId: string) => {
    try {
      const res = await fetch(`${API_BASE}/taxonomy/masks/${maskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMasks((prev) => prev.filter((m) => m.id !== maskId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete mask:', error);
    }
  };

  const handleSave = (mask: Mask) => {
    setShowEditor(false);
    setEditingMask(undefined);
    void loadMasks();
    console.info('Mask saved:', mask.id);
  };

  const handleEdit = (mask: Mask) => {
    setEditingMask(mask);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingMask(undefined);
    setShowEditor(true);
  };

  if (showEditor) {
    return (
      <div className="page">
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="button secondary"
            onClick={() => {
              setShowEditor(false);
              setEditingMask(undefined);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            &larr; Back to Masks
          </button>
        </div>
        <MaskEditor
          apiBaseUrl={`${API_BASE}/taxonomy`}
          initialMask={editingMask}
          onSave={handleSave}
          onError={(err) => console.error('Mask editor error:', err)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page">
        <div className="section" style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              width: '2rem',
              height: '2rem',
              border: '3px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p className="section-subtitle">Loading masks...</p>
        </div>
      </div>
    );
  }

  const grouped = {
    cognitive: masks.filter((m) => m.ontology === 'cognitive'),
    expressive: masks.filter((m) => m.ontology === 'expressive'),
    operational: masks.filter((m) => m.ontology === 'operational'),
  };

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 700,
              margin: 0,
            }}
          >
            <Layers
              style={{
                display: 'inline',
                width: '1.5rem',
                height: '1.5rem',
                marginRight: '0.5rem',
                verticalAlign: 'text-bottom',
              }}
            />
            Mask Management
          </h1>
          <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>
            Create, edit, and manage identity masks ({masks.length} total)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="button secondary"
            onClick={() => void loadMasks()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw style={{ width: '1rem', height: '1rem' }} />
            Refresh
          </button>
          <button
            className="button primary"
            onClick={handleCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Create Mask
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([ontology, ontologyMasks]) => (
        <div key={ontology} className="section" style={{ marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                background: ontologyColors[ontology] || 'var(--stone)',
                display: 'inline-block',
              }}
            />
            {ontology.charAt(0).toUpperCase() + ontology.slice(1)}
            <span className="chip" style={{ fontSize: '0.75rem' }}>
              {ontologyMasks.length}
            </span>
          </h2>

          {ontologyMasks.length === 0 ? (
            <p className="section-subtitle">No masks in this ontology.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ontologyMasks.map((mask) => (
                <div
                  key={mask.id}
                  className="stat-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1rem' }}>{mask.name}</strong>
                      <span
                        className="chip"
                        style={{
                          fontSize: '0.7rem',
                          background: `${ontologyColors[ontology] || '#888'}22`,
                          color: ontologyColors[ontology] || '#888',
                        }}
                      >
                        {mask.id}
                      </span>
                    </div>
                    <div
                      className="section-subtitle"
                      style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}
                    >
                      {mask.functional_scope}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <span className="label" style={{ fontSize: '0.75rem' }}>
                        {mask.stylistic_parameters.tone} /{' '}
                        {mask.stylistic_parameters.rhetorical_mode}
                      </span>
                      <span className="label" style={{ fontSize: '0.75rem' }}>
                        Compression: {mask.stylistic_parameters.compression_ratio}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="button secondary"
                      onClick={() => handleEdit(mask)}
                      style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }}
                      title="Edit mask"
                    >
                      <Pencil style={{ width: '0.9rem', height: '0.9rem' }} />
                    </button>
                    {deleteConfirm === mask.id ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="button primary"
                          onClick={() => void handleDelete(mask.id)}
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Confirm
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => setDeleteConfirm(null)}
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="button secondary"
                        onClick={() => setDeleteConfirm(mask.id)}
                        style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }}
                        title="Delete mask"
                      >
                        <Trash2 style={{ width: '0.9rem', height: '0.9rem' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

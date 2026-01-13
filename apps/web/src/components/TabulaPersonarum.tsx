'use client';

/**
 * Tabula Personarum Component
 * 
 * Mask Registry Editor - Create, edit, and manage professional identity masks
 * Part of the theatrical metaphor: "Table of Personas"
 * 
 * Features:
 * - View all 16 masks with descriptions
 * - Create custom mask variants
 * - Edit mask attributes (name, traits, visibility)
 * - Set temporal ranges (when mask is active)
 * - Configure stage visibility
 * - Preview mask-specific narrative
 */

import { useState, useCallback } from 'react';
import type { Mask } from '@in-midst-my-life/schema';

export interface TabulaPersonarumProps {
  profileId: string;
  masks: Mask[];
  onMaskCreated?: (mask: Mask) => void;
  onMaskUpdated?: (mask: Mask) => void;
  onMaskDeleted?: (maskId: string) => void;
}

export interface MaskFormData {
  name: string;
  description: string;
  traits: string[];
  visibleOn: string[]; // Scaenae stages
  activeFrom?: Date;
  activeTo?: Date;
  isPrimary?: boolean;
}

/**
 * Main component
 */
export function TabulaPersonarum({
  profileId,
  masks,
  onMaskCreated,
  onMaskUpdated,
  onMaskDeleted,
}: TabulaPersonarumProps) {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedMask, setSelectedMask] = useState<Mask | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="tabula-personarum">
      <style jsx>{`
        .tabula-personarum {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(31, 41, 55, 0.3) 100%);
          border-radius: 12px;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .masks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mask-item {
          padding: 1rem;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(107, 114, 128, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mask-item:hover {
          background: rgba(75, 85, 99, 0.7);
          border-color: rgba(147, 154, 166, 0.5);
        }

        .mask-item.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
        }

        .mask-name {
          font-weight: 500;
          color: rgba(229, 231, 235, 0.9);
        }

        .mask-badge {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .trait-chip {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(107, 114, 128, 0.3);
          border-radius: 4px;
          color: rgba(209, 213, 219, 0.8);
        }

        .detail-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(209, 213, 219, 0.9);
        }

        .form-input {
          padding: 0.75rem;
          background: rgba(75, 85, 99, 0.6);
          border: 1px solid rgba(107, 114, 128, 0.4);
          border-radius: 6px;
          color: rgba(229, 231, 235, 0.9);
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.6);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.1);
        }

        .visibility-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-group input {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
        }

        .button {
          padding: 0.75rem 1.5rem;
          background: rgba(59, 130, 246, 0.7);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .button:hover {
          background: rgba(59, 130, 246, 0.9);
        }

        .button.ghost {
          background: transparent;
          border: 1px solid rgba(107, 114, 128, 0.5);
          color: rgba(209, 213, 219, 0.8);
        }

        .button.ghost:hover {
          background: rgba(107, 114, 128, 0.2);
          border-color: rgba(147, 154, 166, 0.7);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          color: rgba(156, 163, 175, 0.7);
        }
      `}</style>

      <div className="masks-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ color: 'rgba(229, 231, 235, 0.9)', margin: 0 }}>Masks ({masks.length})</h3>
          <button className="button" onClick={() => setIsCreateMode(!isCreateMode)}>
            {isCreateMode ? '✕ Cancel' : '+ New Mask'}
          </button>
        </div>

        {masks.length === 0 && !isCreateMode && (
          <div className="empty-state">
            <p>No masks yet. Create your first professional persona.</p>
          </div>
        )}

        {masks.map((mask) => (
          <div
            key={mask.id}
            className={`mask-item ${selectedMask?.id === mask.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedMask(mask);
              setIsEditing(false);
            }}
          >
            <div>
              <div className="mask-name">{mask.name}</div>
              {mask.traits && mask.traits.length > 0 && (
                <div className="mask-badge">
                  {mask.traits.slice(0, 3).map((trait) => (
                    <span key={trait} className="trait-chip">
                      {trait}
                    </span>
                  ))}
                  {mask.traits.length > 3 && (
                    <span className="trait-chip">+{mask.traits.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isCreateMode && (
          <div className="mask-item" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <MaskForm
              onSubmit={(data) => {
                // TODO: Call API to create mask
                console.log('Create mask:', data);
                setIsCreateMode(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="detail-panel">
        {selectedMask && !isEditing ? (
          <>
            <MaskDetail mask={selectedMask} />
            <div className="button-group">
              <button className="button" onClick={() => setIsEditing(true)}>
                ✎ Edit Mask
              </button>
              <button
                className="button ghost"
                onClick={() => {
                  onMaskDeleted?.(selectedMask.id);
                  setSelectedMask(null);
                }}
              >
                🗑 Delete
              </button>
            </div>
          </>
        ) : selectedMask && isEditing ? (
          <>
            <MaskForm
              initialData={selectedMask}
              onSubmit={(data) => {
                // TODO: Call API to update mask
                console.log('Update mask:', data);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </>
        ) : (
          <div style={{ color: 'rgba(156, 163, 175, 0.6)', textAlign: 'center', padding: '2rem' }}>
            Select or create a mask to view details
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mask Detail View
 * Shows read-only information about a mask
 */
function MaskDetail({ mask }: { mask: Mask }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ margin: '0 0 0.5rem 0', color: 'rgba(229, 231, 235, 0.9)' }}>
          {mask.name}
        </h2>
        {mask.description && (
          <p style={{ margin: 0, color: 'rgba(156, 163, 175, 0.8)', fontSize: '0.9rem' }}>
            {mask.description}
          </p>
        )}
      </div>

      {mask.traits && mask.traits.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'rgba(209, 213, 219, 0.8)' }}>
            Traits
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {mask.traits.map((trait) => (
              <span
                key={trait}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  color: 'rgba(191, 219, 254, 0.9)',
                  fontSize: '0.85rem',
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TODO: Show visibility stages, temporal range, and sample narrative preview */}
    </div>
  );
}

/**
 * Mask Form Component
 * For creating and editing masks
 */
interface MaskFormProps {
  initialData?: Mask;
  onSubmit: (data: MaskFormData) => void;
  onCancel?: () => void;
}

function MaskForm({ initialData, onSubmit, onCancel }: MaskFormProps) {
  const [formData, setFormData] = useState<MaskFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    traits: initialData?.traits || [],
    visibleOn: initialData?.visibleOn || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group">
        <label className="form-label">Mask Name</label>
        <input
          className="form-input"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., The Architect, The Problem Solver"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What does this mask represent? When is it active?"
          style={{ minHeight: '80px', fontFamily: 'inherit' }}
        />
      </div>

      <div className="button-group">
        <button className="button" type="submit">
          {initialData ? '✓ Save' : '+ Create'}
        </button>
        {onCancel && (
          <button className="button ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TabulaPersonarum;

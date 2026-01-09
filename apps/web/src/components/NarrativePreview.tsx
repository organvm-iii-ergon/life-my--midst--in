'use client';

import { useEffect, useState } from 'react';
import type { Mask } from '@in-midst-my-life/schema';

// Locally defined to match dashboard usage
interface NarrativeBlock {
  title: string;
  body: string;
  tags?: string[];
}

interface NarrativePreviewProps {
  maskId: string;
  setMaskId: (id: string) => void;
  contexts: string;
  setContexts: (val: string) => void;
  tags: string;
  setTags: (val: string) => void;
  masks: Mask[];
  blocks: NarrativeBlock[];
  draftId?: string;
  status?: string;
  onGenerate: () => void;
  onClear: () => void;
  onApprove: () => void;
  onSaveDraft: (blocks: NarrativeBlock[], note?: string) => void;
}

export function NarrativePreview({
  maskId,
  setMaskId,
  contexts,
  setContexts,
  tags,
  setTags,
  masks,
  blocks,
  draftId,
  status,
  onGenerate,
  onClear,
  onApprove,
  onSaveDraft,
}: NarrativePreviewProps) {
  const [editing, setEditing] = useState(false);
  const [draftBlocks, setDraftBlocks] = useState<NarrativeBlock[]>(blocks);
  const [revisionNote, setRevisionNote] = useState('');

  useEffect(() => {
    setDraftBlocks(blocks);
    setEditing(false);
  }, [blocks]);

  return (
    <div className="section" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Narrative Preview</h3>
      <div className="grid two">
        <label>
          <div className="label">Mask</div>
          <select
            className="input"
            value={maskId}
            onChange={(event) => setMaskId(event.target.value)}
          >
            <option value="">Auto-select</option>
            {masks.map((mask) => (
              <option key={mask.id} value={mask.id}>
                {mask.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <div className="label">Contexts</div>
          <input
            className="input"
            value={contexts}
            onChange={(event) => setContexts(event.target.value)}
          />
        </label>
        <label>
          <div className="label">Tags</div>
          <input className="input" value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
      </div>
      <div className="hero-actions" style={{ marginTop: '0.75rem' }}>
        <button className="button" onClick={onGenerate}>
          Generate Preview
        </button>
        <button className="button secondary" onClick={onClear}>
          Clear
        </button>
        {draftId ? (
          <button className="button ghost" onClick={() => setEditing((prev) => !prev)}>
            {editing ? 'Cancel Edit' : 'Edit Draft'}
          </button>
        ) : null}
      </div>
      {draftId ? (
        <div className="section-subtitle" style={{ marginTop: '0.5rem' }}>
          Draft ID: {draftId} {status ? `• ${status}` : ''}
        </div>
      ) : null}
      <div className="timeline" style={{ marginTop: '1rem' }}>
        {blocks.length === 0 ? (
          <div className="stat-card">Narrative preview will appear here.</div>
        ) : (
          draftBlocks.map((block, idx) => (
            <div key={`${block.title}-${idx}`} className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <strong>{block.title}</strong>
                {editing ? (
                  <textarea
                    className="input"
                    value={block.body}
                    style={{ margin: '0.5rem 0' }}
                    onChange={(event) =>
                      setDraftBlocks((prev) =>
                        prev.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, body: event.target.value } : item,
                        ),
                      )
                    }
                  />
                ) : (
                  <p style={{ margin: '0.5rem 0' }}>{block.body}</p>
                )}
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  {block.tags && block.tags.length > 0 ? (
                    <div className="chip-row">
                      {block.tags.map((tag) => (
                        <span key={`${block.title}-${tag}`} className="chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div />
                  )}
                  {draftId ? (
                    <button className="button ghost small" onClick={onApprove}>
                      Approve
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {editing ? (
        <div className="stat-card" style={{ marginTop: '1rem' }}>
          <div className="label">Revision Note</div>
          <input
            className="input"
            value={revisionNote}
            onChange={(event) => setRevisionNote(event.target.value)}
            placeholder="Optional note about changes"
          />
          <div className="hero-actions" style={{ marginTop: '0.75rem' }}>
            <button className="button" onClick={() => onSaveDraft(draftBlocks, revisionNote)}>
              Save Draft
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import type { Mask, Stage, Epoch } from '@in-midst-my-life/schema';

// Helper to split list strings
const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

interface TaxonomyEditorProps {
  masks: Mask[];
  stages: Stage[];
  epochs: Epoch[];
  onUpdateMask: (mask: Mask) => void;
  onUpdateStage: (stage: Stage) => void;
  onUpdateEpoch: (epoch: Epoch) => void;
  setMasks: (callback: (prev: Mask[]) => Mask[]) => void;
  setStages: (callback: (prev: Stage[]) => Stage[]) => void;
  setEpochs: (callback: (prev: Epoch[]) => Epoch[]) => void;
}

export function TaxonomyEditor({
  masks,
  stages,
  epochs,
  onUpdateMask,
  onUpdateStage,
  onUpdateEpoch,
  setMasks,
  setStages,
  setEpochs,
}: TaxonomyEditorProps) {
  return (
    <>
      <div>
        <h3 style={{ marginTop: 0 }}>Taxonomy Editor</h3>
        <div className="section-subtitle">Edit masks, stages, and epochs with instant save.</div>
        <div className="stack" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {masks.map((mask) => (
            <details key={mask.id} className="stack-item">
              <summary>
                {mask.name} <small>({mask.ontology})</small>
              </summary>
              <div style={{ marginTop: '0.6rem', display: 'grid', gap: '0.5rem' }}>
                <label>
                  <div className="label">Name</div>
                  <input
                    className="input"
                    value={mask.name}
                    onChange={(event) =>
                      setMasks((prev) =>
                        prev.map((item) =>
                          item.id === mask.id ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <div className="label">Functional Scope</div>
                  <input
                    className="input"
                    value={mask.functional_scope}
                    onChange={(event) =>
                      setMasks((prev) =>
                        prev.map((item) =>
                          item.id === mask.id
                            ? { ...item, functional_scope: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <div className="label">Tone</div>
                  <input
                    className="input"
                    value={mask.stylistic_parameters.tone}
                    onChange={(event) =>
                      setMasks((prev) =>
                        prev.map((item) =>
                          item.id === mask.id
                            ? {
                                ...item,
                                stylistic_parameters: {
                                  ...item.stylistic_parameters,
                                  tone: event.target.value,
                                },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <div className="label">Include Tags</div>
                  <input
                    className="input"
                    value={mask.filters.include_tags.join(', ')}
                    onChange={(event) =>
                      setMasks((prev) =>
                        prev.map((item) =>
                          item.id === mask.id
                            ? {
                                ...item,
                                filters: {
                                  ...item.filters,
                                  include_tags: splitList(event.target.value),
                                },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <button className="button secondary" onClick={() => onUpdateMask(mask)}>
                  Save Mask
                </button>
              </div>
            </details>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{ marginTop: 0 }}>Stage + Epoch Controls</h3>
        <div className="stack" style={{ maxHeight: '220px', overflowY: 'auto' }}>
          {stages.map((stage) => (
            <details key={stage.id} className="stack-item">
              <summary>
                {stage.title} <small>({stage.id})</small>
              </summary>
              <div style={{ marginTop: '0.6rem', display: 'grid', gap: '0.5rem' }}>
                <label>
                  <div className="label">Title</div>
                  <input
                    className="input"
                    value={stage.title}
                    onChange={(event) =>
                      setStages((prev) =>
                        prev.map((item) =>
                          item.id === stage.id ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <div className="label">Summary</div>
                  <input
                    className="input"
                    value={stage.summary ?? ''}
                    onChange={(event) =>
                      setStages((prev) =>
                        prev.map((item) =>
                          item.id === stage.id ? { ...item, summary: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <button className="button secondary" onClick={() => onUpdateStage(stage)}>
                  Save Stage
                </button>
              </div>
            </details>
          ))}
        </div>
        <div className="stack" style={{ marginTop: '0.75rem' }}>
          {epochs.map((epoch) => (
            <details key={epoch.id} className="stack-item">
              <summary>
                {epoch.name} <small>(order {epoch.order})</small>
              </summary>
              <div style={{ marginTop: '0.6rem', display: 'grid', gap: '0.5rem' }}>
                <label>
                  <div className="label">Name</div>
                  <input
                    className="input"
                    value={epoch.name}
                    onChange={(event) =>
                      setEpochs((prev) =>
                        prev.map((item) =>
                          item.id === epoch.id ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <div className="label">Summary</div>
                  <input
                    className="input"
                    value={epoch.summary ?? ''}
                    onChange={(event) =>
                      setEpochs((prev) =>
                        prev.map((item) =>
                          item.id === epoch.id ? { ...item, summary: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <button className="button secondary" onClick={() => onUpdateEpoch(epoch)}>
                  Save Epoch
                </button>
              </div>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

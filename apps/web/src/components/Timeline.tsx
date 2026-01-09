'use client';

import { useMemo } from 'react';

// Re-defining internal types here or importing them if they were shared.
// For now, I'll assume we pass the raw data needed for rendering.
interface TimelineEntry {
  id: string;
  type: string;
  title: string;
  summary?: string;
  start: string;
  end?: string;
  tags?: string[];
  settingId?: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  types: string[];
  tags: string[];
  settings: string[];
  settingLabels: Record<string, string>;
  selectedType: string;
  selectedTag: string;
  selectedSetting: string;
  onTypeChange: (type: string) => void;
  onTagChange: (tag: string) => void;
  onSettingChange: (setting: string) => void;
}

const formatRange = (start?: string, end?: string) => {
  if (!start && !end) return 'Date unknown';
  if (start && end) return `${start} - ${end}`;
  return `${start ?? end} - Present`;
};

export function Timeline({
  entries,
  types,
  tags,
  settings,
  settingLabels,
  selectedType,
  selectedTag,
  selectedSetting,
  onTypeChange,
  onTagChange,
  onSettingChange,
}: TimelineProps) {
  const filteredTimeline = useMemo(
    () =>
      entries.filter((entry) => {
        if (selectedType !== 'all' && entry.type !== selectedType) return false;
        if (selectedTag !== 'all' && !(entry.tags ?? []).includes(selectedTag)) return false;
        if (selectedSetting !== 'all' && entry.settingId !== selectedSetting) return false;
        return true;
      }),
    [entries, selectedSetting, selectedTag, selectedType],
  );

  return (
    <section className="section">
      <h2 className="section-title">Timeline + Context Filters</h2>
      <p className="section-subtitle">
        Filter narrative checkpoints by type, tag, and setting. Use these filters to draft a story
        arc.
      </p>
      <div className="chip-row" style={{ marginBottom: '1rem' }}>
        <span className="chip active">Type</span>
        <button
          className={`chip ${selectedType === 'all' ? 'active' : ''}`}
          onClick={() => onTypeChange('all')}
        >
          All
        </button>
        {types.map((type) => (
          <button
            key={type}
            className={`chip ${selectedType === type ? 'active' : ''}`}
            onClick={() => onTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="grid two">
        <label>
          <div className="label">Tag Filter</div>
          <select
            className="input"
            value={selectedTag}
            onChange={(event) => onTagChange(event.target.value)}
          >
            <option value="all">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label>
          <div className="label">Setting Filter</div>
          <select
            className="input"
            value={selectedSetting}
            onChange={(event) => onSettingChange(event.target.value)}
          >
            <option value="all">All Settings</option>
            {settings.map((setting) => (
              <option key={setting} value={setting}>
                {settingLabels[setting] ?? setting}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="timeline" style={{ marginTop: '1rem' }}>
        {filteredTimeline.length === 0 ? (
          <div className="stat-card">No timeline entries yet.</div>
        ) : (
          filteredTimeline.map((entry) => (
            <div key={entry.id} className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <strong>{entry.title}</strong>
                <div className="section-subtitle">
                  {formatRange(entry.start, entry.end)} | {entry.type}
                  {entry.settingId ? ` | ${settingLabels[entry.settingId] ?? entry.settingId}` : ''}
                </div>
                {entry.summary ? <p style={{ margin: '0.5rem 0' }}>{entry.summary}</p> : null}
                {entry.tags && entry.tags.length > 0 ? (
                  <div className="chip-row">
                    {entry.tags.map((tag) => (
                      <span key={`${entry.id}-${tag}`} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

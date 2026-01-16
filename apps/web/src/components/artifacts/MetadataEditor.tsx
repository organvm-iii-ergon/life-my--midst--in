'use client';

import { useState, useEffect } from 'react';
import type { Artifact, ArtifactType } from '@in-midst-my-life/schema';

interface MetadataEditorProps {
  artifact: Artifact;
  onSave: (updates: Partial<Artifact>) => Promise<void>;
}

const artifactTypes: ArtifactType[] = [
  'academic_paper',
  'creative_writing',
  'visual_art',
  'presentation',
  'video',
  'audio',
  'dataset',
  'code_sample',
  'other',
];

export function MetadataEditor({ artifact, onSave }: MetadataEditorProps) {
  const [title, setTitle] = useState(artifact.title || artifact.name);
  const [description, setDescription] = useState(artifact.descriptionMarkdown || '');
  const [artifactType, setArtifactType] = useState(artifact.artifactType);
  const [tags, setTags] = useState((artifact.tags || []).join(', '));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(artifact.title || artifact.name);
    setDescription(artifact.descriptionMarkdown || '');
    setArtifactType(artifact.artifactType);
    setTags((artifact.tags || []).join(', '));
  }, [artifact]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        descriptionMarkdown: description,
        artifactType,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 className="card-title" style={{ marginBottom: '1rem' }}>
        Edit Metadata
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="artifactType">
            Artifact Type
          </label>
          <select
            id="artifactType"
            className="input"
            value={artifactType}
            onChange={(e) => setArtifactType(e.target.value as ArtifactType)}
          >
            {artifactTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="research, 2024, machine-learning"
          />
        </div>
        <button className="button button-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

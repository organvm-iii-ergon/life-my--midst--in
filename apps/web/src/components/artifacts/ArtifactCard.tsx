'use client';

import type { Artifact } from '@in-midst-my-life/schema';
import { FileText, Image, Video, Music, Code, Database, Presentation } from 'lucide-react';

interface ArtifactCardProps {
  artifact: Artifact;
  onSelect?: (artifactId: string) => void;
  selected?: boolean;
}

const iconMap: Record<string, typeof FileText> = {
  academic_paper: FileText,
  creative_writing: FileText,
  visual_art: Image,
  video: Video,
  audio: Music,
  code_sample: Code,
  dataset: Database,
  presentation: Presentation,
};

export function ArtifactCard({ artifact, onSelect, selected }: ArtifactCardProps) {
  const Icon = iconMap[artifact.artifactType] || FileText;
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-800',
  }[artifact.status];

  const handleClick = () => {
    if (onSelect) {
      onSelect(artifact.id);
    }
  };

  return (
    <div
      className={`card artifact-card ${selected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleClick}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>
          <Icon size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
            {artifact.title || artifact.name}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <span className={`badge ${statusColor}`}>{artifact.status}</span>
            <span className="badge">{artifact.artifactType.replace('_', ' ')}</span>
            {artifact.confidence && (
              <span className="badge">
                {Math.round(artifact.confidence * 100)}% confidence
              </span>
            )}
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {artifact.sourceProvider} • {new Date(artifact.capturedDate).toLocaleDateString()}
          </p>
          {artifact.descriptionMarkdown && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {artifact.descriptionMarkdown.slice(0, 150)}
              {artifact.descriptionMarkdown.length > 150 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

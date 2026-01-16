'use client';

import type { Artifact } from '@in-midst-my-life/schema';
import { ArtifactCard } from './ArtifactCard';

interface ArtifactGridProps {
  artifacts: Artifact[];
  onSelectArtifact?: (artifactId: string) => void;
  selectedArtifactId?: string;
  loading?: boolean;
}

export function ArtifactGrid({
  artifacts,
  onSelectArtifact,
  selectedArtifactId,
  loading,
}: ArtifactGridProps) {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="text-muted">Loading artifacts...</p>
      </div>
    );
  }

  if (artifacts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="text-muted">No artifacts found.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        padding: '1rem',
      }}
    >
      {artifacts.map((artifact) => (
        <ArtifactCard
          key={artifact.id}
          artifact={artifact}
          onSelect={onSelectArtifact}
          selected={artifact.id === selectedArtifactId}
        />
      ))}
    </div>
  );
}

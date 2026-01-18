'use client';

import { useState } from 'react';
import { Check, X, Archive } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onApproveAll: () => Promise<void>;
  onRejectAll: () => Promise<void>;
  onArchiveAll: () => Promise<void>;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  onApproveAll,
  onRejectAll,
  onArchiveAll,
  onClearSelection,
}: BulkActionsProps) {
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setProcessing(true);
    try {
      await action();
    } finally {
      setProcessing(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className="card"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
      }}
    >
      <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>{selectedCount} selected</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="button button-success"
          onClick={() => handleAction(onApproveAll)}
          disabled={processing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Check size={16} />
          Approve
        </button>
        <button
          className="button button-danger"
          onClick={() => handleAction(onRejectAll)}
          disabled={processing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <X size={16} />
          Reject
        </button>
        <button
          className="button"
          onClick={() => handleAction(onArchiveAll)}
          disabled={processing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Archive size={16} />
          Archive
        </button>
        <button className="button" onClick={onClearSelection} disabled={processing}>
          Clear
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { CloudStorageIntegration } from '@in-midst-my-life/schema';
import { Cloud, RefreshCw, Settings, Trash2 } from 'lucide-react';

interface IntegrationCardProps {
  integration: CloudStorageIntegration;
  onRefresh: (integrationId: string) => Promise<void>;
  onConfigure: (integrationId: string) => void;
  onDisconnect: (integrationId: string) => Promise<void>;
}

const providerLabels: Record<string, string> = {
  google_drive: 'Google Drive',
  icloud: 'iCloud',
  dropbox: 'Dropbox',
  local: 'Local Filesystem',
};

export function IntegrationCard({
  integration,
  onRefresh,
  onConfigure,
  onDisconnect,
}: IntegrationCardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh(integration.id);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm('Are you sure you want to disconnect this integration? Artifacts will be preserved.')
    ) {
      return;
    }
    setDisconnecting(true);
    try {
      await onDisconnect(integration.id);
    } finally {
      setDisconnecting(false);
    }
  };

  const lastSynced = integration.lastSyncedAt
    ? new Date(integration.lastSyncedAt).toLocaleString()
    : 'Never';

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Cloud size={32} style={{ color: 'var(--color-primary)' }} />
        <div style={{ flex: 1 }}>
          <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
            {providerLabels[integration.provider] || integration.provider}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Last synced: {lastSynced}
          </p>
        </div>
        <span
          className={`badge ${integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {integration.status}
        </span>
      </div>

      {integration.folderConfig?.includedFolders && (
        <div style={{ marginBottom: '1rem' }}>
          <span className="label">Monitored Folders</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {integration.folderConfig.includedFolders.map((folder, idx) => (
              <span key={idx} className="badge">
                {folder || '/'}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="button"
          onClick={handleRefresh}
          disabled={refreshing || disconnecting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} />
          {refreshing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          className="button"
          onClick={() => onConfigure(integration.id)}
          disabled={refreshing || disconnecting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Settings size={16} />
          Configure
        </button>
        <button
          className="button button-danger"
          onClick={handleDisconnect}
          disabled={refreshing || disconnecting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Trash2 size={16} />
          Disconnect
        </button>
      </div>
    </div>
  );
}

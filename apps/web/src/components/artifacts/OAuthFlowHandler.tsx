'use client';

import { useState, useEffect } from 'react';
import { Cloud, AlertCircle, CheckCircle } from 'lucide-react';

interface OAuthFlowHandlerProps {
  provider: 'google_drive' | 'icloud' | 'dropbox';
  profileId: string;
  apiBase?: string;
  onComplete: () => void;
}

const providerLabels: Record<string, string> = {
  google_drive: 'Google Drive',
  icloud: 'iCloud',
  dropbox: 'Dropbox',
};

export function OAuthFlowHandler({
  provider,
  profileId,
  apiBase = 'http://localhost:3001',
  onComplete,
}: OAuthFlowHandlerProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleConnect = async () => {
    setStatus('connecting');
    setError('');

    try {
      const response = await fetch(`${apiBase}/integrations/cloud-storage/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          profileId,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to initiate OAuth flow');
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');

    if (errorParam) {
      setStatus('error');
      setError(errorParam);
    } else if (code && state) {
      setStatus('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [onComplete]);

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Cloud size={32} style={{ color: 'var(--color-primary)' }} />
        <div>
          <h3 className="card-title">Connect {providerLabels[provider]}</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Grant access to sync your files
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <button className="button button-primary" onClick={handleConnect}>
          Connect {providerLabels[provider]}
        </button>
      )}

      {status === 'connecting' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: '8px',
          }}
        >
          <div className="spinner" />
          <p>Redirecting to {providerLabels[provider]}...</p>
        </div>
      )}

      {status === 'success' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            borderRadius: '8px',
          }}
        >
          <CheckCircle size={20} />
          <p>Successfully connected! Redirecting...</p>
        </div>
      )}

      {status === 'error' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            borderRadius: '8px',
          }}
        >
          <AlertCircle size={20} />
          <div>
            <p style={{ fontWeight: 600 }}>Connection failed</p>
            <p style={{ fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

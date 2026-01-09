'use client';

import { useMemo, useState } from 'react';

interface KeyExportModalProps {
  open: boolean;
  did?: string;
  exportPayload?: string;
  reauthToken?: string;
  onClose: () => void;
  onExport: (passphrase: string) => void; // allow-secret
}

export function KeyExportModal({
  open,
  did,
  exportPayload,
  reauthToken,
  onClose,
  onExport,
}: KeyExportModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [ack, setAck] = useState('');
  const [reauthInput, setReauthInput] = useState('');
  const requiresReauth = Boolean(reauthToken);

  const canExport = useMemo(() => {
    const reauthOk = !requiresReauth || reauthInput === reauthToken; // allow-secret
    return (
      passphrase.length >= 8 && passphrase === confirmPassphrase && ack === 'EXPORT' && reauthOk // allow-secret
    );
  }, [ack, confirmPassphrase, passphrase, reauthInput, reauthToken, requiresReauth]);

  if (!open) return null;

  const downloadExport = () => {
    if (!exportPayload) return;
    const blob = new Blob([exportPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `midst-identity-${did ?? 'backup'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="immersive"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16, 14, 12, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(8px)',
        padding: '2rem',
      }}
    >
      <div
        className="immersive-card fade-up"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '18px',
          maxWidth: '720px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
          display: 'grid',
          gap: '1rem',
        }}
      >
        <div>
          <div className="label">Secure Export</div>
          <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Identity Backup</h2>
          <p className="section-subtitle">
            Export an encrypted JSON backup. Keep the passphrase safe; it cannot be recovered. The
            backup never leaves your device.
          </p>
          {did ? (
            <div className="section-subtitle" style={{ wordBreak: 'break-all' }}>
              <strong>DID:</strong> {did}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {requiresReauth ? (
            <label>
              <div className="label">Re-enter dashboard access token</div>
              <input
                type="password"
                className="input"
                value={reauthInput}
                onChange={(event) => setReauthInput(event.target.value)}
              />
            </label>
          ) : null}
          <label>
            <div className="label">Passphrase (min 8 chars)</div>
            <input
              type="password"
              className="input"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
            />
          </label>
          <label>
            <div className="label">Confirm Passphrase</div>
            <input
              type="password"
              className="input"
              value={confirmPassphrase}
              onChange={(event) => setConfirmPassphrase(event.target.value)}
            />
          </label>
          <label>
            <div className="label">Type EXPORT to confirm</div>
            <input
              className="input"
              value={ack}
              onChange={(event) => setAck(event.target.value.toUpperCase())}
            />
          </label>
        </div>

        <div className="hero-actions" style={{ marginTop: '0.5rem' }}>
          <button className="button" disabled={!canExport} onClick={() => onExport(passphrase)}>
            Generate Encrypted Export
          </button>
          <button className="button secondary" onClick={onClose}>
            Close
          </button>
          {exportPayload ? (
            <button className="button ghost" onClick={downloadExport}>
              Download JSON
            </button>
          ) : null}
        </div>

        {exportPayload ? (
          <div className="stat-card" style={{ background: '#f8f5ef' }}>
            <div className="label">Encrypted Payload</div>
            <textarea
              readOnly
              className="input"
              value={exportPayload}
              style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

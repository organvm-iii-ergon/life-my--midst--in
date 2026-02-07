'use client';

import { useState, useEffect, useCallback } from 'react';
import { Code, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

interface OAuthApp {
  id: string;
  clientId: string;
  clientSecret?: string;
  name: string;
  description: string;
  redirectUris: string[];
  permissions: string[];
  createdAt: string;
}

const PERMISSION_OPTIONS = [
  { value: 'read:profile', label: 'Read Profile' },
  { value: 'read:personas', label: 'Read Personas' },
  { value: 'write:feedback', label: 'Write Feedback' },
  { value: 'read:messages', label: 'Read Messages' },
];

export default function DeveloperSettingsPage() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    redirectUris: '',
    permissions: ['read:profile'] as string[],
  });
  const [createdSecret, setCreatedSecret] = useState<{ appId: string; secret: string } | null>(
    null,
  );

  const loadApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/developers/apps`);
      if (res.ok) {
        const data: { apps: OAuthApp[] } = await res.json();
        setApps(data.apps || []);
      }
    } catch (error) {
      console.error('Failed to load OAuth apps:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApps();
  }, [loadApps]);

  const createApp = async () => {
    try {
      const res = await fetch(`${apiBase}/v1/developers/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newApp.name,
          description: newApp.description,
          redirectUris: newApp.redirectUris
            .split('\n')
            .map((u) => u.trim())
            .filter(Boolean),
          permissions: newApp.permissions,
        }),
      });
      if (res.ok) {
        const data: OAuthApp & { clientSecret: string } = await res.json();
        setCreatedSecret({ appId: data.id, secret: data.clientSecret });
        setShowCreate(false);
        setNewApp({ name: '', description: '', redirectUris: '', permissions: ['read:profile'] });
        void loadApps();
      }
    } catch (error) {
      console.error('Failed to create app:', error);
    }
  };

  const revokeApp = async (appId: string) => {
    try {
      const res = await fetch(`${apiBase}/v1/developers/apps/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        setApps((prev) => prev.filter((a) => a.id !== appId));
      }
    } catch (error) {
      console.error('Failed to revoke app:', error);
    }
  };

  const toggleSecret = (appId: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const togglePermission = (perm: string) => {
    setNewApp((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="section" style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            style={{
              width: '2rem',
              height: '2rem',
              border: '3px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p className="section-subtitle">Loading developer settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 700,
              margin: 0,
            }}
          >
            <Code
              style={{
                display: 'inline',
                width: '1.5rem',
                height: '1.5rem',
                marginRight: '0.5rem',
                verticalAlign: 'text-bottom',
              }}
            />
            Developer Settings
          </h1>
          <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>
            Manage OAuth apps and API keys
          </p>
        </div>
        <button
          className="button"
          onClick={() => setShowCreate(!showCreate)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          New App
        </button>
      </div>

      {/* Secret reveal banner */}
      {createdSecret && (
        <div
          className="section"
          style={{
            marginBottom: '1.5rem',
            background: 'rgba(229, 149, 0, 0.08)',
            border: '1px solid rgba(229, 149, 0, 0.3)',
          }}
        >
          <strong>Client Secret (save this now — it won&apos;t be shown again):</strong>
          <code
            style={{
              display: 'block',
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: 'rgba(29, 26, 22, 0.06)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
            }}
          >
            {createdSecret.secret}
          </code>
          <button
            className="button secondary"
            onClick={() => setCreatedSecret(null)}
            style={{ marginTop: '0.75rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="section" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>
            Register New OAuth App
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                App Name
              </label>
              <input
                type="text"
                value={newApp.name}
                onChange={(e) => setNewApp((p) => ({ ...p, name: e.target.value }))}
                placeholder="My Integration"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(29, 26, 22, 0.15)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Description
              </label>
              <input
                type="text"
                value={newApp.description}
                onChange={(e) => setNewApp((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of your app"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(29, 26, 22, 0.15)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Redirect URIs (one per line)
              </label>
              <textarea
                value={newApp.redirectUris}
                onChange={(e) => setNewApp((p) => ({ ...p, redirectUris: e.target.value }))}
                placeholder="https://myapp.example.com/callback"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(29, 26, 22, 0.15)',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Permissions
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PERMISSION_OPTIONS.map((perm) => {
                  const selected = newApp.permissions.includes(perm.value);
                  return (
                    <button
                      key={perm.value}
                      onClick={() => togglePermission(perm.value)}
                      className="chip"
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        background: selected
                          ? 'rgba(211, 107, 60, 0.15)'
                          : 'rgba(29, 26, 22, 0.06)',
                        color: selected ? 'var(--accent)' : 'var(--stone)',
                        fontWeight: selected ? 600 : 400,
                      }}
                    >
                      {perm.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="button"
                onClick={() => void createApp()}
                disabled={!newApp.name || !newApp.redirectUris}
              >
                Create App
              </button>
              <button className="button secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App list */}
      <div className="section">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>Your OAuth Apps</h2>
        {apps.length === 0 ? (
          <p className="section-subtitle">
            No OAuth apps registered. Create one to integrate third-party services.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {apps.map((app) => (
              <div key={app.id} className="stat-card" style={{ padding: '1rem 1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{app.name}</strong>
                    {app.description && (
                      <p
                        className="section-subtitle"
                        style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}
                      >
                        {app.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleSecret(app.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--stone)',
                        padding: '0.25rem',
                      }}
                      title={revealedSecrets.has(app.id) ? 'Hide Client ID' : 'Show Client ID'}
                    >
                      {revealedSecrets.has(app.id) ? (
                        <EyeOff style={{ width: '1rem', height: '1rem' }} />
                      ) : (
                        <Eye style={{ width: '1rem', height: '1rem' }} />
                      )}
                    </button>
                    <button
                      onClick={() => void revokeApp(app.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#c0392b',
                        padding: '0.25rem',
                      }}
                      title="Revoke app"
                    >
                      <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </div>
                <div className="label" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Client ID:{' '}
                  {revealedSecrets.has(app.id) ? (
                    <code>{app.clientId}</code>
                  ) : (
                    <code>
                      {app.clientId.slice(0, 8)}...{app.clientId.slice(-4)}
                    </code>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {app.permissions.map((p) => (
                    <span
                      key={p}
                      className="chip"
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(29, 26, 22, 0.06)',
                        color: 'var(--stone)',
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

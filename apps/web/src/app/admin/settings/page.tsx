'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, ToggleLeft, ToggleRight, Server, Save, RefreshCw } from 'lucide-react';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  updatedAt: string;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unavailable' | 'mock';
  mode: 'live' | 'mock' | 'unconfigured';
  latencyMs?: number;
  details?: string;
}

interface ServiceStatusResponse {
  ok: boolean;
  overall: string;
  services: ServiceStatus[];
  checkedAt: string;
}

export default function AdminSettingsPage() {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [flagsRes, statusRes] = await Promise.allSettled([
        fetch(`${apiBase}/v1/admin/feature-flags`),
        fetch(`${apiBase}/v1/admin/service-status`),
      ]);

      if (flagsRes.status === 'fulfilled' && flagsRes.value.ok) {
        const data: { data: FeatureFlag[] } = await flagsRes.value.json();
        setFlags(data.data || []);
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const data: ServiceStatusResponse = await statusRes.value.json();
        setServiceStatus(data);
      }
    } catch (error) {
      console.error('Failed to load admin settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const toggleFlag = async (flag: FeatureFlag) => {
    setSavingKey(flag.key);
    try {
      const res = await fetch(`${apiBase}/v1/admin/feature-flags/${flag.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });
      if (res.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.key === flag.key ? { ...f, enabled: !f.enabled } : f)),
        );
      }
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    } finally {
      setSavingKey(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'var(--accent-cool)';
      case 'mock':
        return 'var(--stone)';
      case 'degraded':
        return '#e59500';
      case 'unavailable':
        return '#c0392b';
      default:
        return 'var(--stone)';
    }
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
          <p className="section-subtitle">Loading settings...</p>
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
            <Settings
              style={{
                display: 'inline',
                width: '1.5rem',
                height: '1.5rem',
                marginRight: '0.5rem',
                verticalAlign: 'text-bottom',
              }}
            />
            System Settings
          </h1>
          <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>
            Manage feature flags and monitor service health
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => void loadData()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} />
          Refresh
        </button>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <div className="section" style={{ marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Server style={{ width: '1.1rem', height: '1.1rem' }} />
            Service Health
            <span
              className="chip"
              style={{
                background:
                  serviceStatus.overall === 'healthy'
                    ? 'rgba(47, 94, 100, 0.15)'
                    : 'rgba(229, 149, 0, 0.15)',
                color: serviceStatus.overall === 'healthy' ? 'var(--accent-cool)' : '#e59500',
              }}
            >
              {serviceStatus.overall}
            </span>
          </h2>

          <div className="stat-grid">
            {serviceStatus.services.map((svc) => (
              <div key={svc.name} className="stat-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <strong style={{ fontSize: '0.95rem' }}>{svc.name}</strong>
                  <span
                    className="chip"
                    style={{
                      background: `${getStatusColor(svc.status)}22`,
                      color: getStatusColor(svc.status),
                    }}
                  >
                    {svc.status}
                  </span>
                </div>
                <div className="label" style={{ fontSize: '0.8rem' }}>
                  {svc.mode === 'mock'
                    ? 'Mock mode'
                    : svc.mode === 'unconfigured'
                      ? 'Not configured'
                      : 'Live'}
                  {svc.latencyMs !== undefined && ` · ${svc.latencyMs}ms`}
                </div>
                {svc.details && (
                  <p
                    className="section-subtitle"
                    style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}
                  >
                    {svc.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags */}
      <div className="section">
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            margin: '0 0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Save style={{ width: '1.1rem', height: '1.1rem' }} />
          Feature Flags
        </h2>

        {flags.length === 0 ? (
          <p className="section-subtitle">
            No feature flags configured. Run database migrations to seed defaults.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {flags.map((flag) => {
              const label = flag.key
                .replace('feature.', '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <div
                  key={flag.key}
                  className="stat-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{label}</strong>
                    <div className="label" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {flag.key}
                    </div>
                  </div>
                  <button
                    onClick={() => void toggleFlag(flag)}
                    disabled={savingKey === flag.key}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: savingKey === flag.key ? 'wait' : 'pointer',
                      opacity: savingKey === flag.key ? 0.5 : 1,
                      padding: 0,
                      color: flag.enabled ? 'var(--accent-cool)' : 'var(--stone)',
                    }}
                    title={flag.enabled ? 'Disable' : 'Enable'}
                  >
                    {flag.enabled ? (
                      <ToggleRight style={{ width: '2rem', height: '2rem' }} />
                    ) : (
                      <ToggleLeft style={{ width: '2rem', height: '2rem' }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

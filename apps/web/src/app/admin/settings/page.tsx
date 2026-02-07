'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Server,
  Save,
  RefreshCw,
  Sliders,
  Shield,
} from 'lucide-react';

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

interface ScoringWeights {
  skillMatch: number;
  valuesAlign: number;
  growthFit: number;
  sustainability: number;
  compensationFit: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  skillMatch: 1,
  valuesAlign: 1,
  growthFit: 1,
  sustainability: 1,
  compensationFit: 1,
};

const WEIGHT_LABELS: Record<keyof ScoringWeights, string> = {
  skillMatch: 'Skill Match',
  valuesAlign: 'Values Alignment',
  growthFit: 'Growth Fit',
  sustainability: 'Sustainability',
  compensationFit: 'Compensation Fit',
};

export default function AdminSettingsPage() {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Interview config
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [gapThreshold, setGapThreshold] = useState(65);
  const [maxFollowUps, setMaxFollowUps] = useState(3);

  // System config
  const [jwtLifetime, setJwtLifetime] = useState(60);
  const [rateLimit, setRateLimit] = useState(100);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [flagsRes, statusRes, settingsRes] = await Promise.allSettled([
        fetch(`${apiBase}/v1/admin/feature-flags`),
        fetch(`${apiBase}/v1/admin/service-status`),
        fetch(`${apiBase}/v1/admin/settings`),
      ]);

      if (flagsRes.status === 'fulfilled' && flagsRes.value.ok) {
        const data: { data: FeatureFlag[] } = await flagsRes.value.json();
        setFlags(data.data || []);
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const data: ServiceStatusResponse = await statusRes.value.json();
        setServiceStatus(data);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
        const data: { data: Array<{ key: string; value: unknown }> } =
          await settingsRes.value.json();
        for (const row of data.data) {
          switch (row.key) {
            case 'interview.scoringWeights':
              if (row.value && typeof row.value === 'object') {
                setScoringWeights({
                  ...DEFAULT_WEIGHTS,
                  ...(row.value as Partial<ScoringWeights>),
                });
              }
              break;
            case 'interview.gapThreshold':
              setGapThreshold(Number(row.value) || 65);
              break;
            case 'interview.maxFollowUps':
              setMaxFollowUps(Number(row.value) || 3);
              break;
            case 'system.jwtLifetimeMinutes':
              setJwtLifetime(Number(row.value) || 60);
              break;
            case 'system.rateLimitPerMinute':
              setRateLimit(Number(row.value) || 100);
              break;
          }
        }
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

  const saveSetting = async (key: string, value: unknown) => {
    setSavingKey(key);
    try {
      await fetch(`${apiBase}/v1/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
    } catch (error) {
      console.error('Failed to save setting:', error);
    } finally {
      setSavingKey(null);
    }
  };

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

  const updateWeight = (category: keyof ScoringWeights, value: number) => {
    const next = { ...scoringWeights, [category]: value };
    setScoringWeights(next);
    void saveSetting('interview.scoringWeights', next);
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
            Manage feature flags, interview scoring, and system configuration
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

      {/* Interview Configuration */}
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
          <Sliders style={{ width: '1.1rem', height: '1.1rem' }} />
          Interview Configuration
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>
            Scoring Weights
          </strong>
          <p className="section-subtitle" style={{ margin: '0 0 1rem', fontSize: '0.8rem' }}>
            Adjust the relative importance of each compatibility factor (0 = ignore, 2 = double
            weight)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(Object.keys(WEIGHT_LABELS) as Array<keyof ScoringWeights>).map((category) => (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '160px', fontSize: '0.85rem' }}>
                  {WEIGHT_LABELS[category]}
                </span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={scoringWeights[category]}
                  onChange={(e) => updateWeight(category, Number(e.target.value))}
                  disabled={savingKey === 'interview.scoringWeights'}
                  style={{ flex: 1 }}
                />
                <span
                  style={{
                    width: '40px',
                    textAlign: 'right',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: scoringWeights[category] === 1 ? 'var(--stone)' : 'var(--accent)',
                  }}
                >
                  {scoringWeights[category].toFixed(1)}x
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Gap Threshold (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={gapThreshold}
              onChange={(e) => {
                const v = Number(e.target.value);
                setGapThreshold(v);
              }}
              onBlur={() => void saveSetting('interview.gapThreshold', gapThreshold)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
              }}
            />
            <p className="section-subtitle" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
              Scores below this threshold trigger gap recommendations
            </p>
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Max Follow-ups Per Answer (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={maxFollowUps}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMaxFollowUps(v);
              }}
              onBlur={() => void saveSetting('interview.maxFollowUps', maxFollowUps)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
              }}
            />
            <p className="section-subtitle" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
              How many contextual follow-ups to suggest per answer
            </p>
          </div>
        </div>
      </div>

      {/* System Configuration */}
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
          <Shield style={{ width: '1.1rem', height: '1.1rem' }} />
          System Configuration
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              JWT Token Lifetime (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={jwtLifetime}
              onChange={(e) => setJwtLifetime(Number(e.target.value))}
              onBlur={() => void saveSetting('system.jwtLifetimeMinutes', jwtLifetime)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
              }}
            />
            <p className="section-subtitle" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
              How long JWT tokens remain valid
            </p>
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Rate Limit (requests/minute)
            </label>
            <input
              type="number"
              min="10"
              max="10000"
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
              onBlur={() => void saveSetting('system.rateLimitPerMinute', rateLimit)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
              }}
            />
            <p className="section-subtitle" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
              Per-user rate limit for API requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

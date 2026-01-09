'use client';

import type { Profile } from '@in-midst-my-life/schema';

interface HeroProps {
  profiles: Profile[];
  profileId: string;
  setProfileId: (id: string) => void;
  profile: Profile | null;
  apiHealth: string;
  orchHealth: string;
  taskCount: number;
  edgeCount: number;
  onRefresh: () => void;
  onReloadProfile: () => void;
  apiBase: string;
}

export function Hero({
  profiles,
  profileId,
  setProfileId,
  profile,
  apiHealth,
  orchHealth,
  taskCount,
  edgeCount,
  onRefresh,
  onReloadProfile,
  apiBase,
}: HeroProps) {
  return (
    <section className="hero fade-up">
      <div>
        <h1 className="hero-title">In-Midst Identity Studio</h1>
        <p className="hero-subtitle">
          Live orchestration console for profiles, narrative arcs, and relational graphs.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="label">Active Profile</span>
          <select
            className="input"
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
          >
            <option value="">Select a profile</option>
            {profiles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName} ({item.slug})
              </option>
            ))}
          </select>
          {profile ? (
            <div style={{ marginTop: '0.5rem' }}>
              <strong>{profile.displayName}</strong>
              {profile.title ? ` - ${profile.title}` : ''}
              <div className="hero-subtitle">{profile.headline}</div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="stat-grid stagger">
        <div className="stat-card">
          <div className="stat-label">API Health</div>
          <div className="stat-value">{apiHealth}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orchestrator</div>
          <div className="stat-value">{orchHealth}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Queued Tasks</div>
          <div className="stat-value">{taskCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Graph Links</div>
          <div className="stat-value">{edgeCount}</div>
        </div>
      </div>
      <div className="hero-actions">
        <button className="button" onClick={onRefresh}>
          Refresh Pulse
        </button>
        <button className="button secondary" onClick={onReloadProfile}>
          Reload Profile
        </button>
        <a className="button ghost" href={`${apiBase}/openapi.yaml`}>
          OpenAPI
        </a>
      </div>
    </section>
  );
}

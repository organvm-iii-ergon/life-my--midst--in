'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Save } from 'lucide-react';

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

type Visibility = 'public' | 'unlisted' | 'private';

interface ProfileSettings {
  'profile.visibility': Visibility;
  'profile.defaultLanguage': string;
  'profile.defaultThemeId': string;
  'notifications.email': boolean;
  'notifications.webhookUrl': string;
}

const DEFAULTS: ProfileSettings = {
  'profile.visibility': 'private',
  'profile.defaultLanguage': 'en',
  'profile.defaultThemeId': 'classic',
  'notifications.email': false,
  'notifications.webhookUrl': '',
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
];

const THEMES = [
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'academic', label: 'Academic' },
];

export default function ProfileSettingsPage() {
  const [profileId, setProfileId] = useState<string>('');
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadSettings = useCallback(async (pid: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/profiles/${pid}/settings`);
      if (res.ok) {
        const data: { data: Array<{ key: string; value: unknown }> } = await res.json();
        const loaded = { ...DEFAULTS };
        for (const row of data.data) {
          if (row.key in loaded) {
            (loaded as Record<string, unknown>)[row.key] = row.value;
          }
        }
        setSettings(loaded);
      }
    } catch (error) {
      console.error('Failed to load profile settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('profileId') || '';
    setProfileId(pid);
    if (pid) {
      void loadSettings(pid);
    } else {
      setIsLoading(false);
    }
  }, [loadSettings]);

  const saveSetting = async (key: string, value: unknown) => {
    setSavingKey(key);
    setSaveStatus(null);
    try {
      const res = await fetch(`${apiBase}/v1/profiles/${profileId}/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      setSaveStatus('Error saving');
    } finally {
      setSavingKey(null);
    }
  };

  const updateAndSave = (key: keyof ProfileSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    void saveSetting(key, value);
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
          <p className="section-subtitle">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="page">
        <div className="section" style={{ textAlign: 'center', padding: '3rem' }}>
          <User
            style={{
              width: '2.5rem',
              height: '2.5rem',
              margin: '0 auto 1rem',
              color: 'var(--stone)',
            }}
          />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            No profile selected
          </h2>
          <p className="section-subtitle" style={{ margin: '0 0 1rem' }}>
            Select a profile from the dashboard to configure settings.
          </p>
          <a href="/dashboard" className="button">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 700,
            margin: 0,
          }}
        >
          <User
            style={{
              display: 'inline',
              width: '1.5rem',
              height: '1.5rem',
              marginRight: '0.5rem',
              verticalAlign: 'text-bottom',
            }}
          />
          Profile Settings
        </h1>
        <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>
          Control visibility, language preferences, and notifications
        </p>
        {saveStatus && (
          <span
            className="chip"
            style={{
              marginLeft: '1rem',
              background:
                saveStatus === 'Saved' ? 'rgba(47, 94, 100, 0.15)' : 'rgba(229, 149, 0, 0.15)',
              color: saveStatus === 'Saved' ? 'var(--accent-cool)' : '#e59500',
            }}
          >
            {saveStatus}
          </span>
        )}
      </div>

      {/* Visibility */}
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
          Profile Visibility
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(['public', 'unlisted', 'private'] as Visibility[]).map((vis) => (
            <button
              key={vis}
              className={`button ${settings['profile.visibility'] === vis ? '' : 'secondary'}`}
              onClick={() => updateAndSave('profile.visibility', vis)}
              disabled={savingKey === 'profile.visibility'}
              style={{ textTransform: 'capitalize' }}
            >
              {vis}
            </button>
          ))}
        </div>
        <p className="section-subtitle" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          {settings['profile.visibility'] === 'public' && 'Your profile is visible to everyone.'}
          {settings['profile.visibility'] === 'unlisted' &&
            'Only people with a direct link can view your profile.'}
          {settings['profile.visibility'] === 'private' && 'Your profile is only visible to you.'}
        </p>
      </div>

      {/* Language & Theme */}
      <div className="section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>
          Display Preferences
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Default Language
            </label>
            <select
              value={settings['profile.defaultLanguage']}
              onChange={(e) => updateAndSave('profile.defaultLanguage', e.target.value)}
              disabled={savingKey === 'profile.defaultLanguage'}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
                background: '#fff',
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Export Theme
            </label>
            <select
              value={settings['profile.defaultThemeId']}
              onChange={(e) => updateAndSave('profile.defaultThemeId', e.target.value)}
              disabled={savingKey === 'profile.defaultThemeId'}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
                background: '#fff',
              }}
            >
              {THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
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
          Notifications
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            className="stat-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Email Notifications</strong>
              <div className="label" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                Receive updates about interview sessions and profile views
              </div>
            </div>
            <button
              onClick={() => updateAndSave('notifications.email', !settings['notifications.email'])}
              disabled={savingKey === 'notifications.email'}
              style={{
                background: 'none',
                border: 'none',
                cursor: savingKey === 'notifications.email' ? 'wait' : 'pointer',
                padding: 0,
                color: settings['notifications.email'] ? 'var(--accent-cool)' : 'var(--stone)',
                fontSize: '1.5rem',
              }}
              title={settings['notifications.email'] ? 'Disable' : 'Enable'}
            >
              {settings['notifications.email'] ? 'ON' : 'OFF'}
            </button>
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Webhook URL (optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                value={settings['notifications.webhookUrl'] as string}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, 'notifications.webhookUrl': e.target.value }))
                }
                placeholder="https://hooks.example.com/events"
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(29, 26, 22, 0.15)',
                  fontSize: '0.9rem',
                }}
              />
              <button
                className="button secondary"
                onClick={() =>
                  void saveSetting('notifications.webhookUrl', settings['notifications.webhookUrl'])
                }
                disabled={savingKey === 'notifications.webhookUrl'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

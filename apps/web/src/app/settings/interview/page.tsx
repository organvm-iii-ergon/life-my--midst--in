'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';

const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:3001';

const MASK_OPTIONS = [
  'Analyst',
  'Synthesist',
  'Artisan',
  'Architect',
  'Steward',
  'Navigator',
  'Advocate',
  'Sentinel',
  'Catalyst',
  'Chronicler',
  'Oracle',
  'Weaver',
  'Alchemist',
  'Sage',
  'Nomad',
  'Polymath',
];

const CATEGORY_OPTIONS = [
  { value: 'culture', label: 'Culture' },
  { value: 'growth', label: 'Growth' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'authenticity', label: 'Authenticity' },
  { value: 'team', label: 'Team' },
  { value: 'technical', label: 'Technical' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'values', label: 'Values' },
];

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'direct', label: 'Direct' },
];

interface InterviewSettings {
  'interview.compensationMin': number;
  'interview.compensationMax': number;
  'interview.preferredMasks': string[];
  'interview.questionCategories': string[];
  'interview.tonePreference': string;
}

const DEFAULTS: InterviewSettings = {
  'interview.compensationMin': 0,
  'interview.compensationMax': 0,
  'interview.preferredMasks': [],
  'interview.questionCategories': [],
  'interview.tonePreference': 'conversational',
};

export default function InterviewSettingsPage() {
  const [profileId, setProfileId] = useState<string>('');
  const [settings, setSettings] = useState<InterviewSettings>(DEFAULTS);
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
      console.error('Failed to load interview settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('profileId') || '00000000-0000-0000-0000-000000000001';
    setProfileId(pid);
    void loadSettings(pid);
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

  const toggleArrayItem = (key: keyof InterviewSettings, item: string) => {
    const current = settings[key] as string[];
    const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
    setSettings((prev) => ({ ...prev, [key]: next }));
    void saveSetting(key, next);
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
          <p className="section-subtitle">Loading interview settings...</p>
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
          <MessageCircle
            style={{
              display: 'inline',
              width: '1.5rem',
              height: '1.5rem',
              marginRight: '0.5rem',
              verticalAlign: 'text-bottom',
            }}
          />
          Interview Preferences
        </h1>
        <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>
          Configure compensation expectations, preferred masks, and question categories
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

      {/* Compensation */}
      <div className="section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>
          Compensation Expectations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Minimum (USD)
            </label>
            <input
              type="number"
              value={settings['interview.compensationMin'] || ''}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  'interview.compensationMin': Number(e.target.value),
                }))
              }
              onBlur={() =>
                void saveSetting('interview.compensationMin', settings['interview.compensationMin'])
              }
              placeholder="e.g. 120000"
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
              Maximum (USD)
            </label>
            <input
              type="number"
              value={settings['interview.compensationMax'] || ''}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  'interview.compensationMax': Number(e.target.value),
                }))
              }
              onBlur={() =>
                void saveSetting('interview.compensationMax', settings['interview.compensationMax'])
              }
              placeholder="e.g. 180000"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(29, 26, 22, 0.15)',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Preferred Masks */}
      <div className="section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Preferred Masks
        </h2>
        <p className="section-subtitle" style={{ margin: '0 0 1rem', fontSize: '0.85rem' }}>
          Select which identity masks to surface during interviews
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {MASK_OPTIONS.map((mask) => {
            const selected = settings['interview.preferredMasks'].includes(mask);
            return (
              <button
                key={mask}
                onClick={() => toggleArrayItem('interview.preferredMasks', mask)}
                disabled={savingKey === 'interview.preferredMasks'}
                className="chip"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: selected ? 'rgba(211, 107, 60, 0.15)' : 'rgba(29, 26, 22, 0.06)',
                  color: selected ? 'var(--accent)' : 'var(--stone)',
                  fontWeight: selected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {mask}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Categories */}
      <div className="section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Question Categories
        </h2>
        <p className="section-subtitle" style={{ margin: '0 0 1rem', fontSize: '0.85rem' }}>
          Choose which question categories to include in interviews
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CATEGORY_OPTIONS.map((cat) => {
            const selected = settings['interview.questionCategories'].includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => toggleArrayItem('interview.questionCategories', cat.value)}
                disabled={savingKey === 'interview.questionCategories'}
                className="chip"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: selected ? 'rgba(47, 94, 100, 0.15)' : 'rgba(29, 26, 22, 0.06)',
                  color: selected ? 'var(--accent-cool)' : 'var(--stone)',
                  fontWeight: selected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone Preference */}
      <div className="section">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>Interview Tone</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone.value}
              className={`button ${settings['interview.tonePreference'] === tone.value ? '' : 'secondary'}`}
              onClick={() => {
                setSettings((prev) => ({ ...prev, 'interview.tonePreference': tone.value }));
                void saveSetting('interview.tonePreference', tone.value);
              }}
              disabled={savingKey === 'interview.tonePreference'}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

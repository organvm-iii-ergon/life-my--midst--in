/**
 * Settings Repository
 *
 * Key-value store for system-wide and per-user settings.
 * System settings are admin-only; user settings are profile-scoped.
 */

import { Pool } from 'pg';

export interface SettingRow {
  key: string;
  value: unknown;
  scope: 'system' | 'user';
  profile_id: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface SettingsRepo {
  /** Get a single system setting */
  getSystem(key: string): Promise<unknown>;
  /** Get all system settings */
  listSystem(): Promise<SettingRow[]>;
  /** Set a system setting (upsert) */
  setSystem(key: string, value: unknown, updatedBy?: string): Promise<void>;
  /** Get a user setting */
  getUser(profileId: string, key: string): Promise<unknown>;
  /** Get all settings for a user */
  listUser(profileId: string): Promise<SettingRow[]>;
  /** Set a user setting (upsert) */
  setUser(profileId: string, key: string, value: unknown, updatedBy?: string): Promise<void>;
  /** Check if a feature flag is enabled (system-level) */
  isFeatureEnabled(featureKey: string): Promise<boolean>;
}

export function createSettingsRepo(pool: Pool): SettingsRepo {
  return {
    async getSystem(key) {
      const { rows } = await pool.query<{ value: unknown }>(
        `SELECT value FROM settings WHERE key = $1 AND scope = 'system' AND profile_id IS NULL`,
        [key],
      );
      return rows[0]?.value ?? null;
    },

    async listSystem() {
      const { rows } = await pool.query<SettingRow>(
        `SELECT key, value, scope, profile_id, updated_at::text, updated_by FROM settings WHERE scope = 'system' AND profile_id IS NULL ORDER BY key`,
      );
      return rows;
    },

    async setSystem(key, value, updatedBy) {
      await pool.query(
        `INSERT INTO settings (key, value, scope, profile_id, updated_at, updated_by)
         VALUES ($1, $2, 'system', NULL, now(), $3)
         ON CONFLICT (key, scope, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'))
         DO UPDATE SET value = $2, updated_at = now(), updated_by = $3`,
        [key, JSON.stringify(value), updatedBy ?? null],
      );
    },

    async getUser(profileId, key) {
      const { rows } = await pool.query<{ value: unknown }>(
        `SELECT value FROM settings WHERE key = $1 AND scope = 'user' AND profile_id = $2`,
        [key, profileId],
      );
      return rows[0]?.value ?? null;
    },

    async listUser(profileId) {
      const { rows } = await pool.query<SettingRow>(
        `SELECT key, value, scope, profile_id, updated_at::text, updated_by FROM settings WHERE scope = 'user' AND profile_id = $1 ORDER BY key`,
        [profileId],
      );
      return rows;
    },

    async setUser(profileId, key, value, updatedBy) {
      await pool.query(
        `INSERT INTO settings (key, value, scope, profile_id, updated_at, updated_by)
         VALUES ($1, $2, 'user', $3, now(), $4)
         ON CONFLICT (key, scope, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'))
         DO UPDATE SET value = $2, updated_at = now(), updated_by = $4`,
        [key, JSON.stringify(value), profileId, updatedBy ?? null],
      );
    },

    async isFeatureEnabled(featureKey) {
      const val = await this.getSystem(featureKey);
      return val === 'enabled' || val === true;
    },
  };
}

/**
 * In-memory settings repo for tests
 */
export class InMemorySettingsRepo implements SettingsRepo {
  private store = new Map<string, { value: unknown; scope: string; profileId: string | null }>();

  private makeKey(key: string, scope: string, profileId: string | null) {
    return `${scope}:${profileId ?? 'system'}:${key}`;
  }

  getSystem(key: string): Promise<unknown> {
    return Promise.resolve(this.store.get(this.makeKey(key, 'system', null))?.value ?? null);
  }

  listSystem(): Promise<SettingRow[]> {
    const results: SettingRow[] = [];
    for (const [k, v] of this.store) {
      if (k.startsWith('system:')) {
        const parts = k.split(':');
        results.push({
          key: parts.slice(2).join(':'),
          value: v.value,
          scope: 'system',
          profile_id: null,
          updated_at: new Date().toISOString(),
          updated_by: null,
        });
      }
    }
    return Promise.resolve(results);
  }

  setSystem(key: string, value: unknown): Promise<void> {
    this.store.set(this.makeKey(key, 'system', null), { value, scope: 'system', profileId: null });
    return Promise.resolve();
  }

  getUser(profileId: string, key: string): Promise<unknown> {
    return Promise.resolve(this.store.get(this.makeKey(key, 'user', profileId))?.value ?? null);
  }

  listUser(profileId: string): Promise<SettingRow[]> {
    const prefix = `user:${profileId}:`;
    const results: SettingRow[] = [];
    for (const [k, v] of this.store) {
      if (k.startsWith(prefix)) {
        results.push({
          key: k.slice(prefix.length),
          value: v.value,
          scope: 'user',
          profile_id: profileId,
          updated_at: new Date().toISOString(),
          updated_by: null,
        });
      }
    }
    return Promise.resolve(results);
  }

  setUser(profileId: string, key: string, value: unknown): Promise<void> {
    this.store.set(this.makeKey(key, 'user', profileId), { value, scope: 'user', profileId });
    return Promise.resolve();
  }

  isFeatureEnabled(featureKey: string): Promise<boolean> {
    return this.getSystem(featureKey).then((val) => val === 'enabled' || val === true);
  }
}

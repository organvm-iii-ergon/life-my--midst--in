/**
 * Rate Limit Repository
 * Implements RateLimitStore interface with PostgreSQL backend
 */

import type { FeatureKey } from "@in-midst-my-life/schema";
import type { RateLimitStore } from "@in-midst-my-life/core";
import { Pool } from "pg";

/**
 * PostgreSQL-backed rate limit store
 * Tracks feature usage per user per period
 */
export class PostgresRateLimitStore implements RateLimitStore {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(pool: Pool) {
    this.pool = pool;
    this.ready = this.ensureTable();
  }

  private async ensureTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL,
        feature VARCHAR(255) NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        period_start TIMESTAMP NOT NULL DEFAULT NOW(),
        period_end TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 month',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(profile_id, feature)
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limits_profile_feature
        ON rate_limits(profile_id, feature);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_period_end
        ON rate_limits(period_end);
    `);
  }

  /**
   * Get current usage for a feature in the current period
   */
  async getUsage(profileId: string, feature: FeatureKey): Promise<number> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT COALESCE(used, 0) as used
       FROM rate_limits
       WHERE profile_id = $1
       AND feature = $2
       AND period_end > NOW()`,
      [profileId, feature]
    );

    return result.rows[0]?.used ?? 0;
  }

  /**
   * Increment usage counter atomically
   * Returns the new total
   */
  async increment(profileId: string, feature: FeatureKey, by: number): Promise<number> {
    await this.ready;

    const result = await this.pool.query(
      `INSERT INTO rate_limits (profile_id, feature, used, period_start, period_end)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 month')
       ON CONFLICT (profile_id, feature)
       DO UPDATE SET
         used = rate_limits.used + $3,
         updated_at = NOW()
       RETURNING used`,
      [profileId, feature, by]
    );

    return result.rows[0]?.used ?? by;
  }

  /**
   * Reset usage counter for the period
   */
  async reset(profileId: string, feature: FeatureKey): Promise<void> {
    await this.ready;

    await this.pool.query(
      `UPDATE rate_limits
       SET used = 0, period_start = NOW(), period_end = NOW() + INTERVAL '1 month'
       WHERE profile_id = $1 AND feature = $2`,
      [profileId, feature]
    );
  }

  /**
   * Get reset time for a feature's period
   */
  async getResetTime(profileId: string, feature: FeatureKey): Promise<Date | null> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT period_end
       FROM rate_limits
       WHERE profile_id = $1 AND feature = $2`,
      [profileId, feature]
    );

    return result.rows[0]?.period_end ?? null;
  }

  /**
   * Get all rate limits for a user (for UI display)
   */
  async getAllUsage(profileId: string): Promise<Record<FeatureKey, { used: number; resetAt: Date | null }>> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT feature, COALESCE(used, 0) as used, period_end
       FROM rate_limits
       WHERE profile_id = $1`,
      [profileId]
    );

    const usage: Record<FeatureKey, { used: number; resetAt: Date | null }> = {} as any;

    for (const row of result.rows) {
      usage[row.feature as FeatureKey] = {
        used: row.used,
        resetAt: row.period_end
      };
    }

    return usage;
  }

  /**
   * Bulk reset counters for multiple features
   * Called when subscription tier changes or period resets
   */
  async bulkReset(profileId: string, features: FeatureKey[]): Promise<void> {
    if (features.length === 0) return;

    await this.ready;

    const placeholders = features.map((_, i) => `$${i + 2}`).join(",");

    await this.pool.query(
      `UPDATE rate_limits
       SET used = 0, period_start = NOW(), period_end = NOW() + INTERVAL '1 month'
       WHERE profile_id = $1 AND feature IN (${placeholders})`,
      [profileId, ...features]
    );
  }

  /**
   * Delete all rate limit records for a user (e.g., account deletion)
   */
  async deleteAll(profileId: string): Promise<void> {
    await this.ready;

    await this.pool.query(
      `DELETE FROM rate_limits WHERE profile_id = $1`,
      [profileId]
    );
  }
}

/**
 * In-memory rate limit store for development/testing
 * WARNING: Data is lost on restart, not suitable for production
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private usage = new Map<string, number>(); // Key: "${profileId}:${feature}"
  private resetTimes = new Map<string, Date>();

  private key(profileId: string, feature: FeatureKey): string {
    return `${profileId}:${feature}`;
  }

  async getUsage(profileId: string, feature: FeatureKey): Promise<number> {
    return this.usage.get(this.key(profileId, feature)) ?? 0;
  }

  async increment(profileId: string, feature: FeatureKey, by: number): Promise<number> {
    const k = this.key(profileId, feature);
    const current = this.usage.get(k) ?? 0;
    const newValue = current + by;
    this.usage.set(k, newValue);

    // Set reset time if not already set
    if (!this.resetTimes.has(k)) {
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      this.resetTimes.set(k, resetDate);
    }

    return newValue;
  }

  async reset(profileId: string, feature: FeatureKey): Promise<void> {
    const k = this.key(profileId, feature);
    this.usage.delete(k);
    this.resetTimes.delete(k);
  }

  async getResetTime(profileId: string, feature: FeatureKey): Promise<Date | null> {
    return this.resetTimes.get(this.key(profileId, feature)) ?? null;
  }
}

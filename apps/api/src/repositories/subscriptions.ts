/**
 * Subscription Repository
 * Manages subscription data in PostgreSQL
 */

import { Pool } from "pg";
import type { SubscriptionStatus, SubscriptionTier } from "@in-midst-my-life/schema";

export interface SubscriptionRecord {
  id: string;
  profileId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: "month" | "year" | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionRepo {
  /**
   * Get subscription for a profile (one per user)
   */
  getByProfileId(profileId: string): Promise<SubscriptionRecord | undefined>;

  /**
   * Get subscription by Stripe customer ID
   */
  getByStripeCustomerId(customerId: string): Promise<SubscriptionRecord | undefined>;

  /**
   * Get subscription by Stripe subscription ID
   */
  getByStripeSubscriptionId(subscriptionId: string): Promise<SubscriptionRecord | undefined>;

  /**
   * Create or initialize subscription for a user
   */
  create(profileId: string, stripeCustomerId: string): Promise<SubscriptionRecord>;

  /**
   * Update subscription with Stripe data
   */
  update(profileId: string, patch: Partial<SubscriptionRecord>): Promise<SubscriptionRecord | undefined>;

  /**
   * Update subscription status (e.g., after webhook)
   */
  updateStatus(
    profileId: string,
    status: SubscriptionStatus,
    tier: SubscriptionTier
  ): Promise<SubscriptionRecord | undefined>;

  /**
   * Set cancellation date
   */
  setCancelation(profileId: string, cancelAt: Date, atPeriodEnd: boolean): Promise<SubscriptionRecord | undefined>;

  /**
   * Get all subscriptions for a tier (for analytics)
   */
  getByTier(tier: SubscriptionTier): Promise<SubscriptionRecord[]>;

  /**
   * Delete subscription (e.g., account deletion)
   */
  delete(profileId: string): Promise<boolean>;
}

/**
 * PostgreSQL-backed subscription repository
 */
export class PostgresSubscriptionRepo implements SubscriptionRepo {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(pool: Pool) {
    this.pool = pool;
    this.ready = this.ensureTable();
  }

  private async ensureTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
        stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
        stripe_subscription_id VARCHAR(255),
        tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        billing_interval VARCHAR(10),
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON subscriptions(profile_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id)
        WHERE stripe_subscription_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
    `);
  }

  async getByProfileId(profileId: string): Promise<SubscriptionRecord | undefined> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM subscriptions
      WHERE profile_id = $1`,
      [profileId]
    );

    return result.rows[0];
  }

  async getByStripeCustomerId(customerId: string): Promise<SubscriptionRecord | undefined> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM subscriptions
      WHERE stripe_customer_id = $1`,
      [customerId]
    );

    return result.rows[0];
  }

  async getByStripeSubscriptionId(subscriptionId: string): Promise<SubscriptionRecord | undefined> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM subscriptions
      WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );

    return result.rows[0];
  }

  async create(profileId: string, stripeCustomerId: string): Promise<SubscriptionRecord> {
    await this.ready;

    const result = await this.pool.query(
      `INSERT INTO subscriptions (profile_id, stripe_customer_id, tier, status)
       VALUES ($1, $2, 'FREE', 'active')
       RETURNING
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [profileId, stripeCustomerId]
    );

    return result.rows[0];
  }

  async update(profileId: string, patch: Partial<SubscriptionRecord>): Promise<SubscriptionRecord | undefined> {
    await this.ready;

    const fields: string[] = [];
    const values: any[] = [profileId];
    let paramIndex = 2;

    // Build dynamic UPDATE query
    const fieldMap: Record<string, string> = {
      stripeSubscriptionId: "stripe_subscription_id",
      tier: "tier",
      status: "status",
      billingInterval: "billing_interval",
      currentPeriodStart: "current_period_start",
      currentPeriodEnd: "current_period_end",
      cancelAt: "cancel_at",
      cancelAtPeriodEnd: "cancel_at_period_end",
    };

    for (const [key, dbColumn] of Object.entries(fieldMap)) {
      if (key in patch) {
        fields.push(`${dbColumn} = $${paramIndex}`);
        values.push((patch as any)[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getByProfileId(profileId);
    }

    const result = await this.pool.query(
      `UPDATE subscriptions
       SET ${fields.join(", ")}, updated_at = NOW()
       WHERE profile_id = $1
       RETURNING
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    );

    return result.rows[0];
  }

  async updateStatus(
    profileId: string,
    status: SubscriptionStatus,
    tier: SubscriptionTier
  ): Promise<SubscriptionRecord | undefined> {
    await this.ready;

    const result = await this.pool.query(
      `UPDATE subscriptions
       SET status = $2, tier = $3, updated_at = NOW()
       WHERE profile_id = $1
       RETURNING
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [profileId, status, tier]
    );

    return result.rows[0];
  }

  async setCancelation(profileId: string, cancelAt: Date, atPeriodEnd: boolean): Promise<SubscriptionRecord | undefined> {
    await this.ready;

    const result = await this.pool.query(
      `UPDATE subscriptions
       SET cancel_at = $2, cancel_at_period_end = $3, updated_at = NOW()
       WHERE profile_id = $1
       RETURNING
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [profileId, cancelAt, atPeriodEnd]
    );

    return result.rows[0];
  }

  async getByTier(tier: SubscriptionTier): Promise<SubscriptionRecord[]> {
    await this.ready;

    const result = await this.pool.query(
      `SELECT
        id,
        profile_id as "profileId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        tier,
        status,
        billing_interval as "billingInterval",
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at as "cancelAt",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM subscriptions
      WHERE tier = $1
      ORDER BY created_at DESC`,
      [tier]
    );

    return result.rows;
  }

  async delete(profileId: string): Promise<boolean> {
    await this.ready;

    const result = await this.pool.query(
      `DELETE FROM subscriptions WHERE profile_id = $1`,
      [profileId]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }
}

/**
 * In-memory subscription repo for testing
 */
export class InMemorySubscriptionRepo implements SubscriptionRepo {
  private data = new Map<string, SubscriptionRecord>();
  private stripeCustomerMap = new Map<string, string>(); // stripe_customer_id -> profileId
  private stripeSubscriptionMap = new Map<string, string>(); // stripe_subscription_id -> profileId

  async getByProfileId(profileId: string): Promise<SubscriptionRecord | undefined> {
    return this.data.get(profileId);
  }

  async getByStripeCustomerId(customerId: string): Promise<SubscriptionRecord | undefined> {
    const profileId = this.stripeCustomerMap.get(customerId);
    return profileId ? this.data.get(profileId) : undefined;
  }

  async getByStripeSubscriptionId(subscriptionId: string): Promise<SubscriptionRecord | undefined> {
    const profileId = this.stripeSubscriptionMap.get(subscriptionId);
    return profileId ? this.data.get(profileId) : undefined;
  }

  async create(profileId: string, stripeCustomerId: string): Promise<SubscriptionRecord> {
    const record: SubscriptionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      profileId,
      stripeCustomerId,
      stripeSubscriptionId: null,
      tier: "FREE",
      status: "active",
      billingInterval: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAt: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.set(profileId, record);
    this.stripeCustomerMap.set(stripeCustomerId, profileId);

    return record;
  }

  async update(profileId: string, patch: Partial<SubscriptionRecord>): Promise<SubscriptionRecord | undefined> {
    const existing = this.data.get(profileId);
    if (!existing) return undefined;

    const updated: SubscriptionRecord = {
      ...existing,
      ...patch,
      profileId: existing.profileId,
      stripeCustomerId: existing.stripeCustomerId,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.data.set(profileId, updated);
    return updated;
  }

  async updateStatus(profileId: string, status: SubscriptionStatus, tier: SubscriptionTier): Promise<SubscriptionRecord | undefined> {
    return this.update(profileId, { status, tier });
  }

  async setCancelation(profileId: string, cancelAt: Date, atPeriodEnd: boolean): Promise<SubscriptionRecord | undefined> {
    return this.update(profileId, { cancelAt, cancelAtPeriodEnd: atPeriodEnd });
  }

  async getByTier(tier: SubscriptionTier): Promise<SubscriptionRecord[]> {
    return Array.from(this.data.values()).filter((sub) => sub.tier === tier);
  }

  async delete(profileId: string): Promise<boolean> {
    const existing = this.data.get(profileId);
    if (!existing) return false;

    this.data.delete(profileId);
    this.stripeCustomerMap.delete(existing.stripeCustomerId);
    if (existing.stripeSubscriptionId) {
      this.stripeSubscriptionMap.delete(existing.stripeSubscriptionId);
    }

    return true;
  }
}

// Singleton instance for API routes
const pool = new Pool({
  connectionString: process.env['DATABASE_URL'] || process.env['POSTGRES_URL'],
});

export const subscriptionRepo = process.env['NODE_ENV'] === 'test'
  ? new InMemorySubscriptionRepo()
  : new PostgresSubscriptionRepo(pool);

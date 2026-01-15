#!/usr/bin/env node
/**
 * Seed script for billing and licensing data
 * Creates demo subscriptions for existing profiles
 */

import { Pool } from 'pg';

async function seedBilling() {
  const pool = new Pool({
    connectionString: process.env['DATABASE_URL'] || process.env['POSTGRES_URL'],
  });

  try {
    console.log('🌱 Seeding billing data...');

    // 1. Get all existing profiles
    const { rows: profiles } = await pool.query('SELECT id FROM profiles ORDER BY created_at');
    console.log(`Found ${profiles.length} profiles`);

    // 2. Create subscriptions for each profile
    for (const profile of profiles) {
      const profileId = profile.id;

      // Check if subscription already exists
      const existing = await pool.query(
        'SELECT id FROM subscriptions WHERE profile_id = $1',
        [profileId]
      );

      if (existing.rows.length > 0) {
        console.log(`  ↳ Subscription already exists for profile ${profileId}`);
        continue;
      }

      // Create FREE tier subscription (default)
      const customerId = `cus_seed_${Math.random().toString(36).substr(2, 9)}`;
      await pool.query(
        `INSERT INTO subscriptions (
          profile_id,
          stripe_customer_id,
          tier,
          status,
          billing_interval
        ) VALUES ($1, $2, $3, $4, $5)`,
        [profileId, customerId, 'FREE', 'active', null]
      );

      console.log(`  ✓ Created FREE subscription for profile ${profileId}`);
    }

    // 3. Upgrade first profile to PRO (for testing)
    if (profiles.length > 0) {
      const firstProfileId = profiles[0].id;
      await pool.query(
        `UPDATE subscriptions
         SET tier = $1,
             billing_interval = $2,
             current_period_start = NOW(),
             current_period_end = NOW() + INTERVAL '1 month'
         WHERE profile_id = $3`,
        ['PRO', 'monthly', firstProfileId]
      );
      console.log(`  ✓ Upgraded first profile (${firstProfileId}) to PRO`);
    }

    // 4. Create demo rate limit usage
    if (profiles.length > 1) {
      const secondProfileId = profiles[1].id;
      await pool.query(
        `INSERT INTO rate_limits (profile_id, feature, used, period_start, period_end)
         VALUES
           ($1, 'hunter_job_searches', 3, NOW(), NOW() + INTERVAL '1 month'),
           ($1, 'resume_tailoring', 1, NOW(), NOW() + INTERVAL '1 month')`,
        [secondProfileId]
      );
      console.log(`  ✓ Created demo usage for profile ${secondProfileId}`);
    }

    console.log('✅ Billing seed complete!');

    // Print summary
    const { rows: summary } = await pool.query(`
      SELECT
        tier,
        COUNT(*) as count
      FROM subscriptions
      GROUP BY tier
      ORDER BY tier
    `);

    console.log('\n📊 Subscription Summary:');
    summary.forEach(row => {
      console.log(`  ${row.tier}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedBilling();

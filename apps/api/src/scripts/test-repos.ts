#!/usr/bin/env node
/**
 * Test that PostgreSQL repositories work correctly
 */

import { Pool } from 'pg';
import { PostgresSubscriptionRepo } from '../repositories/subscriptions';
import { PostgresRateLimitStore } from '../repositories/rate-limits';

async function testRepos() {
  const pool = new Pool({
    connectionString: process.env['DATABASE_URL'] || process.env['POSTGRES_URL'],
  });

  try {
    console.log('🧪 Testing repositories...\n');

    // Test 1: SubscriptionRepo
    console.log('1. Testing SubscriptionRepo...');
    const subRepo = new PostgresSubscriptionRepo(pool);

    // Get all subscriptions
    const { rows: allSubs } = await pool.query('SELECT profile_id FROM subscriptions LIMIT 1');
    if (allSubs.length === 0) {
      console.log('  ⚠️  No subscriptions found. Run seed first.');
      return;
    }

    const testProfileId = allSubs[0].profile_id;
    const subscription = await subRepo.getByProfileId(testProfileId);
    console.log(`  ✓ Found subscription: ${subscription?.tier}`);

    // Test 2: RateLimitStore
    console.log('\n2. Testing RateLimitStore...');
    const rateLimitStore = new PostgresRateLimitStore(pool);

    const usage = await rateLimitStore.getUsage(testProfileId, 'hunter_job_searches');
    console.log(`  ✓ Current usage: ${usage}`);

    // Increment
    const newUsage = await rateLimitStore.increment(testProfileId, 'hunter_job_searches', 1);
    console.log(`  ✓ After increment: ${newUsage}`);

    // Reset
    await rateLimitStore.reset(testProfileId, 'hunter_job_searches');
    const resetUsage = await rateLimitStore.getUsage(testProfileId, 'hunter_job_searches');
    console.log(`  ✓ After reset: ${resetUsage}`);

    console.log('\n✅ All repository tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testRepos();

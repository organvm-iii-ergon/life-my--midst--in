/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../../../test/app-builder';
import { InMemorySubscriptionRepo } from '../../repositories/subscriptions';

/**
 * Webhook Fulfillment Integration Tests
 *
 * Verifies that Stripe webhook events properly sync subscription state
 * to the database. This tests the Phase 2 webhook fulfillment logic
 * added to billing.ts (switch on event.type → repo.update calls).
 */
describe('Webhook Fulfillment Integration Tests', () => {
  let app: FastifyInstance;
  let subRepo: InMemorySubscriptionRepo;
  const testCustomerId = 'cus_fulfill_test';
  let testProfileId: string;

  beforeAll(async () => {
    subRepo = new InMemorySubscriptionRepo();
    app = await buildTestApp({ subscriptionRepo: subRepo });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create a test profile
    const response = await app.inject({
      method: 'POST',
      url: '/profiles',
      payload: {
        id,
        identityId: crypto.randomUUID(),
        displayName: 'Webhook Test User',
        slug: 'webhook-test-' + Math.random().toString(36).slice(2, 7),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });
    testProfileId = response.json().data.id;

    // Create a subscription linked to the test Stripe customer
    await subRepo.create(testProfileId, testCustomerId);
  });

  it('syncs subscription.created event to database', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/billing/webhooks/stripe',
      headers: { 'stripe-signature': 'test_sig' },
      payload: {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_new_123',
            customer: testCustomerId,
            status: 'active',
            cancel_at_period_end: false,
            cancel_at: null,
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
            items: {
              data: [{ price: { id: 'price_pro_monthly' } }],
            },
          },
        },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().ok).toBe(true);

    // Verify database was updated
    const sub = await subRepo.getByProfileId(testProfileId);
    expect(sub).toBeDefined();
    expect(sub!.stripeSubscriptionId).toBe('sub_new_123');
    expect(sub!.status).toBe('active');
    expect(sub!.tier).toBe('PRO');
  });

  it('syncs subscription.updated event with tier change', async () => {
    // First set up as PRO
    await subRepo.update(testProfileId, {
      stripeSubscriptionId: 'sub_existing',
      status: 'active',
      tier: 'PRO',
    });

    // Now simulate upgrade to ENTERPRISE
    const response = await app.inject({
      method: 'POST',
      url: '/billing/webhooks/stripe',
      headers: { 'stripe-signature': 'test_sig' },
      payload: {
        id: 'evt_sub_updated',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_existing',
            customer: testCustomerId,
            status: 'active',
            cancel_at_period_end: false,
            cancel_at: null,
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
            items: {
              data: [{ price: { id: 'price_ent_monthly' } }],
            },
          },
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const sub = await subRepo.getByProfileId(testProfileId);
    expect(sub!.status).toBe('active');
    expect(sub!.tier).toBe('ENTERPRISE');
  });

  it('syncs subscription.deleted event — downgrades to FREE', async () => {
    await subRepo.update(testProfileId, {
      stripeSubscriptionId: 'sub_to_delete',
      status: 'active',
      tier: 'PRO',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/billing/webhooks/stripe',
      headers: { 'stripe-signature': 'test_sig' },
      payload: {
        id: 'evt_sub_deleted',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_to_delete',
            customer: testCustomerId,
          },
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const sub = await subRepo.getByProfileId(testProfileId);
    expect(sub!.status).toBe('canceled');
    expect(sub!.tier).toBe('FREE');
  });

  it('syncs invoice.payment_failed — marks as past_due', async () => {
    await subRepo.update(testProfileId, {
      stripeSubscriptionId: 'sub_payment_fail',
      status: 'active',
      tier: 'PRO',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/billing/webhooks/stripe',
      headers: { 'stripe-signature': 'test_sig' },
      payload: {
        id: 'evt_payment_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_failed_123',
            customer: testCustomerId,
          },
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const sub = await subRepo.getByProfileId(testProfileId);
    expect(sub!.status).toBe('past_due');
  });

  it('sets cancellation when cancel_at_period_end is true', async () => {
    const cancelAt = Math.floor(Date.now() / 1000) + 30 * 86400;

    await subRepo.update(testProfileId, {
      stripeSubscriptionId: 'sub_cancel_end',
      status: 'active',
      tier: 'PRO',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/billing/webhooks/stripe',
      headers: { 'stripe-signature': 'test_sig' },
      payload: {
        id: 'evt_cancel_at_end',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_cancel_end',
            customer: testCustomerId,
            status: 'active',
            cancel_at_period_end: true,
            cancel_at: cancelAt,
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: cancelAt,
            items: {
              data: [{ price: { id: 'price_pro_monthly' } }],
            },
          },
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const sub = await subRepo.getByProfileId(testProfileId);
    expect(sub!.cancelAtPeriodEnd).toBe(true);
    expect(sub!.cancelAt).toBeDefined();
  });

  it('handles webhook for unknown customer gracefully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/billing/webhooks/stripe',
      headers: { 'stripe-signature': 'test_sig' },
      payload: {
        id: 'evt_unknown_customer',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_orphan',
            customer: 'cus_does_not_exist',
            status: 'active',
            cancel_at_period_end: false,
            cancel_at: null,
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
            items: { data: [{ price: { id: 'price_pro_monthly' } }] },
          },
        },
      },
    });

    // Should still return 200 to Stripe (don't trigger retries)
    expect(response.statusCode).toBe(200);
  });
});

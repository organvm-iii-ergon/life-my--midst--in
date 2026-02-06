import { describe, expect, it } from 'vitest';
import { EmbeddingsService } from '@in-midst-my-life/core';
import { BillingService } from '@in-midst-my-life/core';

describe('D1: Infrastructure Integration', () => {
  describe('Embeddings Service', () => {
    it('generates embeddings (mocked)', async () => {
      const service = new EmbeddingsService({ apiKey: 'test-key' }); // allow-secret
      const embedding = await service.generateEmbedding('test text');

      // With test key, should return mock embeddings without calling OpenAI
      expect(embedding).toEqual([0.1, 0.2, 0.3]);

      // Test batch embeddings as well
      const embeddings = await service.generateEmbeddings(['text1', 'text2']);
      expect(embeddings).toEqual([
        [0.1, 0.2, 0.3],
        [0.1, 0.2, 0.3],
      ]);
    });
  });

  describe('Billing Service', () => {
    it('creates checkout session (mocked stripe)', async () => {
      const service = new BillingService({
        stripeSecretKey: 'sk_test', // allow-secret (non-live key triggers mock mode)
        webhookSecret: 'whsec_test', // allow-secret
        stripePriceIds: {
          FREE: { monthly: 'free', yearly: 'free' },
          PRO: { monthly: 'price_pro_m', yearly: 'price_pro_y' },
          ENTERPRISE: { monthly: 'price_ent_m', yearly: 'price_ent_y' },
        },
      });

      const session = await service.createCheckoutSession({
        profileId: 'prof_123',
        priceId: 'price_pro_m',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      // BillingService has built-in mock mode for test keys
      expect(session.sessionId).toBeDefined();
      expect(session.sessionId).toMatch(/^cs_test_/);
      expect(session.stripeCustomerId).toBeDefined();
      expect(session.stripeCustomerId).toMatch(/^cus_test_/);
      expect(session.url).toBeDefined();
      expect(session.url).toContain('https://checkout.stripe.com/pay/');
    });
  });
});

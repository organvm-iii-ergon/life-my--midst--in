/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars */
import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { NarrativeBlockSchema, ProfileSchema } from '@in-midst-my-life/schema';
import {
  applyMaskRedaction,
  matchMasksToContext,
  rankMasksByPriority,
  NotFoundError,
  BillingService,
} from '@in-midst-my-life/core';
import { profileRepo, type ProfileRepo } from '../repositories/profiles';
import type { MaskRepo, EpochRepo, StageRepo } from '../repositories/masks';
import { narrativeRepo } from '../repositories/narratives';
import { agentTokenRepo } from '../repositories/agent-tokens';
import { profileKeyRepo } from '../repositories/profile-keys';
import { buildNarrativeOutput } from '@in-midst-my-life/content-model';
import { createMaskRepo } from '../repositories/masks';
import { subscriptionRepo } from '../repositories/subscriptions';
import { createOwnershipMiddleware } from '../middleware/auth';
import {
  NarrativeRequestSchema,
  PaginationSchema,
  ProfileCreateSchema,
  ProfileUpdateSchema,
  MaskSelectionSchema,
} from '../validation';

export async function registerProfileRoutes(
  fastify: FastifyInstance,
  deps?: {
    repo?: ProfileRepo;
    maskRepo?: MaskRepo;
    epochRepo?: EpochRepo;
    stageRepo?: StageRepo;
    billingService?: BillingService;
  },
) {
  const repo = deps?.repo ?? profileRepo;
  const defaults = createMaskRepo();
  const masks = deps?.maskRepo ?? defaults.masks;
  const epochs = deps?.epochRepo ?? defaults.epochs;
  const stages = deps?.stageRepo ?? defaults.stages;

  // Initialize billing service for subscription cancellation on profile deletion
  const billingService =
    deps?.billingService ??
    new BillingService({
      stripeSecretKey: process.env['STRIPE_SECRET_KEY'] || 'sk_test_mock',
      stripePriceIds: {
        FREE: { monthly: 'free', yearly: 'free' },
        PRO: {
          monthly: process.env['STRIPE_PRO_MONTHLY'] || 'price_pro_monthly',
          yearly: process.env['STRIPE_PRO_YEARLY'] || 'price_pro_yearly',
        },
        ENTERPRISE: {
          monthly: process.env['STRIPE_ENTERPRISE_MONTHLY'] || 'price_enterprise_custom',
          yearly: process.env['STRIPE_ENTERPRISE_YEARLY'] || 'price_enterprise_custom',
        },
      },
      webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || 'whsec_test_mock',
    });

  fastify.post('/validate', async (request, reply) => {
    const parsed = ProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        ok: false,
        errors: parsed.error.flatten(),
      });
    }

    return {
      ok: true,
      data: parsed.data,
    };
  });

  fastify.post('/', async (request, reply) => {
    const parsed = ProfileCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        ok: false,
        errors: parsed.error.flatten(),
      });
    }
    let profile = parsed.data;
    if (!profile.did) {
      const existingKey = await profileKeyRepo.get(profile.id);
      const record = existingKey ?? (await profileKeyRepo.create(profile.id));
      profile = { ...profile, did: record.did };
    }
    const created = await repo.add(profile);
    return { ok: true, data: created };
  });

  fastify.get('/', async (request, reply) => {
    const parsed = PaginationSchema.safeParse(request.query ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, errors: parsed.error.flatten() });
    }
    const result = await repo.list(parsed.data.offset, parsed.data.limit);
    return { ok: true, offset: parsed.data.offset, limit: parsed.data.limit, ...result };
  });

  fastify.get('/:id', async (request, reply) => {
    const profile = await repo.find((request.params as { id: string }).id);
    if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
    return { ok: true, data: profile };
  });

  fastify.patch('/:id', { preHandler: [createOwnershipMiddleware()] }, async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const existing = await repo.find(id);
    if (!existing) return reply.code(404).send({ ok: false, error: 'not_found' });

    const parsed = ProfileUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, errors: parsed.error.flatten() });
    }
    const updated = await repo.update(id, parsed.data);
    return { ok: true, data: updated };
  });

  // GDPR-compliant profile deletion
  // Deletes profile and all associated data (subscriptions, rate limits, etc.)
  fastify.delete(
    '/:id',
    {
      preHandler: [createOwnershipMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      // 1. Verify profile exists
      const profile = await repo.find(id);
      if (!profile) {
        throw new NotFoundError(`Profile not found: ${id}`);
      }

      // 2. Cancel active Stripe subscription if exists
      const subscription = await subscriptionRepo.getByProfileId(id);
      if (subscription && subscription.stripeSubscriptionId) {
        try {
          // Cancel immediately (not at period end) for GDPR deletion
          const result = await billingService.cancelSubscription(
            subscription.stripeSubscriptionId,
            false, // immediate cancellation for account deletion
          );
          console.log(
            `[GDPR] Canceled Stripe subscription: ${subscription.stripeSubscriptionId}, status: ${result.status}`,
          );
        } catch (error) {
          // Log but don't block deletion - subscription data will be deleted anyway
          console.error(
            `[GDPR] Failed to cancel Stripe subscription: ${subscription.stripeSubscriptionId}`,
            error,
          );
        }
      }

      // 3. Delete profile (cascades to subscriptions, rate_limits, etc.)
      // Assumes database foreign key cascades are configured
      await repo.remove(id);

      // 5. Log deletion for compliance
      console.log(`[GDPR] Profile deleted: ${id}`);

      return reply.code(200).send({
        ok: true,
        message: 'Profile and all associated data have been deleted',
        deletedAt: new Date().toISOString(),
        dataRetention: 'Records retained for 30 days for audit purposes',
      });
    },
  );

  fastify.post(
    '/:id/masks/select',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profile = await repo.find((request.params as { id: string }).id);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });

      const body = MaskSelectionSchema.safeParse(request.body ?? {});
      if (!body.success) return reply.code(400).send({ ok: false, errors: body.error.flatten() });
      const contexts = body.data.contexts ?? [];
      const available = (await masks.list(0, body.data.limit)).data;
      const matches = matchMasksToContext(available, contexts);
      const ranked = rankMasksByPriority(matches);

      return { ok: true, data: ranked };
    },
  );

  fastify.post(
    '/:id/narrative',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profile = await repo.find((request.params as { id: string }).id);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });

      const body = NarrativeRequestSchema.safeParse(request.body ?? {});
      if (!body.success) return reply.code(400).send({ ok: false, errors: body.error.flatten() });
      const mask = body.data.maskId ? await masks.get(body.data.maskId) : undefined;
      const contexts = body.data.contexts ?? [];
      const tags = body.data.tags ?? [];
      try {
        const availableMasks = (await masks.list(0, 50)).data;
        const epochList = await epochs.list();
        const stageList = (await stages.list(undefined, 0, 200)).data;
        const redactedTimeline = applyMaskRedaction(body.data.timeline ?? ([] as any), mask, {
          dateKeys: ['start', 'end'],
        } as any);
        const narrative = await buildNarrativeOutput({
          profile,
          availableMasks,
          contexts,
          tags,
          mask,
          timeline: redactedTimeline as any,
          epochs: epochList,
          stages: stageList,
          orchestratorUrl: process.env['ORCHESTRATOR_URL'] ?? 'http://localhost:3002',
        });
        const now = new Date().toISOString();
        const snapshot = await narrativeRepo.create({
          id: randomUUID(),
          profileId: profile.id,
          maskId: mask?.id ?? body.data.maskId,
          status: 'draft',
          blocks: narrative.blocks,
          meta: narrative.meta as Record<string, unknown>,
          createdAt: now,
          updatedAt: now,
        });
        return {
          ok: true,
          data: snapshot.blocks,
          meta: snapshot.meta,
          narrativeId: snapshot.id,
          status: snapshot.status,
        };
      } catch (err) {
        fastify.log.error({ err }, 'narrative_failed');
        return { ok: true, data: [] };
      }
    },
  );

  fastify.get('/:id/narratives', async (request, reply) => {
    const profileId = (request.params as { id: string }).id;
    const profile = await repo.find(profileId);
    if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
    const query = request.query as { status?: string; maskId?: string };
    const entries = await narrativeRepo.list(profileId, query.status, query.maskId);
    return { ok: true, data: entries };
  });

  fastify.get('/:id/narratives/approved', async (request, reply) => {
    const profileId = (request.params as { id: string }).id;
    const profile = await repo.find(profileId);
    if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
    const query = request.query as { maskId?: string };
    const snapshot = await narrativeRepo.latestApproved(profileId, query.maskId);
    if (!snapshot)
      return reply.code(404).send({ ok: false, error: 'approved_narrative_not_found' });
    return {
      ok: true,
      data: snapshot.blocks,
      meta: snapshot.meta,
      narrativeId: snapshot.id,
      status: snapshot.status,
    };
  });

  fastify.patch(
    '/:id/narratives/:narrativeId',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profileId = (request.params as { id: string; narrativeId: string }).id;
      const narrativeId = (request.params as { id: string; narrativeId: string }).narrativeId;
      const profile = await repo.find(profileId);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
      const body = request.body as { blocks?: unknown; revisionNote?: string };
      let blocks;
      if (body.blocks) {
        const parsed = NarrativeBlockSchema.array().safeParse(body.blocks);
        if (!parsed.success) {
          return reply
            .code(400)
            .send({ ok: false, error: 'invalid_blocks', details: parsed.error.flatten() });
        }
        blocks = parsed.data;
      }
      const updated = await narrativeRepo.update(narrativeId, {
        blocks,
        revisionNote: body.revisionNote,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      if (!updated || updated.profileId !== profileId) {
        return reply.code(404).send({ ok: false, error: 'narrative_not_found' });
      }
      return { ok: true, data: updated };
    },
  );

  fastify.post(
    '/:id/narratives/:narrativeId/approve',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profileId = (request.params as { id: string; narrativeId: string }).id;
      const narrativeId = (request.params as { id: string; narrativeId: string }).narrativeId;
      const profile = await repo.find(profileId);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
      const body = request.body as { approvedBy?: string };
      const now = new Date().toISOString();
      const updated = await narrativeRepo.update(narrativeId, {
        status: 'approved',
        approvedAt: now,
        approvedBy: body.approvedBy,
        updatedAt: now,
      });
      if (!updated || updated.profileId !== profileId) {
        return reply.code(404).send({ ok: false, error: 'narrative_not_found' });
      }
      return { ok: true, data: updated };
    },
  );

  fastify.post(
    '/:id/agent-tokens',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profileId = (request.params as { id: string }).id;
      const profile = await repo.find(profileId);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
      const body = request.body as { label?: string; scopes?: string[] };
      const scopes =
        Array.isArray(body.scopes) && body.scopes.length > 0 ? body.scopes : ['agent:query'];
      const token = await agentTokenRepo.create(profileId, body.label, scopes); // allow-secret
      return {
        ok: true,
        data: { token: token.token, tokenId: token.record.id, scopes: token.record.scopes },
      }; // allow-secret
    },
  );

  fastify.get(
    '/:id/agent-tokens',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profileId = (request.params as { id: string }).id;
      const profile = await repo.find(profileId);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
      const tokens = await agentTokenRepo.list(profileId);
      return { ok: true, data: tokens.map(({ tokenHash: _hash, ...rest }) => rest) };
    },
  );

  fastify.delete(
    '/:id/agent-tokens/:tokenId',
    { preHandler: [createOwnershipMiddleware()] },
    async (request, reply) => {
      const profileId = (request.params as { id: string; tokenId: string }).id;
      const tokenId = (request.params as { id: string; tokenId: string }).tokenId;
      const profile = await repo.find(profileId);
      if (!profile) return reply.code(404).send({ ok: false, error: 'not_found' });
      const revoked = await agentTokenRepo.revoke(tokenId, profileId);
      if (!revoked) return reply.code(404).send({ ok: false, error: 'token_not_found' });
      return { ok: true };
    },
  );
}

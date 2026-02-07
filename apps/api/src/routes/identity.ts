/**
 * Identity Core Routes
 *
 * CRUD endpoints for a profile's foundational philosophical identity —
 * thesis, invariants, master keywords, intellectual lineage, etc.
 * Each profile has at most one identity_core record (persona principalis).
 */

import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { IdentityCoreSchema } from '@in-midst-my-life/schema';
import { createIdentityCoreRepo, type IdentityCoreRepo } from '../repositories/identity-core';
import { createOwnershipMiddleware } from '../middleware/auth';

export function registerIdentityRoutes(
  fastify: FastifyInstance,
  options: { identityCoreRepo?: IdentityCoreRepo },
  done: (err?: Error) => void,
): void {
  const repo =
    options.identityCoreRepo ??
    createIdentityCoreRepo(
      new Pool({
        connectionString: process.env['DATABASE_URL'] ?? process.env['POSTGRES_URL'],
      }),
    );

  const ownershipCheck = createOwnershipMiddleware();

  /**
   * GET /:profileId/identity
   * Retrieve the identity core for a profile.
   */
  fastify.get<{ Params: { profileId: string } }>('/:profileId/identity', async (request, reply) => {
    const row = await repo.getByProfileId(request.params.profileId);
    if (!row) {
      return reply.code(404).send({ ok: false, error: 'identity_core_not_found' });
    }
    return { ok: true, data: row };
  });

  /**
   * PUT /:profileId/identity
   * Create or update the identity core for a profile.
   * Requires ownership of the profile.
   */
  fastify.put<{ Params: { profileId: string } }>(
    '/:profileId/identity',
    { preHandler: [ownershipCheck] },
    async (request, reply) => {
      const parsed = IdentityCoreSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ ok: false, errors: parsed.error.flatten() });
      }
      const row = await repo.upsert(request.params.profileId, parsed.data);
      return { ok: true, data: row };
    },
  );

  /**
   * DELETE /:profileId/identity
   * Remove the identity core for a profile.
   * Requires ownership of the profile.
   */
  fastify.delete<{ Params: { profileId: string } }>(
    '/:profileId/identity',
    { preHandler: [ownershipCheck] },
    async (request, reply) => {
      const deleted = await repo.deleteByProfileId(request.params.profileId);
      if (!deleted) {
        return reply.code(404).send({ ok: false, error: 'identity_core_not_found' });
      }
      return { ok: true };
    },
  );

  done();
}

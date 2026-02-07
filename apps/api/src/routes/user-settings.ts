/**
 * User Settings Routes
 *
 * Per-profile settings stored in the settings table with scope='user'.
 * All endpoints require authentication + profile ownership (or admin role).
 *
 * GET  /profiles/:profileId/settings       - List all user settings
 * GET  /profiles/:profileId/settings/:key  - Get a single user setting
 * PUT  /profiles/:profileId/settings/:key  - Upsert a user setting
 */

import type { FastifyInstance } from 'fastify';
import { createOwnershipMiddleware } from '../middleware/auth';
import type { SettingsRepo } from '../repositories/settings';

export interface UserSettingsRouteOptions {
  settingsRepo: SettingsRepo;
}

export function registerUserSettingsRoutes(
  fastify: FastifyInstance,
  opts: UserSettingsRouteOptions,
  done: (err?: Error) => void,
): void {
  const { settingsRepo } = opts;
  const ownerAuth = createOwnershipMiddleware();

  /** GET /profiles/:profileId/settings — list all user settings */
  fastify.get<{ Params: { profileId: string } }>(
    '/profiles/:profileId/settings',
    { preHandler: [ownerAuth] },
    async (request, reply) => {
      const settings = await settingsRepo.listUser(request.params.profileId);
      return reply.code(200).send({ ok: true, data: settings, count: settings.length });
    },
  );

  /** GET /profiles/:profileId/settings/:key — get a single user setting */
  fastify.get<{ Params: { profileId: string; key: string } }>(
    '/profiles/:profileId/settings/:key',
    { preHandler: [ownerAuth] },
    async (request, reply) => {
      const value = await settingsRepo.getUser(request.params.profileId, request.params.key);
      if (value === null) {
        return reply.code(404).send({ ok: false, error: 'setting_not_found' });
      }
      return reply.code(200).send({ ok: true, key: request.params.key, value });
    },
  );

  /** PUT /profiles/:profileId/settings/:key — upsert a user setting */
  fastify.put<{ Params: { profileId: string; key: string }; Body: { value: unknown } }>(
    '/profiles/:profileId/settings/:key',
    { preHandler: [ownerAuth] },
    async (request, reply) => {
      const { profileId, key } = request.params;
      const { value } = request.body ?? {};
      if (value === undefined) {
        return reply.code(400).send({ ok: false, error: 'value_required' });
      }
      const userId = (request.user as { id?: string; sub?: string } | undefined)?.sub;
      await settingsRepo.setUser(profileId, key, value, userId);
      return reply.code(200).send({ ok: true, key, value });
    },
  );

  done();
}

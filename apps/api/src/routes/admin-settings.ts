/**
 * Admin Settings Routes
 *
 * CRUD for system-wide settings and feature flags.
 * Requires admin role for all endpoints.
 *
 * GET  /admin/settings            - List all system settings
 * GET  /admin/settings/:key       - Get a single setting
 * PUT  /admin/settings/:key       - Upsert a setting
 * GET  /admin/feature-flags       - List all feature flags with status
 * PUT  /admin/feature-flags/:key  - Toggle a feature flag
 */

import type { FastifyInstance } from 'fastify';
import { createPermissionMiddleware } from '../middleware/auth';
import { Permission } from '../services/auth';
import type { SettingsRepo } from '../repositories/settings';

export interface AdminSettingsRouteOptions {
  settingsRepo: SettingsRepo;
}

export function registerAdminSettingsRoutes(
  fastify: FastifyInstance,
  opts: AdminSettingsRouteOptions,
  done: (err?: Error) => void,
): void {
  const { settingsRepo } = opts;
  const adminAuth = createPermissionMiddleware(Permission.ADMIN_ACCESS);

  /** GET /admin/settings — list all system settings */
  fastify.get('/admin/settings', { onRequest: [adminAuth] }, async (_request, reply) => {
    const settings = await settingsRepo.listSystem();
    return reply.code(200).send({ ok: true, data: settings, count: settings.length });
  });

  /** GET /admin/settings/:key — get a single system setting */
  fastify.get<{ Params: { key: string } }>(
    '/admin/settings/:key',
    { onRequest: [adminAuth] },
    async (request, reply) => {
      const value = await settingsRepo.getSystem(request.params.key);
      if (value === null) {
        return reply.code(404).send({ ok: false, error: 'setting_not_found' });
      }
      return reply.code(200).send({ ok: true, key: request.params.key, value });
    },
  );

  /** PUT /admin/settings/:key — upsert a system setting */
  fastify.put<{ Params: { key: string }; Body: { value: unknown } }>(
    '/admin/settings/:key',
    { onRequest: [adminAuth] },
    async (request, reply) => {
      const { key } = request.params;
      const { value } = request.body ?? {};
      if (value === undefined) {
        return reply.code(400).send({ ok: false, error: 'value_required' });
      }
      const userId = (request.user as { id?: string } | undefined)?.id;
      await settingsRepo.setSystem(key, value, userId);
      return reply.code(200).send({ ok: true, key, value });
    },
  );

  /** GET /admin/feature-flags — list all feature.* settings with enabled/disabled status */
  fastify.get('/admin/feature-flags', { onRequest: [adminAuth] }, async (_request, reply) => {
    const all = await settingsRepo.listSystem();
    const flags = all
      .filter((s) => s.key.startsWith('feature.'))
      .map((s) => ({
        key: s.key,
        enabled: s.value === 'enabled' || s.value === true,
        updatedAt: s.updated_at,
      }));
    return reply.code(200).send({ ok: true, data: flags, count: flags.length });
  });

  /** PUT /admin/feature-flags/:key — toggle a feature flag */
  fastify.put<{ Params: { key: string }; Body: { enabled: boolean } }>(
    '/admin/feature-flags/:key',
    { onRequest: [adminAuth] },
    async (request, reply) => {
      const { key } = request.params;
      const fullKey = key.startsWith('feature.') ? key : `feature.${key}`;
      const { enabled } = request.body ?? {};
      if (typeof enabled !== 'boolean') {
        return reply.code(400).send({ ok: false, error: 'enabled_boolean_required' });
      }
      const userId = (request.user as { id?: string } | undefined)?.id;
      await settingsRepo.setSystem(fullKey, enabled ? 'enabled' : 'disabled', userId);
      return reply.code(200).send({ ok: true, key: fullKey, enabled });
    },
  );

  done();
}

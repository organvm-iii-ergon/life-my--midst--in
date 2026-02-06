/**
 * Admin Licensing Routes
 * Internal endpoints for managing feature gates and user entitlements
 *
 * Requires admin role for all endpoints
 *
 * GET /admin/licensing/entitlements/:profileId - Get user's entitlements
 * POST /admin/licensing/entitlements/:profileId/reset - Reset rate limits
 * PATCH /admin/licensing/tiers/:profileId - Update user's subscription tier
 */

import { FastifyInstance } from "fastify";
import type { LicensingService } from "@in-midst-my-life/core";
import { createPermissionMiddleware } from "../middleware/auth";
import { Permission } from "../services/auth";

export async function registerAdminLicensingRoutes(
  fastify: FastifyInstance,
  licensingService: LicensingService
) {
  // Require admin permission for all routes in this module
  const adminAuth = createPermissionMiddleware(Permission.ADMIN_ACCESS);

  /**
   * GET /admin/licensing/entitlements/:profileId
   * Get current entitlements and usage for a user
   */
  fastify.get<{ Params: { profileId: string } }>(
    "/admin/licensing/entitlements/:profileId",
    { onRequest: [adminAuth] },
    async (request, reply) => {
      const { profileId } = request.params;

      try {
        const entitlements = await licensingService.getEntitlements(profileId);

        return reply.code(200).send({
          ok: true,
          data: entitlements,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          ok: false,
          error: "internal_server_error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  /**
   * POST /admin/licensing/entitlements/:profileId/reset
   * Reset all rate limit counters for a user
   * Useful for testing or customer service
   */
  fastify.post<{ Params: { profileId: string } }>(
    "/admin/licensing/entitlements/:profileId/reset",
    {
      onRequest: [adminAuth],
    },
    async (request, reply) => {
      const { profileId } = request.params;

      try {
        await licensingService.resetAllCounters(profileId);

        return reply.code(200).send({
          ok: true,
          message: `Rate limits reset for profile ${profileId}`,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          ok: false,
          error: "internal_server_error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  /**
   * GET /admin/licensing/tiers
   * List all available subscription tiers and their features
   */
  fastify.get(
    "/admin/licensing/tiers",
    { onRequest: [adminAuth] },
    async (_request, reply) => {
      try {
        const tiers = [
          licensingService.getPlanDefinition("FREE"),
          licensingService.getPlanDefinition("PRO"),
          licensingService.getPlanDefinition("ENTERPRISE"),
        ];

        return reply.code(200).send({
          ok: true,
          data: {
            tiers,
            count: tiers.length,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          ok: false,
          error: "internal_server_error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  /**
   * POST /admin/licensing/feature-check/:profileId/:feature
   * Check if a user can use a specific feature (without consuming quota)
   */
  fastify.post<{ Params: { profileId: string; feature: string } }>(
    "/admin/licensing/feature-check/:profileId/:feature",
    {
      onRequest: [adminAuth],
    },
    async (request, reply) => {
      const { profileId, feature } = request.params;

      try {
        const allowed = await licensingService.canUse(profileId, feature as any);
        const entitlements = await licensingService.getEntitlements(profileId);
        const featureInfo = entitlements.features[feature as keyof typeof entitlements.features];

        return reply.code(200).send({
          ok: true,
          data: {
            profileId,
            feature,
            allowed,
            tier: entitlements.tier,
            limit: featureInfo?.value ?? 0,
            used: featureInfo?.used ?? 0,
            remaining: Math.max(0, (featureInfo?.value ?? 0) - (featureInfo?.used ?? 0)),
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          ok: false,
          error: "internal_server_error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

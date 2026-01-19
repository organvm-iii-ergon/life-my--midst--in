/**
 * Integration CRUD Routes
 *
 * Basic CRUD operations for cloud storage integrations:
 * - GET /profiles/:profileId/integrations - List connected integrations
 * - GET /profiles/:profileId/integrations/:integrationId - Get integration details
 * - PATCH /profiles/:profileId/integrations/:integrationId - Update configuration
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { artifactService } from "../../services/artifact-service";
import { IntegrationUpdateSchema } from "./validation";

/**
 * Register integration CRUD routes.
 */
export async function registerIntegrationCrudRoutes(fastify: FastifyInstance) {
  /**
   * GET /profiles/:profileId/integrations
   *
   * List all connected cloud storage integrations for a profile.
   */
  fastify.get(
    "/profiles/:profileId/integrations",
    async (request, reply) => {
      const { profileId } = request.params as { profileId: string };

      try {
        const integrations = await artifactService.listIntegrations(profileId);

        // Don't expose encrypted tokens in response
        const safe = integrations.map((i) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { accessTokenEncrypted, refreshTokenEncrypted, ...rest } = i;
          return rest;
        });

        return {
          ok: true,
          data: safe,
        };
      } catch (err) {
        request.log.error(err);
        reply.code(500);
        return { ok: false, error: "failed_to_list_integrations" };
      }
    }
  );

  /**
   * GET /profiles/:profileId/integrations/:integrationId
   *
   * Get a specific integration's configuration.
   */
  fastify.get(
    "/profiles/:profileId/integrations/:integrationId",
    async (request, reply) => {
      const { profileId, integrationId } = request.params as {
        profileId: string;
        integrationId: string;
      };

      try {
        const integration = await artifactService.getIntegration(
          integrationId,
          profileId
        );

        if (!integration) {
          reply.code(404);
          return { ok: false, error: "integration_not_found" };
        }

        // Don't expose encrypted tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { accessTokenEncrypted, refreshTokenEncrypted, ...safe } =
          integration;

        return { ok: true, data: safe };
      } catch (err) {
        request.log.error(err);
        reply.code(500);
        return { ok: false, error: "failed_to_get_integration" };
      }
    }
  );

  /**
   * PATCH /profiles/:profileId/integrations/:integrationId
   *
   * Update integration configuration (folder settings, exclusions, etc).
   */
  fastify.patch(
    "/profiles/:profileId/integrations/:integrationId",
    async (request, reply) => {
      const { profileId, integrationId } = request.params as {
        profileId: string;
        integrationId: string;
      };

      try {
        const updates = IntegrationUpdateSchema.parse(request.body);

        // Ensure integration exists
        const existing = await artifactService.getIntegration(
          integrationId,
          profileId
        );
        if (!existing) {
          reply.code(404);
          return { ok: false, error: "integration_not_found" };
        }

        const updated = await artifactService.updateIntegration(
          integrationId,
          profileId,
          updates as any
        );

        if (!updated) {
          reply.code(404);
          return { ok: false, error: "integration_not_found" };
        }

        // Don't expose encrypted tokens
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { accessTokenEncrypted, refreshTokenEncrypted, ...safe } = updated;

        return { ok: true, data: safe };
      } catch (err) {
        if (err instanceof z.ZodError) {
          reply.code(400);
          return { ok: false, error: "validation_error", details: err.errors };
        }
        request.log.error(err);
        reply.code(500);
        return { ok: false, error: "failed_to_update_integration" };
      }
    }
  );
}

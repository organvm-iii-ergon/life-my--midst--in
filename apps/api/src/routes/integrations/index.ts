/**
 * Cloud Storage Integration Routes
 *
 * Main router that registers all integration sub-routes.
 *
 * This file serves as the entry point for integration routes,
 * consolidating OAuth flow, CRUD operations, and complex operations
 * into a single registration function.
 *
 * Endpoints:
 * - POST /integrations/cloud-storage/connect - Initiate OAuth flow
 * - GET /integrations/cloud-storage/callback - OAuth callback handler
 * - GET /profiles/:profileId/integrations - List connected integrations
 * - GET /profiles/:profileId/integrations/:integrationId - Get integration details
 * - PATCH /profiles/:profileId/integrations/:integrationId - Update configuration
 * - DELETE /profiles/:profileId/integrations/:integrationId - Disconnect integration
 * - POST /profiles/:profileId/integrations/:integrationId/sync - Trigger sync
 * - POST /profiles/:profileId/integrations/:integrationId/refresh - Refresh token
 *
 * OAuth flow:
 * 1. User clicks "Connect [Provider]"
 * 2. POST /integrations/cloud-storage/connect → get authorizationUrl
 * 3. User redirected to provider's OAuth consent screen
 * 4. Provider redirects back to callback with authorization code
 * 5. GET /integrations/cloud-storage/callback?code=...&state=...
 * 6. Backend exchanges code for tokens and stores encrypted
 * 7. User sees "Connected" status in settings
 */

import type { FastifyInstance } from "fastify";
import { registerOAuthRoutes } from "./oauth";
import { registerIntegrationCrudRoutes } from "./crud";
import { registerIntegrationOperationRoutes } from "./operations";

/**
 * Register all cloud storage integration routes.
 *
 * @param fastify Fastify instance
 */
export async function registerIntegrationRoutes(
  fastify: FastifyInstance
): Promise<void> {
  // Register OAuth flow routes (connect/callback)
  await registerOAuthRoutes(fastify);

  // Register CRUD routes (list, get, update)
  await registerIntegrationCrudRoutes(fastify);

  // Register operation routes (delete, sync, refresh)
  await registerIntegrationOperationRoutes(fastify);
}

// Re-export validation schemas for external use
export * from "./validation";

/**
 * Aetas Routes
 *
 * Main router that registers all aetas (life-stage) sub-routes.
 *
 * Aetas represent theatrical/developmental stages in a person's life arc:
 * Initiation → Emergence → Consolidation → Expansion → Mastery → Integration → Transmission → Stewardship
 *
 * This file serves as the entry point for aetas routes,
 * consolidating taxonomy definitions and profile-specific CRUD operations.
 *
 * Endpoints:
 * - GET /profiles/:id/aetas - List aetas for profile
 * - POST /profiles/:id/aetas - Create new aetas entry
 * - GET /profiles/:id/aetas/:aetasId - Get specific aetas
 * - PATCH /profiles/:id/aetas/:aetasId - Update aetas
 * - DELETE /profiles/:id/aetas/:aetasId - Remove aetas
 * - GET /taxonomy/aetas - List canonical aetas definitions
 */

import type { FastifyInstance } from "fastify";
import { registerAetasCrudRoutes } from "./crud";
import { registerAetasTaxonomyRoutes } from "./taxonomy";

/**
 * Register all aetas routes.
 *
 * @param fastify Fastify instance
 */
export async function registerAetasRoutes(
  fastify: FastifyInstance
): Promise<void> {
  // Register profile-specific CRUD routes
  await registerAetasCrudRoutes(fastify);

  // Register taxonomy route for canonical aetas
  await registerAetasTaxonomyRoutes(fastify);
}

// Re-export validation schemas and canonical data for external use
export * from "./validation";
export { canonicalAetas } from "./taxonomy";

/**
 * Hunter Protocol Stats Routes
 *
 * Analytics endpoint:
 * - GET /:id/hunter/stats - Get job application statistics
 */

import type { FastifyInstance } from "fastify";
import type { HunterContext } from "./types";

/**
 * Register stats routes.
 */
export async function registerStatsRoutes(
  fastify: FastifyInstance,
  ctx: HunterContext
): Promise<void> {
  const { hunterService } = ctx;

  /**
   * GET /profiles/:id/hunter/stats
   * Get job application statistics
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id/hunter/stats",
    async (request, reply) => {
      const { id } = request.params;
      try {
        const stats = await hunterService.getApplicationStats(id);
        reply.code(200).send(stats);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          error: "Failed to fetch hunter stats",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

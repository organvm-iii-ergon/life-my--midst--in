/**
 * Hunter Protocol Apply Routes
 *
 * Application submission endpoints:
 * - POST /hunter/submit-application/:jobId - Submit application (auth-based)
 * - POST /:id/hunter/applications/batch - Batch auto-apply to multiple jobs
 */

import type { FastifyInstance } from "fastify";
import {
  FeatureNotAvailableError,
  QuotaExceededError,
} from "@in-midst-my-life/core";
import type { HunterContext } from "./types";

/**
 * Register application submission routes.
 */
export async function registerApplyRoutes(
  fastify: FastifyInstance,
  ctx: HunterContext
): Promise<void> {
  const { hunterService } = ctx;

  /**
   * POST /hunter/submit-application/:jobId
   * Submit application with resume and cover letter (uses authenticated user's profile)
   */
  fastify.post<{ Params: { jobId: string } }>(
    "/hunter/submit-application/:jobId",
    {
      schema: {
        params: {
          type: "object",
          required: ["jobId"],
          properties: {
            jobId: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            autoSubmit: { type: "boolean", default: false },
            customResume: { type: "string" },
            customCoverLetter: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;
      const { autoSubmit, customResume, customCoverLetter } =
        request.body as any;
      const profileId = request.user?.profileId;

      if (!profileId) {
        return reply.code(401).send({
          ok: false,
          error: "unauthorized",
          message: "Authentication required",
        });
      }

      try {
        const result = await hunterService.submitApplication(
          profileId,
          jobId,
          {
            autoSubmit,
            customResume,
            customCoverLetter,
            submissionType: "manual",
          }
        );

        return reply.code(200).send({
          ok: true,
          data: result,
        });
      } catch (error) {
        if (error instanceof QuotaExceededError) {
          return reply.code(403).send({
            ok: false,
            error: "quota_exceeded",
            message: error.message,
          });
        }
        if (error instanceof FeatureNotAvailableError) {
          return reply.code(403).send({
            ok: false,
            error: "feature_not_available",
            message: error.message,
          });
        }
        throw error;
      }
    }
  );

  /**
   * POST /profiles/:id/hunter/applications/batch
   * Batch auto-apply to multiple jobs based on compatibility threshold
   */
  fastify.post<{
    Params: { id: string };
    Body: {
      searchFilter: Record<string, unknown>;
      personaId?: string;
      autoApplyThreshold: number;
      maxApplications?: number;
    };
  }>(
    "/:id/hunter/applications/batch",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["searchFilter", "autoApplyThreshold"],
          properties: {
            searchFilter: { type: "object" },
            personaId: { type: "string" },
            autoApplyThreshold: { type: "number", minimum: 0, maximum: 100 },
            maxApplications: { type: "number", minimum: 1, maximum: 50 },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        searchFilter,
        personaId = "default",
        autoApplyThreshold,
        maxApplications = 10,
      } = request.body;

      const profileId = request.user?.profileId;
      if (!profileId) {
        return reply.code(401).send({
          ok: false,
          error: "unauthorized",
          message: "Authentication required",
        });
      }

      try {
        const result = await hunterService.batchApply(
          id,
          searchFilter as any,
          personaId,
          autoApplyThreshold,
          maxApplications
        );

        return reply.code(200).send({
          ok: true,
          applications: result.applications,
          skipped: result.skipped,
          errors: result.errors,
          summary: {
            totalApplied: result.applications.length,
            totalSkipped: result.skipped,
            totalErrors: result.errors.length,
          },
        });
      } catch (error) {
        if (error instanceof QuotaExceededError) {
          return reply.code(403).send({
            ok: false,
            error: "quota_exceeded",
            message: error.message,
            context: {
              feature: error.feature,
              limit: error.limit,
              used: error.used,
              remaining: error.limit - error.used,
            },
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          ok: false,
          error: "batch_application_failed",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

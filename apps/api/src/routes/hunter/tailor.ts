/**
 * Hunter Protocol Tailor Routes
 *
 * Resume tailoring endpoints:
 * - POST /hunter/tailor-resume/:jobId - Generate resume tailored to job (auth-based)
 * - POST /:id/hunter/tailor-resume - Generate tailored resume for profile
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { QuotaExceededError } from "@in-midst-my-life/core";
import type { HunterContext } from "./types";

/**
 * Register resume tailoring routes.
 */
export async function registerTailorRoutes(
  fastify: FastifyInstance,
  ctx: HunterContext
): Promise<void> {
  const { hunterService, tailorGate } = ctx;

  /**
   * POST /hunter/tailor-resume/:jobId
   * Generate resume tailored to job listing (uses authenticated user's profile)
   */
  fastify.post<{ Params: { jobId: string } }>(
    "/hunter/tailor-resume/:jobId",
    {
      schema: {
        params: {
          type: "object",
          required: ["jobId"],
          properties: {
            jobId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;
      const profileId = request.user?.profileId;

      if (!profileId) {
        return reply.code(401).send({
          ok: false,
          error: "unauthorized",
          message: "Authentication required",
        });
      }

      try {
        const result = await hunterService.tailorResume(profileId, jobId, {
          format: "markdown",
          highlightGaps: true,
        });

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
            context: {
              feature: error.feature,
              limit: error.limit,
              used: error.used,
              remaining: error.limit - error.used,
            },
          });
        }
        throw error;
      }
    }
  );

  /**
   * POST /profiles/:id/hunter/tailor-resume
   * Generate tailored resume for specific job and persona
   */
  fastify.post<{ Params: { id: string } }>(
    "/:id/hunter/tailor-resume",
    {
      onRequest: tailorGate,
    },
    async (request, reply) => {
      const { id } = request.params;

      const bodyParsed = z
        .object({
          jobId: z.string(),
          personaId: z.string(),
        })
        .safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { jobId, personaId } = bodyParsed.data;

      try {
        const result = await hunterService.tailorResume(id, jobId, {
          format: "markdown",
          highlightGaps: true,
        });

        // Use suggested improvements as emphasis points if no keyword matches found
        const emphasisPoints =
          result.resume.keywordMatches.length > 0
            ? result.resume.keywordMatches
            : result.resume.suggestedImprovements;

        reply.code(200).send({
          tailoredResume: result,
          maskedResume: result.resume.content,
          keyPointsToEmphasize: emphasisPoints,
          emphasisPoints: emphasisPoints,
          areasToDeEmphasize: [],
          tailoringRationale: result.resume.suggestedImprovements,
          personaRecommendation: personaId,
        });
      } catch (error) {
        fastify.log.error(error);

        // Check for quota exceeded error
        if (error instanceof QuotaExceededError) {
          return reply.code(403).send({
            ok: false,
            error: "quota_exceeded",
            message: error.message,
          });
        }

        reply.code(500).send({
          error: "Failed to tailor resume",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

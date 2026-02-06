/**
 * Hunter Protocol Cover Letter Routes
 *
 * Cover letter generation endpoints:
 * - POST /hunter/generate-letter/:jobId - Generate cover letter (auth-based)
 * - POST /:id/hunter/write-cover-letter - Generate personalized cover letter
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  FeatureNotAvailableError,
  NotFoundError,
  QuotaExceededError,
} from "@in-midst-my-life/core";
import type { HunterContext } from "./types";

/**
 * Register cover letter generation routes.
 */
export async function registerLetterRoutes(
  fastify: FastifyInstance,
  ctx: HunterContext
): Promise<void> {
  const { hunterService } = ctx;

  /**
   * POST /hunter/generate-letter/:jobId
   * Generate customized cover letter for job (uses authenticated user's profile)
   */
  fastify.post<{ Params: { jobId: string } }>(
    "/hunter/generate-letter/:jobId",
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
        const result = await hunterService.generateCoverLetter(
          profileId,
          jobId,
          {
            template: "professional",
            tone: "formal",
          }
        );

        return reply.code(200).send({
          ok: true,
          data: result,
        });
      } catch (error) {
        if (error instanceof FeatureNotAvailableError) {
          return reply.code(403).send({
            ok: false,
            error: "feature_not_available",
            message: error.message,
          });
        }
        if (error instanceof QuotaExceededError) {
          return reply.code(403).send({
            ok: false,
            error: "quota_exceeded",
            message: error.message,
          });
        }
        throw error;
      }
    }
  );

  /**
   * POST /profiles/:id/hunter/write-cover-letter
   * Generate personalized cover letter
   */
  fastify.post<{ Params: { id: string } }>(
    "/:id/hunter/write-cover-letter",
    async (request, reply) => {
      const { id } = request.params;

      const bodyParsed = z
        .object({
          job: z
            .object({
              id: z.string(),
              title: z.string().optional(),
              company: z.string().optional(),
            })
            .optional(),
          jobId: z.string().optional(),
          personaId: z.string(),
          tailoredResume: z.string().optional(),
        })
        .safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { job, jobId: bodyJobId, personaId, tailoredResume: _tailoredResume } =
        bodyParsed.data;
      const jobId = job?.id || bodyJobId;

      if (!jobId) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          message: "jobId is required",
        });
      }

      try {
        const result = await hunterService.generateCoverLetter(id, jobId, {
          template: "professional",
          tone: "formal",
        });

        // Extract personalized elements from notes (split comma-separated string)
        const personalizedElements = (result.personalizationNotes ?? "")
          .split(", ")
          .filter((note) => note.trim().length > 0);

        reply.code(200).send({
          coverLetter: result.coverLetter.content,
          template: result.coverLetter.template,
          tone: result.coverLetter.tone,
          wordCount: result.coverLetter.wordCount,
          readingTime: result.coverLetter.readingTime,
          personalizedElements: personalizedElements,
          metadata: result.metadata,
          hiringManager: result.hiringManager,
          personaRecommendation: personaId,
        });
      } catch (error) {
        fastify.log.error(error);

        // Check for not found error
        if (error instanceof NotFoundError) {
          return reply.code(404).send({
            ok: false,
            error: "not_found",
            message: error.message,
          });
        }

        // Check for quota exceeded error
        if (error instanceof QuotaExceededError) {
          return reply.code(403).send({
            ok: false,
            error: "quota_exceeded",
            message: error.message,
          });
        }

        reply.code(500).send({
          error: "Failed to generate cover letter",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

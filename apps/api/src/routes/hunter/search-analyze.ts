/**
 * Hunter Protocol Search & Analyze Routes
 *
 * Job search and compatibility analysis endpoints:
 * - POST /:id/hunter/search - Search jobs with intelligent filtering
 * - POST /:id/hunter/analyze/:jobId - Analyze compatibility between profile and job
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { NotFoundError } from "@in-midst-my-life/core";
import { HunterSearchFilterSchema } from "@in-midst-my-life/schema";
import type { HunterContext } from "./types";

/**
 * Register search and analyze routes.
 */
export async function registerSearchAnalyzeRoutes(
  fastify: FastifyInstance,
  ctx: HunterContext
): Promise<void> {
  const { hunterService, jobRepo, searchGate } = ctx;

  /**
   * POST /profiles/:id/hunter/search
   * Search jobs with intelligent filtering
   */
  fastify.post<{ Params: { id: string } }>(
    "/:id/hunter/search",
    {
      onRequest: searchGate,
    },
    async (request, reply) => {
      const { id } = request.params;

      const bodyParsed = HunterSearchFilterSchema.extend({
        maxResults: z.number().min(1).max(100).optional(),
      }).safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { maxResults, ...filter } = bodyParsed.data;

      try {
        const start = Date.now();
        const jobs = await hunterService.findJobs(id, {
          keywords: filter.keywords,
          location: filter.locations?.[0],
          seniority: filter.seniority_levels?.[0],
          maxResults,
        });

        reply.code(200).send({
          jobs,
          totalFound: jobs.length,
          searchDurationMs: Date.now() - start,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          error: "Failed to search jobs",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  /**
   * POST /profiles/:id/hunter/analyze/:jobId
   * Analyze compatibility between profile and specific job
   */
  fastify.post<{ Params: { id: string; jobId: string } }>(
    "/:id/hunter/analyze/:jobId",
    async (request, reply) => {
      const { id, jobId } = request.params;
      const body = request.body as any;

      try {
        let job = await jobRepo.findPosting(jobId);

        // Fallback to job provided in body if not in repo
        if (!job && body.job) {
          job = body.job;
        }

        if (!job) {
          return reply.code(404).send({ error: "Job not found" });
        }

        const report = await hunterService.analyzeGap(id, job.title);

        // Map CompatibilityReport to expected API response structure
        const compatibility = {
          overall_score: report.compatibility,
          skill_gaps: report.gaps,
          strengths: report.suggestions,
          concerns: report.concerns,
          recommendation:
            report.compatibility > 80 ? "apply_now" : "moderate_fit",
          skill_match: report.compatibility,
          cultural_match: 50,
          growth_potential: 50,
          compensation_fit: 50,
          location_suitability: 50,
          analysis_date: report.timestamp,
        };

        reply.code(200).send({
          compatibility,
          recommendation: compatibility.recommendation,
          effortEstimate: 15,
        });
      } catch (error) {
        fastify.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.code(404).send({
            error: "not_found",
            message: error.message,
          });
        }

        reply.code(500).send({
          error: "Failed to analyze job compatibility",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createHunterAgent,
  HunterSearchFilterSchema,
  type LicensingService
} from "@in-midst-my-life/core";
import type { Profile } from "@in-midst-my-life/schema";
import { profileRepo, type ProfileRepo } from "../repositories/profiles";
import { createFeatureGateMiddleware } from "../middleware/feature-gate";

/**
 * Hunter Protocol API Routes
 * Autonomous job-search agent endpoints
 */

export async function registerHunterProtocolRoutes(
  fastify: FastifyInstance,
  deps?: { repo?: ProfileRepo; licensingService?: LicensingService }
) {
  const repo = deps?.repo ?? profileRepo;
  const hunterAgent = createHunterAgent(
    process.env['NODE_ENV'] === "development",
    deps?.licensingService
  );
  
  // Create middleware if licensing service is available
  const licensing = deps?.licensingService;
  const searchGate = licensing 
    ? [createFeatureGateMiddleware(licensing, "hunter_job_searches")]
    : [];
  const tailorGate = licensing
    ? [createFeatureGateMiddleware(licensing, "resume_tailoring")]
    : [];
  const applyGate = licensing
    ? [createFeatureGateMiddleware(licensing, "hunter_auto_apply")]
    : [];

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
        const result = await hunterAgent.findJobs({
          profileId: id,
          filter,
          maxResults: maxResults || 50,
        });

        reply.code(200).send({
          jobs: result.jobs,
          totalFound: result.totalFound,
          searchDurationMs: result.searchDurationMs,
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
      
      const bodyParsed = z.object({
        job: z.any(), // JobListing schema
        personaId: z.string().optional(),
      }).safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { job, personaId } = bodyParsed.data;

      try {
        const profile = await repo.find(id);
        if (!profile) {
          return reply.code(404).send({
            error: "Profile not found",
            message: `No profile with ID ${id}`,
          });
        }

        const result = await hunterAgent.analyzeGap({
          job,
          profile,
          personaId,
        });

        reply.code(200).send({
          compatibility: result.compatibility,
          recommendation: result.recommendation,
          effortEstimate: result.effortEstimate,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          error: "Failed to analyze job compatibility",
          message: error instanceof Error ? error.message : "Unknown error",
        });
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
      
      const bodyParsed = z.object({
        jobId: z.string(),
        personaId: z.string(),
      }).safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { jobId, personaId } = bodyParsed.data;

      try {
        const profile = await repo.find(id);
        if (!profile) {
          return reply.code(404).send({
            error: "Profile not found",
            message: `No profile with ID ${id}`,
          });
        }

        const result = await hunterAgent.tailorResume({
          profileId: id,
          jobId,
          profile,
          personaId,
        });

        reply.code(200).send({
          maskedResume: result.maskedResume,
          keyPointsToEmphasize: result.keyPointsToEmphasize,
          areasToDeEmphasize: result.areasToDeEmphasize,
          personaRecommendation: result.personaRecommendation,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          error: "Failed to tailor resume",
          message: error instanceof Error ? error.message : "Unknown error",
        });
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
      
      const bodyParsed = z.object({
        job: z.any(), // JobListing
        personaId: z.string(),
        tailoredResume: z.string(),
      }).safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { job, personaId, tailoredResume } = bodyParsed.data;

      try {
        const profile = await repo.find(id);
        if (!profile) {
          return reply.code(404).send({
            error: "Profile not found",
            message: `No profile with ID ${id}`,
          });
        }

        const result = await hunterAgent.writeCoverLetter({
          profileId: id,
          job,
          profile,
          personaId,
          tailoredResume,
        });

        reply.code(200).send({
          coverLetter: result.coverLetter,
          personalizedElements: result.personalizedElements,
          tone: result.tone,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          error: "Failed to generate cover letter",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  /**
   * POST /profiles/:id/hunter/applications/batch
   * Generate complete applications for multiple jobs
   */
  fastify.post<{ Params: { id: string } }>(
    "/:id/hunter/applications/batch",
    {
      onRequest: applyGate,
    },
    async (request, reply) => {
      const { id } = request.params;
      
      const bodyParsed = z.object({
        searchFilter: HunterSearchFilterSchema,
        personaId: z.string(),
        autoApplyThreshold: z.number().min(0).max(100).default(70),
        maxApplications: z.number().min(1).max(20).default(5),
      }).safeParse(request.body);

      if (!bodyParsed.success) {
        return reply.code(400).send({
          ok: false,
          error: "invalid_request",
          errors: bodyParsed.error.flatten(),
        });
      }

      const { searchFilter, personaId, autoApplyThreshold, maxApplications } = bodyParsed.data;

      try {
        const profile = await repo.find(id);
        if (!profile) {
          return reply.code(404).send({
            error: "Profile not found",
            message: `No profile with ID ${id}`,
          });
        }

        const result = await hunterAgent.completeApplicationPipeline({
          profileId: id,
          profile,
          personaId,
          searchFilter,
          autoApplyThreshold,
          maxApplications,
        });

        reply.code(200).send({
          applications: result.applications.map((app) => ({
            id: app.id,
            job_id: app.job_id,
            status: app.status,
            resume_version: app.resume_version,
            compatibility_analysis: app.compatibility_analysis
              ? {
                overall_score:
                  app.compatibility_analysis.overall_score,
                recommendation:
                  app.compatibility_analysis.recommendation,
              }
              : undefined,
            recommendation: app.recommendation,
          })),
          skipped: result.skipped,
          errors: result.errors,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          error: "Failed to generate batch applications",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}

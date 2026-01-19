/**
 * Hunter Protocol Routes
 *
 * Main router that registers all Hunter Protocol sub-routes.
 * The Hunter Protocol is an autonomous job-search agent system.
 *
 * This file serves as the entry point for Hunter Protocol routes,
 * consolidating search/analyze, resume tailoring, cover letter generation,
 * application submission, and stats into a single registration function.
 *
 * Endpoints:
 * - POST /hunter/tailor-resume/:jobId - Generate resume tailored to job (auth)
 * - POST /hunter/generate-letter/:jobId - Generate cover letter (auth)
 * - POST /hunter/submit-application/:jobId - Submit application (auth)
 * - POST /:id/hunter/search - Search jobs with intelligent filtering
 * - POST /:id/hunter/analyze/:jobId - Analyze profile-job compatibility
 * - POST /:id/hunter/tailor-resume - Generate tailored resume
 * - POST /:id/hunter/write-cover-letter - Generate personalized cover letter
 * - GET /:id/hunter/stats - Get application statistics
 * - POST /:id/hunter/applications/batch - Batch auto-apply
 */

import type { FastifyInstance } from "fastify";
import type { LicensingService } from "@in-midst-my-life/core";
import type { ProfileRepo } from "../../repositories/profiles";
import type { JobRepo } from "../../repositories/jobs";
import { createHunterContext, type HunterDeps } from "./types";
import { registerSearchAnalyzeRoutes } from "./search-analyze";
import { registerTailorRoutes } from "./tailor";
import { registerLetterRoutes } from "./letter";
import { registerApplyRoutes } from "./apply";
import { registerStatsRoutes } from "./stats";

/**
 * Register all Hunter Protocol routes.
 *
 * @param fastify Fastify instance
 * @param deps Optional dependencies for testing/DI
 */
export async function registerHunterProtocolRoutes(
  fastify: FastifyInstance,
  deps?: { repo?: ProfileRepo; jobRepo?: JobRepo; licensingService?: LicensingService }
): Promise<void> {
  // Create shared context with dependencies
  const ctx = createHunterContext(deps);

  // Register search and analyze routes
  await registerSearchAnalyzeRoutes(fastify, ctx);

  // Register resume tailoring routes
  await registerTailorRoutes(fastify, ctx);

  // Register cover letter routes
  await registerLetterRoutes(fastify, ctx);

  // Register application submission routes
  await registerApplyRoutes(fastify, ctx);

  // Register stats routes
  await registerStatsRoutes(fastify, ctx);
}

// Re-export types for external use
export type { HunterDeps, HunterContext } from "./types";

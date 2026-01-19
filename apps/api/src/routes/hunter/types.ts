/**
 * Hunter Protocol Types
 *
 * Shared types, service setup, and middleware configuration for Hunter Protocol routes.
 */

import type { FastifyInstance } from "fastify";
import type { LicensingService } from "@in-midst-my-life/core";
import { profileRepo, type ProfileRepo } from "../../repositories/profiles";
import { jobRepo as defaultJobRepo, type JobRepo } from "../../repositories/jobs";
import { createHunterService } from "../../services/hunter";
import { createFeatureGateMiddleware } from "../../middleware/feature-gate";

/**
 * Dependencies for Hunter Protocol routes
 */
export interface HunterDeps {
  repo?: ProfileRepo;
  jobRepo?: JobRepo;
  licensingService?: LicensingService;
}

/**
 * Context passed to route handlers
 */
export interface HunterContext {
  repo: ProfileRepo;
  jobRepo: JobRepo;
  hunterService: ReturnType<typeof createHunterService>;
  searchGate: any[];
  tailorGate: any[];
  applyGate: any[];
}

/**
 * Initialize Hunter Protocol context from dependencies.
 */
export function createHunterContext(deps?: HunterDeps): HunterContext {
  const repo = deps?.repo ?? profileRepo;
  const jobRepo = deps?.jobRepo ?? defaultJobRepo;

  // Use core hunter agent for logic
  // Use API service for orchestration and DB access
  const hunterService = createHunterService(
    repo,
    deps?.licensingService as LicensingService,
    jobRepo,
    jobRepo
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
    ? [createFeatureGateMiddleware(licensing, "auto_apply")]
    : [];

  return {
    repo,
    jobRepo,
    hunterService,
    searchGate,
    tailorGate,
    applyGate,
  };
}

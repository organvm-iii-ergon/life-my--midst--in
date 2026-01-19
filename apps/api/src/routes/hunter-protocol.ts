/**
 * Hunter Protocol API Routes
 *
 * This file re-exports from the modular hunter directory.
 * The routes have been split into separate files for maintainability:
 *
 * - hunter/types.ts - Shared types and service setup
 * - hunter/search-analyze.ts - Job search & analysis
 * - hunter/tailor.ts - Resume tailoring
 * - hunter/letter.ts - Cover letter generation
 * - hunter/apply.ts - Application submission & batch operations
 * - hunter/stats.ts - Analytics
 * - hunter/index.ts - Main router
 *
 * @see DECISION-LOG.md ADR-015 for file size advisory limits
 */

export { registerHunterProtocolRoutes } from "./hunter/index";
export type { HunterDeps, HunterContext } from "./hunter/types";

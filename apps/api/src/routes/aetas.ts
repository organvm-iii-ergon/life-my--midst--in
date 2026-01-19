/**
 * Aetas Routes
 *
 * This file re-exports from the modular aetas directory.
 * The routes have been split into separate files for maintainability:
 *
 * - aetas/validation.ts - Zod schemas and in-memory storage
 * - aetas/taxonomy.ts - Canonical aetas definitions (the 8 life-stages)
 * - aetas/crud.ts - Profile-specific CRUD operations
 * - aetas/index.ts - Main router
 *
 * @see DECISION-LOG.md ADR-015 for file size advisory limits
 */

export { registerAetasRoutes } from "./aetas/index";
export * from "./aetas/validation";
export { canonicalAetas } from "./aetas/taxonomy";

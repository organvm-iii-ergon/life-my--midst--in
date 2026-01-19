/**
 * Cloud Storage Integration Routes
 *
 * This file re-exports from the modular integrations directory.
 * The routes have been split into separate files for maintainability:
 *
 * - integrations/validation.ts - Shared Zod schemas and OAuth config
 * - integrations/oauth.ts - OAuth flow (connect/callback)
 * - integrations/crud.ts - CRUD operations (list/get/update)
 * - integrations/operations.ts - Complex operations (delete/sync/refresh)
 * - integrations/index.ts - Main router
 *
 * @see DECISION-LOG.md ADR-015 for file size advisory limits
 */

export { registerIntegrationRoutes } from "./integrations/index";
export * from "./integrations/validation";

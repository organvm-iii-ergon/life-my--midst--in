/**
 * Integration Test Utilities
 *
 * Provides standardized patterns for integration tests that require
 * external services (PostgreSQL, Redis). Tests gracefully skip when
 * required environment variables are not set.
 *
 * Usage:
 * ```ts
 * import { integrationDescribe, getPostgresPool, cleanup } from "./integration-utils";
 *
 * integrationDescribe("postgres")("My Integration Tests", () => {
 *   const pool = getPostgresPool();
 *
 *   afterAll(() => cleanup({ pool }));
 *
 *   it("does something with the database", async () => {
 *     // test code
 *   });
 * });
 * ```
 */

import { describe } from "vitest";
import { Pool } from "pg";

// ─────────────────────────────────────────────────────────────────────────────
// Environment Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves the PostgreSQL connection string with standard fallback chain.
 * Priority: INTEGRATION_POSTGRES_URL > DATABASE_URL > POSTGRES_URL
 */
export function resolvePostgresUrl(): string | undefined {
  return (
    process.env["INTEGRATION_POSTGRES_URL"] ??
    process.env["DATABASE_URL"] ??
    process.env["POSTGRES_URL"]
  );
}

/**
 * Resolves the Redis connection string with standard fallback chain.
 * Priority: INTEGRATION_REDIS_URL > REDIS_URL
 */
export function resolveRedisUrl(): string | undefined {
  return process.env["INTEGRATION_REDIS_URL"] ?? process.env["REDIS_URL"];
}

/**
 * Returns environment availability status for conditional test execution.
 */
export function getIntegrationEnv(): {
  postgres: string | undefined;
  redis: string | undefined;
  hasPostgres: boolean;
  hasRedis: boolean;
  hasAny: boolean;
  hasBoth: boolean;
} {
  const postgres = resolvePostgresUrl();
  const redis = resolveRedisUrl();
  return {
    postgres,
    redis,
    hasPostgres: Boolean(postgres),
    hasRedis: Boolean(redis),
    hasBoth: Boolean(postgres && redis),
    hasAny: Boolean(postgres || redis)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Conditional Describe
// ─────────────────────────────────────────────────────────────────────────────

type ServiceRequirement = "postgres" | "redis" | "both" | "any";

/**
 * Returns a describe function that conditionally skips based on service availability.
 *
 * @param requirement - Which services are required:
 *   - "postgres": Only PostgreSQL required
 *   - "redis": Only Redis required
 *   - "both": Both PostgreSQL and Redis required
 *   - "any": At least one service required
 *
 * @example
 * integrationDescribe("postgres")("My DB tests", () => { ... });
 * integrationDescribe("both")("Full integration", () => { ... });
 */
export function integrationDescribe(requirement: ServiceRequirement): typeof describe {
  const env = getIntegrationEnv();

  const shouldRun = (() => {
    switch (requirement) {
      case "postgres":
        return env.hasPostgres;
      case "redis":
        return env.hasRedis;
      case "both":
        return env.hasBoth;
      case "any":
        return env.hasAny;
    }
  })();

  if (!shouldRun) {
    const missing = (() => {
      switch (requirement) {
        case "postgres":
          return "INTEGRATION_POSTGRES_URL";
        case "redis":
          return "INTEGRATION_REDIS_URL";
        case "both":
          return "INTEGRATION_POSTGRES_URL and INTEGRATION_REDIS_URL";
        case "any":
          return "INTEGRATION_POSTGRES_URL or INTEGRATION_REDIS_URL";
      }
    })();

    // Return a describe.skip that logs the reason
    return Object.assign(
      (name: string, fn: () => void) => {
        describe.skip(`${name} (skipped: ${missing} not set)`, fn);
      },
      {
        skip: describe.skip,
        only: describe.only,
        concurrent: describe.concurrent,
        sequential: describe.sequential,
        shuffle: describe.shuffle,
        todo: describe.todo,
        each: describe.each,
        skipIf: describe.skipIf,
        runIf: describe.runIf
      }
    ) as typeof describe;
  }

  return describe;
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection Factories
// ─────────────────────────────────────────────────────────────────────────────

let sharedPool: Pool | undefined;

/**
 * Gets a PostgreSQL pool for integration tests.
 * Returns a shared pool instance to reduce connection overhead.
 *
 * @throws Error if INTEGRATION_POSTGRES_URL is not set
 */
export function getPostgresPool(): Pool {
  const connectionString = resolvePostgresUrl();
  if (!connectionString) {
    throw new Error("Cannot create pool: INTEGRATION_POSTGRES_URL not set");
  }
  if (!sharedPool) {
    sharedPool = new Pool({ connectionString, max: 5 });
  }
  return sharedPool;
}

/**
 * Creates a new PostgreSQL pool (not shared).
 * Use when you need isolated connections.
 *
 * @throws Error if INTEGRATION_POSTGRES_URL is not set
 */
export function createPostgresPool(): Pool {
  const connectionString = resolvePostgresUrl();
  if (!connectionString) {
    throw new Error("Cannot create pool: INTEGRATION_POSTGRES_URL not set");
  }
  return new Pool({ connectionString, max: 5 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup Utilities
// ─────────────────────────────────────────────────────────────────────────────

interface CleanupOptions {
  pool?: Pool;
  redis?: { quit: () => Promise<unknown> };
}

/**
 * Cleans up integration test resources.
 * Safe to call with undefined values.
 */
export async function cleanup(options: CleanupOptions): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (options.pool) {
    tasks.push(options.pool.end());
  }

  if (options.redis) {
    tasks.push(options.redis.quit());
  }

  await Promise.all(tasks);
}

/**
 * Resets the shared pool (for test isolation between suites).
 */
export async function resetSharedPool(): Promise<void> {
  if (sharedPool) {
    await sharedPool.end();
    sharedPool = undefined;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Data Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a unique ID for test data to avoid collisions.
 */
export function testId(prefix = "test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generates a valid UUID v4 for test data.
 */
export function testUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry Utilities
// ─────────────────────────────────────────────────────────────────────────────

interface WaitForOptions {
  /** Maximum time to wait in ms (default: 5000) */
  timeout?: number;
  /** Polling interval in ms (default: 50) */
  interval?: number;
}

/**
 * Waits for a condition to become true.
 * Useful for testing async operations that complete eventually.
 *
 * @example
 * await waitFor(async () => {
 *   const task = await store.get(taskId);
 *   return task?.status === "completed";
 * });
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: WaitForOptions = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
}

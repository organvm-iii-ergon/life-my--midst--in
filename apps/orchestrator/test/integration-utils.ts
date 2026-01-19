/**
 * Integration Test Utilities for Orchestrator
 *
 * Provides standardized patterns for integration tests that require
 * external services (PostgreSQL, Redis). Tests gracefully skip when
 * required environment variables are not set.
 *
 * This version includes Redis support specific to orchestrator's task queue.
 *
 * Usage:
 * ```ts
 * import { integrationDescribe, getPostgresPool, getRedisClient, cleanup } from "./integration-utils";
 *
 * integrationDescribe("both")("Task Queue Integration", () => {
 *   const pool = getPostgresPool();
 *   const redis = getRedisClient();
 *
 *   afterAll(() => cleanup({ pool, redis }));
 *
 *   it("processes tasks end-to-end", async () => {
 *     // test code
 *   });
 * });
 * ```
 */

import { describe } from "vitest";
import { Pool } from "pg";
import Redis from "ioredis";

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
 * Priority: INTEGRATION_REDIS_URL > REDIS_URL > TASK_QUEUE_URL
 */
export function resolveRedisUrl(): string | undefined {
  return (
    process.env["INTEGRATION_REDIS_URL"] ??
    process.env["REDIS_URL"] ??
    process.env["TASK_QUEUE_URL"]
  );
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
 * integrationDescribe("postgres")("Task Store tests", () => { ... });
 * integrationDescribe("redis")("Task Queue tests", () => { ... });
 * integrationDescribe("both")("Full workflow", () => { ... });
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
let sharedRedis: Redis | undefined;

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

/**
 * Gets a Redis client for integration tests.
 * Returns a shared client instance.
 *
 * @throws Error if INTEGRATION_REDIS_URL is not set
 */
export function getRedisClient(): Redis {
  const connectionString = resolveRedisUrl();
  if (!connectionString) {
    throw new Error("Cannot create Redis client: INTEGRATION_REDIS_URL not set");
  }
  if (!sharedRedis) {
    sharedRedis = new Redis(connectionString);
  }
  return sharedRedis;
}

/**
 * Creates a new Redis client (not shared).
 * Use when you need isolated connections.
 *
 * @throws Error if INTEGRATION_REDIS_URL is not set
 */
export function createRedisClient(): Redis {
  const connectionString = resolveRedisUrl();
  if (!connectionString) {
    throw new Error("Cannot create Redis client: INTEGRATION_REDIS_URL not set");
  }
  return new Redis(connectionString);
}

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup Utilities
// ─────────────────────────────────────────────────────────────────────────────

interface CleanupOptions {
  pool?: Pool;
  redis?: Redis;
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
 * Resets all shared resources (for test isolation between suites).
 */
export async function resetSharedResources(): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (sharedPool) {
    tasks.push(sharedPool.end());
    sharedPool = undefined;
  }

  if (sharedRedis) {
    tasks.push(sharedRedis.quit());
    sharedRedis = undefined;
  }

  await Promise.all(tasks);
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
 * Generates a unique Redis key for test isolation.
 */
export function testQueueKey(prefix = "orchestrator:test"): string {
  return `${prefix}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

// ─────────────────────────────────────────────────────────────────────────────
// Task Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

import type { TrackedTask } from "../src/tasks";

// Alias for backwards compatibility with tests
type Task = TrackedTask;

/**
 * Creates a test task with sensible defaults.
 */
export function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: testId("task"),
    role: "architect",
    description: "Test task for integration testing",
    payload: {},
    status: "queued",
    ...overrides
  };
}

/**
 * Clears a Redis queue for test isolation.
 */
export async function clearQueue(redis: Redis, queueKey: string): Promise<void> {
  await redis.del(queueKey);
}

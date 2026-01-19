/**
 * Orchestrator Integration Tests
 *
 * Tests task queue, persistence, and webhook-to-worker flows
 * against real PostgreSQL and Redis instances.
 *
 * Uses granular conditional execution: tests can run partially
 * when only one service is available.
 *
 * Requires:
 * - INTEGRATION_POSTGRES_URL for task store tests
 * - INTEGRATION_REDIS_URL for queue tests
 * - Both for full workflow tests
 */

import { expect, it, beforeAll, afterAll } from "vitest";
import type { Pool } from "pg";
import type Redis from "ioredis";
import { runTaskMigrations, runTaskSeeds } from "../src/migrations";
import { PostgresTaskStore } from "../src/persistence";
import { RedisTaskQueue } from "../src/queue";
import { buildOrchestrator } from "../src/server";
import { defaultAgents } from "../src/agents";
import {
  integrationDescribe,
  getPostgresPool,
  getRedisClient,
  cleanup,
  testId,
  testQueueKey,
  createTestTask,
  clearQueue,
  waitFor
} from "./integration-utils";

// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL Task Store Tests
// ─────────────────────────────────────────────────────────────────────────────

integrationDescribe("postgres")("Postgres task store integration", () => {
  // Defer resource creation to beforeAll to avoid errors during test collection
  let pool: Pool;
  let store: PostgresTaskStore;

  beforeAll(async () => {
    pool = getPostgresPool();
    store = new PostgresTaskStore(pool);
  });

  afterAll(async () => {
    if (pool) {
      await cleanup({ pool });
    }
  });

  it("runs migrations and seeds tasks", async () => {
    await runTaskMigrations(pool);
    await runTaskSeeds(pool);
    const seeded = await store.get("seed-task-1");
    expect(seeded?.status).toBe("queued");
  });

  it("writes and reads tasks", async () => {
    await runTaskMigrations(pool);
    const task = createTestTask({
      id: testId("pg-store"),
      description: "Verify Postgres store"
    });
    await store.add(task);
    await store.setStatus(task.id, "running");
    const loaded = await store.get(task.id);
    expect(loaded?.status).toBe("running");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Redis Task Queue Tests
// ─────────────────────────────────────────────────────────────────────────────

integrationDescribe("redis")("Redis task queue integration", () => {
  // Defer resource creation to beforeAll to avoid errors during test collection
  let redis: Redis;
  let queueKey: string;
  let queue: RedisTaskQueue;

  beforeAll(() => {
    redis = getRedisClient();
    queueKey = testQueueKey("redis-test");
    queue = new RedisTaskQueue(redis, queueKey);
  });

  afterAll(async () => {
    if (redis) {
      await cleanup({ redis });
    }
  });

  it("enqueues and dequeues tasks", async () => {
    await clearQueue(redis, queueKey);
    const task = createTestTask({
      id: "redis-task-1",
      role: "implementer",
      description: "Verify redis queue"
    });
    await queue.enqueue(task);
    const out = await queue.dequeue();
    expect(out?.id).toBe("redis-task-1");
  });

  it("tracks queue size correctly", async () => {
    const sizeKey = testQueueKey("size-test");
    const sizeQueue = new RedisTaskQueue(redis, sizeKey);
    await clearQueue(redis, sizeKey);

    expect(await sizeQueue.size()).toBe(0);

    await sizeQueue.enqueue(createTestTask({ id: "size-1" }));
    await sizeQueue.enqueue(createTestTask({ id: "size-2" }));
    expect(await sizeQueue.size()).toBe(2);

    await sizeQueue.dequeue();
    expect(await sizeQueue.size()).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full Workflow Tests (require both services)
// ─────────────────────────────────────────────────────────────────────────────

integrationDescribe("both")("Webhook → queue → store flow", () => {
  // Defer resource creation to beforeAll to avoid errors during test collection
  let pool: Pool;
  let redis: Redis;
  let queueKey: string;
  let queue: RedisTaskQueue;
  let store: PostgresTaskStore;
  let app: ReturnType<typeof buildOrchestrator>;

  beforeAll(() => {
    pool = getPostgresPool();
    redis = getRedisClient();
    queueKey = testQueueKey("webhook");
    queue = new RedisTaskQueue(redis, queueKey);
    store = new PostgresTaskStore(pool);
    app = buildOrchestrator(defaultAgents(), { queue, store });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await cleanup({ pool, redis });
  });

  it("accepts a GitHub webhook, enqueues, dispatches, and persists status", async () => {
    await runTaskMigrations(pool);
    await clearQueue(redis, queueKey);

    const webhookResponse = await app.inject({
      method: "POST",
      url: "/webhooks/github",
      headers: { "x-github-event": "issues" },
      payload: { action: "opened", issue: { id: 123 } }
    });

    expect(webhookResponse.statusCode).toBe(200);
    expect(await queue.size()).toBe(1);

    const dispatchResponse = await app.inject({
      method: "POST",
      url: "/tasks/dispatch"
    });
    expect(dispatchResponse.statusCode).toBe(200);
    const body = dispatchResponse.json() as { ok: boolean };
    expect(body.ok).toBe(true);

    const tasks = await store.all();
    const dispatched = tasks.find((t) => t.description.toLowerCase().includes("issue"));
    expect(dispatched?.status).toBe("completed");
  });

  it("processes queue via worker and exposes metrics", async () => {
    await runTaskMigrations(pool);
    const workerQueueKey = testQueueKey("worker");
    const workerQueue = new RedisTaskQueue(redis, workerQueueKey);
    const workerStore = new PostgresTaskStore(pool);
    await clearQueue(redis, workerQueueKey);

    const workerApp = buildOrchestrator(defaultAgents(), {
      queue: workerQueue,
      store: workerStore,
      worker: true,
      pollIntervalMs: 25
    });

    await workerApp.inject({
      method: "POST",
      url: "/webhooks/github",
      headers: { "x-github-event": "push" },
      payload: { ref: "refs/heads/main", repository: { full_name: "demo/repo" } }
    });

    // Wait for worker to process using utility
    await waitFor(
      async () => {
        const tasks = await workerStore.all();
        const processed = tasks.find((t) => t.description.includes("Push to"));
        return processed?.status === "completed";
      },
      { timeout: 1000, interval: 50 }
    );

    const metrics = await workerApp.inject({ method: "GET", url: "/metrics" });
    expect(metrics.body).toContain("orchestrator_tasks_dispatched");

    await workerApp.close();
  });
});

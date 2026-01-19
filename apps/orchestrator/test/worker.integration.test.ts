/**
 * Worker Integration Tests
 *
 * Tests TaskWorker behavior with real PostgreSQL and Redis instances.
 * Verifies retry logic, dead-lettering, run status updates, and metrics
 * work correctly with actual persistence.
 *
 * Requires: INTEGRATION_POSTGRES_URL and INTEGRATION_REDIS_URL
 */

import { expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import type { Pool } from "pg";
import type Redis from "ioredis";
import { runTaskMigrations } from "../src/migrations";
import { PostgresTaskStore } from "../src/persistence";
import { RedisTaskQueue } from "../src/queue";
import { createRunStore } from "../src/runs";
import { TaskWorker } from "../src/worker";
import type { Agent } from "../src/agents";
import {
  integrationDescribe,
  getPostgresPool,
  getRedisClient,
  cleanup,
  testId,
  testQueueKey,
  createTestTask,
  clearQueue
} from "./integration-utils";

// ─────────────────────────────────────────────────────────────────────────────
// Worker Retry and Dead Letter Integration
// ─────────────────────────────────────────────────────────────────────────────

integrationDescribe("both")("Worker retry integration", () => {
  let pool: Pool;
  let redis: Redis;
  let store: PostgresTaskStore;
  let queue: RedisTaskQueue;
  let deadLetterQueue: RedisTaskQueue;
  let queueKey: string;
  let dlqKey: string;

  beforeAll(async () => {
    pool = getPostgresPool();
    redis = getRedisClient();
    await runTaskMigrations(pool);
  });

  beforeEach(async () => {
    store = new PostgresTaskStore(pool);
    queueKey = testQueueKey("worker-retry");
    dlqKey = testQueueKey("dead-letter");
    queue = new RedisTaskQueue(redis, queueKey);
    deadLetterQueue = new RedisTaskQueue(redis, dlqKey);
    await clearQueue(redis, queueKey);
    await clearQueue(redis, dlqKey);
  });

  afterAll(async () => {
    await cleanup({ pool, redis });
  });

  it("retries failed tasks and moves to dead letter after max retries", async () => {
    const taskId = testId("retry");
    const task = createTestTask({
      id: taskId,
      role: "architect",
      description: "Test retry with real persistence"
    });

    await store.add({ ...task, status: "queued" });
    await queue.enqueue(task);

    let attempts = 0;
    const failingAgent: Agent = {
      role: "architect",
      execute: async () => {
        attempts++;
        throw new Error("Intentional failure for retry test");
      }
    };

    const worker = new TaskWorker(queue, store, [failingAgent], {
      maxRetries: 2,
      backoffMs: 10,
      pollIntervalMs: 5,
      deadLetterQueue
    });

    // Process until dead-lettered
    for (let i = 0; i < 5; i++) {
      await worker.tickOnce();
      await new Promise((r) => setTimeout(r, 20)); // wait for backoff re-enqueue
    }

    const finalTask = await store.get(taskId);
    expect(finalTask?.status).toBe("failed");
    expect(attempts).toBeGreaterThanOrEqual(2);

    const dlqItem = await deadLetterQueue.dequeue();
    expect(dlqItem?.id).toBe(taskId);

    const metrics = worker.getMetrics();
    expect(metrics.deadLettered).toBeGreaterThan(0);
    expect(metrics.retries).toBeGreaterThan(0);
  });

  it("completes tasks successfully and updates metrics", async () => {
    const taskId = testId("success");
    const task = createTestTask({
      id: taskId,
      role: "implementer",
      description: "Test successful completion"
    });

    await store.add({ ...task, status: "queued" });
    await queue.enqueue(task);

    const successAgent: Agent = {
      role: "implementer",
      execute: async (t) => ({
        taskId: t.id,
        status: "completed" as const,
        output: { message: "Task executed successfully" },
        notes: "",
        llm: { provider: "test", model: "test" }
      })
    };

    const worker = new TaskWorker(queue, store, [successAgent], {
      pollIntervalMs: 5
    });

    await worker.tickOnce();

    const completedTask = await store.get(taskId);
    expect(completedTask?.status).toBe("completed");

    const metrics = worker.getMetrics();
    expect(metrics.completed).toBeGreaterThan(0);
    expect(metrics.failed).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Worker Run Tracking Integration
// ─────────────────────────────────────────────────────────────────────────────

integrationDescribe("both")("Worker run tracking integration", () => {
  let pool: Pool;
  let redis: Redis;
  let store: PostgresTaskStore;
  let queue: RedisTaskQueue;
  let queueKey: string;

  beforeAll(async () => {
    pool = getPostgresPool();
    redis = getRedisClient();
    await runTaskMigrations(pool);
  });

  beforeEach(async () => {
    store = new PostgresTaskStore(pool);
    queueKey = testQueueKey("run-tracking");
    queue = new RedisTaskQueue(redis, queueKey);
    await clearQueue(redis, queueKey);
  });

  afterAll(async () => {
    await cleanup({ pool, redis });
  });

  it("updates run status when all tasks complete", async () => {
    const runStore = createRunStore({ kind: "postgres", pool });
    const runId = testId("run");
    const task1Id = testId("task-1");
    const task2Id = testId("task-2");
    const now = new Date().toISOString();

    // Create a run with two tasks
    await runStore.add({
      id: runId,
      type: "manual",
      status: "queued",
      payload: {},
      taskIds: [task1Id, task2Id],
      metadata: {},
      createdAt: now,
      updatedAt: now
    });

    // Add tasks linked to the run
    await store.add({
      id: task1Id,
      runId,
      role: "architect",
      description: "First task in run",
      payload: {},
      status: "queued"
    });
    await store.add({
      id: task2Id,
      runId,
      role: "reviewer",
      description: "Second task in run",
      payload: {},
      status: "queued"
    });

    await queue.enqueue({ id: task1Id, runId, role: "architect", description: "First", payload: {} });
    await queue.enqueue({ id: task2Id, runId, role: "reviewer", description: "Second", payload: {} });

    const agents: Agent[] = [
      {
        role: "architect",
        execute: async (t) => ({
          taskId: t.id,
          status: "completed" as const,
          output: { message: "Done" },
          notes: "",
          llm: { provider: "test", model: "test" }
        })
      },
      {
        role: "reviewer",
        execute: async (t) => ({
          taskId: t.id,
          status: "completed" as const,
          output: { message: "Reviewed" },
          notes: "",
          llm: { provider: "test", model: "test" }
        })
      }
    ];

    const worker = new TaskWorker(queue, store, agents, {
      pollIntervalMs: 5,
      runStore
    });

    // Process both tasks
    await worker.tickOnce();
    await worker.tickOnce();

    // Verify run status updated
    const completedRun = await runStore.get(runId);
    expect(completedRun?.status).toBe("completed");

    // Verify both tasks completed
    const task1 = await store.get(task1Id);
    const task2 = await store.get(task2Id);
    expect(task1?.status).toBe("completed");
    expect(task2?.status).toBe("completed");
  });

  it("marks run as failed if any task fails after retries", async () => {
    const runStore = createRunStore({ kind: "postgres", pool });
    const runId = testId("fail-run");
    const taskId = testId("fail-task");
    const now = new Date().toISOString();

    await runStore.add({
      id: runId,
      type: "manual",
      status: "queued",
      payload: {},
      taskIds: [taskId],
      metadata: {},
      createdAt: now,
      updatedAt: now
    });

    await store.add({
      id: taskId,
      runId,
      role: "architect",
      description: "Task that will fail",
      payload: {},
      status: "queued"
    });

    await queue.enqueue({ id: taskId, runId, role: "architect", description: "Fail", payload: {} });

    const failAgent: Agent = {
      role: "architect",
      execute: async () => {
        throw new Error("Simulated failure");
      }
    };

    const dlqKey = testQueueKey("fail-dlq");
    const dlq = new RedisTaskQueue(redis, dlqKey);
    await clearQueue(redis, dlqKey);

    const worker = new TaskWorker(queue, store, [failAgent], {
      maxRetries: 1,
      backoffMs: 5,
      pollIntervalMs: 5,
      deadLetterQueue: dlq,
      runStore
    });

    // Process until dead-lettered
    for (let i = 0; i < 4; i++) {
      await worker.tickOnce();
      await new Promise((r) => setTimeout(r, 15));
    }

    const failedRun = await runStore.get(runId);
    expect(failedRun?.status).toBe("failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Worker Concurrent Processing Integration
// ─────────────────────────────────────────────────────────────────────────────

integrationDescribe("both")("Worker concurrent processing integration", () => {
  let pool: Pool;
  let redis: Redis;
  let store: PostgresTaskStore;
  let queue: RedisTaskQueue;
  let queueKey: string;

  beforeAll(async () => {
    pool = getPostgresPool();
    redis = getRedisClient();
    await runTaskMigrations(pool);
  });

  beforeEach(async () => {
    store = new PostgresTaskStore(pool);
    queueKey = testQueueKey("concurrent");
    queue = new RedisTaskQueue(redis, queueKey);
    await clearQueue(redis, queueKey);
  });

  afterAll(async () => {
    await cleanup({ pool, redis });
  });

  it("processes multiple tasks in sequence", async () => {
    const taskIds = [testId("multi-1"), testId("multi-2"), testId("multi-3")];
    const processedOrder: string[] = [];

    // Enqueue multiple tasks
    for (const id of taskIds) {
      const task = createTestTask({ id, role: "architect" });
      await store.add({ ...task, status: "queued" });
      await queue.enqueue(task);
    }

    const trackingAgent: Agent = {
      role: "architect",
      execute: async (t) => {
        processedOrder.push(t.id);
        return {
          taskId: t.id,
          status: "completed" as const,
          output: { message: `Processed ${t.id}` },
          notes: "",
          llm: { provider: "test", model: "test" }
        };
      }
    };

    const worker = new TaskWorker(queue, store, [trackingAgent], {
      pollIntervalMs: 5
    });

    // Process all tasks
    await worker.tickOnce();
    await worker.tickOnce();
    await worker.tickOnce();

    // All should be completed
    for (const id of taskIds) {
      const task = await store.get(id);
      expect(task?.status).toBe("completed");
    }

    // Processed in FIFO order
    expect(processedOrder).toEqual(taskIds);
    expect(worker.getMetrics().completed).toBe(3);
  });
});

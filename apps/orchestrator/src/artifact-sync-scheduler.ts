import { randomUUID } from "node:crypto";
import type { AgentTask } from "./agents";
import type { TaskQueue } from "./queue";
import type { TaskStore } from "./persistence";
import type { RunRecord, RunStore } from "./runs";
import type { TrackedTask } from "./tasks";

export interface ArtifactSyncSchedulerOptions {
  intervalMs?: number;
  apiBaseUrl?: string;
}

/**
 * Artifact Sync Scheduler
 *
 * Orchestrates the Catcher agent to automatically sync artifacts from cloud storage.
 * Runs incremental syncs on a configurable interval to detect new/modified files.
 *
 * For MVP, this scheduler will enqueue stub tasks. When cloud providers are
 * initialized in Phase 6.2, it will query for active integrations and enqueue
 * real artifact_sync_incremental tasks.
 */
export class ArtifactSyncScheduler {
  private queue: TaskQueue;
  private store: TaskStore;
  private runStore: RunStore;
  private intervalMs: number;
  private apiBaseUrl: string;
  private timer?: NodeJS.Timeout;

  constructor(queue: TaskQueue, store: TaskStore, runStore: RunStore, options: ArtifactSyncSchedulerOptions = {}) {
    this.queue = queue;
    this.store = store;
    this.runStore = runStore;
    this.intervalMs = options.intervalMs ?? 86_400_000; // 24 hours default
    this.apiBaseUrl = options.apiBaseUrl ?? "http://localhost:3001";
  }

  /**
   * Start the artifact sync scheduler
   */
  start() {
    if (this.timer) return;
    const loop = async () => {
      await this.tick();
      this.timer = setTimeout(loop, this.intervalMs);
    };
    this.timer = setTimeout(loop, this.intervalMs);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  /**
   * Run artifact sync immediately
   */
  async tickOnce() {
    await this.tick();
  }

  /**
   * Enqueue artifact sync tasks for all profiles with active integrations
   *
   * TODO: Phase 6.2 - Query API for profiles with active cloud integrations
   * For MVP, we enqueue a single stub task to demonstrate the flow
   */
  private async tick() {
    const runId = `artifact-sync-${randomUUID()}`;
    const scheduledAt = new Date().toISOString();
    const tasks: AgentTask[] = [];

    // TODO: Phase 6.2 - Query API endpoint:
    // GET /profiles (or iterate profiles in the system)
    // For each profile, check if they have active integrations:
    //   GET /profiles/{profileId}/integrations?status=active
    //
    // For each active integration, enqueue an artifact_sync_incremental task:
    //   {
    //     id: `${runId}-sync-${profileId}-${integrationId}`,
    //     runId,
    //     role: "catcher",
    //     description: `Sync artifacts from ${provider}`,
    //     payload: {
    //       profileId,
    //       integrationId,
    //       source: "schedule"
    //     }
    //   }

    // For MVP, enqueue a stub task
    const stubTask: AgentTask = {
      id: `${runId}-stub`,
      runId,
      role: "catcher",
      description: "[STUB] Artifact sync scheduled (Phase 6.2: query API for active integrations)",
      payload: {
        source: "artifact-sync-scheduler",
        scheduledAt,
        mode: "incremental"
      }
    };
    tasks.push(stubTask);

    if (tasks.length === 0) {
      return;
    }

    // Create run record
    const run: RunRecord = {
      id: runId,
      type: "schedule",
      status: "queued",
      payload: {
        scheduledAt,
        tasksCreated: tasks.length,
        source: "artifact-sync-scheduler"
      },
      taskIds: tasks.map((task) => task.id),
      metadata: {
        source: "artifact-sync-scheduler",
        type: "incremental-artifact-sync"
      },
      createdAt: scheduledAt,
      updatedAt: scheduledAt
    };

    await this.runStore.add(run);

    // Enqueue all tasks
    for (const task of tasks) {
      await this.queue.enqueue(task);
      const tracked: TrackedTask = {
        ...task,
        status: "queued",
        attempts: 0,
        history: []
      };
      await this.store.add(tracked);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      enabled: !!this.timer,
      intervalMs: this.intervalMs,
      apiBaseUrl: this.apiBaseUrl,
      nextRunAt: this.timer ? new Date(Date.now() + this.intervalMs).toISOString() : null
    };
  }
}

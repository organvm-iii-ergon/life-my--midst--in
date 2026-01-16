import { buildOrchestrator } from "./server";
import { defaultAgents } from "./agents";
import { loadSchedulerConfig, loadServerConfig, loadWorkerConfig, loadArtifactSyncConfig } from "./config";
import { resolveAgentExecutor } from "./llm";
import { createTaskQueue } from "./queue";
import { createTaskStore } from "./persistence";
import { createRunStore } from "./runs";
import { TaskScheduler } from "./scheduler";
import { JobHuntScheduler } from "./job-hunt-scheduler";
import { ArtifactSyncScheduler } from "./artifact-sync-scheduler";

async function bootstrap() {
  const executor = resolveAgentExecutor();
  const queue = createTaskQueue();
  const store = createTaskStore();
  const runStore = createRunStore();
  const workerConfig = loadWorkerConfig();
  const schedulerConfig = loadSchedulerConfig();
  const artifactSyncConfig = loadArtifactSyncConfig();
  
  const scheduler = schedulerConfig.enabled
    ? new TaskScheduler(queue, store, runStore, {
        intervalMs: schedulerConfig.intervalMs,
        roles: schedulerConfig.roles,
        description: schedulerConfig.description
      })
    : undefined;

  const jobHuntScheduler = new JobHuntScheduler(queue, store, runStore, {
    jobs: [], // Start empty, populate via API
    apiBaseUrl: process.env["API_URL"] ?? "http://localhost:3001"
  });

  const artifactSyncScheduler = artifactSyncConfig.enabled
    ? new ArtifactSyncScheduler(queue, store, runStore, {
        intervalMs: artifactSyncConfig.intervalMs,
        apiBaseUrl: process.env["API_URL"] ?? "http://localhost:3001"
      })
    : undefined;

  const fastify = buildOrchestrator(executor ? defaultAgents(executor) : defaultAgents(), {
    queue,
    store,
    runStore,
    worker: workerConfig.enabled,
    pollIntervalMs: workerConfig.pollIntervalMs,
    maxRetries: workerConfig.maxRetries,
    backoffMs: workerConfig.backoffMs,
    jobHuntScheduler
  });
  
  const serverConfig = loadServerConfig();
  try {
    if (scheduler) scheduler.start();
    if (schedulerConfig.enabled) jobHuntScheduler.start();
    if (artifactSyncScheduler) artifactSyncScheduler.start();
    
    await fastify.listen({ port: serverConfig.port, host: serverConfig.host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error("Orchestrator failed to start", error);
  process.exit(1);
});

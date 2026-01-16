/**
 * Artifact Sync State Repository
 *
 * Tracks per-file sync state for efficient delta sync detection.
 * Enables incremental syncs without re-downloading entire cloud storage.
 *
 * Stores:
 * - Last modified timestamp (from cloud API)
 * - Content hash/checksum (from cloud API for change detection)
 * - Reference to created artifact (if ingested)
 * - Sync timestamp for audit trail
 */

import type { ArtifactSyncState } from "@in-midst-my-life/schema";
import { Pool } from "pg";

export interface SyncStateRepo {
  upsert(syncState: Omit<ArtifactSyncState, "synced_at">): Promise<ArtifactSyncState>;
  findByFile(integrationId: string, sourceFileId: string): Promise<ArtifactSyncState | undefined>;
  listByIntegration(integrationId: string): Promise<ArtifactSyncState[]>;
  listModifiedSince(integrationId: string, timestamp: string): Promise<ArtifactSyncState[]>;
  updateArtifactId(
    syncStateId: string,
    artifactId: string
  ): Promise<ArtifactSyncState | undefined>;
  updateChecksum(
    integrationId: string,
    sourceFileId: string,
    lastModified: string,
    checksum: string
  ): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  deleteByIntegration(integrationId: string): Promise<number>;
}

class InMemorySyncStateRepo implements SyncStateRepo {
  private data = new Map<string, ArtifactSyncState>();

  async upsert(syncState: Omit<ArtifactSyncState, "synced_at">): Promise<ArtifactSyncState> {
    // Check if exists
    let existing: ArtifactSyncState | undefined;
    for (const state of this.data.values()) {
      if (
        state.integrationId === syncState.integrationId &&
        state.sourceFileId === syncState.sourceFileId
      ) {
        existing = state;
        break;
      }
    }

    const result: ArtifactSyncState = {
      ...syncState,
      id: existing?.id || Math.random().toString(),
      syncedAt: new Date().toISOString()
    };

    this.data.set(result.id, result);
    return result;
  }

  async findByFile(integrationId: string, sourceFileId: string) {
    for (const state of this.data.values()) {
      if (state.integrationId === integrationId && state.sourceFileId === sourceFileId) {
        return state;
      }
    }
    return undefined;
  }

  async listByIntegration(integrationId: string) {
    return Array.from(this.data.values()).filter((s) => s.integrationId === integrationId);
  }

  async listModifiedSince(integrationId: string, timestamp: string) {
    const targetTime = new Date(timestamp).getTime();
    return Array.from(this.data.values()).filter(
      (s) =>
        s.integrationId === integrationId &&
        new Date(s.lastModified).getTime() > targetTime
    );
  }

  async updateArtifactId(syncStateId: string, artifactId: string) {
    const state = this.data.get(syncStateId);
    if (!state) return undefined;

    state.artifactId = artifactId;
    state.syncedAt = new Date().toISOString();
    this.data.set(syncStateId, state);
    return state;
  }

  async updateChecksum(
    integrationId: string,
    sourceFileId: string,
    lastModified: string,
    checksum: string
  ) {
    const state = await this.findByFile(integrationId, sourceFileId);
    if (!state) return false;

    state.lastModified = lastModified;
    state.checksum = checksum;
    state.syncedAt = new Date().toISOString();
    this.data.set(state.id, state);
    return true;
  }

  async delete(id: string) {
    return this.data.delete(id);
  }

  async deleteByIntegration(integrationId: string) {
    let deleted = 0;
    for (const [id, state] of this.data.entries()) {
      if (state.integrationId === integrationId) {
        this.data.delete(id);
        deleted++;
      }
    }
    return deleted;
  }
}

class PostgresSyncStateRepo implements SyncStateRepo {
  constructor(private pool: Pool) {}

  async upsert(syncState: Omit<ArtifactSyncState, "synced_at">): Promise<ArtifactSyncState> {
    const query = `
      INSERT INTO artifact_sync_state (
        id, integration_id, source_file_id,
        last_modified, checksum, artifact_id, synced_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (integration_id, source_file_id)
      DO UPDATE SET
        last_modified = $4,
        checksum = $5,
        artifact_id = COALESCE($6, artifact_id),
        synced_at = $7
      RETURNING *
    `;

    const now = new Date().toISOString();
    const result = await this.pool.query(query, [
      syncState.id,
      syncState.integrationId,
      syncState.sourceFileId,
      syncState.lastModified,
      syncState.checksum,
      syncState.artifactId || null,
      now
    ]);

    return result.rows[0] as ArtifactSyncState;
  }

  async findByFile(integrationId: string, sourceFileId: string) {
    const query = `
      SELECT * FROM artifact_sync_state
      WHERE integration_id = $1 AND source_file_id = $2
      LIMIT 1
    `;

    const result = await this.pool.query(query, [integrationId, sourceFileId]);
    return result.rows[0] as ArtifactSyncState | undefined;
  }

  async listByIntegration(integrationId: string) {
    const query = `
      SELECT * FROM artifact_sync_state
      WHERE integration_id = $1
      ORDER BY synced_at DESC
    `;

    const result = await this.pool.query(query, [integrationId]);
    return result.rows as ArtifactSyncState[];
  }

  async listModifiedSince(integrationId: string, timestamp: string) {
    const query = `
      SELECT * FROM artifact_sync_state
      WHERE integration_id = $1 AND last_modified > $2
      ORDER BY last_modified DESC
    `;

    const result = await this.pool.query(query, [integrationId, timestamp]);
    return result.rows as ArtifactSyncState[];
  }

  async updateArtifactId(syncStateId: string, artifactId: string) {
    const query = `
      UPDATE artifact_sync_state
      SET artifact_id = $2, synced_at = $3
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [syncStateId, artifactId, new Date().toISOString()]);
    return result.rows[0] as ArtifactSyncState | undefined;
  }

  async updateChecksum(
    integrationId: string,
    sourceFileId: string,
    lastModified: string,
    checksum: string
  ) {
    const query = `
      UPDATE artifact_sync_state
      SET last_modified = $3, checksum = $4, synced_at = $5
      WHERE integration_id = $1 AND source_file_id = $2
    `;

    const result = await this.pool.query(query, [
      integrationId,
      sourceFileId,
      lastModified,
      checksum,
      new Date().toISOString()
    ]);

    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: string) {
    const query = `
      DELETE FROM artifact_sync_state
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByIntegration(integrationId: string) {
    const query = `
      DELETE FROM artifact_sync_state
      WHERE integration_id = $1
    `;

    const result = await this.pool.query(query, [integrationId]);
    return result.rowCount ?? 0;
  }
}

export interface SyncStateRepoOptions {
  pool?: Pool;
  kind?: "memory" | "postgres";
}

export function createSyncStateRepo(options: SyncStateRepoOptions = {}): SyncStateRepo {
  if (options.kind === "postgres" || options.pool) {
    if (!options.pool && !process.env["DATABASE_URL"]) {
      throw new Error("Postgres repo requires pool or DATABASE_URL");
    }
    const pool = options.pool || new Pool({ connectionString: process.env["DATABASE_URL"] });
    return new PostgresSyncStateRepo(pool);
  }

  return new InMemorySyncStateRepo();
}

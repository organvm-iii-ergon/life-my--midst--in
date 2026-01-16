/**
 * Cloud Storage Integration Repository
 *
 * Manages OAuth credentials and folder configuration for cloud storage providers.
 * Tracks integration status and last sync timestamps for delta sync coordination.
 *
 * Tokens stored encrypted at the application level (before persistence).
 */

import type { CloudStorageIntegration } from "@in-midst-my-life/schema";
import { Pool } from "pg";

export interface CloudIntegrationRepo {
  create(integration: CloudStorageIntegration): Promise<CloudStorageIntegration>;
  findById(id: string, profileId: string): Promise<CloudStorageIntegration | undefined>;
  listByProfile(profileId: string): Promise<CloudStorageIntegration[]>;
  listActiveByProfile(profileId: string): Promise<CloudStorageIntegration[]>;
  update(
    id: string,
    profileId: string,
    patch: Partial<CloudStorageIntegration>
  ): Promise<CloudStorageIntegration | undefined>;
  updateSyncTimestamp(id: string, profileId: string, timestamp: string): Promise<boolean>;
  updateStatus(id: string, profileId: string, status: "active" | "expired" | "revoked" | "error"): Promise<boolean>;
  delete(id: string, profileId: string): Promise<boolean>;
}

class InMemoryCloudIntegrationRepo implements CloudIntegrationRepo {
  private data = new Map<string, CloudStorageIntegration>();

  async create(integration: CloudStorageIntegration) {
    this.data.set(integration.id, integration);
    return integration;
  }

  async findById(id: string, profileId: string) {
    const integration = this.data.get(id);
    return integration && integration.profileId === profileId ? integration : undefined;
  }

  async listByProfile(profileId: string) {
    return Array.from(this.data.values()).filter((i) => i.profileId === profileId);
  }

  async listActiveByProfile(profileId: string) {
    return Array.from(this.data.values()).filter(
      (i) => i.profileId === profileId && i.status === "active"
    );
  }

  async update(id: string, profileId: string, patch: Partial<CloudStorageIntegration>) {
    const existing = await this.findById(id, profileId);
    if (!existing) return undefined;

    const updated: CloudStorageIntegration = {
      ...existing,
      ...patch,
      id: existing.id,
      profileId: existing.profileId,
      provider: existing.provider,
      updatedAt: new Date().toISOString()
    };

    this.data.set(id, updated);
    return updated;
  }

  async updateSyncTimestamp(id: string, profileId: string, timestamp: string) {
    const integration = await this.findById(id, profileId);
    if (!integration) return false;

    integration.lastSyncedAt = timestamp;
    integration.updatedAt = new Date().toISOString();
    this.data.set(id, integration);
    return true;
  }

  async updateStatus(id: string, profileId: string, status: "active" | "expired" | "revoked" | "error") {
    const integration = await this.findById(id, profileId);
    if (!integration) return false;

    integration.status = status;
    integration.updatedAt = new Date().toISOString();
    this.data.set(id, integration);
    return true;
  }

  async delete(id: string, profileId: string) {
    const integration = await this.findById(id, profileId);
    if (!integration) return false;
    return this.data.delete(id);
  }
}

class PostgresCloudIntegrationRepo implements CloudIntegrationRepo {
  constructor(private pool: Pool) {}

  async create(integration: CloudStorageIntegration): Promise<CloudStorageIntegration> {
    const query = `
      INSERT INTO cloud_storage_integrations (
        id, profile_id, provider,
        access_token_encrypted, refresh_token_encrypted, token_expires_at,
        folder_config, last_synced_at, status, metadata,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12
      )
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      integration.id,
      integration.profileId,
      integration.provider,
      integration.accessTokenEncrypted,
      integration.refreshTokenEncrypted,
      integration.tokenExpiresAt,
      JSON.stringify(integration.folderConfig || {}),
      integration.lastSyncedAt,
      integration.status,
      JSON.stringify(integration.metadata || {}),
      integration.createdAt,
      integration.updatedAt
    ]);

    return this.rowToIntegration(result.rows[0]);
  }

  async findById(id: string, profileId: string): Promise<CloudStorageIntegration | undefined> {
    const query = `
      SELECT * FROM cloud_storage_integrations
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId]);
    return result.rows[0] ? this.rowToIntegration(result.rows[0]) : undefined;
  }

  async listByProfile(profileId: string): Promise<CloudStorageIntegration[]> {
    const query = `
      SELECT * FROM cloud_storage_integrations
      WHERE profile_id = $1
      ORDER BY updated_at DESC
    `;

    const result = await this.pool.query(query, [profileId]);
    return result.rows.map((row) => this.rowToIntegration(row));
  }

  async listActiveByProfile(profileId: string): Promise<CloudStorageIntegration[]> {
    const query = `
      SELECT * FROM cloud_storage_integrations
      WHERE profile_id = $1 AND status = 'active'
      ORDER BY updated_at DESC
    `;

    const result = await this.pool.query(query, [profileId]);
    return result.rows.map((row) => this.rowToIntegration(row));
  }

  async update(
    id: string,
    profileId: string,
    patch: Partial<CloudStorageIntegration>
  ): Promise<CloudStorageIntegration | undefined> {
    const existing = await this.findById(id, profileId);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: any[] = [id, profileId];
    let paramIndex = 3;

    const fieldsToUpdate = [
      { schema: "folder_config", key: "folderConfig" },
      { schema: "last_synced_at", key: "lastSyncedAt" },
      { schema: "status", key: "status" },
      { schema: "metadata", key: "metadata" }
    ];

    for (const field of fieldsToUpdate) {
      if (field.key in patch) {
        const value = (patch as any)[field.key];
        updates.push(`${field.schema} = $${paramIndex}`);
        values.push(["folderConfig", "metadata"].includes(field.key) ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (updates.length === 0) return existing;

    updates.push(`updated_at = $${paramIndex}`);
    values.push(new Date().toISOString());

    const query = `
      UPDATE cloud_storage_integrations
      SET ${updates.join(", ")}
      WHERE id = $1 AND profile_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] ? this.rowToIntegration(result.rows[0]) : undefined;
  }

  async updateSyncTimestamp(id: string, profileId: string, timestamp: string): Promise<boolean> {
    const query = `
      UPDATE cloud_storage_integrations
      SET last_synced_at = $3, updated_at = $4
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId, timestamp, new Date().toISOString()]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateStatus(id: string, profileId: string, status: "active" | "expired" | "revoked" | "error"): Promise<boolean> {
    const query = `
      UPDATE cloud_storage_integrations
      SET status = $3, updated_at = $4
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId, status, new Date().toISOString()]);
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: string, profileId: string): Promise<boolean> {
    const query = `
      DELETE FROM cloud_storage_integrations
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId]);
    return (result.rowCount ?? 0) > 0;
  }

  private rowToIntegration(row: any): CloudStorageIntegration {
    return {
      id: row.id,
      profileId: row.profile_id,
      provider: row.provider,
      accessTokenEncrypted: row.access_token_encrypted,
      refreshTokenEncrypted: row.refresh_token_encrypted,
      tokenExpiresAt: row.token_expires_at,
      folderConfig: row.folder_config,
      lastSyncedAt: row.last_synced_at,
      status: row.status,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export interface CloudIntegrationRepoOptions {
  pool?: Pool;
  kind?: "memory" | "postgres";
}

export function createCloudIntegrationRepo(options: CloudIntegrationRepoOptions = {}): CloudIntegrationRepo {
  if (options.kind === "postgres" || options.pool) {
    if (!options.pool && !process.env["DATABASE_URL"]) {
      throw new Error("Postgres repo requires pool or DATABASE_URL");
    }
    const pool = options.pool || new Pool({ connectionString: process.env["DATABASE_URL"] });
    return new PostgresCloudIntegrationRepo(pool);
  }

  return new InMemoryCloudIntegrationRepo();
}

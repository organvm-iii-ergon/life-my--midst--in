/**
 * Artifact Repository
 *
 * Persistence layer for artifact records discovered and ingested from cloud storage.
 * Handles creation, retrieval, and status updates during the approval workflow.
 *
 * Production uses PostgreSQL; MVP can use in-memory storage.
 */

import type { Artifact } from "@in-midst-my-life/schema";
import { Pool } from "pg";

export interface ArtifactRepo {
  create(artifact: Artifact): Promise<Artifact>;
  findById(id: string, profileId: string): Promise<Artifact | undefined>;
  findBySource(
    profileId: string,
    sourceProvider: string,
    sourceId: string
  ): Promise<Artifact | undefined>;
  listByProfile(
    profileId: string,
    options?: {
      status?: "pending" | "approved" | "rejected" | "archived";
      artifactType?: string;
      offset?: number;
      limit?: number;
    }
  ): Promise<{ data: Artifact[]; total: number }>;
  update(id: string, profileId: string, patch: Partial<Artifact>): Promise<Artifact | undefined>;
  updateStatus(id: string, profileId: string, status: "pending" | "approved" | "rejected" | "archived"): Promise<boolean>;
  delete(id: string, profileId: string): Promise<boolean>;
}

class InMemoryArtifactRepo implements ArtifactRepo {
  private data = new Map<string, Artifact>();

  async create(artifact: Artifact) {
    this.data.set(artifact.id, artifact);
    return artifact;
  }

  async findById(id: string, profileId: string) {
    const artifact = this.data.get(id);
    return artifact && artifact.profileId === profileId ? artifact : undefined;
  }

  async findBySource(profileId: string, sourceProvider: string, sourceId: string) {
    for (const artifact of this.data.values()) {
      if (
        artifact.profileId === profileId &&
        artifact.sourceProvider === sourceProvider &&
        artifact.sourceId === sourceId
      ) {
        return artifact;
      }
    }
    return undefined;
  }

  async listByProfile(
    profileId: string,
    options?: {
      status?: "pending" | "approved" | "rejected" | "archived";
      artifactType?: string;
      offset?: number;
      limit?: number;
    }
  ) {
    const { status, artifactType, offset = 0, limit = 100 } = options || {};

    let results = Array.from(this.data.values()).filter((a) => a.profileId === profileId);

    if (status) {
      results = results.filter((a) => a.status === status);
    }

    if (artifactType) {
      results = results.filter((a) => a.artifactType === artifactType);
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = results.length;
    const data = results.slice(offset, offset + limit);

    return { data, total };
  }

  async update(id: string, profileId: string, patch: Partial<Artifact>) {
    const existing = await this.findById(id, profileId);
    if (!existing) return undefined;

    const updated: Artifact = {
      ...existing,
      ...patch,
      id: existing.id,
      profileId: existing.profileId,
      sourceProvider: existing.sourceProvider,
      sourceId: existing.sourceId,
      sourcePath: existing.sourcePath,
      updatedAt: new Date().toISOString()
    };

    this.data.set(id, updated);
    return updated;
  }

  async updateStatus(id: string, profileId: string, status: "pending" | "approved" | "rejected" | "archived") {
    const artifact = await this.findById(id, profileId);
    if (!artifact) return false;

    artifact.status = status;
    artifact.updatedAt = new Date().toISOString();
    this.data.set(id, artifact);
    return true;
  }

  async delete(id: string, profileId: string) {
    const artifact = await this.findById(id, profileId);
    if (!artifact) return false;
    return this.data.delete(id);
  }
}

class PostgresArtifactRepo implements ArtifactRepo {
  constructor(private pool: Pool) {}

  async create(artifact: Artifact): Promise<Artifact> {
    const query = `
      INSERT INTO artifacts (
        id, profile_id, source_provider, source_id, source_path,
        name, artifact_type, mime_type, file_size,
        created_date, modified_date, captured_date,
        title, description_markdown, authors, keywords,
        media_metadata, tags, categories, confidence,
        integrity, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23, $24
      )
      ON CONFLICT (profile_id, source_provider, source_id)
      DO UPDATE SET updated_at = $24
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      artifact.id,
      artifact.profileId,
      artifact.sourceProvider,
      artifact.sourceId,
      artifact.sourcePath,
      artifact.name,
      artifact.artifactType,
      artifact.mimeType,
      artifact.fileSize,
      artifact.createdDate,
      artifact.modifiedDate,
      artifact.capturedDate,
      artifact.title,
      artifact.descriptionMarkdown,
      artifact.authors,
      artifact.keywords,
      JSON.stringify(artifact.mediaMetadata || {}),
      artifact.tags,
      artifact.categories,
      artifact.confidence,
      artifact.integrity ? JSON.stringify(artifact.integrity) : null,
      artifact.status,
      artifact.createdAt,
      artifact.updatedAt
    ]);

    return result.rows[0] as Artifact;
  }

  async findById(id: string, profileId: string): Promise<Artifact | undefined> {
    const query = `
      SELECT * FROM artifacts
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId]);
    return result.rows[0] as Artifact | undefined;
  }

  async findBySource(
    profileId: string,
    sourceProvider: string,
    sourceId: string
  ): Promise<Artifact | undefined> {
    const query = `
      SELECT * FROM artifacts
      WHERE profile_id = $1 AND source_provider = $2 AND source_id = $3
      LIMIT 1
    `;

    const result = await this.pool.query(query, [profileId, sourceProvider, sourceId]);
    return result.rows[0] as Artifact | undefined;
  }

  async listByProfile(
    profileId: string,
    options?: {
      status?: "pending" | "approved" | "rejected" | "archived";
      artifactType?: string;
      offset?: number;
      limit?: number;
    }
  ): Promise<{ data: Artifact[]; total: number }> {
    const { status, artifactType, offset = 0, limit = 100 } = options || {};

    let whereClause = "WHERE profile_id = $1";
    const params: any[] = [profileId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (artifactType) {
      whereClause += ` AND artifact_type = $${paramIndex}`;
      params.push(artifactType);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(
        `SELECT * FROM artifacts ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        params
      ),
      this.pool.query(
        `SELECT COUNT(*)::integer as count FROM artifacts ${whereClause}`,
        params.slice(0, paramIndex - 2)
      )
    ]);

    return {
      data: dataResult.rows as Artifact[],
      total: countResult.rows[0]?.count ?? 0
    };
  }

  async update(id: string, profileId: string, patch: Partial<Artifact>): Promise<Artifact | undefined> {
    const existing = await this.findById(id, profileId);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: any[] = [id, profileId];
    let paramIndex = 3;

    // Build dynamic UPDATE clause
    const fieldsToUpdate = [
      "title",
      "description_markdown",
      "artifact_type",
      "tags",
      "categories",
      "status"
    ];

    for (const field of fieldsToUpdate) {
      const key = field === "description_markdown" ? "descriptionMarkdown" : field.replace(/_/g, "");
      if (key in patch) {
        const value = (patch as any)[key];
        updates.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) return existing;

    updates.push(`updated_at = $${paramIndex}`);
    values.push(new Date().toISOString());

    const query = `
      UPDATE artifacts
      SET ${updates.join(", ")}
      WHERE id = $1 AND profile_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] as Artifact | undefined;
  }

  async updateStatus(id: string, profileId: string, status: "pending" | "approved" | "rejected" | "archived"): Promise<boolean> {
    const query = `
      UPDATE artifacts
      SET status = $3, updated_at = $4
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId, status, new Date().toISOString()]);
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: string, profileId: string): Promise<boolean> {
    const query = `
      DELETE FROM artifacts
      WHERE id = $1 AND profile_id = $2
    `;

    const result = await this.pool.query(query, [id, profileId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export function createArtifactRepo(pool?: Pool): ArtifactRepo {
  if (pool) {
    return new PostgresArtifactRepo(pool);
  }

  // Use in-memory for MVP
  return new InMemoryArtifactRepo();
}

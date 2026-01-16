import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { VerificationLog } from "@in-midst-my-life/schema";

export interface VerificationLogRepo {
  create(log: VerificationLog): Promise<VerificationLog>;
  findByEntity(entityId: string): Promise<VerificationLog[]>;
  reset(): Promise<void>;
}

export type VerificationLogRepoKind = "memory" | "postgres";

export interface VerificationLogRepoOptions {
  kind?: VerificationLogRepoKind;
  pool?: Pool;
  connectionString?: string;
}

class InMemoryVerificationLogRepo implements VerificationLogRepo {
  private data = new Map<string, VerificationLog>();

  async create(log: VerificationLog) {
    const normalized: VerificationLog = {
      ...log,
      id: log.id || randomUUID(),
      createdAt: log.createdAt || new Date().toISOString(),
      updatedAt: log.updatedAt || new Date().toISOString()
    };
    this.data.set(normalized.id, normalized);
    return normalized;
  }

  async findByEntity(entityId: string) {
    return Array.from(this.data.values()).filter(log => log.entityId === entityId);
  }

  async reset() {
    this.data.clear();
  }
}

class PostgresVerificationLogRepo implements VerificationLogRepo {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(pool: Pool) {
    this.pool = pool;
    this.ready = this.ensureTable();
  }

  private async ensureTable() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id uuid PRIMARY KEY,
        profile_id uuid NOT NULL,
        entity_type text NOT NULL,
        entity_id uuid NOT NULL,
        credential_id uuid,
        status text NOT NULL,
        source text NOT NULL,
        verifier_label text,
        notes text,
        metadata jsonb,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      )
    `);
  }

  async create(log: VerificationLog) {
    await this.ready;
    const normalized: VerificationLog = {
      ...log,
      id: log.id || randomUUID(),
      createdAt: log.createdAt || new Date().toISOString(),
      updatedAt: log.updatedAt || new Date().toISOString()
    };
    await this.pool.query(
      `INSERT INTO verification_logs (id, profile_id, entity_type, entity_id, credential_id, status, source, verifier_label, notes, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        normalized.id,
        normalized.profileId,
        normalized.entityType,
        normalized.entityId,
        normalized.credentialId || null,
        normalized.status,
        normalized.source,
        normalized.verifierLabel || null,
        normalized.notes || null,
        normalized.metadata || null,
        normalized.createdAt,
        normalized.updatedAt
      ]
    );
    return normalized;
  }

  async findByEntity(entityId: string) {
    await this.ready;
    const res = await this.pool.query(
      `SELECT * FROM verification_logs WHERE entity_id = $1`,
      [entityId]
    );
    return res.rows.map(row => ({
      id: row.id,
      profileId: row.profile_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      credentialId: row.credential_id,
      status: row.status,
      source: row.source,
      verifierLabel: row.verifier_label,
      notes: row.notes,
      metadata: row.metadata,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at,
      updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at
    }));
  }

  async reset() {
    await this.ready;
    await this.pool.query(`TRUNCATE TABLE verification_logs`);
  }
}

export function createVerificationLogRepo(options: VerificationLogRepoOptions = {}): VerificationLogRepo {
  const hasPostgres = Boolean(options.connectionString ?? process.env["DATABASE_URL"] ?? process.env["ORCH_POSTGRES_URL"]);
  const kind = options.kind ?? (process.env["VERIFICATION_LOG_STORE"] ?? (hasPostgres ? "postgres" : "memory"));
  if (kind === "postgres") {
    const pool =
      options.pool ??
      new Pool({
        connectionString: options.connectionString ?? process.env["ORCH_POSTGRES_URL"] ?? process.env["DATABASE_URL"]
      });
    return new PostgresVerificationLogRepo(pool);
  }
  return new InMemoryVerificationLogRepo();
}

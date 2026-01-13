/**
 * Job Posting Repository
 * 
 * Abstraction layer for Job Posting persistence
 * Supports both in-memory (dev) and PostgreSQL (prod)
 */

import type { JobListing } from "@in-midst-my-life/schema";

/**
 * Repository interface for JobListing entities
 */
export interface JobPostingRepository {
  // Read operations
  find(id: string): Promise<JobListing | undefined>;
  list(options: { offset?: number; limit?: number }): Promise<{
    data: JobListing[];
    total: number;
  }>;
  listBySource(
    source: string,
    options?: { offset?: number; limit?: number }
  ): Promise<JobListing[]>;

  // Write operations
  upsert(job: JobListing): Promise<JobListing>;
  upsertBatch(jobs: JobListing[]): Promise<JobListing[]>;

  // Metadata
  getLastSync(source: string): Promise<Date | undefined>;
  setLastSync(source: string, date: Date): Promise<void>;

  // Cleanup
  removeOlder(beforeDate: Date): Promise<number>;
}

/**
 * In-Memory Job Posting Repository (Development)
 * Uses Map for fast lookups, suitable for dev/test
 */
export class InMemoryJobPostingRepository implements JobPostingRepository {
  private jobs: Map<string, JobListing> = new Map();
  private lastSync: Map<string, Date> = new Map();

  async find(id: string): Promise<JobListing | undefined> {
    return this.jobs.get(id);
  }

  async list(options: { offset?: number; limit?: number } = {}): Promise<{
    data: JobListing[];
    total: number;
  }> {
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    const all = Array.from(this.jobs.values()).sort(
      (a, b) => b.posted_date.getTime() - a.posted_date.getTime()
    );

    const data = all.slice(offset, offset + limit);

    return {
      data,
      total: all.length,
    };
  }

  async listBySource(
    source: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<JobListing[]> {
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    const bySource = Array.from(this.jobs.values())
      .filter((job) => job.source === source)
      .sort((a, b) => b.posted_date.getTime() - a.posted_date.getTime());

    return bySource.slice(offset, offset + limit);
  }

  async upsert(job: JobListing): Promise<JobListing> {
    this.jobs.set(job.id, job);
    return job;
  }

  async upsertBatch(jobs: JobListing[]): Promise<JobListing[]> {
    for (const job of jobs) {
      this.jobs.set(job.id, job);
    }
    return jobs;
  }

  async getLastSync(source: string): Promise<Date | undefined> {
    return this.lastSync.get(source);
  }

  async setLastSync(source: string, date: Date): Promise<void> {
    this.lastSync.set(source, date);
  }

  async removeOlder(beforeDate: Date): Promise<number> {
    const before = Array.from(this.jobs.entries()).filter(
      ([, job]) => job.posted_date < beforeDate
    );

    for (const [id] of before) {
      this.jobs.delete(id);
    }

    return before.length;
  }
}

/**
 * PostgreSQL Job Posting Repository (Production)
 * 
 * TODO: Implement when Neon database is provisioned
 * 
 * Expected schema:
 * CREATE TABLE job_postings (
 *   id UUID PRIMARY KEY,
 *   title VARCHAR NOT NULL,
 *   company VARCHAR NOT NULL,
 *   location VARCHAR,
 *   remote VARCHAR,
 *   description TEXT,
 *   requirements TEXT,
 *   salary_min INTEGER,
 *   salary_max INTEGER,
 *   job_url VARCHAR UNIQUE,
 *   posted_date TIMESTAMP DEFAULT NOW(),
 *   source VARCHAR NOT NULL,
 *   technologies TEXT[],
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_job_postings_source ON job_postings(source);
 * CREATE INDEX idx_job_postings_posted_date ON job_postings(posted_date DESC);
 */
export class PostgresJobPostingRepository implements JobPostingRepository {
  constructor(private db: any) {} // TODO: proper DB type

  async find(id: string): Promise<JobListing | undefined> {
    // TODO: Implement
    throw new Error("PostgresJobPostingRepository.find() not yet implemented");
  }

  async list(options: { offset?: number; limit?: number } = {}): Promise<{
    data: JobListing[];
    total: number;
  }> {
    // TODO: Implement
    throw new Error("PostgresJobPostingRepository.list() not yet implemented");
  }

  async listBySource(
    source: string,
    options?: { offset?: number; limit?: number }
  ): Promise<JobListing[]> {
    // TODO: Implement
    throw new Error(
      "PostgresJobPostingRepository.listBySource() not yet implemented"
    );
  }

  async upsert(job: JobListing): Promise<JobListing> {
    // TODO: Implement
    throw new Error("PostgresJobPostingRepository.upsert() not yet implemented");
  }

  async upsertBatch(jobs: JobListing[]): Promise<JobListing[]> {
    // TODO: Implement
    throw new Error(
      "PostgresJobPostingRepository.upsertBatch() not yet implemented"
    );
  }

  async getLastSync(source: string): Promise<Date | undefined> {
    // TODO: Implement
    throw new Error(
      "PostgresJobPostingRepository.getLastSync() not yet implemented"
    );
  }

  async setLastSync(source: string, date: Date): Promise<void> {
    // TODO: Implement
    throw new Error(
      "PostgresJobPostingRepository.setLastSync() not yet implemented"
    );
  }

  async removeOlder(beforeDate: Date): Promise<number> {
    // TODO: Implement
    throw new Error(
      "PostgresJobPostingRepository.removeOlder() not yet implemented"
    );
  }
}

/**
 * Factory function to create appropriate repository based on environment
 */
export function createJobPostingRepository(
  options?: {
    type?: "memory" | "postgres";
    db?: any;
  }
): JobPostingRepository {
  const type = options?.type || process.env.JOB_REPO_TYPE || "memory";

  if (type === "postgres") {
    if (!options?.db) {
      throw new Error("PostgreSQL repository requires database connection");
    }
    return new PostgresJobPostingRepository(options.db);
  }

  return new InMemoryJobPostingRepository();
}

/**
 * Job Application Repository
 * 
 * Abstraction layer for Job Application persistence
 * Tracks user applications, their status, and outcomes
 */

import type { JobApplicationStatus } from "@in-midst-my-life/schema";

export interface JobApplication {
  id: string;
  profile_id: string;
  job_posting_id: string;
  mask_id: string; // Which mask was used for this application
  status: JobApplicationStatus;
  tailored_resume_url?: string; // URL to tailored resume PDF
  cover_letter?: string;
  submitted_date?: Date;
  response_date?: Date;
  interview_scheduled?: boolean;
  interview_date?: Date;
  offer_received?: boolean;
  offer_details?: {
    salary_offered?: number;
    title?: string;
    notes?: string;
  };
  rejection_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Repository interface for JobApplication entities
 */
export interface JobApplicationRepository {
  // Read operations
  find(id: string): Promise<JobApplication | undefined>;
  findByProfileAndJob(
    profileId: string,
    jobId: string
  ): Promise<JobApplication | undefined>;
  listByProfile(
    profileId: string,
    options?: { status?: JobApplicationStatus; offset?: number; limit?: number }
  ): Promise<{
    data: JobApplication[];
    total: number;
  }>;

  // Write operations
  create(app: Omit<JobApplication, "id" | "created_at" | "updated_at">): Promise<JobApplication>;
  update(
    id: string,
    patch: Partial<Omit<JobApplication, "id" | "created_at">>
  ): Promise<JobApplication | undefined>;

  // Bulk operations
  markAsSubmitted(
    ids: string[],
    tailoredResumeUrl: string,
    submittedDate: Date
  ): Promise<JobApplication[]>;
  markAsRejected(
    ids: string[],
    rejectionReason?: string
  ): Promise<JobApplication[]>;
  recordInterviewScheduled(id: string, interviewDate: Date): Promise<JobApplication | undefined>;
  recordOfferReceived(
    id: string,
    offerDetails: { salary_offered?: number; title?: string; notes?: string }
  ): Promise<JobApplication | undefined>;

  // Analytics
  getStats(profileId: string): Promise<{
    total_applications: number;
    pending: number;
    submitted: number;
    rejected: number;
    interviews: number;
    offers: number;
  }>;
}

/**
 * In-Memory Job Application Repository (Development)
 */
export class InMemoryJobApplicationRepository implements JobApplicationRepository {
  private applications: Map<string, JobApplication> = new Map();
  private idCounter = 0;

  async find(id: string): Promise<JobApplication | undefined> {
    return this.applications.get(id);
  }

  async findByProfileAndJob(
    profileId: string,
    jobId: string
  ): Promise<JobApplication | undefined> {
    return Array.from(this.applications.values()).find(
      (app) => app.profile_id === profileId && app.job_posting_id === jobId
    );
  }

  async listByProfile(
    profileId: string,
    options?: { status?: JobApplicationStatus; offset?: number; limit?: number }
  ): Promise<{ data: JobApplication[]; total: number }> {
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    let filtered = Array.from(this.applications.values()).filter(
      (app) => app.profile_id === profileId
    );

    if (options?.status) {
      filtered = filtered.filter((app) => app.status === options.status);
    }

    const sorted = filtered.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );

    return {
      data: sorted.slice(offset, offset + limit),
      total: sorted.length,
    };
  }

  async create(
    app: Omit<JobApplication, "id" | "created_at" | "updated_at">
  ): Promise<JobApplication> {
    const id = `app-${++this.idCounter}`;
    const now = new Date();

    const application: JobApplication = {
      ...app,
      id,
      created_at: now,
      updated_at: now,
    };

    this.applications.set(id, application);
    return application;
  }

  async update(
    id: string,
    patch: Partial<Omit<JobApplication, "id" | "created_at">>
  ): Promise<JobApplication | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const updated: JobApplication = {
      ...app,
      ...patch,
      updated_at: new Date(),
    };

    this.applications.set(id, updated);
    return updated;
  }

  async markAsSubmitted(
    ids: string[],
    tailoredResumeUrl: string,
    submittedDate: Date
  ): Promise<JobApplication[]> {
    const results: JobApplication[] = [];

    for (const id of ids) {
      const updated = await this.update(id, {
        status: "submitted" as JobApplicationStatus,
        tailored_resume_url: tailoredResumeUrl,
        submitted_date: submittedDate,
      });
      if (updated) results.push(updated);
    }

    return results;
  }

  async markAsRejected(
    ids: string[],
    rejectionReason?: string
  ): Promise<JobApplication[]> {
    const results: JobApplication[] = [];

    for (const id of ids) {
      const updated = await this.update(id, {
        status: "rejected" as JobApplicationStatus,
        rejection_reason: rejectionReason,
        response_date: new Date(),
      });
      if (updated) results.push(updated);
    }

    return results;
  }

  async recordInterviewScheduled(
    id: string,
    interviewDate: Date
  ): Promise<JobApplication | undefined> {
    return this.update(id, {
      interview_scheduled: true,
      interview_date: interviewDate,
    });
  }

  async recordOfferReceived(
    id: string,
    offerDetails: { salary_offered?: number; title?: string; notes?: string }
  ): Promise<JobApplication | undefined> {
    return this.update(id, {
      status: "offer_received" as JobApplicationStatus,
      offer_received: true,
      offer_details: offerDetails,
      response_date: new Date(),
    });
  }

  async getStats(profileId: string): Promise<{
    total_applications: number;
    pending: number;
    submitted: number;
    rejected: number;
    interviews: number;
    offers: number;
  }> {
    const apps = Array.from(this.applications.values()).filter(
      (app) => app.profile_id === profileId
    );

    return {
      total_applications: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      submitted: apps.filter((a) => a.status === "submitted").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      interviews: apps.filter((a) => a.interview_scheduled).length,
      offers: apps.filter((a) => a.offer_received).length,
    };
  }
}

/**
 * PostgreSQL Job Application Repository (Production)
 * 
 * TODO: Implement when Neon database is provisioned
 */
export class PostgresJobApplicationRepository implements JobApplicationRepository {
  constructor(private db: any) {} // TODO: proper DB type

  async find(id: string): Promise<JobApplication | undefined> {
    throw new Error(
      "PostgresJobApplicationRepository.find() not yet implemented"
    );
  }

  async findByProfileAndJob(
    profileId: string,
    jobId: string
  ): Promise<JobApplication | undefined> {
    throw new Error(
      "PostgresJobApplicationRepository.findByProfileAndJob() not yet implemented"
    );
  }

  async listByProfile(
    profileId: string,
    options?: { status?: JobApplicationStatus; offset?: number; limit?: number }
  ): Promise<{ data: JobApplication[]; total: number }> {
    throw new Error(
      "PostgresJobApplicationRepository.listByProfile() not yet implemented"
    );
  }

  async create(
    app: Omit<JobApplication, "id" | "created_at" | "updated_at">
  ): Promise<JobApplication> {
    throw new Error(
      "PostgresJobApplicationRepository.create() not yet implemented"
    );
  }

  async update(
    id: string,
    patch: Partial<Omit<JobApplication, "id" | "created_at">>
  ): Promise<JobApplication | undefined> {
    throw new Error(
      "PostgresJobApplicationRepository.update() not yet implemented"
    );
  }

  async markAsSubmitted(
    ids: string[],
    tailoredResumeUrl: string,
    submittedDate: Date
  ): Promise<JobApplication[]> {
    throw new Error(
      "PostgresJobApplicationRepository.markAsSubmitted() not yet implemented"
    );
  }

  async markAsRejected(
    ids: string[],
    rejectionReason?: string
  ): Promise<JobApplication[]> {
    throw new Error(
      "PostgresJobApplicationRepository.markAsRejected() not yet implemented"
    );
  }

  async recordInterviewScheduled(
    id: string,
    interviewDate: Date
  ): Promise<JobApplication | undefined> {
    throw new Error(
      "PostgresJobApplicationRepository.recordInterviewScheduled() not yet implemented"
    );
  }

  async recordOfferReceived(
    id: string,
    offerDetails: { salary_offered?: number; title?: string; notes?: string }
  ): Promise<JobApplication | undefined> {
    throw new Error(
      "PostgresJobApplicationRepository.recordOfferReceived() not yet implemented"
    );
  }

  async getStats(profileId: string): Promise<{
    total_applications: number;
    pending: number;
    submitted: number;
    rejected: number;
    interviews: number;
    offers: number;
  }> {
    throw new Error(
      "PostgresJobApplicationRepository.getStats() not yet implemented"
    );
  }
}

/**
 * Factory function to create appropriate repository based on environment
 */
export function createJobApplicationRepository(
  options?: {
    type?: "memory" | "postgres";
    db?: any;
  }
): JobApplicationRepository {
  const type = options?.type || process.env.JOB_APP_REPO_TYPE || "memory";

  if (type === "postgres") {
    if (!options?.db) {
      throw new Error(
        "PostgreSQL repository requires database connection"
      );
    }
    return new PostgresJobApplicationRepository(options.db);
  }

  return new InMemoryJobApplicationRepository();
}

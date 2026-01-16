import type { JobPosting, HunterSearchFilter, JobListing } from "@in-midst-my-life/schema";
export type { JobPosting };

export interface JobSearchQuery {
  keywords: string[];
  location?: string;
  remote?: boolean;
  limit?: number;
}

export interface JobSearchProvider {
  name: string;
  search(query: JobSearchQuery | HunterSearchFilter): Promise<JobPosting[] | JobListing[]>;
  getById?(id: string): Promise<JobPosting | null>;
}

/**
 * JobSearchService is an alias for JobSearchProvider used in hunter-protocol
 */
export type JobSearchService = JobSearchProvider;

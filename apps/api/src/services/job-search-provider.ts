import type { JobListing } from "@in-midst-my-life/schema";
import type { HunterSearchFilter } from "@in-midst-my-life/schema";
import { createJobSearchProvider } from "@in-midst-my-life/core";

export interface JobSearchCriteria {
  keywords: string[];
  location?: string;
  seniority?: string;
  maxResults?: number;
}

/**
 * JobSearchProvider - Integration layer for real job data
 *
 * Features:
 * - Automatic detection of real vs. mock providers via environment variables
 * - Serper API integration (requires SERPER_API_KEY)
 * - Fallback to mock data for development/testing
 * - Seamless API transformation from core layer to schema
 */
export class JobSearchProvider {
  private provider = createJobSearchProvider(
    process.env["NODE_ENV"] === "production" || !!process.env["SERPER_API_KEY"]
  );

  async search(criteria: JobSearchCriteria): Promise<JobListing[]> {
    // Convert JobSearchCriteria to HunterSearchFilter format
    const filter: HunterSearchFilter = {
      keywords: criteria.keywords || [],
      locations: criteria.location ? [criteria.location] : [],
      seniority_levels: criteria.seniority ? [criteria.seniority] : [],
      remote_requirement: "any",
    };

    try {
      // Use core provider (real Serper or mock based on environment)
      const results = await this.provider.search(filter);

      // Limit results if specified
      if (criteria.maxResults) {
        return results.slice(0, criteria.maxResults);
      }

      return results;
    } catch (error) {
      // Log and fallback to mock data on error
      console.error("Job search provider error:", error);
      return this.getMockFallback(criteria);
    }
  }

  /**
   * Fallback mock data for development/testing
   * Used when real providers are unavailable
   */
  private getMockFallback(criteria: JobSearchCriteria): JobListing[] {
    const mockJobs: JobListing[] = [
      {
        id: "job_001",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: criteria.location || "Remote",
        description: "Looking for experienced engineer with modern stack experience",
        requirements: "5+ years experience, TypeScript, Node.js",
        salary_min: 150000,
        salary_max: 180000,
        currency: "USD",
        posted_date: new Date(),
        job_url: "https://example.com/job/001",
        remote: "hybrid",
        source: "other",
        technologies: ["TypeScript", "React", "Node.js"],
      },
      {
        id: "job_002",
        title: "Full Stack Developer",
        company: "StartUp Inc",
        location: criteria.location || "Remote",
        description: "Build amazing products for millions of users",
        requirements: "3+ years experience, React, Python",
        salary_min: 120000,
        salary_max: 150000,
        currency: "USD",
        posted_date: new Date(),
        job_url: "https://example.com/job/002",
        remote: "fully",
        source: "other",
        technologies: ["React", "Python"],
      },
    ];

    // Filter by keywords if provided
    if (criteria.keywords && criteria.keywords.length > 0) {
      return mockJobs.filter((job) =>
        criteria.keywords.some(
          (keyword) =>
            job.title.toLowerCase().includes(keyword.toLowerCase()) ||
            job.description.toLowerCase().includes(keyword.toLowerCase()) ||
            job.technologies?.some((t) => t.toLowerCase().includes(keyword.toLowerCase()))
        )
      );
    }

    return mockJobs;
  }
}

"use client";

import React, { useState, useRef } from "react";
import type { HunterSearchFilter, JobListing } from "@in-midst-my-life/schema";

/**
 * Hunter Dashboard
 * Autonomous job-search interface
 *
 * Solves: Instead of applying to 2000 jobs → Get 0 interviews
 * Now: Search intelligently, analyze compatibility, auto-generate quality applications
 */

interface Job = JobListing;

interface CompatibilityResult {
  overall_score: number;
  skill_match: number;
  cultural_match: number;
  recommendation: "apply_now" | "strong_candidate" | "moderate_fit" | "stretch_goal" | "skip";
  skill_gaps: Array<{
    skill: string;
    gap_severity: "critical" | "high" | "medium" | "low" | "none";
    learnable: boolean;
  }>;
  strengths: string[];
  concerns: string[];
  negotiation_points: string[];
}

export interface HunterDashboardProps {
  profileId: string;
  personaId: string;
  onApplyJob?: (job: Job, compatibility: CompatibilityResult) => void;
}

export default function HunterDashboard({
  profileId,
  personaId,
  onApplyJob,
}: HunterDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [compatibilities, setCompatibilities] = useState<
    Record<string, CompatibilityResult>
  >({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Filter state
  const [keywords, setKeywords] = useState<string>("");
  const [locations, setLocations] = useState<string>("");
  const [minSalary, setMinSalary] = useState<number | undefined>();
  const [maxSalary, setMaxSalary] = useState<number | undefined>();
  const [remoteType, setRemoteType] = useState<string>("any");
  const [technologies, setTechnologies] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score" | "recency" | "salary">("score");

  const searchRef = useRef<HTMLDivElement>(null);

  /**
   * Search jobs with filters
   */
  const handleSearch = async () => {
    setSearching(true);
    try {
      const filter: HunterSearchFilter = {
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
        locations: locations
          .split(",")
          .map((l) => l.trim())
          .filter((l) => l.length > 0),
        min_salary: minSalary,
        max_salary: maxSalary,
        remote_requirement: remoteType as any,
        required_technologies: technologies
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      };

      const response = await fetch(
        `/api/profiles/${profileId}/hunter/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filter),
        }
      );

      const data = await response.json();
      setJobs(data.jobs || []);
      setCompatibilities({});
      setSelectedJob(null);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Analyze compatibility for a job
   */
  const handleAnalyzeJob = async (job: Job) => {
    if (compatibilities[job.id]) {
      setSelectedJob(job);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/profiles/${profileId}/hunter/analyze/${job.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job, personaId }),
        }
      );

      const data = await response.json();
      setCompatibilities((prev) => ({
        ...prev,
        [job.id]: data.compatibility,
      }));
      setSelectedJob(job);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate application for job
   */
  const handleGenerateApplication = async (job: Job) => {
    if (!compatibilities[job.id]) {
      await handleAnalyzeJob(job);
      return;
    }

    // Would generate tailored resume + cover letter here
    const compatibility = compatibilities[job.id];

    if (onApplyJob) {
      onApplyJob(job, compatibility);
    }
  };

  // Sort jobs by selected criteria
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === "recency") {
      return (
        new Date(b.posted_date).getTime() -
        new Date(a.posted_date).getTime()
      );
    }

    if (sortBy === "salary" && a.salary_max && b.salary_max) {
      return b.salary_max - a.salary_max;
    }

    // Score sorting
    const scoreA = compatibilities[a.id]?.overall_score || 0;
    const scoreB = compatibilities[b.id]?.overall_score || 0;
    return scoreB - scoreA;
  });

  const selectedCompat = selectedJob ? compatibilities[selectedJob.id] : null;
  const jobCount = jobs.length;
  const analyzedCount = Object.keys(compatibilities).length;
  const strongMatches = Object.values(compatibilities).filter(
    (c) => c.overall_score >= 80
  ).length;

  return (
    <div className="hunter-dashboard">
      <div className="hunter-header">
        <h1>🎯 Hunter Protocol</h1>
        <p>Intelligent job search. Quality over quantity.</p>
      </div>

      {/* Search Section */}
      <section className="hunter-search" ref={searchRef}>
        <h2>Search Jobs</h2>

        <div className="search-form">
          <div className="form-group">
            <label htmlFor="keywords">Keywords</label>
            <input
              id="keywords"
              type="text"
              placeholder="e.g., TypeScript, React, Backend"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="locations">Locations</label>
            <input
              id="locations"
              type="text"
              placeholder="e.g., San Francisco, New York"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="remote">Remote</label>
            <select
              id="remote"
              value={remoteType}
              onChange={(e) => setRemoteType(e.target.value)}
            >
              <option value="any">Any</option>
              <option value="fully">Fully Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="min-salary">Min Salary ($)</label>
            <input
              id="min-salary"
              type="number"
              placeholder="e.g., 120000"
              value={minSalary || ""}
              onChange={(e) =>
                setMinSalary(e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="max-salary">Max Salary ($)</label>
            <input
              id="max-salary"
              type="number"
              placeholder="e.g., 200000"
              value={maxSalary || ""}
              onChange={(e) =>
                setMaxSalary(e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="technologies">Technologies</label>
            <input
              id="technologies"
              type="text"
              placeholder="e.g., TypeScript, PostgreSQL"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search Jobs"}
          </button>
        </div>
      </section>

      {/* Results Section */}
      {jobs.length > 0 && (
        <section className="hunter-results">
          <div className="results-header">
            <h2>Results</h2>
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{jobCount}</span>
                <span className="stat-label">Jobs Found</span>
              </div>
              <div className="stat">
                <span className="stat-value">{analyzedCount}</span>
                <span className="stat-label">Analyzed</span>
              </div>
              <div className="stat">
                <span className="stat-value">{strongMatches}</span>
                <span className="stat-label">Strong Matches</span>
              </div>
            </div>

            <div className="sort-controls">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="score">Compatibility Score</option>
                <option value="recency">Recency</option>
                <option value="salary">Salary</option>
              </select>
            </div>
          </div>

          <div className="jobs-list">
            {sortedJobs.map((job) => {
              const compat = compatibilities[job.id];
              const score = compat?.overall_score || 0;
              const scoreColor =
                score >= 80
                  ? "score-green"
                  : score >= 70
                    ? "score-yellow"
                    : score >= 50
                      ? "score-orange"
                      : "score-red";

              return (
                <div
                  key={job.id}
                  className={`job-card ${
                    selectedJob?.id === job.id ? "selected" : ""
                  }`}
                  onClick={() => handleAnalyzeJob(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnalyzeJob(job);
                  }}
                >
                  <div className="job-header">
                    <div className="job-title">
                      <h3>{job.title}</h3>
                      <span className="company">{job.company}</span>
                    </div>

                    {compat && (
                      <div className={`score ${scoreColor}`}>
                        <span className="score-number">{score}%</span>
                        <span className="score-label">
                          {compat.recommendation === "apply_now" && "Apply Now"}
                          {compat.recommendation === "strong_candidate" &&
                            "Strong"}
                          {compat.recommendation === "moderate_fit" && "Moderate"}
                          {compat.recommendation === "stretch_goal" && "Stretch"}
                          {compat.recommendation === "skip" && "Skip"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="job-details">
                    <span className="detail">
                      📍 {job.location}
                      {job.remote === "fully" && " (Remote)"}
                    </span>
                    <span className="detail">
                      💼 {job.company_size || "Unknown"} company
                    </span>
                    {job.salary_min && job.salary_max && (
                      <span className="detail">
                        💰 ${job.salary_min.toLocaleString()} - $
                        {job.salary_max.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {job.technologies && job.technologies.length > 0 && (
                    <div className="technologies">
                      {job.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                      {job.technologies.length > 3 && (
                        <span className="tech-tag">
                          +{job.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {compat && (
                    <div className="quick-stats">
                      <span className="skill-match">
                        Skills: {compat.skill_match}%
                      </span>
                      <span className="cultural-match">
                        Culture: {compat.cultural_match}%
                      </span>
                    </div>
                  )}

                  {!compat && (
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeJob(job);
                      }}
                      disabled={loading}
                    >
                      {loading ? "Analyzing..." : "Analyze"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Detail Section */}
      {selectedJob && selectedCompat && (
        <section className="job-detail">
          <h2>{selectedJob.title}</h2>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Compatibility Analysis</h3>

              <div className="score-breakdown">
                <div className="score-item">
                  <span className="label">Overall</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${selectedCompat.overall_score}%` }}
                    ></div>
                  </div>
                  <span className="value">{selectedCompat.overall_score}%</span>
                </div>

                <div className="score-item">
                  <span className="label">Skill Match</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${selectedCompat.skill_match}%` }}
                    ></div>
                  </div>
                  <span className="value">{selectedCompat.skill_match}%</span>
                </div>

                <div className="score-item">
                  <span className="label">Cultural Fit</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${selectedCompat.cultural_match}%` }}
                    ></div>
                  </div>
                  <span className="value">{selectedCompat.cultural_match}%</span>
                </div>

                <div className="score-item">
                  <span className="label">Growth Potential</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${selectedCompat.cultural_match}%` }}
                    ></div>
                  </div>
                  <span className="value">{selectedCompat.cultural_match}%</span>
                </div>
              </div>
            </div>

            {selectedCompat.strengths.length > 0 && (
              <div className="detail-section strengths">
                <h3>✓ Your Strengths</h3>
                <ul>
                  {selectedCompat.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCompat.skill_gaps.length > 0 && (
              <div className="detail-section gaps">
                <h3>⚠ Skill Gaps</h3>
                <ul>
                  {selectedCompat.skill_gaps.map((gap, idx) => (
                    <li key={idx}>
                      <span className={`gap-${gap.gap_severity}`}>
                        {gap.skill}
                      </span>
                      {gap.learnable && <span className="learnable">Learnable</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCompat.concerns.length > 0 && (
              <div className="detail-section concerns">
                <h3>⚠ Concerns</h3>
                <ul>
                  {selectedCompat.concerns.map((concern, idx) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={() => handleGenerateApplication(selectedJob)}
            >
              Generate Application
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </button>
          </div>
        </section>
      )}

      <style jsx>{`
        .hunter-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .hunter-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .hunter-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .hunter-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .hunter-search {
          background: #f5f5f5;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #0066cc;
          color: white;
          grid-column: 1 / -1;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0052a3;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .hunter-results {
          margin-bottom: 2rem;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0066cc;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-controls select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .jobs-list {
          display: grid;
          gap: 1rem;
        }

        .job-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .job-card:hover {
          border-color: #0066cc;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1);
        }

        .job-card.selected {
          border-color: #0066cc;
          background: #f0f7ff;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .job-title h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.2rem;
        }

        .company {
          color: #666;
          font-size: 0.9rem;
        }

        .score {
          text-align: center;
          padding: 0.75rem;
          border-radius: 4px;
          min-width: 80px;
        }

        .score-green {
          background: #e6f7ed;
          color: #2d6a4f;
        }

        .score-yellow {
          background: #fff8e1;
          color: #f57f17;
        }

        .score-orange {
          background: #ffe8d6;
          color: #e65100;
        }

        .score-red {
          background: #ffebee;
          color: #c62828;
        }

        .score-number {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .score-label {
          display: block;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .job-details {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #666;
          flex-wrap: wrap;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .technologies {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .tech-tag {
          background: #f0f0f0;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .quick-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .job-detail {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 2rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .detail-section {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 6px;
        }

        .detail-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .score-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .score-item .label {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .bar {
          background: #ddd;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar .fill {
          background: #0066cc;
          height: 100%;
          transition: width 0.3s;
        }

        .score-item .value {
          font-size: 0.85rem;
          color: #666;
        }

        .detail-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .detail-section li {
          padding: 0.5rem 0;
          font-size: 0.95rem;
        }

        .gap-critical {
          color: #d32f2f;
          font-weight: 600;
        }

        .gap-high {
          color: #f57c00;
          font-weight: 600;
        }

        .learnable {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 0.2rem 0.6rem;
          border-radius: 3px;
          font-size: 0.8rem;
          margin-left: 0.5rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #ddd;
        }

        .actions .btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

# Exhaustive Implementation Plan

This document outlines the remaining phases to transform the prototype into a production-ready "Blockchain CV" system.

## Phase 6: True Intelligence (Refinement)
**Goal:** Ensure the "Narrator" agent produces high-quality, distinct voices for each mask.
- [x] **Prompt Engineering**: Enhance `apps/orchestrator/src/prompts.ts` to include specific system instructions for the `narrator` role.
- [x] **Context Injection**: Ensure the `timeline` and `tags` passed to the orchestrator are formatted for maximum LLM comprehension.
- [x] **Fallback Handling**: Improve `llm-provider.ts` to handle orchestrator timeouts gracefully.

## Phase 7: Ingestion & Automation ("The Feeds")
**Goal:** Automate the population of the "Ledger" from external sources.
- [x] **GitHub Ingest Agent**: Implement `ingestor` agent for GitHub User Events and Repositories.
- [x] **LinkedIn/Resume Parser**: Build `ResumeParser` capability in `ingestor` agent to bulk-import `Experience` entities.

## Phase 8: Cryptographic Truth ("The Ledger")
**Goal:** Move from "Self-Attested" to "Verifiable".
- [x] **DID Generation**: Implement `did:key` generation for the Profile.
- [x] **Block Signing**: Sign entity hashes with the Profile's private key.
- [x] **Verification UI**: Update `ImmersiveModal` to verify signatures client-side.

## Phase 9: Deployment & Polish
**Goal:** Ship the system.
- [x] **Docker Production Build**: Optimize `Dockerfile` for multi-stage builds.
- [x] **CI/CD**: GitHub Actions for testing and linting.
- [x] **Database Persistence**: Configure PostgreSQL/Redis volume mounts.
- [x] **Public Read-Only Mode**: Refine `/share` page for standalone viewing.

## Phase 10: Theatrical Themes (Expansion)
**Goal:** Expand the visual vocabulary.
- [x] **Theme: "Academic"**: LaTeX/Paper style.
- [x] **Theme: "Futurist"**: Cyberpunk/Neon style.
- [x] **Mobile Optimization**: Responsive design.

## Track: Resilience & Semantics (Completed)
**Goal:** Harden the system and ensure semantic interoperability (SEO/Machine Readability).
- [x] **Standardized Error Taxonomy**: Created `packages/core/src/errors.ts` with `RetryableError`, `FatalError`, `RateLimitError`.
- [x] **Orchestrator Circuit Breaker**: Updated `apps/orchestrator/src/worker.ts` to handle error types with smart backoff.
- [x] **Semantic Injection (JSON-LD)**:
    - [x] **Generator Service**: Created `packages/content-model/src/json-ld.ts`.
    - [x] **Web Component**: Integrated `<StructuredData />` into `apps/web/src/app/share/[profileId]/[maskId]/page.tsx`.
    - [x] **Validation Test**: Added `packages/content-model/test/json-ld.test.ts`.

## Track: The Hunter Protocol (Active)
**Goal:** Autonomous job search and application (The "Active" Agent).

### 1. Schema & API Foundation (Completed)
- [x] **Job Entities**: `JobPosting` and `JobApplication` schemas in `packages/schema`.
- [x] **API Routes**: `jobRoutes` registered in `apps/api`.
- [x] **Job Board Adapter Interface**: `JobSearchProvider` interface defined in `packages/core`.

### 2. Job Search Infrastructure
- [ ] **Search Provider Implementation**:
    - [ ] Create `packages/core/src/search/google-jobs.ts` implementing `JobSearchProvider` using Serper or Google Custom Search API.
    - [ ] Add `SERPER_API_KEY` to `.env` and `apps/orchestrator/src/config.ts`.
- [ ] **Job Ingestion Pipeline**:
    - [ ] Update `apps/orchestrator/src/agents/ingestor.ts` to handle `ingest_job` task type.
    - [ ] Implement URL scraper to extract `description`, `company`, `title` from a job link.

### 3. The "Hunter" Agent
- [ ] **Agent Definition**:
    - [ ] Create `apps/orchestrator/src/agents/hunter.ts`.
    - [ ] Register `hunter` role in `agent-registry.json`.
- [ ] **Tool Implementation**:
    - [ ] `find_jobs(keywords, location)`: Wraps the Search Provider.
    - [ ] `analyze_gap(job_description, profile_id)`: Uses RAG to list missing skills.
    - [ ] `tailor_resume(job_id, profile_id)`: Selects the best Mask and specific Experience blocks.
    - [ ] `write_cover_letter(job_id, profile_id)`: Generates markdown cover letter.
- [ ] **Orchestration**:
    - [ ] Create a "Job Hunt Loop" in `apps/orchestrator/src/scheduler.ts` (optional) or manual trigger via API.

## Track: Autonomous Growth (Future)
**Goal:** The system proposes and implements its own features.

- [ ] **Autonomous PR Agent**:
    - [ ] **Architect Agent**: Analyzes code structure and proposes changes.
    - [ ] **Implementer Agent**: Writes code and tests.
    - [ ] **Reviewer Agent**: Critiques PRs.
    - [ ] **GitHub Integration**: Logic to checkout branch, commit, and push.

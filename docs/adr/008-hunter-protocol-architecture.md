# ADR 008: Hunter Protocol Architecture

**Status:** Accepted
**Date:** 2025-03-15
**Deciders:** Core Team

## Context

A core feature of the platform is autonomous job search and application assistance. Users should be able to:

- Search for jobs matching their profile and preferences
- Analyze compatibility between their skills and job requirements
- Generate tailored resumes for specific opportunities
- Produce personalized cover letters with appropriate tone

This requires an agent architecture that separates concerns between business logic, orchestration, and external integrations.

## Decision

Implement the Hunter Protocol as a **modular 4-tool agent** with clear separation between core logic (`packages/core`) and task orchestration (`apps/orchestrator`).

### Four Core Tools

1. **`find_jobs`** — Search job postings by keywords, location, and filters
2. **`analyze_gap`** — Score compatibility and identify skill gaps (critical/high/medium/low)
3. **`tailor_resume`** — Generate persona-filtered resume for a specific opportunity
4. **`write_cover_letter`** — Create personalized cover letter with tone adaptation

### Architecture Layers

```
packages/core/src/hunter-protocol/
├── hunter-agent.ts           # Core interface and contracts
├── job-search.ts             # JobSearchProvider abstraction + implementations
├── compatibility-analyzer.ts # Skill gap analysis with scoring
└── document-generator.ts     # Resume and cover letter generation

apps/orchestrator/src/agents/
└── hunter.ts                 # Task executor (dispatcher pattern)
```

### Provider Abstraction

Job search uses a pluggable `JobSearchProvider` interface:
- Development: Mock provider with realistic test data
- Production: Serper API integration (with plans for LinkedIn/Indeed)

### Data Flow

```
User Request → Orchestrator Task Queue → HunterAgent.execute()
  → Dispatch by action type (find/analyze/tailor/write)
  → Core business logic (packages/core)
  → Results stored via API calls
  → Task marked complete with metadata
```

## Rationale

### Why Modular Tools over Monolithic Agent?

- **Composability**: Tools can be invoked independently or chained
- **Testability**: Each tool has focused unit tests
- **Parallelism**: Independent tools can run concurrently
- **Extensibility**: New tools (e.g., `schedule_interview`) added without modifying existing ones

### Why Core/Orchestrator Split?

- **Core** contains pure business logic — no framework dependencies, fully testable
- **Orchestrator** handles side effects — task queuing, scheduling, external API calls
- Follows the project's "functional core, imperative shell" principle (ADR 001)

### Why API-Mediated Persistence?

The agent writes results through the API (not directly to DB) because:
- Validates data through the same schemas as user-facing writes
- Maintains audit trail via API middleware
- Allows the agent to run on a separate machine from the database

## Mask Integration

The Hunter Protocol integrates with the mask system (ADR 005):

- `tailor_resume` accepts a `personaId` (mask) to filter profile data
- Different masks produce different resume emphasis:
  - **Analyst mask**: Highlights data analysis, research, metrics
  - **Architect mask**: Highlights system design, scalability, leadership
  - **Executor mask**: Highlights delivery, deadlines, results

## Consequences

### Positive

- Clean separation enables independent testing of each tool
- Provider abstraction allows swapping job search APIs without code changes
- Mask integration leverages existing identity system
- Task queue provides retry and failure handling

### Negative

- Multi-step agent workflow is more complex than a simple API call
- Mock provider may diverge from real provider behavior
- API-mediated persistence adds latency vs. direct DB writes

### Neutral

- LLM integration for document generation is optional (rule-based fallback exists)
- Scheduling frequency is configurable per user

## References

- [packages/core/src/hunter-protocol/](../../packages/core/src/hunter-protocol/) — Core implementation
- [apps/orchestrator/src/agents/hunter.ts](../../apps/orchestrator/src/agents/hunter.ts) — Task executor
- [ADR 005: Mask-Based Identity System](./005-mask-based-identity.md) — Mask integration

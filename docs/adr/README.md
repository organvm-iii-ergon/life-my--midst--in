# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) documenting key architectural decisions for the **In Midst My Life** platform.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams:
- Understand why decisions were made
- Onboard new team members faster
- Revisit decisions with full context
- Avoid rehashing old debates

## Format

Each ADR follows this structure:

```markdown
# ADR NNN: Title

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Deciders:** Team/People

## Context
What is the issue we're seeing that is motivating this decision?

## Decision
What is the change we're proposing?

## Rationale
Why this decision over alternatives?

## Consequences
What becomes easier or harder by this decision?

## References
Links to related docs, discussions, code
```

## Current ADRs

### Infrastructure & Data

- [ADR 001: Monorepo Structure with pnpm Workspaces](./001-monorepo-structure.md)
  - Chose monorepo over polyrepo for type safety and code sharing
  - Selected pnpm for disk efficiency and workspace support
  - Use Turborepo for build orchestration

- [ADR 002: PostgreSQL as Primary Database](./002-postgresql-primary-database.md)
  - PostgreSQL 15 with pgvector extension
  - JSONB for flexible schema extensions
  - Native vector search for embeddings

- [ADR 003: Redis for Caching and Job Queue](./003-redis-caching-queue.md)
  - Redis for caching (with in-memory fallback)
  - BullMQ for async job processing
  - Future rate limiting support

### AI & Intelligence

- [ADR 004: Local-First LLM with Ollama](./004-local-llm-ollama.md)
  - Default to local LLMs (Ollama + llama3.1:8b)
  - Privacy-first approach
  - Optional hosted LLM support (future)

### Application Architecture

- [ADR 005: Mask-Based Identity System](./005-mask-based-identity.md)
  - Masks as contextual filters over CV data
  - Cognitive/Expressive/Operational ontologies
  - Dynamic identity projection without data duplication

- [ADR 006: Next.js 15 for Frontend with App Router](./006-nextjs-frontend.md)
  - Next.js 15 with App Router (React Server Components)
  - Tailwind CSS for styling
  - D3.js for interactive visualizations

## Status Definitions

- **Proposed**: Under discussion, not yet adopted
- **Accepted**: Decision approved and implemented
- **Deprecated**: No longer recommended, but still in use
- **Superseded**: Replaced by a newer ADR (link to new ADR)

## Creating a New ADR

1. **Copy the template**:
   ```bash
   cp adr/000-template.md adr/NNN-short-title.md
   ```

2. **Fill out sections**:
   - Be concise but complete
   - Include context for future readers
   - Document alternatives considered
   - Be honest about trade-offs

3. **Review process**:
   - Propose via PR
   - Discuss in PR comments
   - Update based on feedback
   - Merge when consensus reached

4. **Link from main docs**:
   - Reference ADRs in relevant docs
   - Keep architecture docs in sync

## Guidelines

### What Deserves an ADR?

**Yes:**
- Technology choices (database, framework, library)
- Architectural patterns (API design, data flow)
- Major abstractions (mask system, agent framework)
- Deployment strategies (Docker vs. k8s)

**No:**
- Minor library choices (date formatting, logging)
- Implementation details (function names, file structure)
- Temporary decisions (quick fixes, experiments)

### Writing Tips

- **Context First**: Explain the problem before the solution
- **Be Specific**: "We chose X" not "We might use X"
- **Document Alternatives**: Show you considered other options
- **Honest Trade-offs**: Every decision has pros and cons
- **Link Everything**: Reference specs, issues, discussions

### Updating ADRs

ADRs are **immutable once accepted**. If a decision changes:

1. **Don't edit the original ADR**
2. **Create a new ADR** that supersedes it
3. **Update the status** of the old ADR to "Superseded by ADR NNN"
4. **Link between them**

Example:
```markdown
# ADR 002: PostgreSQL as Primary Database

**Status:** Superseded by ADR 008
```

### Deprecating Decisions

When a decision is no longer recommended but still in use:

1. Change status to "Deprecated"
2. Add a section explaining why
3. Provide migration guidance if available

## Review Schedule

- **Quarterly**: Review all ADRs for currency
- **Before Major Releases**: Ensure ADRs reflect reality
- **When Onboarding**: Walk through key ADRs

## Further Reading

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard
- [ADR GitHub Organization](https://adr.github.io/)
- [Architectural Decision Records in Action](https://www.thoughtworks.com/insights/blog/architecture/architectural-decision-records-action)

---

## Index by Topic

### Infrastructure
- ADR 001: Monorepo Structure
- ADR 002: PostgreSQL Database
- ADR 003: Redis Caching

### AI/LLM
- ADR 004: Local-First LLM

### Application
- ADR 005: Mask System
- ADR 006: Next.js Frontend

### Coming Soon
- ADR 007: GraphQL vs REST API
- ADR 008: Hunter Protocol Architecture
- ADR 009: Deployment Strategy (Docker vs k8s)
- ADR 010: Authentication & Authorization

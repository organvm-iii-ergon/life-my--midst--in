# DECISION LOG
## Architecture Decision Records for in–midst–my-life

**Version**: 1.0
**Last Updated**: 2026-01-18
**Format**: [ADR](https://adr.github.io/) (Architecture Decision Records)

---

## Table of Contents

1. [ADR-001: Monorepo Structure](#adr-001-monorepo-structure)
2. [ADR-002: Schema-First Design with Zod](#adr-002-schema-first-design-with-zod)
3. [ADR-003: Hexagonal Architecture](#adr-003-hexagonal-architecture)
4. [ADR-004: Direct SQL over ORM](#adr-004-direct-sql-over-orm)
5. [ADR-005: Energy Units over Time Estimates](#adr-005-energy-units-over-time-estimates)
6. [ADR-006: Theatrical Metaphor System](#adr-006-theatrical-metaphor-system)
7. [ADR-007: Repository Pattern with Dual Implementation](#adr-007-repository-pattern-with-dual-implementation)
8. [ADR-008: TypeScript Strict Mode](#adr-008-typescript-strict-mode)
9. [ADR-009: Fastify over Express](#adr-009-fastify-over-express)
10. [ADR-010: Mask-Based Identity Filtering](#adr-010-mask-based-identity-filtering)
11. [ADR-011: Redis for Task Queue](#adr-011-redis-for-task-queue)
12. [ADR-012: Vitest over Jest](#adr-012-vitest-over-jest)
13. [ADR-013: Next.js 15 App Router](#adr-013-nextjs-15-app-router)
14. [ADR-014: Single Reviewer Requirement](#adr-014-single-reviewer-requirement)
15. [ADR-015: Advisory vs. Enforced Constraints](#adr-015-advisory-vs-enforced-constraints)

---

## ADR-001: Monorepo Structure

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need to organize multiple applications (web, API, orchestrator) and shared packages (schema, core, content-model, design-system).

### Decision
Use a **pnpm workspaces monorepo** with Turborepo for build orchestration.

### Structure
```
apps/
  web/           # Next.js frontend
  api/           # Fastify REST API
  orchestrator/  # Worker service
packages/
  schema/        # Zod schemas (foundation)
  core/          # Business logic
  content-model/ # Narrative generation
  design-system/ # UI primitives
```

### Rationale
1. **Shared code**: Schema and utilities needed across all apps
2. **Atomic commits**: Related changes across packages in single commit
3. **Dependency graph**: Turborepo understands build order
4. **Single lockfile**: Consistent dependencies across workspace

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Polyrepo (separate repos) | Schema changes require synchronized releases |
| Nx | Heavier than needed for this project size |
| Lerna | Deprecated in favor of native workspace managers |
| Yarn workspaces | pnpm offers better disk efficiency and strictness |

### Consequences
- (+) Single `pnpm install` sets up everything
- (+) Import paths like `@in-midst-my-life/schema` work naturally
- (-) CI must be smart about partial builds (Turbo handles this)
- (-) Repository grows larger over time

---

## ADR-002: Schema-First Design with Zod

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need consistent data models across frontend, backend, and orchestrator.

### Decision
Use **Zod** for schema definition as the single source of truth. All TypeScript types are derived from Zod schemas via `z.infer<>`.

### Location
All schemas live in `packages/schema/src/`:
- `identity.ts`, `profile.ts`, `mask.ts`, `epoch.ts`, `stage.ts`, etc.

### Rationale
1. **Runtime validation**: Zod validates at runtime, not just compile time
2. **Type inference**: `z.infer<typeof Schema>` generates TypeScript types
3. **Composability**: Schemas can extend/merge other schemas
4. **No codegen**: Unlike OpenAPI or GraphQL, no separate generation step
5. **Error messages**: Zod provides detailed validation error messages

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| TypeScript interfaces only | No runtime validation |
| JSON Schema | Requires separate codegen for TypeScript |
| io-ts | Steeper learning curve, less active maintenance |
| Yup | Less powerful type inference |
| OpenAPI-first | Adds codegen complexity, less natural for TS |

### Consequences
- (+) Single source of truth for types and validation
- (+) API request/response validation uses same schemas
- (+) Frontend can import and use same schemas
- (-) Zod bundle size added to frontend (mitigated by tree-shaking)
- (-) Must remember to update schemas first before implementation

---

## ADR-003: Hexagonal Architecture

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need clean separation between business logic and framework concerns.

### Decision
Adopt **hexagonal architecture (ports and adapters)** for the API service:

```
routes/       → Thin HTTP handlers (adapters)
  ↓
services/     → Pure business logic (core)
  ↓
repositories/ → Data access interfaces (ports)
  ↓
db/           → Postgres/Redis implementations (adapters)
```

### Rationale
1. **Testability**: Services can be tested without HTTP framework
2. **Framework independence**: Could swap Fastify for Hono without touching services
3. **Clear boundaries**: Forces explicit dependencies
4. **Maintainability**: Business rules isolated from infrastructure

### Implementation
- **Routes** accept Fastify request/reply, validate input, call services
- **Services** contain pure business logic, accept repository interfaces
- **Repositories** abstract data access, return domain objects
- **DB** implements repository interfaces with actual Postgres/Redis calls

### Consequences
- (+) Easy to unit test services with mock repositories
- (+) Clear separation of concerns
- (-) More files and indirection
- (-) Requires discipline to maintain boundaries

---

## ADR-004: Direct SQL over ORM

**Date**: 2025-12-27
**Status**: Accepted
**Context**: Need database access for profiles, masks, epochs, and other entities.

### Decision
Use **direct SQL via pg.Pool** instead of an ORM like Drizzle or Prisma.

### Rationale
1. **Transparency**: SQL is explicit; no magic or hidden queries
2. **Performance**: Direct control over query construction
3. **Simplicity**: No ORM configuration, migrations, or abstractions
4. **Learning**: Developers understand actual database operations
5. **Flexibility**: Complex queries (window functions, CTEs) are natural

### Implementation
- Connection pool created with `pg.Pool`
- Repository methods execute parameterized SQL
- Results mapped to TypeScript types manually
- Migrations are raw SQL files in `apps/*/migrations/`

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Drizzle ORM | Added abstraction layer without clear benefit |
| Prisma | Heavy runtime, opinionated schema management |
| Knex | Query builder adds complexity without full ORM |
| TypeORM | Decorator-heavy, runtime metadata issues |

### Note
`seed.yaml` and `CONSOLIDATED-SPECIFICATIONS.md` mention drizzle-orm. This was an early consideration that was **not implemented**. The actual codebase uses direct SQL.

### Consequences
- (+) Full control over queries
- (+) No ORM version compatibility issues
- (+) Simpler debugging (just SQL)
- (-) Manual mapping from rows to objects
- (-) Must write migrations by hand
- (-) More verbose for simple CRUD

---

## ADR-005: Energy Units over Time Estimates

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need a planning methodology that doesn't create deadline pressure.

### Decision
Use **Energy Units (EU)** as an abstract measure of effort instead of hours or days.

### Definition
- 1 EU = abstract unit of development capacity
- **Deliberately undefined** in terms of calendar time
- Focuses on relative effort, not duration

### Rationale
1. **No deadline pressure**: Removes artificial time constraints
2. **Capacity-focused**: Plans based on effort investment, not speed
3. **Flexible pacing**: Same EU can take different calendar time
4. **Honest estimation**: Easier to estimate "this is 3x harder" than "this takes 6 hours"

### Usage
- Roadmap phases measured in EU (e.g., Phase 0 = 12 EU)
- Features estimated in EU during planning
- Velocity tracked as EU/week (if desired)

### Consequences
- (+) Reduces estimation anxiety
- (+) Allows honest complexity assessment
- (+) Adapts to variable availability
- (-) Hard to give external stakeholders calendar dates
- (-) May need translation for project management tools

---

## ADR-006: Theatrical Metaphor System

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need a conceptual framework for context-specific identity presentation.

### Decision
Adopt a **theatrical metaphor** for the identity system:

| Term | Meaning |
|------|---------|
| **Mask** | Context-specific identity filter |
| **Epoch** | Temporal period in professional evolution |
| **Scaenae** | Stages/contexts where different masks are appropriate |
| **Tabula Personarum** | Registry of available masks |
| **Aetas** | Timeline showing epoch progression |

### Rationale
1. **Rich semantics**: More expressive than "filter" or "view"
2. **Cultural resonance**: Theatrical concepts are widely understood
3. **Philosophical depth**: Masks aren't deception — they're perspectives
4. **Differentiation**: Unique vocabulary distinguishes from competitors
5. **Extensibility**: Metaphor supports future features (directors, critics, etc.)

### Covenant
This metaphor is **non-negotiable**. All implementations must honor the theatrical framework. See `docs/COVENANT.md`.

### Consequences
- (+) Strong product identity and positioning
- (+) Rich vocabulary for complex concepts
- (+) Philosophical foundation for design decisions
- (-) Learning curve for new contributors
- (-) May confuse users expecting standard resume terminology

---

## ADR-007: Repository Pattern with Dual Implementation

**Date**: 2025-12-27
**Status**: Accepted
**Context**: Need testable data access layer that works with both real databases and tests.

### Decision
Implement **repository pattern** with two implementations:
1. **MemoryRepository**: In-memory for unit tests
2. **PostgresRepository**: Real database for integration/production

### Interface
```typescript
interface ProfileRepository {
  findById(id: string): Promise<Profile | null>
  findAll(): Promise<Profile[]>
  create(data: CreateProfileInput): Promise<Profile>
  update(id: string, data: UpdateProfileInput): Promise<Profile>
  delete(id: string): Promise<void>
}
```

### Rationale
1. **Fast tests**: Unit tests don't need database
2. **Isolation**: Tests don't affect each other
3. **CI simplicity**: Can run tests without external services
4. **Flexibility**: Easy to add Redis, cache, or other implementations

### Consequences
- (+) Tests run in milliseconds
- (+) Can test error conditions easily
- (+) Clear interface for data access
- (-) Must maintain two implementations
- (-) Memory implementation might diverge from real behavior

---

## ADR-008: TypeScript Strict Mode

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need maximum type safety across the codebase.

### Decision
Enable **all strict TypeScript flags** in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true
  }
}
```

### Rationale
1. **Catch bugs early**: Stricter checks find issues at compile time
2. **Self-documenting**: Types serve as documentation
3. **Refactoring safety**: Compiler catches breaking changes
4. **Team alignment**: Everyone follows same rules

### Consequences
- (+) Fewer runtime type errors
- (+) Better IDE support and autocomplete
- (+) Easier onboarding (code is self-explanatory)
- (-) Initial overhead when writing code
- (-) External library types may be incomplete

---

## ADR-009: Fastify over Express

**Date**: 2025-12-27
**Status**: Accepted
**Context**: Need HTTP framework for REST API.

### Decision
Use **Fastify** for all backend services (API and orchestrator).

### Rationale
1. **Performance**: Fastify is significantly faster than Express
2. **Schema validation**: Native support for JSON Schema validation
3. **TypeScript**: Better TypeScript support out of the box
4. **Plugins**: Excellent plugin architecture
5. **Async/await**: First-class async support

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Express | Slower, middleware-based, less TypeScript-native |
| Hono | Newer, less ecosystem maturity |
| Koa | Smaller ecosystem, manual middleware |
| NestJS | Too opinionated and heavy for this project |

### Consequences
- (+) Fast request handling
- (+) Built-in validation
- (+) Excellent docs and community
- (-) Different API surface than Express (learning curve)
- (-) Some Express middleware doesn't work directly

---

## ADR-010: Mask-Based Identity Filtering

**Date**: 2025-12-26
**Status**: Accepted
**Context**: Need to generate context-specific résumés from a single CV.

### Decision
Implement **mask-based filtering** where each mask defines:
- Content filters (include/exclude tags)
- Priority weights (which content to emphasize)
- Stylistic parameters (tone, compression ratio)
- Activation rules (contexts that trigger the mask)

### Algorithm
```typescript
// packages/core/src/maskMatching.ts
function rankMasks(context: Context, masks: Mask[]): RankedMask[] {
  // 1. Match masks to context tags
  // 2. Score by relevance and activation rules
  // 3. Return ranked list
}

function applyMask(profile: Profile, mask: Mask): FilteredProfile {
  // 1. Filter content by mask rules
  // 2. Reweight narrative blocks
  // 3. Adjust presentation style
}
```

### Rationale
1. **Single source of truth**: One CV, many views
2. **Context sensitivity**: Right presentation for right audience
3. **Identity preservation**: Invariants remain constant across masks
4. **Composability**: Masks can potentially be combined

### Consequences
- (+) Flexible identity presentation
- (+) Maintains data integrity
- (+) Enables sophisticated matching
- (-) Complex filtering logic
- (-) Must validate mask configurations

---

## ADR-011: Redis for Task Queue

**Date**: 2025-12-27
**Status**: Accepted
**Context**: Orchestrator needs a task queue for worker dispatch.

### Decision
Use **Redis** with a custom queue implementation rather than a dedicated queue service.

### Implementation
- Tasks stored as JSON in Redis lists
- Worker loop polls with `BRPOPLPUSH`
- Task history stored for debugging
- Uses `ioredis` client library

### Rationale
1. **Simplicity**: Redis is already used for caching
2. **Speed**: Sub-millisecond operations
3. **Flexibility**: Can implement custom queue semantics
4. **Observability**: Easy to inspect queue state

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| BullMQ | Added complexity for simple use case |
| RabbitMQ | Separate service to manage |
| AWS SQS | Cloud lock-in, cost |
| Kafka | Overkill for current scale |

### Consequences
- (+) Simple implementation
- (+) One less service to manage
- (+) Full control over queue behavior
- (-) Must implement reliability features manually
- (-) No built-in retry/backoff (must implement)

---

## ADR-012: Vitest over Jest

**Date**: 2025-12-27
**Status**: Accepted
**Context**: Need a testing framework for unit and integration tests.

### Decision
Use **Vitest** for all testing.

### Rationale
1. **Speed**: Native ESM, much faster than Jest
2. **Compatibility**: Jest-compatible API (easy migration)
3. **TypeScript**: First-class TypeScript support
4. **Vite integration**: Works well with Vite-based tooling
5. **Watch mode**: Excellent developer experience

### Configuration
- Coverage thresholds: 75% statements, branches, functions, lines
- Coverage only runs in CI (`CI=true pnpm test`)
- Integration tests gated by `INTEGRATION_*` env vars

### Consequences
- (+) Fast test execution
- (+) Great DX with watch mode
- (+) Native ESM support
- (-) Smaller ecosystem than Jest
- (-) Some Jest plugins don't work

---

## ADR-013: Next.js 15 App Router

**Date**: 2025-12-27
**Status**: Accepted
**Context**: Need frontend framework for web application.

### Decision
Use **Next.js 15** with the **App Router** (not Pages Router).

### Rationale
1. **Server Components**: Better performance, less client JS
2. **Streaming**: Progressive rendering
3. **Layouts**: Nested layouts without prop drilling
4. **Modern React**: Full React 19 features
5. **Vercel deployment**: Easy deployment path

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Pages Router | Legacy, being deprecated |
| Remix | Good but smaller ecosystem |
| SvelteKit | Would require learning Svelte |
| Astro | Less suitable for interactive app |

### Consequences
- (+) Modern React patterns
- (+) Excellent performance
- (+) Strong community support
- (-) App Router still evolving
- (-) Some libraries not yet compatible

---

## ADR-014: Single Reviewer Requirement

**Date**: 2025-12-28
**Status**: Accepted (with concern noted)
**Context**: Need merge policy for pull requests.

### Decision
Require review from **"4jp"** for all merges.

### Rationale
1. **Quality control**: Ensures consistent standards
2. **Knowledge transfer**: Single reviewer sees all changes
3. **Early stage**: Project is still stabilizing

### Risk
**Bus factor = 1**: If reviewer is unavailable, no merges can happen.

### Mitigation (Recommended)
Add additional reviewers before production deployment:
- At least 2 approved reviewers
- One can be AI-assisted review tools

### Consequences
- (+) Consistent quality standards
- (+) Single point of knowledge
- (-) Bottleneck risk
- (-) Single point of failure

---

## ADR-015: Advisory vs. Enforced Constraints

**Date**: 2025-12-28
**Status**: Accepted
**Context**: seed.yaml defines constraints (file size, function length, etc.) but states "Enforced: false".

### Decision
Constraints in seed.yaml are **policy**, not **automated enforcement**.

### Constraints (Advisory)
| Constraint | Limit | Status |
|------------|-------|--------|
| Max lines per file | 1200 | Advisory |
| Max function length | 200 LOC | Advisory |
| Max cyclomatic complexity | 10 | Advisory |
| Max cognitive complexity | 15 | Advisory |

### Rationale
1. **Pragmatism**: Sometimes constraints must be exceeded
2. **Judgment**: Humans/AI decide when to break rules
3. **Evolution**: Constraints can be adjusted based on experience

### Future
Consider adding ESLint rules to enforce some constraints:
- `max-lines` for file size
- `max-lines-per-function` for function length
- `complexity` for cyclomatic complexity

### Consequences
- (+) Flexibility when needed
- (+) Guidelines without rigidity
- (-) Constraints may be ignored
- (-) Inconsistent application

---

## Pending Decisions

These decisions are not yet finalized and need further discussion:

### API Versioning Strategy
**Question**: How to version the API for breaking changes?
**Options**: URL versioning (`/v1/`), header versioning, no versioning (semver)
**Status**: Needs decision before v1.0 release

### Authentication Strategy
**Question**: How to authenticate users in production?
**Options**: JWT, session cookies, OAuth2, DID-based
**Status**: Security implications need review

### Scaling Strategy
**Question**: How to handle increased load?
**Options**: Read replicas, connection pooling, horizontal scaling
**Status**: Needs load testing baseline first

---

## Decision Template

For future decisions, use this template:

```markdown
## ADR-XXX: [Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded
**Context**: What is the issue that requires a decision?

### Decision
What is the change being proposed?

### Rationale
Why is this the right decision? List reasons.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| ... | ... |

### Consequences
- (+) Positive outcome
- (-) Negative outcome
```

---

## Related Documents

- [seed.yaml](seed.yaml) — Repository constraints and governance
- [DEFINITIONS.md](DEFINITIONS.md) — Unified glossary
- [CONSOLIDATED-SPECIFICATIONS.md](CONSOLIDATED-SPECIFICATIONS.md) — Technical specifications
- [ARCH-*.md](ARCH-001-system-architecture.md) — Original architecture conversations

---

**Document Authority**: This log records architectural decisions with their rationale. When understanding "why" something is built a certain way, consult this document first.

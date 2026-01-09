# in–midst–my-life

> **Interactive CV/Résumé System**: A blockchain-inspired, mask-based identity platform for dynamic professional narratives

[![Status](https://img.shields.io/badge/status-design%20phase-blue)]()
[![Documentation](https://img.shields.io/badge/docs-comprehensive-green)]()
[![Energy Units](https://img.shields.io/badge/roadmap-37%20EU-orange)]()

---

## 🎯 Vision

Transform the static CV/résumé into a **living, queryable, multi-dimensional identity system** that:

- **Functions like a blockchain**: CV as immutable ledger, résumé as derived state snapshot
- **Uses identity masks**: Context-specific projections (Academic, Artistic, Technical, etc.)
- **Enables temporal navigation**: Professional epochs from Initiation → Mastery → Legacy
- **Provides verification**: W3C Verifiable Credentials and DID integration
- **Grows autonomously**: Multi-agent system that writes and maintains its own code

---

## 🚀 Quick Start

### For Readers & Implementers

**Start here** to understand the system:

1. **[MANIFEST.md](MANIFEST.md)** - Complete overview and file organization
2. **[META-001-project-bible.md](META-001-project-bible.md)** - Consolidated design document
3. **[CONSOLIDATED-SPECIFICATIONS.md](CONSOLIDATED-SPECIFICATIONS.md)** - Technical specifications
4. **[seed.yaml](seed.yaml)** - Repository "genome" defining all constraints

### For Developers

```bash
# 1. Clone and explore
git clone <your-repo-url>
cd life-my--midst--in

# 2. Review the documentation structure
ls -1 {FOUND,SPEC,ARCH,PLAN,WORK,ORCH,META}-*.md

# 3. Read the essential documents
cat MANIFEST.md                              # System overview
cat CONSOLIDATED-SPECIFICATIONS.md           # Technical specs
cat seed.yaml                                # Development constraints

# 4. When ready to implement, see:
cat QUICKSTART.md                            # Step-by-step implementation guide
```

---

## 🗄️ Database Migrations & Seeds

- **Services**: Postgres + Redis via `docker-compose.yml` (`scripts/dev-up.sh` spins them up, `scripts/dev-shell.sh` opens psql/redis-cli).
- **Environment**: set `DATABASE_URL`/`POSTGRES_URL` for API and `DATABASE_URL`/`ORCH_TASK_STORE=postgres` plus `REDIS_URL` for orchestrator. Keep dev/test names distinct (e.g., `midst_dev`, `midst_test`, `midst_integration`).
- **Run migrations**: `pnpm --filter @in-midst-my-life/api migrate` and `pnpm --filter @in-midst-my-life/orchestrator migrate` (idempotent and safe to re-run).
- **Seed data**: `pnpm --filter @in-midst-my-life/api seed` and `pnpm --filter @in-midst-my-life/orchestrator seed` populate demo rows. Seeds use `ON CONFLICT DO NOTHING` upserts, so repeated runs are safe across environments.
- **Taxonomy storage**: masks/epochs/stages now live in Postgres (`masks`, `epochs`, `stages` tables) with seeds for SPEC-003 taxonomy; API routes under `/taxonomy/*`.
- **Isolation**: point integration tests to `INTEGRATION_POSTGRES_URL`/`INTEGRATION_REDIS_URL` to avoid touching dev data; migrations respect whatever URL you provide.
- **Full stack dev**: `docker-compose up api orchestrator web` brings up DB/Redis + services; the web dashboard (http://localhost:3000) includes timeline/graph/gallery views plus the Admin Studio. Override `NEXT_PUBLIC_API_BASE_URL`/`NEXT_PUBLIC_ORCH_BASE_URL` in `.env` if needed. Helm chart scaffold lives in `infra/helm` for k8s deploys.
- **One-shot migrations in compose**: `docker-compose --profile init run --rm migrations` applies API + Orchestrator migrations/seeds before starting the rest of the stack.

## 🔌 API & Orchestrator Endpoints
- OpenAPI: `apps/api/openapi.yaml` (served at `/openapi.yaml` when API runs).
- Health: `/health`, readiness: `/ready`, metrics: `/metrics` (Prometheus format) on both API (port 3001) and Orchestrator (port 3002). In prod, gate `/metrics` behind network/ingress auth or a scrape token; scrape with `Accept: text/plain; version=0.0.4`.
- Taxonomy: `/taxonomy/masks|epochs|stages` with pagination/filters; profiles under `/profiles/*`; orchestrator tasks under `/tasks`, `/tasks/:id/history`, and GitHub webhook at `/webhooks/github`.
- Narrative contracts: `POST /profiles/{id}/masks/select` accepts `{ contexts, tags, limit }`; `POST /profiles/{id}/narrative` accepts `{ maskId?, contexts, tags, timeline[] }` and returns weighted blocks (Identity Mode, Stage Context, Timeline Sequence, etc.).
- Exports: `/profiles/{id}/export/jsonld`, `/profiles/{id}/export/vc`, `/profiles/{id}/export/pdf`.
- Integration env flags: `INTEGRATION_POSTGRES_URL`, `INTEGRATION_REDIS_URL` gate live DB/queue tests; absent values skip suites.
- Sample env: `.env.integration.example` contains URLs for Postgres/Redis integration runs.

### Metrics & Health Scraping
- API/Orchestrator return `status: ok` JSON on `/health` and 200 on `/ready` when dependencies respond. Expect 503 on degraded repos/queues (see tests).
- Metrics are Prometheus text; example scrape: `curl -s ${API_BASE}/metrics | grep api_requests_total`. Add ingress auth (basic/OIDC) or source IP allowlists before exposing.
- Compose: `curl localhost:3001/metrics` and `localhost:3002/metrics`. Helm: point Prometheus ServiceMonitor at `port: 3001/3002`.

---

## 📚 Repository Structure

This repository contains **32 organized design documents** from extensive ChatGPT conversations, plus comprehensive implementation artifacts.

### File Organization

```
📁 life-my--midst--in/
│
├── 📄 README.md                              ← You are here
├── 📄 MANIFEST.md                            ← Complete file catalog and dependency graph
├── 📄 CONSOLIDATED-SPECIFICATIONS.md         ← All technical specs in one place
├── 📄 seed.yaml                              ← Repository genome (constraints & rules)
├── 📄 CLAUDE.md                              ← Guidance for Claude Code AI
├── 📄 docs/SECURITY.md                       ← Security checklist for secrets, ingress, and env isolation
├── 📄 FILE-REORGANIZATION-PLAN.md            ← How files were organized
│
├── 📁 FOUNDATIONAL CONCEPTS [FOUND-*]        5 files
│   ├── FOUND-001-blockchain-cv-analogy.md    Core architectural metaphor
│   ├── FOUND-002-blockchain-cv-vs-resume.md  CV vs résumé distinction
│   ├── FOUND-003-meta-latin-etymology.md     Linguistic foundations
│   ├── FOUND-004-identity-narrative-questions.md  8 foundational identity questions
│   └── FOUND-005-prospecting-research-prompts.md  Deep research frameworks
│
├── 📁 CORE SPECIFICATIONS [SPEC-*]           4 files
│   ├── SPEC-001-data-schema.md               Complete TypeScript schema
│   ├── SPEC-002-system-design.md             System design specification
│   ├── SPEC-003-mask-taxonomy.md             15+ identity masks defined
│   └── SPEC-004-json-schemas.md              JSON Schema definitions
│
├── 📁 ARCHITECTURE & TECHNICAL [ARCH-*]      5 files
│   ├── ARCH-001-system-architecture.md       Multi-layer system architecture
│   ├── ARCH-002-repository-layout.md         Monorepo structure
│   ├── ARCH-003-cicd-pipeline.md             GitHub Actions workflows
│   ├── ARCH-004-monorepo-alternatives.md     Alternative structures
│   └── ARCH-005-monorepo-generator.md        Executable Python scaffold script
│
├── 📁 PLANNING & ROADMAP [PLAN-*]            4 files
│   ├── PLAN-001-product-roadmap.md           7 phases, 37 energy units
│   ├── PLAN-002-effort-timeline.md           Energy-based timeline
│   ├── PLAN-003-action-items.md              Immediate next steps
│   └── PLAN-004-task-breakdown.md            Task decomposition
│
├── 📁 WORKFLOWS & AUTOMATION [WORK-*]        5 files
│   ├── WORK-001-content-pipeline.md          Content workflows
│   ├── WORK-002-automation-spec.md           Automation specifications
│   ├── WORK-003-bpmn-diagrams.md             Process diagrams
│   ├── WORK-004-orchestration-graphs.md      LangGraph + CrewAI specs
│   └── WORK-005-autonomous-code-growth.md    🔥 Self-growing codebase system
│
├── 📁 INTEGRATION & ORCHESTRATION [ORCH-*]   5 files
│   ├── ORCH-001-agent-meta-prompt.md         AI agent instructions
│   ├── ORCH-002-execution-strategy.md        Implementation sequencing
│   ├── ORCH-003-resource-allocation.md       Resource distribution
│   ├── ORCH-004-template-system.md           Code generation templates
│   └── ORCH-005-master-index.md              Cross-reference system
│
└── 📁 META-ORGANIZATION [META-*]             4 files
    ├── META-001-project-bible.md             🔥 Complete consolidated design
    ├── META-002-thread-enumeration.md        Thread tracking
    ├── META-003-dependency-graph.md          Inter-document dependencies
    └── META-004-vision-deck.md               Presentation materials
```

---

## 🧬 Core Concepts

### 1. Blockchain-as-CV Analogy

The foundational architectural metaphor:

| Blockchain | CV System |
|------------|-----------|
| **Complete ledger** | Curriculum Vitae (full history) |
| **State snapshot** | Résumé (context-specific view) |
| **Consensus & signatures** | Verifiable Credentials |
| **DID / Wallet** | Professional identity |
| **Immutability** | Append-only work history |
| **Zero-knowledge proofs** | Selective disclosure |

**Key Insight**: Store the CV as master ledger, generate many résumés as derived proof objects.

### 2. Identity Mask System

**15+ functional, non-branded masks** for context-specific presentation:

**Cognitive Masks**:
- Analyst, Synthesist, Observer, Strategist, Speculator, Interpreter

**Expressive Masks**:
- Artisan, Architect, Narrator, Provoker, Mediator

**Operational Masks**:
- Executor, Steward, Integrator, Custodian, Calibrator

Each mask filters the same underlying data differently, preserving identity invariants while changing presentation.

### 3. Temporal Epochs

Professional life organized into **meaningful periods**:

```
Initiation → Expansion → Consolidation → Divergence →
Mastery → Reinvention → Transmission → Legacy
```

Non-chronological, functional time-blocks that map identity evolution.

### 4. Autonomous Development

**Revolutionary approach**: Repository as living system with formal "genome" ([seed.yaml](seed.yaml))

**Multi-Agent Crew**:
```
Architect → Implementer → Reviewer → Tester → Maintainer
```

- Agents generate code through GitHub Actions
- Self-correcting through PR review process
- Grows within defined constraints
- Human-in-loop initially, progressively autonomous

---

## 🛠️ Technology Stack

### Planned Implementation

**Frontend**:
- Next.js 15 with React Server Components
- TypeScript (strict mode)
- TailwindCSS

**Backend**:
- Node 22+ / TypeScript
- Fastify for APIs
- GraphQL (optional, later phase)

**Data Layer**:
- PostgreSQL (primary)
- Neo4j or ArangoDB (graph DB for career relationships)
- Pinecone or pgvector (semantic search)
- Redis (caching)
- Kafka/NATS (message queue)

**Blockchain/Web3**:
- W3C Verifiable Credentials
- DID methods (did:ethr, did:web)
- Optional: Ethereum for Soulbound Tokens

**Infrastructure**:
- Vercel (web hosting)
- Fly.io or Railway (API hosting)
- GitHub Actions (CI/CD)
- Kubernetes (orchestration)

## 🔐 Security & Env Hygiene
- Never commit secrets. Use `.env`/`.env.local` and keep `DATABASE_URL`, `REDIS_URL`, and any optional hosted-provider keys out of git; prefer `doppler`, `1password`, or platform secrets managers.
- Default to open-source, free-usage APIs/models; add proprietary providers only if explicitly needed later.
- Maintain per-env DBs (`midst_dev`, `midst_test`, `midst_integration`) and unique Redis namespaces/keys. Integration suites honor `INTEGRATION_*` URLs and skip when absent.
- Migrations/seeds are idempotent; safe to re-run during deploy hooks (Helm/compose migration steps are documented in `infra/README.md`).
- API/Orchestrator metrics and health endpoints are public in dev; restrict/behind auth in prod ingress.

---

## 📈 Roadmap

**Energy-Based Planning** (37 Energy Units total, no calendar time):

| Phase | Focus | EU | Status |
|-------|-------|---:|--------|
| **0** | Foundation & Setup | - | 🟢 In Progress |
| **1** | Foundational Architecture | 4 | ⚪ Planned |
| **2** | Core Engine & Data | 6 | ⚪ Planned |
| **3** | Interaction Layer | 5 | ⚪ Planned |
| **4** | Authoring Studio | 7 | ⚪ Planned |
| **5** | Presentation & Export | 4 | ⚪ Planned |
| **6** | Intelligence & Autonomy | 8 | ⚪ Planned |
| **7** | Deployment & Reliability | 3 | ⚪ Planned |

**Current Phase 0 Progress**:
- ✅ All design documents created and organized
- ✅ Complete specifications consolidated
- ✅ Repository genome (seed.yaml) defined
- ✅ File organization system implemented
- 🔄 Implementation artifacts being extracted
- ⏳ Monorepo scaffold generation next

See **[PLAN-001-product-roadmap.md](PLAN-001-product-roadmap.md)** for complete phase breakdown.

---

## 🎓 Key Documents

### Essential Reading (Start Here)

1. **[MANIFEST.md](MANIFEST.md)** - Complete catalog and dependency graph
2. **[META-001-project-bible.md](META-001-project-bible.md)** - Consolidated design document
3. **[CONSOLIDATED-SPECIFICATIONS.md](CONSOLIDATED-SPECIFICATIONS.md)** - All technical specs
4. **[FOUND-001-blockchain-cv-analogy.md](FOUND-001-blockchain-cv-analogy.md)** - Core concept
5. **[WORK-005-autonomous-code-growth.md](WORK-005-autonomous-code-growth.md)** - Revolutionary development approach

### Implementation References

6. **[SPEC-001-data-schema.md](SPEC-001-data-schema.md)** - Complete data model
7. **[ARCH-001-system-architecture.md](ARCH-001-system-architecture.md)** - System design
8. **[ARCH-005-monorepo-generator.md](ARCH-005-monorepo-generator.md)** - Scaffold generator
9. **[seed.yaml](seed.yaml)** - Repository constraints and rules
10. **[CLAUDE.md](CLAUDE.md)** - Guidance for AI assistants

---

## 🚧 Current Status: Design Phase Complete

### ✅ Completed

- [x] 33 ChatGPT conversations exported and analyzed
- [x] Complete conceptual framework established
- [x] Comprehensive specifications written
- [x] System architecture designed
- [x] File organization system implemented
- [x] Repository genome (seed.yaml) created
- [x] All documentation consolidated

### 🔄 In Progress

- [ ] Extracting executable code artifacts
- [ ] Creating implementation quickstart guide
- [ ] Preparing monorepo scaffold

### ⏳ Next Steps

1. Run monorepo generator script (ARCH-005)
2. Set up initial TypeScript project structure
3. Implement schema package (SPEC-001)
4. Begin Phase 1 development (see PLAN-001)

---

## 🤝 Contributing

This project is currently in the **design and architecture phase**.

Implementation will follow the autonomous development model described in [WORK-005](WORK-005-autonomous-code-growth.md), where:

1. **Human** defines the task or epic
2. **Architect Agent** breaks it down
3. **Implementer Agent** writes code
4. **Reviewer Agent** provides feedback
5. **Tester Agent** improves coverage
6. **Maintainer Agent** approves for merge
7. **Human** provides final approval (initially)

All development must follow constraints in [seed.yaml](seed.yaml).

---

## 📖 Eight Foundational Identity Questions

Every implementation decision must address these invariants (from FOUND-004):

1. **What is the core identity/thesis that remains invariant?**
2. **Which claims require external verification?**
3. **What temporal arcs define identity evolution?**
4. **Which contradictions exist and how are they treated?**
5. **What non-obvious intellectual lineages should be included?**
6. **What strategic differentiators are overlooked?**
7. **Which identity components must be modular/mask-based?**
8. **What would skeptics challenge, and what evidence counters them?**

---

## 🔗 Related Resources

### Internal References
- [File Reorganization Plan](FILE-REORGANIZATION-PLAN.md)
- [Consolidated Specifications](CONSOLIDATED-SPECIFICATIONS.md)
- [Repository Genome](seed.yaml)

### External Standards
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [W3C Decentralized Identifiers](https://www.w3.org/TR/did-core/)
- [Schema.org Person](https://schema.org/Person)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

## 📝 License

*To be determined during implementation phase*

---

## 💡 Acknowledgments

This system design was developed through 33 extensive conversations exploring:
- Identity architecture and narrative systems
- Blockchain-inspired data structures
- Multi-agent autonomous development
- Temporal and contextual professional identity
- Verifiable credential integration

All conversations have been preserved, organized, and consolidated in this repository.

---

## 📞 Contact

**Project Owner**: 4jp
**Status**: Design Phase → Implementation Preparation
**Last Updated**: 2025-12-26

---

<div align="center">

**in–midst–my-life**
*Transforming professional identity from static document to living system*

[View Manifest](MANIFEST.md) • [Read Specs](CONSOLIDATED-SPECIFICATIONS.md) • [See Roadmap](PLAN-001-product-roadmap.md)

</div>

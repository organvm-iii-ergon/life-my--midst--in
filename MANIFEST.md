# PROJECT MANIFEST
## in–midst–my-life: Interactive CV/Résumé System

**Version**: 2.0
**Last Updated**: 2026-01-18
**Implementation Status**: 90% Core Complete

---

## Executive Summary

This repository contains the **implemented** interactive CV/résumé system "in–midst–my-life" — a programmable, multi-layered, agent-driven identity architecture. The system transforms a static resume into a dynamic, queryable, multi-perspective profile with mask-based identity filtering and blockchain-inspired verification capabilities.

**Core Innovation**: Treating a CV as a verifiable, append-only ledger (analogous to blockchain) from which multiple résumé "views" can be derived as contextual, mask-filtered snapshots.

**Origin**: Compiled from 33 ChatGPT conversations, now evolved into a working monorepo implementation.

---

## Implementation Status

### What's Built (90%)

| Component | Status | Details |
|-----------|--------|---------|
| **Monorepo Structure** | ✅ Complete | 3 apps, 4 packages, proper workspace config |
| **Schema Package** | ✅ Complete | 21+ Zod schemas for all entities |
| **API Service** | ✅ Complete | 50+ endpoints, health/metrics/OpenAPI |
| **Orchestrator Service** | ✅ Complete | Task queue, webhooks, 9 agent roles |
| **Web Frontend** | ✅ Complete | 40+ components, dashboard, mask editor prototype |
| **Database Layer** | ✅ Complete | Postgres + Redis, migrations, seeds |
| **Test Infrastructure** | ✅ Complete | 69 test files, 75% coverage threshold |
| **Content Model** | ✅ Complete | Narrative generation, mask taxonomy |
| **Core Business Logic** | ✅ Complete | Mask matching, verification utilities |

### What's Remaining (10%)

| Component | Status | Gap |
|-----------|--------|-----|
| **Hunter Protocol** | 🟡 60% | Search provider partial, agent tools partial |
| **Theatrical UI Polish** | 🟡 70% | Components built, animations incomplete |
| **Monetization** | ❌ 0% | Stripe integration, billing, feature gates |
| **Production Deployment** | ❌ 0% | Vercel, Neon, Upstash, CI/CD |
| **Marketing** | ❌ 0% | Landing page, docs site, demo |

---

## Repository Structure

```
life-my--midst--in/
│
├── 📁 apps/                          # Deployable applications
│   ├── web/                          # Next.js 15 dashboard (:3000)
│   ├── api/                          # Fastify REST API (:3001)
│   └── orchestrator/                 # Node.js worker service (:3002)
│
├── 📁 packages/                      # Shared libraries
│   ├── schema/                       # Zod schemas & TypeScript types
│   ├── core/                         # Business logic, mask matching
│   ├── content-model/                # Narrative generation, JSON-LD
│   └── design-system/                # UI primitives
│
├── 📁 infra/                         # Infrastructure
│   ├── docker-compose.yml            # Local development stack
│   ├── Dockerfile                    # Container build
│   └── helm/                         # Kubernetes charts (scaffold)
│
├── 📁 docs/                          # Documentation
│   ├── SECURITY.md                   # Security guidelines
│   ├── PHASE-ROADMAP.md              # Complete roadmap
│   ├── HUNTER-PROTOCOL.md            # Job search automation
│   └── [30+ documentation files]
│
├── 📁 scripts/                       # Development utilities
│   ├── dev-up.sh                     # Start Docker services
│   └── dev-shell.sh                  # Open DB shells
│
├── 📄 Configuration Files
│   ├── seed.yaml                     # Repository "genome"
│   ├── turbo.json                    # Build orchestration
│   ├── pnpm-workspace.yaml           # Workspace config
│   └── tsconfig.json                 # TypeScript config
│
└── 📄 Documentation Files
    ├── README.md                     # Project overview
    ├── CLAUDE.md                     # AI development guidance
    ├── DEFINITIONS.md                # Unified glossary
    ├── DECISION-LOG.md               # Architecture decisions
    ├── MANIFEST.md                   # This file
    └── CONSOLIDATED-SPECIFICATIONS.md # Technical specs
```

---

## Document Classification System

### Category Codes
- **[FOUND]** - Foundational Concepts & Philosophy (5 files)
- **[SPEC]** - Core Specifications & Schemas (4 files)
- **[ARCH]** - Architecture & Technical Design (5 files)
- **[PLAN]** - Planning, Roadmaps & Strategy (4 files)
- **[WORK]** - Workflows & Automation (5 files)
- **[ORCH]** - Integration & Orchestration (5 files)
- **[META]** - Meta-Organization & Documentation (5 files)

### Design Documents Index

| ID | Filename | Topic | Status |
|----|----------|-------|--------|
| FOUND-001 | blockchain-cv-analogy.md | Core metaphor | Reference |
| FOUND-002 | blockchain-cv-vs-resume.md | CV vs Résumé | Reference |
| FOUND-003 | meta-latin-etymology.md | Theatrical terms | Reference |
| FOUND-004 | identity-narrative-questions.md | 8 core questions | Active |
| SPEC-001 | data-schema.md | TypeScript schemas | Implemented |
| SPEC-002 | system-design.md | Masks, content graph | Implemented |
| SPEC-003 | mask-taxonomy.md | 16 functional masks | Implemented |
| ARCH-001 | system-architecture.md | Technical diagram | Partial |
| ARCH-002 | repository-layout.md | Monorepo structure | Implemented |
| ARCH-003 | cicd-pipeline.md | GitHub Actions | Not implemented |
| WORK-005 | autonomous-code-growth.md | Multi-agent system | In progress |
| META-001 | project-bible.md | Complete overview | Reference |

---

## Dependency Graph

### Module Dependencies

```
packages/schema          ← Foundation (no deps)
       ↓
packages/core           ← Business logic
packages/content-model  ← Narrative generation
       ↓
apps/api               ← REST API
apps/orchestrator      ← Worker service
apps/web               ← Frontend
```

### Build Order
```
schema → core → content-model → api → orchestrator → web
```

### Critical Path
```
FOUND-001 (Blockchain analogy)
    → SPEC-001 (Schema)
    → ARCH-001 (Architecture)
    → Implementation (Current)
    → Deployment (Next)
```

---

## Key Artifacts by Priority

### Tier 1: Essential for Development
1. **CLAUDE.md** - Development guidelines (AI and human)
2. **DEFINITIONS.md** - Unified terminology glossary
3. **DECISION-LOG.md** - Architecture decision records
4. **packages/schema/** - Data model source of truth
5. **seed.yaml** - Repository constraints

### Tier 2: Implementation Reference
6. **CONSOLIDATED-SPECIFICATIONS.md** - Technical specs
7. **docs/PHASE-ROADMAP.md** - Complete roadmap
8. **apps/api/openapi.yaml** - API contract
9. **docs/HUNTER-PROTOCOL.md** - Job search system

### Tier 3: Historical Context
10. **META-001-project-bible.md** - Original design vision
11. **FOUND-*.md** files - Philosophical foundation
12. **ARCH-*.md** files - Original architecture discussions

---

## Current Phase: Commercialization

The core implementation is complete. Current focus areas:

### Phase 0 (Now): Polish & Complete
**Streams:**
- **0A**: Hunter Protocol completion (search, gap analysis, tailoring)
- **0B**: Theatrical UI polish (animations, mask transitions)

### Phase 1 (Next): Monetization
- Stripe integration
- Subscription tiers (Artisan, Dramatist)
- Feature gates

### Phase 2: Deployment
- Vercel deployment (web)
- Database hosting (Neon/Supabase)
- CI/CD pipelines

See `docs/PHASE-ROADMAP.md` for complete 140 EU roadmap.

---

## Key Innovations

### 1. Blockchain-Inspired CV Architecture
CV as immutable ledger, résumé as derived proof object.

### 2. Identity Mask System
16 non-branded functional masks (Analyst, Synthesist, Artisan, etc.) that filter the same underlying truth.

### 3. Temporal Epoch Architecture
Career divided into meaningful periods (Initiation → Mastery → Legacy) for biographical narrative.

### 4. Autonomous Agent System
Multi-agent crew (Architect, Implementer, Reviewer, Tester, Maintainer) for assisted development.

### 5. Energy-Based Planning
Abstract effort units instead of calendar time for pressure-free planning.

---

## Quick Commands

```bash
# Install dependencies
pnpm install

# Start development services
scripts/dev-up.sh      # PostgreSQL + Redis
pnpm dev               # All apps in parallel

# Testing
pnpm test              # Unit tests
pnpm integration       # Integration tests (needs env vars)
pnpm typecheck         # TypeScript validation
pnpm lint              # ESLint

# Database
scripts/dev-shell.sh   # Interactive psql
pnpm --filter api migrate
pnpm --filter api seed
```

---

## Integration Points

| System | Status | Purpose |
|--------|--------|---------|
| PostgreSQL | ✅ Implemented | Primary data store |
| Redis | ✅ Implemented | Cache & task queue |
| W3C VCs | 🟡 Partial | Credential verification |
| W3C DIDs | ❌ Planned | Decentralized identity |
| Serper API | 🟡 Partial | Job search (Hunter Protocol) |
| Stripe | ❌ Planned | Payments |
| Vercel | ❌ Planned | Web hosting |
| GitHub Actions | ❌ Planned | CI/CD |

---

## Glossary Quick Reference

| Term | Definition |
|------|------------|
| **CV** | Complete professional history (blockchain ledger) |
| **Résumé** | Context-specific view (state snapshot) |
| **Mask** | Identity filter for context-specific presentation |
| **Epoch** | Temporal period in professional evolution |
| **Scaenae** | Theatrical stages/contexts |
| **EU** | Energy Unit (abstract effort measure) |

See **[DEFINITIONS.md](DEFINITIONS.md)** for complete glossary.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | User-facing overview |
| [CLAUDE.md](CLAUDE.md) | Development guidance |
| [DEFINITIONS.md](DEFINITIONS.md) | Terminology glossary |
| [DECISION-LOG.md](DECISION-LOG.md) | Architecture decisions |
| [seed.yaml](seed.yaml) | Repository constraints |
| [docs/SECURITY.md](docs/SECURITY.md) | Security guidelines |
| [docs/PHASE-ROADMAP.md](docs/PHASE-ROADMAP.md) | Complete roadmap |

---

**Document Authority**: This manifest provides the high-level view of project status and organization. For detailed specifications, consult the referenced documents.

**Last Reconciliation**: This document has been updated to reflect the actual implementation state as of 2026-01-18. Previous version referenced "Phase 0: Foundation (Now)" which is no longer accurate — core implementation is 90% complete.

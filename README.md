# in–midst–my–life

> The employer becomes the interviewee.

[![CI](https://github.com/4444J99/life-my--midst--in/actions/workflows/test.yml/badge.svg)](https://github.com/4444J99/life-my--midst--in/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/4444J99/life-my--midst--in/branch/master/graph/badge.svg)](https://codecov.io/gh/4444J99/life-my--midst--in)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/4444J99/life-my--midst--in)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/4444J99/life-my--midst--in)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/4444J99/life-my--midst--in)

---

## The Vision: The Inverted Interview

In a traditional hiring process, the employer asks all the questions. This project
inverts that dynamic: **the employer becomes the interviewee**.

A recruiter or hiring manager visits the candidate's link, answers questions about
their role, team, and culture — and the system assembles a CV view curated specifically
for what they're seeking. The candidate's complete identity is a structured ledger;
what the employer sees is a dynamically filtered, role-specific snapshot.

This is not deception. It is **strategic curation** — the same person, presented
through the lens most relevant to the opportunity.

See [docs/INVERTED-INTERVIEW.md](docs/INVERTED-INTERVIEW.md) for the full paradigm design.

---

## How It Works

### The Problem

Traditional CVs are static, one-dimensional documents that force professionals to flatten
their multifaceted identity into a single narrative. They cannot adapt to different audiences,
evolve with career transitions, or provide verifiable proof of claims.

### The Approach

This project reimagines the CV as an **identity operating system** built on three ideas:

1. **CV as Ledger**: The complete work history is an immutable, append-only record from which audience-specific views are derived on demand.
2. **Mask-Based Filtering**: 16 identity masks (Analyst, Architect, Narrator, etc.) reshape the same underlying data for different professional contexts.
3. **Role-Family Curation**: When an employer states their role (e.g., "Senior Frontend Engineer"), the system maps it to a role family and selects the optimal mask blend — so "UI Developer" and "React Lead" produce the same curated view.

### The Outcome

A feature-complete full-stack system (Next.js 16 + Fastify + PostgreSQL) that:
- Generates context-aware professional profiles through the Inverted Interview flow
- Supports temporal career navigation through 8 epochs
- Automates job search via the Hunter Protocol
- Exports to JSON-LD, PDF, and Verifiable Credential formats

All from a single source of truth.

---

## Overview

- **Inverted Interview** — employers answer *your* questions; the system evaluates fit
- **16 identity masks** filter the same underlying truth for different audiences
- **10 role families** map job titles to curated mask blends (Frontend, Backend, DevOps, etc.)
- **5-factor compatibility scoring** (skill match, values alignment, growth fit, sustainability, compensation)
- **8 temporal epochs** (Initiation through Legacy) structure career narrative
- **W3C Verifiable Credentials** and DID resolution provide cryptographic proof
- **Autonomous job search** (Hunter Protocol) finds, analyzes, and tailors applications

The project is **feature-complete** with 68+ commits across all roadmap phases.

---

## Quick Start

### Prerequisites

- **Node.js 22+** and **pnpm** (monorepo package manager)
- **Docker + Docker Compose** (for PostgreSQL and Redis)

### Install and Run

```bash
# Clone
git clone https://github.com/4444J99/life-my--midst--in.git
cd life-my--midst--in

# Install dependencies
pnpm install

# Start PostgreSQL + Redis
scripts/dev-up.sh

# Start all services (web :3000, api :3001, orchestrator :3002)
pnpm dev
```

### Verify

```bash
curl http://localhost:3001/health        # { "status": "ok" }
curl http://localhost:3001/taxonomy/masks # list all 16 masks
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│               THE INVERTED INTERVIEW                      │
│  Employer visits link → answers questions → system        │
│  assembles role-curated CV from mask-filtered ledger      │
├──────────────────────────────────────────────────────────┤
│  Frontend (Next.js 16)    │  API (Fastify)               │
│    Dashboard, Mask Editor │    Profile CRUD, Narrative    │
│    Interview Flow, Admin  │    Multi-format Export, Auth  │
├──────────────────────────────────────────────────────────┤
│  Orchestrator (Node.js)   │  Data Layer                  │
│    10 Agent Roles         │    PostgreSQL + pgvector      │
│    Task Queue, Webhooks   │    Redis (cache/queue)        │
│    Hunter Protocol        │    DID/VC (verification)      │
└──────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion 11 |
| **Backend** | Fastify 5, Node.js 22+, TypeScript, GraphQL subscriptions |
| **Data** | PostgreSQL + pgvector, Redis, Zod schemas, JSON-LD |
| **Verification** | W3C DIDs (web, key, jwk, pkh), Verifiable Credentials |
| **Infrastructure** | Docker Compose, Helm charts, GitHub Actions (6 workflows) |
| **Quality** | ESLint 9, Vitest 4, Playwright, Prettier, 75%+ coverage |

---

## The Mask System

Not personalities — **professional lenses** that filter the same underlying truth.

| Category | Masks |
|----------|-------|
| **Cognitive** (how you think) | Analyst, Synthesist, Observer, Strategist, Speculator, Interpreter |
| **Expressive** (how you express) | Artisan, Architect, Narrator, Provoker, Mediator |
| **Operational** (how you execute) | Executor, Steward, Integrator, Custodian, Calibrator |

### Role Families

When an employer states their role, the system maps it to a **role family** with a curated mask blend:

| Role Family | Primary Masks | Example Titles |
|-------------|--------------|----------------|
| Frontend Engineering | Architect, Artisan, Integrator | UI Developer, React Lead, Frontend Engineer |
| Backend Engineering | Architect, Analyst, Steward | API Developer, Platform Engineer |
| Engineering Management | Steward, Strategist, Mediator | Tech Lead, Engineering Manager |
| DevOps / SRE | Custodian, Architect, Executor | SRE, Infrastructure Engineer |
| Product Design | Artisan, Observer, Narrator | UX Designer, Product Designer |

See [`packages/content-model/src/role-families.ts`](packages/content-model/src/role-families.ts) for the full 10-family taxonomy.

### Epochs

Professional identity evolves through temporal arcs:

```
Initiation → Expansion → Consolidation → Divergence →
Mastery → Reinvention → Transmission → Legacy
```

---

## API Summary

| Group | Endpoints |
|-------|-----------|
| **Health** | `GET /health`, `GET /ready`, `GET /metrics` |
| **Taxonomy** | `GET /taxonomy/masks`, `/epochs`, `/stages` |
| **Profiles** | `GET /profiles/:id`, `POST .../narrative`, `POST .../masks/select` |
| **Export** | `GET .../export/jsonld`, `.../vc`, `.../pdf` |
| **Hunter** | `POST /hunter/find-jobs`, `/analyze-gap`, `/tailor-resume`, `/write-cover-letter` |
| **Auth** | `POST /auth/login`, `/auth/revoke` |
| **Admin** | Taxonomy mutations, scoring weights, feature flags |

Full specification: [`apps/api/openapi.yaml`](apps/api/openapi.yaml)

---

## Repository Structure

```
life-my--midst--in/
├── apps/
│   ├── web/                  Next.js 16 dashboard (:3000)
│   ├── api/                  Fastify REST API (:3001)
│   └── orchestrator/         Node.js worker service (:3002)
├── packages/
│   ├── schema/               Zod schemas & TypeScript types
│   ├── core/                 Business logic, mask matching, DIDs
│   ├── content-model/        Narrative generation, JSON-LD, role families
│   └── design-system/        Shared UI primitives
├── docs/
│   ├── INVERTED-INTERVIEW.md The north-star paradigm design
│   ├── seed.yaml             Repository constraints ("genome")
│   ├── CONTRIBUTING.md       Contribution guidelines
│   ├── CHANGELOG.md          Release history
│   ├── adr/                  15 Architecture Decision Records
│   └── archived/             Historical design documents (64 files)
├── infra/                    Docker Compose, Helm charts, Dockerfiles
├── scripts/                  Dev utilities (dev-up.sh, dev-shell.sh)
├── config/                   Tool configs (Lighthouse CI)
└── CLAUDE.md                 AI development guidance
```

---

## Development

### Environment

```bash
# .env.local (or export directly)
DATABASE_URL=postgresql://user:pass@localhost:5432/midst_dev
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### Testing

```bash
pnpm test                    # unit tests (all packages)
pnpm test:watch              # watch mode
pnpm integration             # integration tests (needs INTEGRATION_* env vars)
pnpm typecheck               # TypeScript validation
pnpm lint                    # ESLint
```

### Database

```bash
scripts/dev-up.sh            # start PostgreSQL + Redis
scripts/dev-shell.sh         # open psql / redis-cli
pnpm --filter api migrate    # run API migrations
pnpm --filter api seed       # seed demo data
```

---

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/SELF-HOSTING.md](docs/SELF-HOSTING.md) for full guides.

---

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines. In brief:

- TypeScript strict mode, no `any` types
- 75%+ test coverage, Prettier formatting, ESLint rules
- Max 1200 LOC per file, max 200 LOC per function
- Feature branch workflow with PR review

Please also read the [Code of Conduct](docs/CODE_OF_CONDUCT.md) and [Security Policy](.github/SECURITY.md).

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/INVERTED-INTERVIEW.md](docs/INVERTED-INTERVIEW.md) | The Inverted Interview paradigm |
| [CLAUDE.md](CLAUDE.md) | Development guidance and architecture patterns |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute |
| [docs/MANIFEST.md](docs/MANIFEST.md) | Complete project overview and file catalog |
| [docs/DEFINITIONS.md](docs/DEFINITIONS.md) | Unified terminology glossary |
| [docs/DECISION-LOG.md](docs/DECISION-LOG.md) | Architecture decision records |
| [docs/SECURITY.md](docs/SECURITY.md) | Security checklist |
| [docs/seed.yaml](docs/seed.yaml) | Repository constraints |

Historical design documents are preserved in [`docs/archived/`](docs/archived/).

---

## License

[MIT](LICENSE)

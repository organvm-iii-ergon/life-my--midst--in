# GitHub Repository Standards Alignment

## Context

The repo is feature-complete (65 commits, zero open issues/PRs), but the root directory has **57 items** — rated "critical" by the Minimal Root standard (target < 15). The README is long but outdated (references Phase 0 as "next", shows Next.js 15, 90% progress). Several community files are missing from `.github/`, issue templates don't exist, and documentation organization needs cleanup. This plan aligns the repo with the standards defined in `github-repo-curator` and `github-repository-standards` skills.

**Strategy**: 4 commits — root declutter, GitHub community files, README rewrite, documentation organization.

---

## Commit 1: Root Declutter — Move Docs & Configs

**Goal**: Reduce root from 57 → ~22 items (acceptable tier).

### 1a. Move root markdown files to `docs/`

These files are internal documentation, not architectural pillars:

| File | Move To |
|------|---------|
| `AGENTS.md` | `docs/AGENTS.md` |
| `CONSOLIDATED-SPECIFICATIONS.md` | `docs/archived/CONSOLIDATED-SPECIFICATIONS.md` |
| `CONVERSATION-COVENANT-GENESIS.md` | `docs/archived/CONVERSATION-COVENANT-GENESIS.md` |
| `DECISION-LOG.md` | `docs/DECISION-LOG.md` |
| `DEFINITIONS.md` | `docs/DEFINITIONS.md` |
| `EVOLUTION-PLAN.md` | `docs/EVOLUTION-PLAN.md` |
| `MANIFEST.md` | `docs/MANIFEST.md` |
| `QUICKSTART.md` | `docs/QUICKSTART.md` (README has its own Quick Start) |

**Keep in root** (required by convention/tooling):
- `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CLAUDE.md`
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`
- `.gitignore`, `.dockerignore`, `.prettierrc`, `.commitlintrc.json`
- `eslint.config.mjs`, `vitest.config.ts`, `turbo.json`
- `seed.yaml` (project "genome" — referenced from CLAUDE.md)

### 1b. Move deployment configs to `infra/`

| File | Move To |
|------|---------|
| `docker-compose.yml` | `infra/docker-compose.yml` |
| `docker-compose.prod.yml` | `infra/docker-compose.prod.yml` |
| `Dockerfile` | `infra/Dockerfile` |
| `railway.json` | `infra/railway.json` |
| `render.yaml` | `infra/render.yaml` |
| `vercel.json` | `infra/vercel.json` |

**Glue code needed**:
- Update `scripts/dev-up.sh` to reference `infra/docker-compose.yml`
- Update `scripts/dev-shell.sh` similarly
- Update `.github/workflows/deploy.yml` for new Dockerfile path
- Update `CLAUDE.md` references to docker-compose

**Note**: `Dockerfile` CAN be moved if `-f` flag is used in docker build commands. Check all workflow references.

### 1c. Move `.env.*.example` files to `infra/`

| File | Move To |
|------|---------|
| `.env.example` | `infra/.env.example` |
| `.env.integration.example` | `infra/.env.integration.example` |
| `.env.production.example` | `infra/.env.production.example` |

### 1d. Remove obsolete files

| File | Action |
|------|--------|
| `generate-monorepo.py` | Delete (one-time scaffold script, already executed) |
| `.envrc` | Keep (direnv — unclear if active, low risk to leave) |
| `tsconfig.tsbuildinfo` | Already in `.gitignore` pattern — verify, delete from repo if tracked |
| `.release-please-manifest.json` | Keep (release-please needs root) |
| `release-please-config.json` | Keep (release-please needs root) |
| `secrets.env.op.sh` | Already gitignored by `*.env.op.sh` pattern — verify |

### 1e. Update `.gitignore` additions

Add missing entries per standard:
```
.vscode/
.idea/
*.pem
*.key
Thumbs.db
```

### 1f. Update internal references

After moves, update paths in:
- `CLAUDE.md` — docker-compose references, file catalog
- `README.md` — will be rewritten in Commit 3, but fix any broken links now
- `.github/workflows/*.yml` — Dockerfile paths, docker-compose paths
- `scripts/dev-up.sh`, `scripts/dev-shell.sh` — docker-compose paths

**Estimated root after**: ~22 items (README, LICENSE, CHANGELOG, CONTRIBUTING, CLAUDE, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, tsconfig.json, .gitignore, .dockerignore, .prettierrc, .commitlintrc.json, eslint.config.mjs, vitest.config.ts, turbo.json, seed.yaml, release-please-manifest.json, release-please-config.json, + dirs: apps/, packages/, infra/, scripts/, docs/, .github/, .husky/, .lighthouserc.js)

### Verification
```bash
ls -1a | wc -l  # Target: < 25
pnpm test && pnpm typecheck && pnpm lint
scripts/dev-up.sh  # Verify docker-compose still works (if Docker available)
```

---

## Commit 2: GitHub Community Files & Templates

### 2a. Create `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the Bug
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. ...
2. ...

## Expected Behavior
What you expected to happen.

## Environment
- OS: [e.g., macOS 15, Ubuntu 24.04]
- Node.js: [e.g., 22.x]
- pnpm: [e.g., 10.x]

## Additional Context
Add any other context, screenshots, or logs.
```

### 2b. Create `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Problem Statement
A clear description of what problem this would solve.

## Proposed Solution
Describe the solution you'd like.

## Alternatives Considered
Any alternative solutions or features you've considered.

## Additional Context
Any other context or screenshots about the feature request.
```

### 2c. Create `.github/CODE_OF_CONDUCT.md`

Use Contributor Covenant v2.1 (the de-facto standard).

### 2d. Move `SECURITY.md` to `.github/SECURITY.md`

Currently at `docs/SECURITY.md`. GitHub auto-discovers `SECURITY.md` from `.github/` and displays it in the Security tab. Create `.github/SECURITY.md` that either:
- Contains the full security policy, OR
- Is a concise policy that links to `docs/SECURITY.md` for detailed technical docs

Recommended: Create a concise `.github/SECURITY.md` with reporting instructions and link to `docs/SECURITY.md` for the full technical audit.

### 2e. Add `CODEOWNERS`

```
# Default owner
* @4444J99
```

**Files created/modified**:
- `.github/ISSUE_TEMPLATE/bug_report.md` (NEW)
- `.github/ISSUE_TEMPLATE/feature_request.md` (NEW)
- `.github/CODE_OF_CONDUCT.md` (NEW)
- `.github/SECURITY.md` (NEW)
- `.github/CODEOWNERS` (NEW)

### Verification
```bash
# Verify GitHub recognizes the templates (push and check Issues > New Issue)
# Verify security policy shows in Security tab
```

---

## Commit 3: README Rewrite

The current README is 782 lines, outdated (references Phase 0 as "next", shows Next.js 15, 90% progress), and violates several README standards:

**Current issues**:
- No dark-mode compatible logo/banner
- Badges point to `main` branch (repo uses `master`)
- Status table is outdated (shows Hunter Protocol 60%, Monetization 0%, Deployment 0%)
- "Quick Start for Different Audiences" section is cluttered (3 audiences including "AI Assistants")
- Phase 0 work instructions are stale (all complete)
- Architecture diagram says Next.js 15 (now 16)
- 782 lines — too long, violates progressive disclosure

**Rewrite structure** (target: ~250 lines, following World-Class README Anatomy):

### Hero Section
- Project name + one-line pitch (no emoji in title)
- Badge dashboard: CI status, coverage, license, Node.js version (fix branch: `master` not `main`)
- Deploy buttons (Railway, Render, Vercel) — keep these, they're valuable

### Value Section (The Idea)
- Keep the "60 seconds" pitch but tighten to ~10 lines
- 5 key features as bullets with brief explanations

### Quick Start (~15 lines)
- Prerequisites
- Clone, install, start (copy-pasteable, 5 commands max)
- Expected output

### Architecture (condensed)
- ASCII diagram updated to Next.js 16
- Tech stack list (one line per layer)
- Directory structure (simplified)

### Documentation Links
- Table linking to docs/: Getting Started, API Reference, Architecture, Security, Operations

### Configuration
- Env vars table (Name | Description | Default)

### Testing (condensed)
- 4-5 commands with descriptions

### Contributing
- Link to CONTRIBUTING.md
- Quick 3-step contributor flow

### License
- One-liner + link

### Footer
- Navigation links (Docs, Security, ADRs, Roadmap)

**Files modified**: `README.md`

### Verification
- All links resolve (no broken links)
- Badges render correctly
- Copy-paste Quick Start commands work

---

## Commit 4: Documentation Polish & Metadata

### 4a. Add `docs/getting-started.md`

Currently missing. Create from content extracted from the old README Quick Start sections. Should cover:
- Prerequisites
- Installation
- Starting services
- Seeding data
- Exploring the API
- Running tests

### 4b. Rename/organize docs for discoverability

Ensure these key docs exist and are linked:
- `docs/getting-started.md` (NEW — from README extraction)
- `docs/API_REFERENCE.md` (EXISTS)
- `docs/ARCHITECTURE_DIAGRAMS.md` (EXISTS)
- `docs/DEPLOYMENT.md` (EXISTS)
- `docs/DEVELOPER_GUIDE.md` (EXISTS)

### 4c. Update `package.json` metadata

Add missing fields:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/4444J99/life-my--midst--in.git"
  },
  "homepage": "https://github.com/4444J99/life-my--midst--in#readme",
  "bugs": {
    "url": "https://github.com/4444J99/life-my--midst--in/issues"
  },
  "author": "4444J99",
  "keywords": [
    "cv",
    "resume",
    "identity",
    "blockchain",
    "verifiable-credentials",
    "did",
    "mask",
    "narrative",
    "typescript",
    "monorepo"
  ]
}
```

### 4d. Update `CLAUDE.md`

Fix outdated references:
- Next.js 15 → 16
- `.eslintrc.cjs` → `eslint.config.mjs`
- Update docker-compose paths if moved
- Update file catalog to match new structure

### 4e. Clean up `.github/` directory

- Remove `GITHUB_ACTIONS_SETUP.md` and `QUICK_START.md` (internal dev docs, not GitHub community files — move to `docs/` or delete if redundant)

### Verification
```bash
pnpm test && pnpm typecheck && pnpm lint
# Verify all doc links from README resolve
```

---

## Gap Summary

| Standard | Current State | Action |
|----------|--------------|--------|
| Root item count | 57 (critical) | Commit 1: → ~22 (acceptable) |
| Issue templates | Missing | Commit 2: Add bug_report + feature_request |
| Code of Conduct | Missing | Commit 2: Contributor Covenant v2.1 |
| SECURITY.md in .github | Only in docs/ | Commit 2: Add .github/SECURITY.md |
| CODEOWNERS | Missing | Commit 2: Add |
| FUNDING.yml | Skipped | Repo may be transferred — not creating |
| README quality | 782 lines, outdated | Commit 3: Rewrite ~250 lines |
| README badges | Wrong branch (main→master) | Commit 3: Fix |
| README status | Outdated (90%, Phase 0 next) | Commit 3: Update to 100% complete |
| getting-started.md | Missing | Commit 4: Create |
| package.json metadata | Missing repo/homepage/bugs/keywords | Commit 4: Add |
| CLAUDE.md accuracy | Outdated references | Commit 4: Update |
| .gitignore completeness | Missing .vscode, .idea, *.pem, *.key | Commit 1: Add |
| Docker/deploy configs in root | 6 files polluting root | Commit 1: Move to infra/ |

## Files Summary

| Commit | Key Files |
|--------|-----------|
| 1 | Move 14+ files, update `scripts/`, `.github/workflows/`, `CLAUDE.md`, `.gitignore` |
| 2 | `.github/ISSUE_TEMPLATE/`, `.github/CODE_OF_CONDUCT.md`, `.github/SECURITY.md`, `.github/CODEOWNERS`, `.github/FUNDING.yml` |
| 3 | `README.md` (full rewrite) |
| 4 | `docs/getting-started.md`, `package.json`, `CLAUDE.md`, `.github/` cleanup |

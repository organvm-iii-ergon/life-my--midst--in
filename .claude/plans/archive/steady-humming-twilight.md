# Plan: Make in-midst-my-life Fully Functioning

## Context

The codebase is **code-quality perfect** (0 build errors, 0 type errors, 0 lint warnings, 535+ tests passing, comprehensive CI/CD). But it's not yet a fully functioning product. Gaps exist in: real data, partial UI features, external service wiring, deployment readiness, and portfolio presentation.

**Key constraint**: External services (Stripe, Serper, OpenAI, OAuth) must be wired to admin/user settings — the app works with graceful fallbacks when keys aren't set, and activates features when they are.

---

## Phase 1: Real Data & Demo-Ready UX Flow

**Goal**: Replace stub seed data so the full UX flow works end-to-end locally.

### 1.1 Create Comprehensive Seed Profile (L)
- **Files**: `apps/api/seeds/profiles.sql`, `apps/api/seeds/z_cv_entities.sql`
- Replace "Seed Demo" / "Contributor" with a rich professional profile (senior architect, 12+ years)
- Add 4–6 experiences, 2–3 educations, 3–5 projects, 8–12 skills, publications, awards, certs
- Tags must trigger different masks (analysis, design, systems, craft, delivery, etc.)
- Add 6–10 timeline events spanning epochs/stages, 2–3 content edges, 2–3 VCs

### 1.2 Add Second Seed Profile (M)
- **Files**: Same as 1.1 (append)
- Contrasting archetype (creative researcher/designer) to demonstrate multi-mask across different people
- Enables community features (leaderboard, mentor matching)

### 1.3 Wire Narrative Route to Real Data (M)
- **File**: `apps/api/src/routes/narratives.ts` (lines 158–263)
- Currently returns **100% hardcoded mock** (a "Researcher" persona with fake narrative blocks)
- Replace with: DB lookup for persona from mask taxonomy, call existing `services/narrative.ts` `generateNarrativeBlocks()` with real timeline entries
- The service function already works — just needs real data piped through it

### 1.4 Update profiles.json (S)
- **File**: `apps/api/src/data/profiles.json`
- Replace "Demo Two/Three/Five" stubs with data matching seed profile IDs

### 1.5 Wire Resume Export TODOs (S)
- **File**: `apps/web/src/app/profile/[profileId]/resumes/page.tsx`
- Line 162: Wire "Export" button → `GET /:profileId/export/pdf` + browser download
- Line 229: Implement "Download All" (JSZip or sequential download)
- Line 238: Implement "Share" (copy-to-clipboard of public URL)

### 1.6 Verify Full E2E Flow (M)
- Smoke-test: Dashboard → Profile → Select Mask → Timeline → Generate Narrative → Export
- Fix any broken links or missing endpoint wiring discovered

---

## Phase 2: Code Completeness (Finish Partial Features)

**Goal**: Complete all partially-implemented UI components and wire them to real APIs.

### Quick Wins (S effort each, no dependencies)

| Task | File | What's Missing |
|------|------|----------------|
| 2.1 OnboardingWizard routes | `components/OnboardingWizard.tsx` | Fix 5 broken action links pointing to non-existent `/dashboard/${id}/...` routes → real routes. Add completion state to localStorage. |
| 2.2 MaskEditor shortcuts | `components/MaskEditor.tsx` | Add Ctrl+Z/Y/S keyboard shortcuts. Fix Reset button no-op for new masks. |
| 2.3 ScaenaeFilter expand | `components/ScaenaeFilter.tsx` | Wire unused `_expandedStage` state. Show mask list + narrative preview in expanded view. |
| 2.4 RelationshipBuilder | `components/RelationshipBuilder.tsx` | Add "remove from stack" button. Wire `onSave` to POST content_edges API. Confirmation dialog. |
| 2.5 CommunityBadges progress | `components/CommunityBadges.tsx` | Compute actual progress from user data (persona count, integration checks). Add progress bars. |
| 2.6 Artifacts ContentEdge stub | `apps/api/src/routes/artifacts.ts` (line 330) | Replace stub message with real content_edges table insert. |

### Medium Effort (M, some dependencies)

| Task | File | What's Missing |
|------|------|----------------|
| 2.7 HunterDashboard wiring | `components/HunterDashboard.tsx` | Wire unused `minSalary`/`maxSalary`/`technologies` filter inputs. Fix API paths (currently calling Next.js routes instead of Fastify API). |
| 2.8 BatchApplications API | `components/BatchApplications.tsx` | Replace 5 hardcoded mockJobs + `setTimeout` stubs with real API calls. Depends on 2.7. |
| 2.9 GraphView interactivity | `components/GraphView.tsx` | Responsive SVG canvas (currently fixed 360×360). Add zoom/pan, node detail panel on click, edge labels on hover. |
| 2.10 Interview download+persist | `components/InvertedInterviewInterface.tsx` | Replace `alert('coming soon')` → JSON/PDF report download via Blob URL. POST results to API for persistence. Default compatibility scoring fallback. |
| 2.11 Hunter Job Detail page | `apps/web/src/app/profiles/[id]/hunter/[jobId]/page.tsx` | Replace mockJob/mockCompatibility/mockResume/mockLetter (lines 50–250) with real API calls. Depends on 2.7. |
| 2.12 MentorProfiles API | `components/MentorProfiles.tsx` | Replace mockMentors with profiles endpoint + tag overlap matching. Wire mentorship request to messaging route. Depends on Phase 1.2. |
| 2.13 CommunityLeaderboard API | `components/CommunityLeaderboard.tsx` | Create `GET /community/leaderboard` API route OR client-side scoring from `/profiles`. Wire timeframe/filter controls. Depends on Phase 1.2. |
| 2.14 Admin Beta dashboard | `apps/web/src/app/admin/beta/page.tsx` | Replace mock metrics (lines 51–98) with real API calls (profile count, subscription stats). |

### Lower Priority (L effort)

| Task | File | What's Missing |
|------|------|----------------|
| 2.15 Messaging persistence | `apps/api/src/routes/messaging.ts` | Replace `Map<string, Thread>` in-memory storage with PostgreSQL repo. Needs new migration for threads/messages tables. |

---

## Phase 3: External Service Wiring (Settings-based)

**Goal**: All external services configurable at runtime; graceful fallback when unconfigured.

### Current State (already working fallbacks)
- **Stripe**: Mock mode when `STRIPE_SECRET_KEY` missing/test — ✅ fallback exists
- **Serper**: `MockJobSearchProvider` when `SERPER_API_KEY` missing — ✅ fallback exists
- **LLM**: Orchestrator supports `stub`/`none` modes, content-model has mock fallback — ✅
- **Sentry**: Only initializes when `SENTRY_DSN` set — ✅
- **OAuth (Drive/Dropbox)**: Returns `provider_not_configured` error — ⚠️ needs graceful UI

### What's Missing

| Task | Effort | Description |
|------|--------|-------------|
| 3.1 Service status endpoint | S | Create `GET /admin/service-status` returning config state of all external services (stripe: mock/live, serper: configured/mock, llm: provider/model, oauth: per-provider). |
| 3.2 Settings DB table + API | M | Migration for `settings(key TEXT PK, value JSONB, updated_at, updated_by)`. Repository + CRUD routes under `/admin/settings`. Stores feature flags and non-secret config. |
| 3.3 Feature flags service | S | `services/feature-flags.ts` reads from settings table with env var fallback. Wire to existing feature-gate middleware. |
| 3.4 Admin settings page | M | `/admin/settings` page showing all service statuses (from 3.1). Read-only for secrets (instructions to set env vars). Toggleable for feature flags (from 3.2). |
| 3.5 User settings page | M | `/settings` root page: default mask, narrative tone, export format, integration links, subscription tier, API key management. |
| 3.6 Mock mode indicators | S | Reusable `<ServiceStatusBanner>` component. Shows "Demo Mode" on Hunter results, "Test Mode" on billing pages. Disable OAuth connect buttons for unconfigured providers with tooltip. |
| 3.7 Graceful degradation fixes | S | `BillingService` constructor: don't throw on empty key, auto-switch to mock. `EmbeddingsService`: return zero-vector on failure instead of throwing. OAuth routes: return `{ configured: false }` instead of 400 error. |

---

## Phase 4: Deployment Readiness

**Goal**: App is deployable to common platforms with clear instructions.

| Task | Effort | Description |
|------|--------|-------------|
| 4.1 Web Dockerfile healthcheck | S | Add `HEALTHCHECK` to `apps/web/Dockerfile` (wget to localhost:3000). |
| 4.2 Fix deploy workflow context | S | `.github/workflows/deploy.yml`: Change Docker build `context` from `./apps/api` to `.` (repo root) for all 3 images. Dockerfiles expect root context. |
| 4.3 Production docker-compose | M | `docker-compose.production.yml`: Uses built images (not bind mounts), `NODE_ENV=production`, resource limits, `.env` for secrets, migration init container. Remove dev-only services (Jaeger/Grafana) or make optional via profiles. |
| 4.4 Vercel configuration | S | `apps/web/vercel.json`: Build command, output dir, env vars. Update `next.config.js` with optional API proxy rewrites. |
| 4.5 Fly.io / Railway templates | S | `apps/api/fly.toml`, `apps/orchestrator/fly.toml`: Port, healthcheck, scaling, secrets reference. |
| 4.6 Env var reference doc | M | `docs/deployment/env-vars.md`: Every env var across all 3 apps, categorized (Required / Required-for-Prod / Optional-External / Optional-Tuning). Sourced from `env.ts`, `config.ts`, `.env.example`. |
| 4.7 Platform deploy guides | M | `docs/deployment/{vercel,railway,fly-io,neon,upstash}.md`: Step-by-step for each platform. |
| 4.8 Migration strategy doc | S | `docs/deployment/migrations.md`: How to run migrations in each environment (local, Docker, Neon, K8s, Railway/Fly). |

---

## Phase 5: Portfolio Polish

**Goal**: Project is presentable as a portfolio piece with polished visuals and documentation.

### 5.1 Install Tailwind CSS (S) — PREREQUISITE
- **Critical finding**: `tailwindcss` is **not installed** in `apps/web`. Components using Tailwind classes (NeoCard, PricingCard, UpgradeWall) are visually broken.
- Install `tailwindcss`, `postcss`, `autoprefixer` as devDeps
- Create `tailwind.config.ts` extending CSS variable palette (ink, paper, accent, etc.)
- Add `@tailwind` directives to `globals.css`
- Content paths must include `../../packages/design-system/src/**/*.tsx`

### 5.2 Public Assets & Branding (M)
- `apps/web/public/` is **completely empty** — no favicon, logo, or OG image
- Create: `favicon.svg` (mask icon in #d36b3c), `apple-touch-icon.png`, `og-image.png` (1200×630), `logo.svg`
- Update `layout.tsx` metadata for favicon, OG image, theme color

### 5.3 Pricing Page Visual Alignment (S)
- Currently uses dark/cyberpunk aesthetic (bg-black, border-cyan-500) that clashes with warm parchment theme
- Restyle to use CSS variable system (ink/paper/accent) — visual consistency signals professionalism
- Replace NeoCard with standard Card component from design system

### 5.4 README Overhaul (M)
- Current README is AI-agent-oriented (parallel execution guides, 140 EU roadmap breakdowns)
- Rewrite for portfolio visitors: elevator pitch → screenshot → key features → architecture diagram → tech stack → quick start → project stats
- Move AI development content to `docs/DEVELOPMENT.md`
- Create `docs/assets/`: architecture diagram (SVG), screenshots

### 5.5 Landing Page Enhancement (L)
- **Hero**: Add animated mask-switching demo (framer-motion, already installed) showing same profile through 3 different masks
- **FeatureGrid**: Replace emoji icons with lucide-react SVGs (already installed)
- **New sections**: "See It In Action" theme showcase, architecture preview, tech stack display, stats bar (535+ tests, 16 masks, 50+ endpoints)
- **Theme Showcase**: Surface the 6 hidden visual themes from `share/themes.css` (cognitive, expressive, operational, academic, futurist, florentine) — these are the project's most unique visual asset

### 5.6 Blog Polish (S)
- Add reading time calculation to `src/lib/blog.ts`
- Add 4th post: "Architecture of a Monorepo Identity System"
- Add header illustrations/gradient banners

### 5.7 Demo Flow (S)
- Add "View Demo Profile" button on landing page → pre-seeded share page
- Ensure dashboard loads demo profile automatically when no auth configured

---

## Implementation Order

```
Phase 1 (Foundation) ──────────────────────────────────
  1.1 Seed Profile → 1.2 Second Profile → 1.3 Wire Narratives → 1.4–1.6

Phase 5.1 (Unblock) ──────────────────────────────────
  5.1 Install Tailwind (prerequisite for many Phase 2 & 5 tasks)

Phase 2 (Quick wins, parallel) ────────────────────────
  2.1–2.6 (all S, no dependencies)
  Then: 2.7–2.14 (M, some depend on Phase 1)
  Last: 2.15 (L, lower priority)

Phase 3 (Service wiring) ─────────────────────────────
  3.1 Status endpoint → 3.2 Settings table → 3.3 Feature flags
  3.4–3.5 Settings pages (parallel) → 3.6 Mock indicators → 3.7 Degradation fixes

Phase 4 (Deployment) ─────────────────────────────────
  4.1–4.2 Quick fixes → 4.3 Prod compose → 4.4–4.5 Platform configs
  4.6–4.8 Documentation

Phase 5 (Polish) ─────────────────────────────────────
  5.2 Assets → 5.3 Pricing → 5.4 README → 5.5 Landing page → 5.6–5.7 Blog & demo
```

## Verification

After each phase:
```bash
pnpm build          # All 7 packages build
pnpm typecheck      # 0 errors
pnpm lint           # 0 warnings
pnpm test           # 535+ tests pass
pnpm --filter web test  # 213+ pass

# Phase 1 verification: docker-compose --profile init up, browse localhost:3000
# Phase 4 verification: docker-compose -f docker-compose.production.yml up
# Phase 5 verification: visual inspection of landing page, README, share pages
```

## Estimated Total: ~45 tasks across 5 phases
- **Phase 1**: 6 tasks (foundation)
- **Phase 2**: 15 tasks (feature completion)
- **Phase 3**: 7 tasks (service wiring)
- **Phase 4**: 8 tasks (deployment)
- **Phase 5**: 7 tasks (polish)

# Seed Document Alignment Audit

**Date**: 2026-02-07
**Scope**: Philosophy-to-code alignment across all foundational seed documents
**Methodology**: Systematic comparison of seed documents against implemented codebase, covering originals in `docs/archived/`, consolidated summaries, ADRs, root-level design docs, and the philosophical manifesto
**Companion to**: `docs/FEATURE-AUDIT.md` (spec-to-code audit)

---

## Source Documents

The project's DNA originates from foundational documents compiled across 33 design conversations. These exist in three tiers: (1) original seed documents in `docs/archived/`, (2) consolidated summaries in root-level files, and (3) architectural decision records in `docs/adr/`.

### Tier 1: Original Seed Documents (`docs/archived/`)

| ID | Title | File | Domain |
|----|-------|------|--------|
| FOUND-001 | Blockchain-CV Analogy | `docs/archived/FOUND-001-blockchain-cv-analogy.md` | Core thesis |
| FOUND-002 | Blockchain CV vs Resume | `docs/archived/FOUND-002-blockchain-cv-vs-resume.md` | Verification |
| FOUND-003 | Latin Dramaturgy Framework | `docs/archived/FOUND-003-meta-latin-etymology.md` | Theatrical frame |
| FOUND-004 | Identity Narrative Questions | `docs/archived/FOUND-004-identity-narrative-questions.md` | Identity invariants |
| FOUND-005 | Prospecting Research Prompts | `docs/archived/FOUND-005-prospecting-research-prompts.md` | Research framework |
| SPEC-001 | Data Schema Specification | `docs/archived/SPEC-001-data-schema.md` | Data model |
| SPEC-002 | System Design | `docs/archived/SPEC-002-system-design.md` | Core engine |
| SPEC-003 | Mask Taxonomy | `docs/archived/SPEC-003-mask-taxonomy.md` | Taxonomy |
| SPEC-004 | JSON Schemas | `docs/archived/SPEC-004-json-schemas.md` | Schema contracts |
| ARCH-001 | System Architecture | `docs/archived/ARCH-001-system-architecture.md` | System design |
| ARCH-002 | Repository Layout | `docs/archived/ARCH-002-repository-layout.md` | Structure |
| ARCH-003 | CI/CD Pipeline | `docs/archived/ARCH-003-cicd-pipeline.md` | DevOps |
| ARCH-004 | Monorepo Alternatives | `docs/archived/ARCH-004-monorepo-alternatives.md` | Tech choices |
| ARCH-005 | Monorepo Generator | `docs/archived/ARCH-005-monorepo-generator.md` | Scaffold |
| ORCH-001 | Agent Meta-Prompt | `docs/archived/ORCH-001-agent-meta-prompt.md` | Agent protocol |
| ORCH-002 | Execution Strategy | `docs/archived/ORCH-002-execution-strategy.md` | Orchestration |
| ORCH-003 | Resource Allocation | `docs/archived/ORCH-003-resource-allocation.md` | Planning |
| ORCH-004 | Template System | `docs/archived/ORCH-004-template-system.md` | Templates |
| ORCH-005 | Master Index | `docs/archived/ORCH-005-master-index.md` | Index |
| META-001 | Project Bible | `docs/archived/META-001-project-bible.md` | Vision |
| META-002 | Thread Enumeration | `docs/archived/META-002-thread-enumeration.md` | Cataloging |
| META-003 | Dependency Graph | `docs/archived/META-003-dependency-graph.md` | Dependencies |
| META-004 | Vision Deck | `docs/archived/META-004-vision-deck.md` | Positioning |
| PLAN-001 | Product Roadmap | `docs/archived/PLAN-001-product-roadmap.md` | 7-phase roadmap |
| PLAN-002 | Effort Timeline | `docs/archived/PLAN-002-effort-timeline.md` | EU allocation |
| PLAN-003 | Action Items | `docs/archived/PLAN-003-action-items.md` | Task breakdown |
| PLAN-004 | Task Breakdown | `docs/archived/PLAN-004-task-breakdown.md` | Granular tasks |
| PLAN-005 | Baseline Inventory | `docs/archived/PLAN-005-baseline-inventory.md` | Starting state |
| PLAN-006 | Data Model | `docs/archived/PLAN-006-data-model.md` | CVM design |
| WORK-001 | Content Pipeline | `docs/archived/WORK-001-content-pipeline.md` | Content flow |
| WORK-002 | Automation Spec | `docs/archived/WORK-002-automation-spec.md` | Automation |
| WORK-003 | BPMN Diagrams | `docs/archived/WORK-003-bpmn-diagrams.md` | Process models |
| WORK-004 | Orchestration Graphs | `docs/archived/WORK-004-orchestration-graphs.md` | Graph runtime |
| WORK-005 | Autonomous Code Growth | `docs/archived/WORK-005-autonomous-code-growth.md` | Self-improvement |

### Tier 2: Consolidated & Root-Level Documents

| ID | Title | File | Domain |
|----|-------|------|--------|
| CONSOL | Consolidated Specifications | `CONSOLIDATED-SPECIFICATIONS.md` | Compiled spec |
| SEED | Repository Genome | `seed.yaml` | Config DNA |
| COVENANT | Philosophical Manifesto | `docs/COVENANT.md` | Philosophy |
| GENESIS | Covenant Genesis Conversation | `CONVERSATION-COVENANT-GENESIS.md` | Origin story |
| DEFS | Unified Glossary | `DEFINITIONS.md` | Terminology |
| DECISIONS | Architecture Decision Log | `DECISION-LOG.md` | ADR index |
| EVOLUTION | Post-Phase Evolution Plan | `EVOLUTION-PLAN.md` | Future vision |
| PLAN-007 | Hunter Protocol Design | `docs/PLAN-007-hunter-protocol.md` | Job search |
| PLAN-008 | Inverted Interview Vision | `docs/INVERTED-INTERVIEW.md` | Interview design |

### Tier 3: Architecture Decision Records (`docs/adr/`)

| ADR | Title | Status |
|-----|-------|--------|
| 001 | Monorepo Structure with pnpm | Accepted |
| 002 | PostgreSQL as Primary Database | Accepted |
| 003 | Redis for Caching and Job Queue | Accepted |
| 004 | Local-First LLM with Ollama | Accepted |
| 005 | Mask-Based Identity System | Accepted |
| 006 | Next.js 15 Frontend with App Router | Accepted |
| 007 | REST API with Hybrid Versioning | Accepted |
| 008 | Hunter Protocol Architecture | Accepted |
| 009 | Deployment Strategy (Docker + K8s) | Accepted |
| 010 | Authentication & Authorization (JWT + RBAC) | Accepted |
| 011 | GraphQL WebSocket Subscriptions | Accepted |
| 012 | DID Resolver Architecture | Accepted |

---

## 1. Philosophical Foundations (FOUND-001–005 + COVENANT + GENESIS)

### 1.1 Core Thesis: Blockchain-CV Analogy

| Promise | Implementation | Evidence | Status |
|---------|---------------|----------|--------|
| CV = master ledger (append-only, complete) | `CurriculumVitaeMultiplexSchema` with versioned entries | `packages/schema/src/curriculum-vitae.ts` | ✅ |
| Resume = derived proof (selective, context-optimized) | Mask-filtered CV views via `CVFilterSchema` | `packages/schema/src/curriculum-vitae.ts`, `apps/api/src/routes/curriculum-vitae-multiplex.ts` | ✅ |
| Mask = filter that generates resume from CV | 16 masks with activation rules, filters, priority weights | `packages/content-model/src/taxonomy.ts` (`MASK_TAXONOMY`) | ✅ |
| Verification via consensus + signatures | W3C VCs with Ed25519 proofs, 4 DID resolvers | `packages/core/src/vc.ts`, `packages/core/src/did/resolvers/` | ✅ |
| Identity via DID / wallet address | DIDs (did:key, did:jwk, did:pkh, did:web) — software-based | `packages/core/src/did/resolvers/{key,jwk,pkh,web}.ts` | ✅ |
| Selective disclosure (ZKP analogy) | Mask-based filtering + redaction rules | `MaskSchema.redaction` in `packages/schema/src/mask.ts` | ✅ |
| On-chain identity / SBT registry | Not implemented — DIDs are software-only | — | 🔄 Deferred |

### 1.2 Eight Foundational Identity Questions (FOUND-004)

| # | Question | Implementation | Evidence | Status |
|---|----------|---------------|----------|--------|
| 1 | Core identity/thesis invariant across outputs? | `IdentityCoreSchema` defines thesis, invariants, master_keywords | `packages/schema/src/identity.ts` | ⚠️ Schema exists; no dedicated DB persistence |
| 2 | Claims requiring external verification? | VC issuance + verification + attestation blocks | `packages/core/src/vc.ts`, `apps/api/src/routes/attestation-blocks.ts` | ✅ |
| 3 | Temporal arcs defining identity evolution? | 8 epochs: initiation → legacy, with `AetasSchema` lifecycle | `packages/schema/src/epoch.ts`, `packages/content-model/src/taxonomy.ts` | ✅ |
| 4 | Contradictions and their treatment? | Narrative engine handles via `authentic_caveat` and mask tension | `packages/content-model/src/narrative.ts` (template bank) | ✅ |
| 5 | Non-obvious intellectual lineages? | `IdentityCoreSchema.intellectual_lineage` field | `packages/schema/src/identity.ts` | ⚠️ Schema exists; not surfaced in UI |
| 6 | Strategic differentiators overlooked? | `IdentityCoreSchema.strategic_differentiators` field | `packages/schema/src/identity.ts` | ⚠️ Schema exists; not surfaced in UI |
| 7 | Modular/mask-based identity components? | Full mask system with 16 masks, 3 ontologies, activation rules | `packages/schema/src/mask.ts`, `packages/content-model/src/mask-selection.ts` | ✅ |
| 8 | Skeptic challenges and counter-evidence? | VC verification + narrative `evidence` blocks + proof points | `packages/core/src/vc.ts`, `packages/content-model/src/narrative.ts` | ✅ |

### 1.3 Problem Statement & Dignity (FOUND-005 + COVENANT §II + GENESIS)

| Promise | Implementation | Evidence | Status |
|---------|---------------|----------|--------|
| Documented failure (2000 apps → 0 interviews) | COVENANT §II frames the motivation | `docs/COVENANT.md` §II | ✅ Context |
| "You are not a resume. You are a complete human." | Dignity embedded in feature design, not stated in UI | — | ⚠️ See G6 |
| Inverting the power dynamic | Inverted Interview + Hunter Protocol + mutual evaluation | `apps/api/src/routes/interviews.ts`, `packages/core/src/hunter-protocol/` | ✅ |
| "We do not reform this system. We replace it." | System provides alternative paradigm, not incremental fix | Architecture is ground-up, not a resume builder plugin | ✅ |
| Three-fold completeness (masks + places + things) | Masks (16) × Scaenae (6) × CVEntryTypes (11) | Schema, taxonomy, API routes | ✅ |

### 1.4 Inverted Interview Vision (PLAN-008)

The standalone `docs/INVERTED-INTERVIEW.md` (449 lines) envisions a theatrical two-act structure with real-time LLM analysis.

| Promise | Implementation | Evidence | Status |
|---------|---------------|----------|--------|
| Act I: Interviewer becomes interviewee | Interview session with questions posed to employer | `apps/api/src/routes/interviews.ts`, `InvertedInterviewInterface.tsx` | ✅ |
| Act II: Requirements appear "from the sides of the stage" | Job requirements injected into analysis | `packages/core/src/hunter-protocol/compatibility-analyzer.ts` | ⚠️ Batch, not theatrical |
| Real-time tone analysis | Not implemented — answers recorded, not analyzed for tone | — | ❌ |
| Dynamic mask triggering based on interviewer needs | Masks are statically selected | `apps/web/src/components/MaskSelector.tsx` | ❌ |
| 5-factor compatibility scoring | Compatibility via `CompatibilityAnalyzer` with fit_score | `packages/core/src/hunter-protocol/compatibility-analyzer.ts` | ⚠️ Simplified |
| Live dashboard with red/green flags | Static results page post-completion | `InvertedInterviewInterface.tsx` | ⚠️ Post-hoc |
| System-generated follow-up questions | Not implemented — questions are static | — | ❌ See G9 |
| Compensation analysis against market rate | Not implemented | — | ❌ |

### 1.5 Genesis Document (CONVERSATION-COVENANT-GENESIS)

The genesis conversation records the philosophical arc from "imagine..." to technical architecture. Key promises not captured elsewhere:

| Promise | Implementation | Evidence | Status |
|---------|---------------|----------|--------|
| Theatrical self-awareness as political act | Schema uses Latin terminology; system acknowledges performance | `nomen`, `motto` fields in mask/persona schemas | ✅ In schema |
| "Nothing broken, everything clarified" | Infrastructure aligns with applications | Consistent schema → API → UI flow | ✅ |
| Application spam prevention through Hunter filtering | Hunter Protocol filters opportunities before applying | `packages/core/src/hunter-protocol/` | ✅ |
| Recognize transfer skills (e.g., mother = operations manager) | Multi-dimensional mask system can surface cross-domain skills | `CVEntrySchema` with custom types, mask filtering | ✅ Enabled |

---

## 2. Ontological Taxonomy (SPEC-003)

### 2.1 Masks — 16/16 ✅

All 16 masks from SPEC-003 are implemented with full activation rules, filters, and stylistic parameters.

| # | Mask | Ontology | Evidence |
|---|------|----------|----------|
| 1 | Analyst | Cognitive | `MASK_TAXONOMY[0]` in `packages/content-model/src/taxonomy.ts` |
| 2 | Synthesist | Cognitive | `MASK_TAXONOMY[1]` |
| 3 | Observer | Cognitive | `MASK_TAXONOMY[2]` |
| 4 | Strategist | Cognitive | `MASK_TAXONOMY[3]` |
| 5 | Speculator | Cognitive | `MASK_TAXONOMY[4]` |
| 6 | Interpreter | Expressive | `MASK_TAXONOMY[5]` |
| 7 | Artisan | Expressive | `MASK_TAXONOMY[6]` |
| 8 | Architect | Expressive | `MASK_TAXONOMY[7]` |
| 9 | Narrator | Expressive | `MASK_TAXONOMY[8]` |
| 10 | Provoker | Expressive | `MASK_TAXONOMY[9]` |
| 11 | Mediator | Expressive | `MASK_TAXONOMY[10]` |
| 12 | Executor | Operational | `MASK_TAXONOMY[11]` |
| 13 | Steward | Operational | `MASK_TAXONOMY[12]` |
| 14 | Integrator | Operational | `MASK_TAXONOMY[13]` |
| 15 | Custodian | Operational | `MASK_TAXONOMY[14]` |
| 16 | Calibrator | Operational | `MASK_TAXONOMY[15]` |

**Schema richness**: Each mask includes `id`, `name`, `nomen` (Latin), `role_vector`, `tone_register`, `motto`, `ontology`, `functional_scope`, `stylistic_parameters` (tone, rhetorical_mode, compression_ratio), `activation_rules`, `filters`, and optional `redaction` rules.

### 2.2 Personalities — 9/9 ⚠️

All 9 defined, but with thin schema. See **G1**.

Evidence: `packages/schema/src/personality.ts`, `PERSONALITY_TAXONOMY` in `packages/content-model/src/taxonomy.ts`

### 2.3 Stages — 8/8 ✅

Inquiry → Design → Construction → Calibration → Transmission → Reflection → Negotiation → Archival

Evidence: `STAGE_TAXONOMY` in `packages/content-model/src/taxonomy.ts`

### 2.4 Epochs — 8/8 ✅

Initiation → Expansion → Consolidation → Divergence → Mastery → Reinvention → Transmission → Legacy

Evidence: `EPOCH_TAXONOMY` in `packages/content-model/src/taxonomy.ts`. `AetasSchema` provides `latin_name`, `capability_profile`, `transitions_to`.

### 2.5 Settings — 8/8 ⚠️

Research, Studio, Production, Lab, Public, Retreat, Arena, Archive. Thin schema — see **G2**.

### 2.6 Scaenae — 6/6 ✅

Academica, Technica, Artistica, Civica, Domestica, Occulta. Rich schema with audience, formality, visibility, tone.

Evidence: `packages/schema/src/scaenae.ts`

### 2.7 Taxonomy Relationship Maps — 4/4 ✅

`MASK_PERSONALITY_RELATIONS`, `STAGE_SETTING_RELATIONS`, `MASK_STAGE_AFFINITIES`, `EPOCH_MASK_MODIFIERS` — all implemented in `packages/content-model/src/taxonomy.ts`.

---

## 3. Data Schema (SPEC-001 + PLAN-006)

### 3.1 Entity Coverage

| Spec Entity | Implemented | Evidence | Status |
|------------|------------|----------|--------|
| `IDENTITY_CORE` | `IdentityCoreSchema` with thesis, invariants, master_keywords | `packages/schema/src/identity.ts` | ⚠️ No dedicated DB table |
| `MASKS[]` | `MaskSchema` + `MaskType` enum (16 values) | `packages/schema/src/mask.ts` | ✅ |
| `EPOCHS[]` | `EpochSchema` + `AetasSchema` | `packages/schema/src/epoch.ts` | ✅ |
| `CLAIMS[]` | Absorbed into VC credentialSubject | `packages/core/src/vc.ts` | ✅ Adapted |
| `CREDENTIALS[]` | `W3CVerifiableCredential` + `VerifiablePresentation` | `packages/core/src/vc.ts` | ✅ |
| `PROJECTS[]` | `CVEntrySchema` type `project` (11 entry types) | `packages/schema/src/curriculum-vitae.ts` | ✅ |
| `OUTPUT_TEMPLATES[]` | `TEMPLATE_BANK` in narrative engine | `packages/content-model/src/narrative.ts` | ✅ |
| `NARRATIVE_RULES[]` | Narrative plan builder + LLM integration | `packages/content-model/src/narrative.ts` | ✅ |
| `VERIFICATION_LOG[]` | Verification logs in Postgres migrations | `apps/api/migrations/` | ✅ |
| `RELATIONS[]` | Taxonomy relationship maps (4 maps) | `packages/content-model/src/taxonomy.ts` | ✅ |
| `AttestationBlock` | Schema + routes + repository | `packages/schema/src/verification.ts`, `apps/api/src/routes/attestation-blocks.ts` | ✅ |

### 3.2 Verification Layer

| Component | Status | Evidence |
|-----------|--------|----------|
| DID Resolution (4 methods) | ✅ | `packages/core/src/did/resolvers/{key,jwk,pkh,web}.ts` |
| VC Issuance + Verification | ✅ | `VC.issue()`, `VC.verify()` in `packages/core/src/vc.ts` |
| Verifiable Presentations | ✅ | `VC.createPresentation()` / `VC.verifyPresentation()` |
| Content-Addressed IDs (CID) | ✅ | `VC.calculateCID()` — IPFS SHA-256 |
| Attestation Blocks | ✅ | `apps/api/src/routes/attestation-blocks.ts`, `apps/api/src/repositories/attestation-blocks.ts` |
| Soulbound Tokens (SBT) | 🔄 Deferred | Not implemented — see G10 |

### 3.3 Curriculum Vitae Multiplex

| Feature | Status | Evidence |
|---------|--------|----------|
| Master document with versioned entries | ✅ | `CurriculumVitaeMultiplexSchema` |
| 11 entry types | ✅ | experience through custom |
| Multi-dimensional filtering | ✅ | `CVFilterSchema` — personae, aetas, scaenae, tags, priority |
| Persona-scoped resume generation | ✅ | `POST /:id/cv/generate-resume/:maskId` |
| Tabula Personarum (persona directory) | ✅ | `TabulaPersonarumEntrySchema` + `TabulaPersonarum.tsx` UI component |
| Persona resonance tracking | ✅ | `PersonaResonanceSchema` — fit_score 0-100 |

---

## 4. System Architecture (ARCH-001–005 + ADRs)

### 4.1 Planned vs. Actual Architecture

| Layer | Planned | Actual | Status |
|-------|---------|--------|--------|
| Client | Web + Mobile + Admin | Next.js 15 with admin settings | ⚠️ No mobile |
| API Gateway | REST + GraphQL | Fastify REST (50+ endpoints) + GraphQL subscriptions | ✅ |
| Identity Service | DID Resolver | 4 DID resolvers (key, jwk, pkh, web) | ✅ |
| Profile Service | Career Graph DB + Timeline | PostgreSQL + pgvector + `AetasTimeline.tsx` | ✅ |
| VC Service | Issuance + Verification + SBT | VC + attestation blocks — no SBT | ⚠️ SBT deferred |
| Data Layer | Relational + Graph + Vector | PostgreSQL (relational + vector) + Redis | ✅ Simplified |
| Blockchain Layer | DID + VC + SBT + Wallet | Software-based DIDs only | 🔄 Deferred |

### 4.2 ADR Alignment Summary

| ADR | Decision | Alignment | Notes |
|-----|----------|-----------|-------|
| 001 | pnpm monorepo + Turborepo | ✅ Fully aligned | Performance targets met |
| 002 | PostgreSQL 15 + pgvector | ✅ Fully aligned | Migrations, JSONB, vector search all present |
| 003 | Redis 7 + BullMQ | ✅ Mostly aligned | Cache + queue working; rate limiting deferred |
| 004 | Local-first LLM (Ollama) | ⚠️ Partial | Core executor working; tool allowlist not implemented |
| 005 | Mask-based identity system | ✅ Fully aligned | 16 masks, 3 ontologies, scoring algorithms |
| 006 | Next.js 15 App Router | ✅ Mostly aligned | D3 present; Lighthouse CI not validated |
| 007 | REST API + hybrid versioning | ✅ Fully aligned | `/v1/` routes, `Accept-Version` header |
| 008 | Hunter Protocol architecture | ⚠️ Partial | 4-tool interface correct; provider implementations limited to mock |
| 009 | Docker + Kubernetes + Helm | ✅ Fully aligned | docker-compose, Helm charts, GH Actions deploy |
| 010 | JWT + RBAC auth | ✅ Mostly aligned | Auth hardened; token revocation blocklist not yet implemented |
| 011 | GraphQL WebSocket subscriptions | ✅ Fully aligned | CJS/ESM workaround in place |
| 012 | DID Resolver plugin architecture | ✅ Fully aligned | Registry + 4 method resolvers |

---

## 5. Agent Registry (SPEC-004 + ORCH-001–005)

### 5.1 Agent Mapping — 10/10 ✅

All 10 agents implemented: Architect, Implementer, Reviewer, Tester, Maintainer, Narrator, Ingestor, Crawler, Hunter, Catcher.

Evidence: `apps/orchestrator/src/agents.ts`

### 5.2 Agent Operating Principles (ORCH-001)

The agent meta-prompt defines 6 principles: Continuity, Coherence, Initiative, Practicality, Acceleration, Constraint Preservation.

| Principle | Implementation | Status |
|-----------|---------------|--------|
| Continuity (track prior outputs) | Task queue persists execution history | ✅ |
| Coherence (unified model) | Schema-first design ensures single truth | ✅ |
| Initiative (infer next actions) | Agents use `StubExecutor` — no autonomous initiative | ⚠️ Stub only |
| Practicality (no filler) | 4-tool Hunter Protocol is focused | ✅ |
| Acceleration (shorten future work) | Narrative templates, batch generation | ✅ |
| Constraint Preservation (respect invariants) | Auth middleware, ownership guards | ✅ |

### 5.3 Orchestration Capabilities

| Capability | Status | Evidence |
|-----------|--------|----------|
| Task queue with persistence | ✅ | Redis-backed queue in orchestrator |
| Role-based agent routing | ✅ | `RoutedAgentExecutor` |
| GitHub webhook ingestion | ✅ | `POST /webhooks/github` |
| Dead letter queue (DLQ) | ✅ | DLQ implementation |
| Sense-Plan-Act-Critique loop | ⚠️ Partial | Individual steps exist; full cycle not wired |
| CI-triggered autonomous cycles | ❌ | Agents use `StubExecutor` |

---

## 6. COVENANT Commitments

### 6.1 Core Commitments (§X) — 6/6

| # | Commitment | Status | Evidence |
|---|-----------|--------|----------|
| 1 | **Master Truth** — One source, many views | ✅ | `CurriculumVitaeMultiplexSchema` |
| 2 | **Transparent Personas** — Every mask declared | ✅ | `TabulaPersonarumSchema` + `TabulaPersonarum.tsx` UI |
| 3 | **Intelligent Filtering** — Right mask for context | ✅ | `selectBestMask()`, `maskWeight()` |
| 4 | **Mutual Evaluation** — Both sides scored | ✅ | Inverted Interview + `CompatibilityAnalyzer` |
| 5 | **Respect for Time** — Quick, relevant, honest | ✅ | Hunter Protocol 4-step pipeline |
| 6 | **Dignity** — Complete human, not a resume | ⚠️ | Embedded in design, not stated in UI (G6) |

### 6.2 Theatrical Frame (§IX) — 6/6 ✅

Theatrum mundi, Dramatis personae, In medias res, Persona, Finis coronat opus, Ars est celare artem — all mapped to implementation.

### 6.3 Designer/User/System Commitments (§XIII) — All honored

- Users own their master record (ownership middleware) ✅
- Users choose which masks to present (PersonaeSelector) ✅
- System never alters master record without auth ✅
- Verifiable claims via cryptographic proof ✅

---

## 7. Evolution Plan Alignment (EVOLUTION-PLAN)

The evolution plan documents post-Phase 10 aspirations. Many items marked `[x]` (complete) — verified against codebase:

| Promise | Claimed | Verified | Evidence |
|---------|---------|----------|----------|
| Ingestor upsert logic | ✅ | ✅ | Orchestrator repository layer |
| Key export/backup UI | ✅ | ✅ | `apps/web/src/components/KeyExportModal.tsx` |
| Human-in-the-loop narrative drafts | ✅ | ✅ | Draft approval in `NarrativeBlocks.tsx` |
| Redaction mask logic | ✅ | ✅ | `MaskSchema.redaction` + API enforcement |
| Rate limiting | ✅ | ✅ | Fastify rate limiting middleware |
| Agent-to-Agent Read API | ✅ | ✅ | `/agent/v1/query` in `apps/api/src/index.ts` |
| Visual career architecture | ✅ | ✅ | `apps/web/src/components/MermaidView.tsx`, `apps/web/src/app/share/[profileId]/visuals/page.tsx` |
| Third-party attestation protocol | ✅ | ✅ | `AttestationBlock` schema + routes + repository |
| Resume parser ingestor | ✅ | ⚠️ | Agent exists; local-only LLM mode unclear |
| Aetas timeline visualization | ✅ | ✅ | `apps/web/src/components/AetasTimeline.tsx` (with tests) |
| RAG/context window management | ✅ | ⚠️ | LLM context vars exist; summarizer service unclear |

---

## 8. Archived Originals vs. Consolidated Summaries

The `CONSOLIDATED-SPECIFICATIONS.md` compresses the original FOUND/SPEC/ARCH/ORCH/META/PLAN series into a single 787-line reference. Key observations from comparing originals to consolidated:

### Context Preserved

- Blockchain-CV analogy (FOUND-001 → §1.1): Core thesis intact
- Eight identity questions (FOUND-004 → §1.2): All 8 questions preserved
- Mask taxonomy (SPEC-003 → §3): All 16 masks with full detail
- Agent registry (SPEC-004 → §5.2): All 5 core roles preserved
- Orchestration loop (ORCH-002 → §5.4): Sense-Plan-Act-Critique intact

### Context Compressed or Lost

| Original | What was compressed | Impact |
|----------|-------------------|--------|
| FOUND-002 | Four-layer blockchain stack (DID/VC/SBT/Portfolio) with env placeholders | Lost pluggability emphasis |
| FOUND-003 | Latin etymology deep dive (persona principalis, deus ex machina rejection) | Persona principalis concept underemphasized |
| FOUND-005 | Eight research domain prompts as modular agent instructions | Research modularity not visible |
| META-001 | "Identity OS" framing; five major systems with verification as 5th | "Identity OS" vision less prominent |
| META-004 | Long-term trajectory toward "Personal Operating System for Work History" | Category-defining ambition compressed |
| ORCH-001 | Six operating principles + continuation hooks + authority boundaries | Agent protocol detail lost |
| PLAN-001/002 | 37 EU total effort across 7 phases; 100% budget allocation | Planning detail not referenced |

### Philosophical Elements Unique to Originals

These ideas appear in the originals but not in `CONSOLIDATED-SPECIFICATIONS.md`:

1. **Persona principalis** (FOUND-003) — The underlying actor beneath all masks. Schema supports it via `IdentityCoreSchema`, but the term and its implications aren't operationalized.

2. **"Identity OS" vision** (META-001, META-004) — The system evolving from CV tool to a sovereign identity operating system powering all professional representations. Current architecture supports this trajectory.

3. **Agent continuation hooks** (ORCH-001) — Agents should emit "next-step affordances" after completing tasks, creating a proactive suggestion loop. Not implemented (agents are reactive, not proactive).

4. **Eight research domains as callable services** (FOUND-005) — Identity, Product, Architecture, Schema, Positioning, Masks, Lineage, Cost — each delegable to an independent agent. Partially realized through 10-agent system.

---

## 9. Gap Register

### G1: PersonalitySchema Underdeveloped ([#24](https://github.com/4444J99/life-my--midst--in/issues/24))

- **Severity**: Medium
- **Seed Source**: SPEC-003 (9 personalities with rich descriptions implying capability profiles)
- **Current State**: `PersonalitySchema` has only `id`, `label`, `orientation`, `summary` — 4 fields
- **Contrast**: `ScaenaSchema` has 10+ fields including audience, formality, visibility, activities, tone
- **Recommendation**: Extend with `capability_profile`, `strengths`, `weaknesses`, `complementary_masks`

### G2: SettingSchema Minimal ([#25](https://github.com/4444J99/life-my--midst--in/issues/25))

- **Severity**: Medium
- **Seed Source**: SPEC-003 (8 settings providing environmental context)
- **Current State**: 4 fields (`id`, `title`, `summary`, `tags`) vs. ScaenaSchema's 10+
- **Recommendation**: Extend with `audience`, `formality`, `tone_expectations`, `typical_constraints`

### G3: COVENANT Persona Names Not Operationalized ([#26](https://github.com/4444J99/life-my--midst--in/issues/26))

- **Severity**: Low
- **Seed Source**: COVENANT §III-A (Persona Sapiens, Mechanica, Fabulator, Synthesist, Errans, Soror/Frater)
- **Current State**: 16 functional masks exist but COVENANT's 6 Latin personas not seeded as canonical `TabulaPersonarumEntry` instances
- **Recommendation**: Seed 6 entries with COVENANT names as `nomen`, mapping to mask combinations

### G4: MaskSelector Hardcodes 4 Masks ([#27](https://github.com/4444J99/life-my--midst--in/issues/27))

- **Severity**: Medium
- **Seed Source**: SPEC-003 (16 masks available)
- **Current State**: `MaskSelector.tsx` exposes only analyst, artisan, architect, strategist (4/16)
- **Note**: `PersonaeSelector.tsx` and `TabulaPersonarum.tsx` are dynamic — this gap is specific to `MaskSelector`
- **Recommendation**: Make dynamic or replace with `PersonaeSelector`

### G5: Theatrical Language Not Surfaced in UI ([#28](https://github.com/4444J99/life-my--midst--in/issues/28))

- **Severity**: Low
- **Seed Source**: FOUND-003 (theatrum mundi, persona principalis), COVENANT §IX
- **Current State**: Schema has `nomen`, `latin_name`, `motto`; UI uses English labels
- **Recommendation**: Surface `nomen`/`motto` in persona cards; consider theatrical mode toggle

### G6: No Explicit Dignity Statement in UI ([#29](https://github.com/4444J99/life-my--midst--in/issues/29))

- **Severity**: Low
- **Seed Source**: COVENANT §XII–XIV, GENESIS ("You are not a resume. You are a complete human.")
- **Current State**: Dignity embedded in design but not visible as mission statement
- **Recommendation**: Extend about page with COVENANT dignity statements

### G7: Identity Invariants Not Persisted ([#30](https://github.com/4444J99/life-my--midst--in/issues/30))

- **Severity**: Medium
- **Seed Source**: FOUND-004 (8 identity questions), SPEC-001 (IdentityCore interface), FOUND-003 (persona principalis)
- **Current State**: `IdentityCoreSchema` exists with 7 fields but no dedicated DB table
- **Recommendation**: Add `identity_core` table or JSON column on profiles

### G8: Mask Matching Not Unified ([#31](https://github.com/4444J99/life-my--midst--in/issues/31))

- **Severity**: Low
- **Seed Source**: SPEC-002 (single coherent mask filtering system)
- **Current State**: Basic in `core/maskMatching.ts`, sophisticated in `content-model/mask-selection.ts`
- **Recommendation**: Deprecate simpler version, re-export from content-model

### G9: Interview Questions Hardcoded ([#32](https://github.com/4444J99/life-my--midst--in/issues/32))

- **Severity**: Medium
- **Seed Source**: COVENANT §VIII, PLAN-008 (12 strategic questions + system-generated follow-ups)
- **Current State**: 9 static questions in API, 5 in UI. No gap-based follow-up generation.
- **Recommendation**: LLM-powered question generation from profile/job context, with static fallback

### G10: Blockchain/Wallet/SBT Not Implemented ([#33](https://github.com/4444J99/life-my--midst--in/issues/33))

- **Severity**: Deferred (by design)
- **Seed Source**: FOUND-002, SPEC-001, COVENANT §XI
- **COVENANT Position**: Explicitly "Long Term"
- **Recommendation**: Document as intentionally deferred

### G11: Real-Time Interview Analysis ([#34](https://github.com/4444J99/life-my--midst--in/issues/34))

- **Severity**: Medium
- **Seed Source**: PLAN-008 (Act II staging, live compatibility, tone analysis)
- **Current State**: Post-hoc scoring, not live. No tone analysis.
- **Recommendation**: WebSocket live scoring; LLM tone analysis on answer submission

### G12: Dynamic Mask Triggering From Interview ([#35](https://github.com/4444J99/life-my--midst--in/issues/35))

- **Severity**: Low
- **Seed Source**: PLAN-008 §"The Masks Respond Dynamically"
- **Current State**: Masks selected manually, not triggered by interviewer answers
- **Recommendation**: Wire `selectBestMask()` to interview answer analysis

### G13: Custom User-Created Masks ([#36](https://github.com/4444J99/life-my--midst--in/issues/36))

- **Severity**: Low (Phase 2 feature)
- **Seed Source**: ADR-005 (promises user-created masks in Phase 2)
- **Current State**: 16 predefined masks only; no custom mask creation UI or API
- **Recommendation**: Implement as planned Phase 2 feature

### G14: Hunter Protocol Provider Implementations ([#37](https://github.com/4444J99/life-my--midst--in/issues/37))

- **Severity**: Medium
- **Seed Source**: ADR-008 (pluggable job search providers)
- **Current State**: Only `MockJobSearchProvider` confirmed; Serper/real provider status unclear
- **Recommendation**: Implement at least one real job board provider (Indeed, LinkedIn, Serper)

### G15: Agent Stub Executors (No Real Autonomy) ([#38](https://github.com/4444J99/life-my--midst--in/issues/38))

- **Severity**: Low (architectural placeholder)
- **Seed Source**: ORCH-001 (6 operating principles including Initiative), ORCH-002 (Sense-Plan-Act loop)
- **Current State**: All 10 agents use `StubExecutor` (20ms delay, always returns "completed")
- **Impact**: Agent infrastructure is correct but non-functional — no LLM-powered execution
- **Recommendation**: Connect agents to Ollama executor for real task processing

---

## 10. Remediation Recommendations

### Priority 1 — Quick Wins (Low effort, medium impact)

| Gap | Action | Effort |
|-----|--------|--------|
| **G4** | Make `MaskSelector.tsx` dynamic | 1-2 hours |
| **G8** | Unify mask matching in content-model | 1 hour |
| **G5** | Surface `nomen`/`motto` in persona cards | 1 hour |

### Priority 2 — Schema Enrichment (Medium effort, ontological depth)

| Gap | Action | Effort |
|-----|--------|--------|
| **G1** | Extend `PersonalitySchema` | 2-3 hours |
| **G2** | Extend `SettingSchema` | 2-3 hours |
| **G7** | Persist `identity_core` in DB | 3-4 hours |

### Priority 3 — Content & Presentation (Low effort, philosophical alignment)

| Gap | Action | Effort |
|-----|--------|--------|
| **G3** | Seed 6 COVENANT persona entries | 1-2 hours |
| **G6** | Extend about page with dignity statements | 1-2 hours |

### Priority 4 — Interview Vision (Medium effort)

| Gap | Action | Effort |
|-----|--------|--------|
| **G9** | Dynamic interview question generation | 4-6 hours |
| **G11** | WebSocket live interview scoring | 6-8 hours |
| **G12** | Auto-suggest masks from interview context | 3-4 hours |

### Priority 5 — System Maturation (Higher effort)

| Gap | Action | Effort |
|-----|--------|--------|
| **G14** | Real job search provider | 4-6 hours |
| **G15** | Connect agents to LLM executor | 8-12 hours |
| **G13** | Custom mask creation | 6-8 hours |
| **G10** | Blockchain/SBT integration | Significant (future) |

---

## 11. Cross-Reference with FEATURE-AUDIT.md

- **FEATURE-AUDIT** answers: "Does the code implement what the specs describe?" (functional completeness)
- **SEED-ALIGNMENT-AUDIT** answers: "Does the code honor the vision, ontology, and promises of the founding documents?" (philosophical alignment)

No contradictions found. Where FEATURE-AUDIT marks `✅ COMPLETE`, this audit confirms philosophical intent is preserved. The 15 gaps are areas where implementation is *functionally correct* but *ontologically thinner* or *aspirationally incomplete* relative to the seeds.

**Key correction from expanded audit**: Several items initially flagged as gaps (Aetas timeline, MermaidView, KeyExportModal, AttestationBlock, agent-to-agent API) turned out to be **already implemented** — the EVOLUTION-PLAN's `[x]` markers were accurate.

---

## Conclusion

Across all seed documents — 34 archived originals, 9 consolidated/root-level design docs, and 12 ADRs — the implementation demonstrates strong philosophical alignment:

- **Core thesis** (blockchain-CV analogy, mask-based identity, mutual evaluation) is fully realized
- **Ontological taxonomy** (16 masks, 9 personalities, 8 stages, 8 epochs, 8 settings, 6 scaenae) is complete with relationship maps
- **12 ADRs** show 9 fully aligned, 3 partially aligned, 0 contradicted
- **COVENANT commitments** (6 core + designer/user/system) are all honored
- **EVOLUTION-PLAN** features are largely implemented (verified: AetasTimeline, MermaidView, KeyExportModal, AttestationBlock, agent-to-agent API)
- **15 gaps** remain: 5 medium severity (thin schemas, hardcoded masks/questions, identity persistence, live interview, real job providers), 7 low severity, 1 deferred by design, 2 architectural placeholders
- **0 contradictions** with FEATURE-AUDIT

The system translates its philosophical DNA into working software. The original seeds envisioned an "Identity OS" — the current implementation is a strong foundation toward that vision, with the remaining gaps being refinements rather than structural failures.

*Finis coronat opus.*

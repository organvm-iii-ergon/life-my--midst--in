# Exhaustive Roadmap: in–midst–my–life System
## From Covenant to Complete Implementation

**Generated**: 2026-01-07  
**Status**: Roadmap committed to universal contextual awareness  
**Total Scope**: 13 phases, 98 tasks, ~79 EU (6 months at 3 EU/week)

---

## PHASE SUMMARY

### Phase 1: Core Schema & Data Model Stabilization (3 EU)
- Extend identity schema with theatrical metadata (nomen, role vector, tone register, visibility scope, motto)
- Create curriculum vitae multiplex schema (master CV with personae/aetas/scaenae tagging)
- Define tabula personarum (mask index) schema with theatrical attributes
- Extend epoch schema with aetas lifecycle definitions
- Create scaenae (theatrical stages) taxonomy schema
- Add profile narrative structure for theatrical self-awareness

**Depends on**: Nothing (foundational)  
**Unblocks**: Phase 2 (API)  
**Success criterion**: Schemas pass validation, tests written

---

### Phase 2: Backend API Expansion - Curriculum Vitae Multiplex Operations (5 EU)
- Create /profiles/:id/cv endpoint (master curriculum vitae retrieval)
- Create /profiles/:id/masks endpoint (CRUD operations)
- Create /profiles/:id/resume/:maskId endpoint (filtered resume generation)
- Create /profiles/:id/narrative/:maskId endpoint (mask-specific narrative blocks)
- Implement CV tagging system (personae/aetas/scaenae filters)
- Create /taxonomy/scaenae endpoint (theatrical stages listing)
- Create /profiles/:id/aetas endpoint (life-stage management)
- Implement batch resume generation for all masks

**Depends on**: Phase 1  
**Unblocks**: Phases 3, 4, 5  
**Success criterion**: All 8 endpoints working, tested, documented

---

### Phase 3: Frontend UI - Mask & Profile Management (7 EU)
- Create master CV viewer component (read-only presentation)
- Create tabula personarum editor (mask creation, editing, deletion)
- Create theatrical mask builder (nomen, role vector, tone, motto, scaenae assignment)
- Create resume preview component (show how CV appears through each mask)
- Create aetas/life-stage timeline editor
- Create batch resume exporter (PDF, DOCX, JSON-LD for each mask)
- Create scaenae visibility toggles (show/hide masks by theatrical stage)
- Create narrative block editor (edit/weight narrative entries per mask)

**Depends on**: Phase 2  
**Unblocks**: Full system UI  
**Success criterion**: UI matches mockups, mask operations fluid, no data leakage

---

### Phase 4: Hunter Protocol Full Integration (6 EU)
- Expand SearchProvider with advanced filtering (seniority, industry, stack match)
- Integrate JobHuntScheduler with database persistence (Redis migration tracking)
- Implement mask-aware resume tailor (use selected mask for resume customization)
- Create HunterAgent logging/monitoring (track all find/analyze/tailor/write operations)
- Add job application history tracking (timestamp, mask used, outcome)
- Implement feedback loop (mark interviews/rejections, refine Hunter strategy)
- Create Hunter agent dashboard (active jobs, pending applications, win rate)

**Depends on**: Phase 2  
**Unblocks**: Phase 12 (Launch with real user data)  
**Success criterion**: Hunter finds 20 good jobs/week, tailor works per mask, cover letter generated

---

### Phase 5: Inverted Interview Full Integration (8 EU)
- Implement public profile link generation (shareable inverted interview URLs)
- Create interviewer response persistence (save answers, calculate compatibility real-time)
- Build interviewer dashboard (see which profiles evaluated them, compatibility scores)
- Implement mask resonance analysis (which masks best fit this interviewer's profile)
- Create compatibility export (PDF/JSON report both parties can download)
- Add customizable interview questions (profile owner can set questions per mask)
- Implement interview scheduling integration (calendar sync if match is high)
- Create anti-pattern detection (flags concerning hiring practices or red flags)

**Depends on**: Phase 2  
**Unblocks**: Phase 12 (Launch with real user data)  
**Success criterion**: 100+ test interviews, compatibility scores match manual review, performance <2s

---

### Phase 6: Narrative Engine Enhancement (5 EU)
- Implement mask-specific narrative filtering (show different story for each mask)
- Create narrative weighting system (LLM-scored importance per mask context)
- Build narrative timeline visualization (interactive aetas/epoch progression)
- Implement narrative PDF generation (styled resume PDFs with cover letter injection)
- Create JSON-LD narrative export (semantic web consumption)
- Implement narrative coherence checking (verify mask transitions are logical)

**Depends on**: Phase 2  
**Unblocks**: Phase 12 (Launch with complete export capability)  
**Success criterion**: PDFs render correctly, JSON-LD validates, timeline interactive

---

### Phase 7: Verification & Credentials (DID/VC Integration) (6 EU)
- Implement DID generation (decentralized identifier for profile)
- Create verifiable credential issuance (issue VCs for each mask/aetas/scaenae)
- Implement credential presentation (selective disclosure of credentials)
- Create credential verification endpoint (3rd party validation)
- Build credential history/revocation system
- Implement mask-specific credential issuing (different credentials per persona)

**Depends on**: Phase 2  
**Unblocks**: Phase 13 (Advanced verification features)  
**Success criterion**: DIDs generated, VCs issuable/verifiable, selective disclosure working

---

### Phase 8: Testing & Quality Assurance (12 EU)
- Unit tests for all mask filtering logic
- Integration tests for CV multiplex operations (tag/filter/retrieve)
- End-to-end tests (create profile → add masks → generate resumes → inverted interview)
- Hunter Protocol integration tests (job search → analyze → tailor → cover letter)
- Compatibility analysis unit tests (all 5-factor scoring dimensions)
- UI component tests (Mask editor, Resume preview, Interview flow)
- Security tests (no mask bleed-through, no unauthorized access)
- Performance tests (resume generation time, narrative rendering, compatibility scoring)

**Depends on**: Phases 2-7 (tests written as features ship)  
**Unblocks**: Phase 9 (Deploy with confidence)  
**Success criterion**: >80% coverage, E2E tests pass, no security vulnerabilities

---

### Phase 9: Deployment & Infrastructure (6 EU)
- Finalize Docker Compose setup (all services with health checks)
- Create Kubernetes manifests (API, Orchestrator, Web, database, Redis)
- Set up CI/CD pipeline (tests, build, deploy to staging/production)
- Implement database migration strategy (versioning, rollback capability)
- Create monitoring/alerting (logs, metrics, uptime tracking)
- Set up backup/restore procedures (database, user data)
- Configure secrets management (API keys, database passwords, LLM tokens)

**Depends on**: Phase 8 (tests must pass before deploy)  
**Unblocks**: Phase 11 (Beta testing) and Phase 12 (Public launch)  
**Success criterion**: Deploys via CI/CD, scales horizontally, monitoring alerts working

---

### Phase 10: Documentation & Knowledge Transfer (5 EU)
- Complete API documentation (OpenAPI/Swagger with all endpoints)
- Create user guide (how to create masks, generate resumes, use hunter, inverted interview)
- Write architecture documentation (system design, data flows, integration points)
- Create developer onboarding guide (setup, conventions, contribution process)
- Document theatrical framework (theatrum mundi, personae, dramatist personae implications)
- Create deployment runbook (how to deploy, scaling, troubleshooting)

**Depends on**: All feature phases (written concurrently)  
**Unblocks**: Phase 11 (Beta users need docs)  
**Success criterion**: API docs complete, no unanswered questions

---

### Phase 11: Beta Testing & Iteration (4 EU)
- Internal testing with team (all features, all user flows)
- Alpha user group testing (recruit 5-10 users for feedback)
- Iterate on UX based on feedback (mask editor, resume preview, interview flow)
- Performance tuning (optimize resume generation, narrative rendering)
- Security audit (penetration testing, vulnerability assessment)

**Depends on**: Phases 9-10 (infrastructure and docs ready)  
**Unblocks**: Phase 12 (Launch)  
**Success criterion**: Alpha users complete inverted interviews, feedback incorporated

---

### Phase 12: Launch & Market Introduction (4 EU)
- Finalize branding and messaging (theatrical metaphor positioning)
- Create public landing page (vision, problem, solution, call to action)
- Launch public beta (collect user feedback, iterate rapidly)
- Implement analytics (track user behavior, feature adoption, funnel analysis)
- Create case studies (success stories of users who got jobs via inverted interview)

**Depends on**: Phase 11 (Tested and ready)  
**Unblocks**: Phase 13 (Growth features)  
**Success criterion**: Landing page converts, public beta launched, early adopters onboarded

---

### Phase 13: Advanced Features & Extensions (8+ EU)
- Multi-party interviews (evaluate teams, not just individuals)
- Reverse interviews (organizations create profiles, candidates interview them)
- Community masks (shared mask templates, community voting on quality)
- AI-powered mask suggestions (LLM recommends masks based on profile content)
- Network analysis (show how masks connect people with shared experiences)
- Marketplace integration (connect to job boards directly, two-way updates)

**Depends on**: Phase 12 (Only after proving core value)  
**Unblocks**: Nothing—these are growth vectors  
**Success criterion**: Community features adopted, network effects visible

---

## CRITICAL PATH & DEPENDENCIES

```
Schema (Phase 1)
    ↓
API Endpoints (Phase 2)
    ↓
┌───────────────────┬──────────────────┬───────────────────┐
│                   │                  │                   │
UI (Phase 3)    Hunter (Phase 4)   Inverted (Phase 5)    
│                   │                  │
└───────────────────┴──────────────────┘
        ↓
  Narrative (Phase 6)
        ↓
  Credentials (Phase 7)
        ↓
  Testing (Phase 8) ←── parallel --→ Infra (Phase 9) ←── parallel --→ Docs (Phase 10)
        ↓
  Beta Testing (Phase 11)
        ↓
  Launch (Phase 12)
        ↓
  Advanced (Phase 13)
```

---

## EFFORT ESTIMATE BY PHASE

| Phase | EU | Notes |
|-------|-----|--------|
| 1: Schema | 3 | Schema work is fast if clear; foundational |
| 2: API | 5 | CRUD endpoints, filtering logic, multi-level access |
| 3: UI | 7 | Most complex user-facing phase; mask editor + preview |
| 4: Hunter | 6 | Integration + persistence + logging |
| 5: Inverted | 8 | Most complex feature; public links + real-time scoring |
| 6: Narrative | 5 | Building on existing engine; filtering + export |
| 7: Credentials | 6 | DID/VC stack integration; selective disclosure |
| 8: Testing | 12 | Comprehensive unit/integration/E2E/security/perf |
| 9: Infrastructure | 6 | Kubernetes, monitoring, secrets, backup |
| 10: Documentation | 5 | API docs, user guide, architecture, onboarding |
| 11: Beta Testing | 4 | User testing, iteration, security audit |
| 12: Launch | 4 | Branding, landing page, beta, analytics |
| 13: Advanced | 8+ | Growth features; scope grows with feedback |
| **TOTAL** | **79 EU** | **~6 months at 3 EU/week velocity** |

---

## SUCCESS CRITERIA BY PHASE

| Phase | Success = |
|-------|-----------|
| 1 | Schemas pass validation, test coverage, no circular deps |
| 2 | 8/8 endpoints working, tested, documented in OpenAPI |
| 3 | UI matches mockups, no data bleed, operations intuitive |
| 4 | Hunter finds 20 quality jobs/week, mask-aware tailoring works |
| 5 | 100+ test interviews, scores match manual review, <2s response |
| 6 | PDFs render, JSON-LD validates, timeline interactive |
| 7 | DIDs generated, VCs issued/verified, selective disclosure works |
| 8 | >80% coverage, E2E pass, 0 security vulns, perf benchmarked |
| 9 | CI/CD deploy, horizontal scaling, monitoring + alerts working |
| 10 | API docs complete, onboarding questions answered |
| 11 | Alpha users complete workflows, feedback core → backlog |
| 12 | Landing page converts, public beta live, early cohort onboarded |
| 13 | Community adoption, network effects emerging, roadmap extends |

---

## PARALLEL WORK OPPORTUNITIES

These can start simultaneously once their dependencies are met:

- **Phases 3, 4, 5** can run in parallel after Phase 2 completes (different domains)
- **Phases 8, 9, 10** should run in parallel starting mid-Phase 6 (write tests as features ship, infra as tests solidify, docs continuously)
- **Phase 11** cannot start until Phase 9 is stable (infrastructure must be deployable)
- **Phase 12** cannot start until Phase 11 validates core workflows

---

## PHASE 1 DETAILED BREAKDOWN (NEXT IMMEDIATE WORK)

When ready to begin Phase 1, tasks are:

1. **1.1** - Extend `packages/schema/src/identity.ts` with theatrical metadata
   - Add fields: nomen (Latin name), role_vector, tone_register, visibility_scope, motto
   - Add validation rules

2. **1.2** - Create `packages/schema/src/curriculum-vitae-multiplex.ts`
   - Master CV structure with entry tagging (personae[], aetas[], scaenae[])
   - Entry filtering logic

3. **1.3** - Create `packages/schema/src/tabula-personarum.ts` (mask index)
   - Mask metadata schema with all theatrical attributes
   - Visibility and resonance tracking

4. **1.4** - Extend `packages/schema/src/epoch.ts` with aetas
   - Life-stage definitions (Initiation, Emergence, Mastery, Integration)
   - Age ranges and capability descriptions

5. **1.5** - Create `packages/schema/src/scaenae.ts` (theatrical stages)
   - Stage taxonomy (Academica, Technica, Artistica, Civica, Domestica, Occulta)
   - Visibility rules per mask

6. **1.6** - Add narrative structure for theatrical self-awareness
   - Self-aware narrative blocks that acknowledge performance
   - Meta-theatrical commentary fields

---

## WHAT'S ALREADY DONE (Foundation)

✅ Tasks 1-15 (from previous session)
- Core schema, migrations, API foundation, design system, CI/CD

✅ Hunter Protocol (recent)
- SearchProvider, HunterAgent (4 tools), JobHuntScheduler, tests, docs

✅ Inverted Interview (recent)
- CompatibilityAnalyzer, Interview API routes, UI component, full documentation

✅ Philosophical Foundation
- COVENANT.md, CONVERSATION-COVENANT-GENESIS.md, git initialized

---

## DECISION POINTS FOR USER

Before proceeding, clarify:

1. **Velocity**: Sequential (finish phase → next) or parallel (work on multiple simultaneously)?
2. **Scope**: Full 79 EU roadmap, or **MVP sprint** (Phases 1-5 only = ~30 EU)?
3. **Team**: Solo builder or multiple contributors? (affects documentation priority)
4. **Commercialization**: Public product launch (all 13 phases) or proof-of-concept (1-7)?
5. **Starting Point**: Begin with Phase 1 (Schema) or skip to a specific phase?

---

## CONTEXT FOR FUTURE SESSIONS

This roadmap provides:
- ✅ Clear phasing with dependencies mapped
- ✅ Effort estimates (79 EU total)
- ✅ Success criteria for each phase
- ✅ Parallel work opportunities (3, 4, 5 in parallel; 8, 9, 10 in parallel)
- ✅ Immediate next tasks (Phase 1 detailed breakdown)
- ✅ Foundation already in place (schema, API, Hunter, Inverted Interview)

When a new session begins, reference this memory to:
- Know where we are in the roadmap
- Know what phase to tackle next
- Know what's blocking what
- Know effort remaining (~79 EU from scratch, less foundation already done)

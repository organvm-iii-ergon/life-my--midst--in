-- ============================================================================
-- CV Entities for Profile 1: Elena Vasquez (Senior Systems Architect)
-- ID prefix: 00000000-0000-0000-0000-000000000001 (profile)
-- Entity IDs: 0001xx for experiences, 0002xx for educations, etc.
-- ============================================================================

-- ── Experiences (6) ─────────────────────────────────────────────────────────

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000001',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0001-000000000001",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "roleTitle":"Principal Systems Architect",
   "organization":"Meridian Platform Inc.",
   "startDate":"2022-03-01",
   "isCurrent":true,
   "highlights":[
     "Designed event-driven architecture serving 12M daily active users with 99.97% uptime",
     "Led RFC process adopted by 8 engineering teams, reducing architectural drift by 60%",
     "Mentored 14 engineers across L3-L6, resulting in 5 promotions",
     "Introduced observability-first design reducing MTTR from 45min to 8min"
   ],
   "tags":["architecture","systems","design","reliability","observability","leadership","delivery"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2025-01-15T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-15T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000002',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0001-000000000002",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "roleTitle":"Senior Platform Engineer",
   "organization":"Stratos Cloud",
   "startDate":"2019-06-01",
   "endDate":"2022-02-28",
   "isCurrent":false,
   "highlights":[
     "Built multi-tenant data pipeline processing 2.3B events/day with sub-200ms p99 latency",
     "Migrated monolith to 34 microservices using strangler fig pattern over 18 months",
     "Designed API gateway handling 15K rps with circuit breaker and rate limiting",
     "Authored internal \"Architecture Decision Records\" practice, now company standard"
   ],
   "tags":["platform","api","integration","delivery","metrics","scalability","migration"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000003',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0001-000000000003",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "roleTitle":"Backend Engineer",
   "organization":"NovaTech Solutions",
   "startDate":"2016-08-01",
   "endDate":"2019-05-31",
   "isCurrent":false,
   "highlights":[
     "Implemented real-time collaboration engine using CRDTs and WebSocket transport",
     "Reduced database query costs by 70% through materialized view strategy",
     "Led on-call rotation redesign reducing alert fatigue by 55%",
     "Contributed to open-source distributed tracing library (1.2K GitHub stars)"
   ],
   "tags":["backend","collaboration","research","quality","testing","observability"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000004',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0001-000000000004",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "roleTitle":"Software Engineer",
   "organization":"Foundry Labs",
   "startDate":"2013-09-01",
   "endDate":"2016-07-31",
   "isCurrent":false,
   "highlights":[
     "Built payment processing pipeline handling $2.1M daily transaction volume",
     "Designed fault-tolerant job queue with exactly-once delivery semantics",
     "Introduced property-based testing reducing production bugs by 40%"
   ],
   "tags":["backend","delivery","quality","testing","reliability"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000005',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0001-000000000005",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "roleTitle":"Teaching Assistant — Distributed Systems",
   "organization":"UC Berkeley EECS",
   "startDate":"2012-01-01",
   "endDate":"2013-06-30",
   "isCurrent":false,
   "highlights":[
     "Guided 120 graduate students through Paxos, Raft, and Byzantine consensus labs",
     "Co-authored lecture materials on consistency models adopted in subsequent semesters",
     "Mentored 8 research project teams on distributed storage implementations"
   ],
   "tags":["research","communication","documentation","collaboration"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000006',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0001-000000000006",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "roleTitle":"Open Source Maintainer",
   "organization":"Convergence Project (OSS)",
   "startDate":"2018-01-01",
   "isCurrent":true,
   "highlights":[
     "Created and maintain distributed tracing SDK used by 340+ production deployments",
     "Manage 12 contributors across 4 time zones, shipping monthly releases",
     "Published RFC process for feature proposals with community governance model"
   ],
   "tags":["craft","artifact","collaboration","governance","documentation"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2025-01-10T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-10T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Educations (3) ──────────────────────────────────────────────────────────

INSERT INTO educations (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0002-000000000001',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0002-000000000001",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "institution":"University of California, Berkeley",
   "degree":"M.S.",
   "fieldOfStudy":"Computer Science — Distributed Systems",
   "startDate":"2011-08-01",
   "endDate":"2013-05-31",
   "isCurrent":false,
   "highlights":["Thesis: Adaptive Consensus Protocols for Heterogeneous Networks","GPA 3.92/4.0"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO educations (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0002-000000000002',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0002-000000000002",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "institution":"Universidad Nacional Autonoma de Mexico",
   "degree":"B.S.",
   "fieldOfStudy":"Computer Engineering",
   "startDate":"2007-08-01",
   "endDate":"2011-06-30",
   "isCurrent":false,
   "highlights":["Magna Cum Laude","Senior capstone: Fault-tolerant message broker prototype"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO educations (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0002-000000000003',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0002-000000000003",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "institution":"Santa Fe Institute",
   "degree":"Certificate",
   "fieldOfStudy":"Complexity Science — Summer School",
   "startDate":"2015-06-01",
   "endDate":"2015-08-31",
   "isCurrent":false,
   "highlights":["Agent-based modeling of organizational decision networks"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Projects (5) ────────────────────────────────────────────────────────────

INSERT INTO projects (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0003-000000000001',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0003-000000000001",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "name":"Meridian Event Mesh",
   "role":"Lead Architect",
   "startDate":"2022-06-01",
   "isOngoing":true,
   "url":"https://meridian.dev/event-mesh",
   "highlights":[
     "Event-driven backbone connecting 34 microservices with exactly-once delivery",
     "Schema registry with backward/forward compatibility validation",
     "Custom dead-letter queue with automatic retry and circuit breaker integration"
   ],
   "tags":["architecture","system","delivery","reliability","integration"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2025-01-10T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-10T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO projects (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0003-000000000002',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0003-000000000002",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "name":"Convergence Tracing SDK",
   "role":"Creator & Maintainer",
   "startDate":"2018-03-01",
   "isOngoing":true,
   "url":"https://github.com/convergence-project/tracing-sdk",
   "highlights":[
     "Open-source distributed tracing library — 1,200+ GitHub stars, 340+ production users",
     "OpenTelemetry-compatible with zero-config auto-instrumentation",
     "Monthly release cadence with semantic versioning and migration guides"
   ],
   "tags":["craft","artifact","observability","documentation","collaboration"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2025-01-05T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-05T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO projects (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0003-000000000003',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0003-000000000003",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "name":"Platform Reliability Scorecard",
   "role":"Technical Lead",
   "startDate":"2023-01-01",
   "endDate":"2023-09-30",
   "isOngoing":false,
   "highlights":[
     "Internal tool scoring service reliability across 12 dimensions",
     "Automated weekly reports to VP Engineering with trend analysis",
     "Adopted by 3 other business units after pilot success"
   ],
   "tags":["quality","metrics","testing","reliability","governance"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO projects (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0003-000000000004',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0003-000000000004",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "name":"Monolith Migration Playbook",
   "role":"Author",
   "startDate":"2020-03-01",
   "endDate":"2021-09-30",
   "isOngoing":false,
   "highlights":[
     "40-page internal playbook for strangler-fig microservice migration",
     "Includes decision trees, risk matrices, and rollback procedures",
     "Used across 3 migration waves touching 34 services"
   ],
   "tags":["documentation","roadmap","strategy","migration","communication"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

INSERT INTO projects (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0003-000000000005',
 '00000000-0000-0000-0000-000000000001',
 '{
   "id":"00000000-0000-0000-0003-000000000005",
   "profileId":"00000000-0000-0000-0000-000000000001",
   "name":"Identity Narrative Engine",
   "role":"Architect & IC",
   "startDate":"2024-06-01",
   "isOngoing":true,
   "url":"https://github.com/in-midst-my-life",
   "highlights":[
     "Theatrical mask-based identity presentation system for professional profiles",
     "Schema-first monorepo with 535+ tests across 4 packages and 3 apps",
     "Novel narrative generation with epoch/stage/mask taxonomy"
   ],
   "tags":["design","system","craft","artifact","innovation","experiment"],
   "createdAt":"2024-06-01T00:00:00.000Z",
   "updatedAt":"2025-01-15T00:00:00.000Z"
 }'::jsonb,
 '2024-06-01T00:00:00.000Z','2025-01-15T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Skills (12) ─────────────────────────────────────────────────────────────

INSERT INTO skills (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000001","profileId":"00000000-0000-0000-0000-000000000001","name":"Distributed Systems Architecture","category":"technical","level":"expert","isPrimary":true,"tags":["architecture","system","reliability"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000002","profileId":"00000000-0000-0000-0000-000000000001","name":"Event-Driven Architecture","category":"technical","level":"expert","isPrimary":true,"tags":["architecture","integration","delivery"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000003","profileId":"00000000-0000-0000-0000-000000000001","name":"TypeScript / Node.js","category":"technical","level":"expert","isPrimary":true,"tags":["build","delivery","craft"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000004","profileId":"00000000-0000-0000-0000-000000000001","name":"PostgreSQL & Data Modeling","category":"technical","level":"expert","isPrimary":false,"tags":["reliability","quality","system"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000005","profileId":"00000000-0000-0000-0000-000000000001","name":"Kubernetes & Container Orchestration","category":"technical","level":"advanced","isPrimary":false,"tags":["delivery","reliability","observability"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000006","profileId":"00000000-0000-0000-0000-000000000001","name":"Observability & SRE Practices","category":"technical","level":"expert","isPrimary":true,"tags":["observability","reliability","metrics","quality"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000007","profileId":"00000000-0000-0000-0000-000000000001","name":"Technical Writing & ADRs","category":"professional","level":"expert","isPrimary":false,"tags":["documentation","communication","governance"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000008","profileId":"00000000-0000-0000-0000-000000000001","name":"Engineering Leadership","category":"professional","level":"advanced","isPrimary":false,"tags":["stakeholder","collaboration","roadmap"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000009","profileId":"00000000-0000-0000-0000-000000000001","name":"API Design (REST, GraphQL, gRPC)","category":"technical","level":"expert","isPrimary":false,"tags":["api","integration","design","contract"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000010","profileId":"00000000-0000-0000-0000-000000000001","name":"Rust","category":"technical","level":"intermediate","isPrimary":false,"tags":["build","quality","system"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000011', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000011","profileId":"00000000-0000-0000-0000-000000000001","name":"Mentoring & Coaching","category":"professional","level":"advanced","isPrimary":false,"tags":["collaboration","stakeholder","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0004-000000000012","profileId":"00000000-0000-0000-0000-000000000001","name":"Complexity Science","category":"research","level":"intermediate","isPrimary":false,"tags":["research","hypothesis","exploration"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Publications (3) ────────────────────────────────────────────────────────

INSERT INTO publications (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0005-000000000001","profileId":"00000000-0000-0000-0000-000000000001","title":"Adaptive Consensus in Heterogeneous Networks: A Practical Framework","publicationType":"journal","venue":"ACM Transactions on Computer Systems","date":"2014-03-01","url":"https://doi.org/10.1145/example1","tags":["research","analysis","system"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0005-000000000002","profileId":"00000000-0000-0000-0000-000000000001","title":"Event Mesh Patterns for Large-Scale Microservice Architectures","publicationType":"conference","venue":"USENIX SREcon","date":"2023-10-01","url":"https://srecon.example.com/event-mesh","tags":["architecture","delivery","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0005-000000000003","profileId":"00000000-0000-0000-0000-000000000001","title":"Observability-First Design: Beyond the Three Pillars","publicationType":"article","venue":"InfoQ","date":"2024-05-01","url":"https://infoq.com/articles/observability-first","tags":["observability","documentation","quality","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Awards (2) ──────────────────────────────────────────────────────────────

INSERT INTO awards (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0006-000000000001","profileId":"00000000-0000-0000-0000-000000000001","title":"Platform Engineering Excellence Award","issuer":"Meridian Platform Inc.","date":"2024-02-01","description":"Annual award for highest-impact platform contribution across all engineering teams"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0006-000000000002","profileId":"00000000-0000-0000-0000-000000000001","title":"Outstanding Graduate Research","issuer":"UC Berkeley EECS","date":"2013-05-01","description":"Awarded for thesis work on adaptive consensus protocols"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Certifications (3) ─────────────────────────────────────────────────────

INSERT INTO certifications (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0007-000000000001","profileId":"00000000-0000-0000-0000-000000000001","name":"AWS Solutions Architect — Professional","issuer":"Amazon Web Services","issueDate":"2021-04-01","expiryDate":"2024-04-01"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0007-000000000002","profileId":"00000000-0000-0000-0000-000000000001","name":"Certified Kubernetes Administrator (CKA)","issuer":"CNCF","issueDate":"2022-09-01","expiryDate":"2025-09-01"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0007-000000000003","profileId":"00000000-0000-0000-0000-000000000001","name":"Site Reliability Engineering Foundations","issuer":"Google Cloud","issueDate":"2020-11-01"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Social Links (3) ────────────────────────────────────────────────────────

INSERT INTO social_links (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0008-000000000001","profileId":"00000000-0000-0000-0000-000000000001","platform":"github","url":"https://github.com/elena-vasquez","sortOrder":1}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0008-000000000002","profileId":"00000000-0000-0000-0000-000000000001","platform":"linkedin","url":"https://linkedin.com/in/elena-vasquez","sortOrder":2}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0008-000000000003","profileId":"00000000-0000-0000-0000-000000000001","platform":"website","url":"https://elena-vasquez.dev","sortOrder":3}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Timeline Events (10) — spanning epochs/stages ───────────────────────────

INSERT INTO timeline_events (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000001","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"education","entityId":"00000000-0000-0000-0002-000000000002","title":"Started Computer Engineering at UNAM","startDate":"2007-08-01","endDate":"2011-06-30","descriptionMarkdown":"Foundational education in systems and algorithms. Capstone project on fault-tolerant messaging.","tags":["research","exploration","build"],"epochId":"initiation","stageId":"stage/inquiry","lane":1,"importance":0.7}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000002","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"education","entityId":"00000000-0000-0000-0002-000000000001","title":"Graduate Research at UC Berkeley","startDate":"2011-08-01","endDate":"2013-05-31","descriptionMarkdown":"Deep dive into distributed consensus protocols. Thesis on adaptive Paxos variants for heterogeneous networks.","tags":["research","analysis","system","exploration"],"epochId":"initiation","stageId":"stage/inquiry","lane":1,"importance":0.85}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000003","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"experience","entityId":"00000000-0000-0000-0001-000000000004","title":"First Industry Role at Foundry Labs","startDate":"2013-09-01","endDate":"2016-07-31","descriptionMarkdown":"Built payment pipeline and job queue systems. Introduced property-based testing. Learned production operations at scale.","tags":["build","delivery","quality","testing"],"epochId":"expansion","stageId":"stage/construction","lane":1,"importance":0.75}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000004', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000004","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"education","entityId":"00000000-0000-0000-0002-000000000003","title":"Complexity Science at Santa Fe Institute","startDate":"2015-06-01","endDate":"2015-08-31","descriptionMarkdown":"Agent-based modeling of organizational decision networks. Cross-pollination of systems thinking with social science.","tags":["research","exploration","hypothesis","vision"],"epochId":"divergence","stageId":"stage/inquiry","lane":2,"importance":0.65}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000005","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"experience","entityId":"00000000-0000-0000-0001-000000000003","title":"Backend Engineering at NovaTech","startDate":"2016-08-01","endDate":"2019-05-31","descriptionMarkdown":"CRDT-based collaboration engine, materialized view optimization, distributed tracing contribution. Deepening operational maturity.","tags":["backend","collaboration","research","quality","observability"],"epochId":"expansion","stageId":"stage/construction","lane":1,"importance":0.8}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000006","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"project","entityId":"00000000-0000-0000-0003-000000000002","title":"Launched Convergence Tracing SDK","startDate":"2018-03-01","descriptionMarkdown":"Created open-source distributed tracing library. Community governance model with RFC process. 340+ production deployments.","tags":["craft","artifact","collaboration","documentation"],"epochId":"consolidation","stageId":"stage/transmission","lane":2,"importance":0.85}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000007","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"experience","entityId":"00000000-0000-0000-0001-000000000002","title":"Platform Engineering at Stratos Cloud","startDate":"2019-06-01","endDate":"2022-02-28","descriptionMarkdown":"Monolith-to-microservices migration via strangler fig. Built API gateway at 15K rps. Authored ADR practice.","tags":["platform","api","integration","delivery","metrics","scalability"],"epochId":"consolidation","stageId":"stage/calibration","lane":1,"importance":0.9}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000008', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000008","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"experience","entityId":"00000000-0000-0000-0001-000000000001","title":"Principal Architect at Meridian","startDate":"2022-03-01","descriptionMarkdown":"Event-driven architecture for 12M DAU. RFC process for 8 teams. Observability-first design. Mentored 14 engineers.","tags":["architecture","systems","design","reliability","observability","leadership"],"epochId":"mastery","stageId":"stage/design","lane":1,"importance":0.95}'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-15T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000009","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"publication","entityId":"00000000-0000-0000-0005-000000000002","title":"Published Event Mesh Patterns at SREcon","startDate":"2023-10-01","descriptionMarkdown":"Conference talk and paper on event mesh patterns for large-scale microservice architectures.","tags":["architecture","delivery","communication","documentation"],"epochId":"mastery","stageId":"stage/transmission","lane":2,"importance":0.8}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0010-000000000010', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0010-000000000010","profileId":"00000000-0000-0000-0000-000000000001","entityKind":"project","entityId":"00000000-0000-0000-0003-000000000005","title":"Building the Identity Narrative Engine","startDate":"2024-06-01","descriptionMarkdown":"Personal project exploring theatrical metaphors for professional identity presentation. Novel mask-based narrative generation.","tags":["design","system","craft","innovation","experiment"],"epochId":"reinvention","stageId":"stage/design","lane":2,"importance":0.75}'::jsonb,
 '2024-06-01T00:00:00.000Z','2025-01-15T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Verifiable Credentials (3) ──────────────────────────────────────────────

INSERT INTO verifiable_credentials (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0020-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0020-000000000001","issuerIdentityId":"00000000-0000-0000-0000-000000000010","subjectProfileId":"00000000-0000-0000-0000-000000000001","types":["VerifiableCredential","EmploymentCredential"],"issuedAt":"2024-03-01T00:00:00.000Z","credentialSubject":{"employer":"Meridian Platform Inc.","role":"Principal Systems Architect","startDate":"2022-03-01"},"proof":{"type":"Ed25519Signature2020","proofPurpose":"assertionMethod"},"summary":"Employment at Meridian as Principal Systems Architect since March 2022","status":"valid"}'::jsonb,
 '2024-03-01T00:00:00.000Z','2024-03-01T00:00:00.000Z'),
('00000000-0000-0000-0020-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0020-000000000002","issuerIdentityId":"00000000-0000-0000-0000-000000000010","subjectProfileId":"00000000-0000-0000-0000-000000000001","types":["VerifiableCredential","EducationCredential"],"issuedAt":"2013-06-01T00:00:00.000Z","credentialSubject":{"institution":"UC Berkeley","degree":"M.S. Computer Science","graduationDate":"2013-05-31"},"proof":{"type":"Ed25519Signature2020","proofPurpose":"assertionMethod"},"summary":"M.S. Computer Science from UC Berkeley, 2013","status":"valid"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0020-000000000003', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0020-000000000003","issuerIdentityId":"00000000-0000-0000-0000-000000000010","subjectProfileId":"00000000-0000-0000-0000-000000000001","types":["VerifiableCredential","CertificationCredential"],"issuedAt":"2022-09-01T00:00:00.000Z","credentialSubject":{"certification":"CKA","issuer":"CNCF","issueDate":"2022-09-01"},"proof":{"type":"Ed25519Signature2020","proofPurpose":"assertionMethod"},"summary":"Certified Kubernetes Administrator from CNCF","status":"valid"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Attestation Links (3) ───────────────────────────────────────────────────

INSERT INTO attestation_links (id, profile_id, credential_id, target_type, target_id, created_at, updated_at) VALUES
('00000000-0000-0000-0021-000000000001', '00000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0020-000000000001', 'experience', '00000000-0000-0000-0001-000000000001',
 '2024-03-01T00:00:00.000Z','2024-03-01T00:00:00.000Z'),
('00000000-0000-0000-0021-000000000002', '00000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0020-000000000002', 'education', '00000000-0000-0000-0002-000000000001',
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0021-000000000003', '00000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0020-000000000003', 'certification', '00000000-0000-0000-0007-000000000002',
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  credential_id = EXCLUDED.credential_id,
  target_type = EXCLUDED.target_type,
  target_id = EXCLUDED.target_id;

-- ── Content Edges (3) ──────────────────────────────────────────────────────

INSERT INTO content_edges (id, profile_id, from_type, from_id, to_type, to_id, relation_type, metadata, created_at, updated_at) VALUES
('00000000-0000-0000-0030-000000000001', '00000000-0000-0000-0000-000000000001',
 'experience', '00000000-0000-0000-0001-000000000001', 'project', '00000000-0000-0000-0003-000000000001',
 'led', '{"context":"Meridian Event Mesh designed during Principal Architect tenure"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0030-000000000002', '00000000-0000-0000-0000-000000000001',
 'experience', '00000000-0000-0000-0001-000000000003', 'project', '00000000-0000-0000-0003-000000000002',
 'created', '{"context":"Convergence SDK born from NovaTech tracing work"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-0030-000000000003', '00000000-0000-0000-0000-000000000001',
 'experience', '00000000-0000-0000-0001-000000000002', 'project', '00000000-0000-0000-0003-000000000004',
 'authored', '{"context":"Migration playbook written during Stratos platform work"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  from_type = EXCLUDED.from_type, from_id = EXCLUDED.from_id,
  to_type = EXCLUDED.to_type, to_id = EXCLUDED.to_id,
  relation_type = EXCLUDED.relation_type, metadata = EXCLUDED.metadata;

-- ── Content Revisions (1) ──────────────────────────────────────────────────

INSERT INTO content_revisions (id, profile_id, entity_type, entity_id, data, created_at) VALUES
('00000000-0000-0000-0040-000000000001', '00000000-0000-0000-0000-000000000001',
 'experience', '00000000-0000-0000-0001-000000000001',
 '{"snapshot":"initial","version":1}'::jsonb,
 '2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ── Verification Logs (2) ──────────────────────────────────────────────────

INSERT INTO verification_logs (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0050-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0050-000000000001","profileId":"00000000-0000-0000-0000-000000000001","entityType":"experience","entityId":"00000000-0000-0000-0001-000000000001","credentialId":"00000000-0000-0000-0020-000000000001","status":"verified","source":"external","verifierLabel":"Employment Credential — Meridian","notes":"Verified via VC bundle."}'::jsonb,
 '2024-03-01T00:00:00.000Z','2024-03-01T00:00:00.000Z'),
('00000000-0000-0000-0050-000000000002', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0050-000000000002","profileId":"00000000-0000-0000-0000-000000000001","entityType":"education","entityId":"00000000-0000-0000-0002-000000000001","credentialId":"00000000-0000-0000-0020-000000000002","status":"verified","source":"external","verifierLabel":"Education Credential — UC Berkeley","notes":"Verified via VC bundle."}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Custom Sections (1) ────────────────────────────────────────────────────

INSERT INTO custom_sections (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-0060-000000000001', '00000000-0000-0000-0000-000000000001',
 '{"id":"00000000-0000-0000-0060-000000000001","profileId":"00000000-0000-0000-0000-000000000001","title":"Philosophy","contentMarkdown":"I believe the best architectures emerge from understanding human systems as deeply as technical ones. Every RFC is a negotiation, every API a contract of trust, every migration a narrative of organizational change.","sortOrder":1}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;


-- ============================================================================
-- CV Entities for Profile 2: Marcus Okonkwo (Design Researcher)
-- Profile ID: 00000000-0000-0000-0000-000000000002
-- ============================================================================

-- ── Experiences (4) ─────────────────────────────────────────────────────────

INSERT INTO experiences (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1001-000000000001', '00000000-0000-0000-0000-000000000002',
 '{
   "id":"00000000-0000-0000-1001-000000000001",
   "profileId":"00000000-0000-0000-0000-000000000002",
   "roleTitle":"Senior Design Researcher",
   "organization":"Digital Identity Lab, UCL",
   "startDate":"2021-09-01",
   "isCurrent":true,
   "highlights":[
     "Leading 3-year ethnographic study on decentralized identity adoption across 6 communities",
     "Published 5 papers at CHI, DIS, and CSCW on self-presentation in credential systems",
     "Built prototype tools used by 800+ research participants for identity narrative construction",
     "Supervising 4 PhD students on topics spanning HCI, privacy, and creative computing"
   ],
   "tags":["research","exploration","user","communication","documentation","stakeholder"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2025-01-20T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-20T00:00:00.000Z'),
('00000000-0000-0000-1001-000000000002', '00000000-0000-0000-0000-000000000002',
 '{
   "id":"00000000-0000-0000-1001-000000000002",
   "profileId":"00000000-0000-0000-0000-000000000002",
   "roleTitle":"Interaction Designer & Researcher",
   "organization":"IDEO",
   "startDate":"2018-06-01",
   "endDate":"2021-08-31",
   "isCurrent":false,
   "highlights":[
     "Led design research for civic technology projects reaching 2M+ citizens",
     "Created participatory design toolkit adopted by 15 municipal governments",
     "Facilitated 60+ co-design workshops with diverse community stakeholders",
     "Published case study on speculative design methods for public services"
   ],
   "tags":["design","user","stakeholder","collaboration","communication","innovation"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1001-000000000003', '00000000-0000-0000-0000-000000000002',
 '{
   "id":"00000000-0000-0000-1001-000000000003",
   "profileId":"00000000-0000-0000-0000-000000000002",
   "roleTitle":"Creative Technologist",
   "organization":"Barbican Centre (Digital Programme)",
   "startDate":"2016-03-01",
   "endDate":"2018-05-31",
   "isCurrent":false,
   "highlights":[
     "Designed interactive installations exploring digital identity and memory",
     "Built generative art system using audience biometric data (with consent framework)",
     "Collaborated with 8 international artists on exhibitions seen by 120K visitors"
   ],
   "tags":["craft","artifact","innovation","experiment","user","impact"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1001-000000000004', '00000000-0000-0000-0000-000000000002',
 '{
   "id":"00000000-0000-0000-1001-000000000004",
   "profileId":"00000000-0000-0000-0000-000000000002",
   "roleTitle":"UX Research Intern",
   "organization":"Mozilla Foundation",
   "startDate":"2015-06-01",
   "endDate":"2015-12-31",
   "isCurrent":false,
   "highlights":[
     "Conducted user research on Firefox privacy features with 200 participants",
     "Developed persona framework for privacy-conscious user segments",
     "Research findings influenced privacy UI changes reaching 450M users"
   ],
   "tags":["research","user","quality","testing","impact"],
   "createdAt":"2024-01-01T00:00:00.000Z",
   "updatedAt":"2024-01-01T00:00:00.000Z"
 }'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Educations (2) ──────────────────────────────────────────────────────────

INSERT INTO educations (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1002-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1002-000000000001","profileId":"00000000-0000-0000-0000-000000000002","institution":"Royal College of Art","degree":"MA","fieldOfStudy":"Information Experience Design","startDate":"2014-09-01","endDate":"2016-06-30","isCurrent":false,"highlights":["Distinction","Thesis: Theatrical Metaphors for Digital Self-Presentation"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1002-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1002-000000000002","profileId":"00000000-0000-0000-0000-000000000002","institution":"University of Lagos","degree":"B.Sc.","fieldOfStudy":"Computer Science","startDate":"2010-09-01","endDate":"2014-06-30","isCurrent":false,"highlights":["First Class Honours","Minor in Visual Arts"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Projects (3) ────────────────────────────────────────────────────────────

INSERT INTO projects (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1003-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1003-000000000001","profileId":"00000000-0000-0000-0000-000000000002","name":"Persona Loom","role":"Creator","startDate":"2023-01-01","isOngoing":true,"url":"https://personaloom.research.ucl.ac.uk","highlights":["Interactive tool for constructing multi-faceted professional identities","Used by 800+ participants in longitudinal identity research","Built with React, D3.js, and WebGL for real-time identity visualization"],"tags":["craft","artifact","research","user","innovation","design"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-20T00:00:00.000Z'),
('00000000-0000-0000-1003-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1003-000000000002","profileId":"00000000-0000-0000-0000-000000000002","name":"Civic Mirror","role":"Design Lead","startDate":"2019-09-01","endDate":"2021-03-31","isOngoing":false,"highlights":["Speculative design platform exploring future civic participation","Deployed in 4 cities as part of participatory governance experiments","Won Interaction Award at DIS 2020"],"tags":["design","innovation","stakeholder","impact","experiment"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1003-000000000003', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1003-000000000003","profileId":"00000000-0000-0000-0000-000000000002","name":"Biometric Portraits","role":"Artist & Technologist","startDate":"2017-01-01","endDate":"2018-04-30","isOngoing":false,"highlights":["Generative art installation translating biometric data into visual narratives","Exhibited at Barbican, V&A, and Ars Electronica","Featured in Wired UK and Creative Review"],"tags":["craft","artifact","innovation","experiment","impact"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Skills (8) ──────────────────────────────────────────────────────────────

INSERT INTO skills (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1004-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000001","profileId":"00000000-0000-0000-0000-000000000002","name":"Design Research (Ethnographic & Participatory)","category":"research","level":"expert","isPrimary":true,"tags":["research","exploration","user"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000002","profileId":"00000000-0000-0000-0000-000000000002","name":"Interaction Design","category":"design","level":"expert","isPrimary":true,"tags":["design","user","craft"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000003', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000003","profileId":"00000000-0000-0000-0000-000000000002","name":"Creative Coding (p5.js, TouchDesigner, WebGL)","category":"technical","level":"advanced","isPrimary":true,"tags":["craft","artifact","innovation"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000004', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000004","profileId":"00000000-0000-0000-0000-000000000002","name":"Academic Writing & Publication","category":"professional","level":"expert","isPrimary":false,"tags":["documentation","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000005', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000005","profileId":"00000000-0000-0000-0000-000000000002","name":"React & TypeScript","category":"technical","level":"advanced","isPrimary":false,"tags":["build","craft","delivery"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000006', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000006","profileId":"00000000-0000-0000-0000-000000000002","name":"Workshop Facilitation","category":"professional","level":"expert","isPrimary":false,"tags":["collaboration","stakeholder","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000007', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000007","profileId":"00000000-0000-0000-0000-000000000002","name":"Speculative Design","category":"design","level":"advanced","isPrimary":false,"tags":["innovation","hypothesis","experiment"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1004-000000000008', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1004-000000000008","profileId":"00000000-0000-0000-0000-000000000002","name":"Data Visualization (D3.js)","category":"technical","level":"advanced","isPrimary":false,"tags":["craft","analysis","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Publications (4) ────────────────────────────────────────────────────────

INSERT INTO publications (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1005-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1005-000000000001","profileId":"00000000-0000-0000-0000-000000000002","title":"Masks We Wear Online: Theatrical Self-Presentation in Professional Networks","publicationType":"conference","venue":"ACM CHI","date":"2024-04-01","tags":["research","user","communication"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1005-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1005-000000000002","profileId":"00000000-0000-0000-0000-000000000002","title":"Credential Narratives: How Users Frame Verifiable Claims","publicationType":"conference","venue":"ACM DIS","date":"2023-07-01","tags":["research","user","documentation"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1005-000000000003', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1005-000000000003","profileId":"00000000-0000-0000-0000-000000000002","title":"Participatory Futures in Civic Technology","publicationType":"conference","venue":"ACM CSCW","date":"2021-10-01","tags":["stakeholder","collaboration","innovation"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1005-000000000004', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1005-000000000004","profileId":"00000000-0000-0000-0000-000000000002","title":"The Biometric Portrait: Consent and Aesthetics in Data Art","publicationType":"journal","venue":"Leonardo (MIT Press)","date":"2019-03-01","tags":["craft","innovation","experiment"]}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Awards (2) ──────────────────────────────────────────────────────────────

INSERT INTO awards (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1006-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1006-000000000001","profileId":"00000000-0000-0000-0000-000000000002","title":"Interaction Award — Best Research Prototype","issuer":"ACM DIS 2020","date":"2020-07-01","description":"For Civic Mirror participatory governance platform"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1006-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1006-000000000002","profileId":"00000000-0000-0000-0000-000000000002","title":"Prix Ars Electronica — Honorary Mention","issuer":"Ars Electronica","date":"2018-09-01","description":"For Biometric Portraits installation exploring consent in generative data art"}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Timeline Events (8) — for Marcus ────────────────────────────────────────

INSERT INTO timeline_events (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1010-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000001","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"education","entityId":"00000000-0000-0000-1002-000000000002","title":"Computer Science at University of Lagos","startDate":"2010-09-01","endDate":"2014-06-30","descriptionMarkdown":"Foundation in algorithms, data structures, and software engineering. Minor in Visual Arts planted seeds for design career.","tags":["research","exploration","build"],"epochId":"initiation","stageId":"stage/inquiry","lane":1,"importance":0.7}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000002","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"education","entityId":"00000000-0000-0000-1002-000000000001","title":"Information Experience Design at RCA","startDate":"2014-09-01","endDate":"2016-06-30","descriptionMarkdown":"Masters exploring theatrical metaphors for digital self-presentation. Distinction grade. Pivotal shift from pure CS to design research.","tags":["design","exploration","innovation","experiment"],"epochId":"initiation","stageId":"stage/design","lane":1,"importance":0.85}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000003', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000003","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"experience","entityId":"00000000-0000-0000-1001-000000000003","title":"Creative Technologist at the Barbican","startDate":"2016-03-01","endDate":"2018-05-31","descriptionMarkdown":"Interactive installations exploring digital identity and memory. Generative art with biometric data. Collaboration with international artists.","tags":["craft","artifact","innovation","experiment","impact"],"epochId":"expansion","stageId":"stage/construction","lane":1,"importance":0.8}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000004', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000004","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"project","entityId":"00000000-0000-0000-1003-000000000003","title":"Biometric Portraits Exhibition","startDate":"2017-01-01","endDate":"2018-04-30","descriptionMarkdown":"Generative art installation translating biometric data into visual narratives. Exhibited internationally. Featured in Wired UK.","tags":["craft","artifact","innovation","experiment","impact"],"epochId":"expansion","stageId":"stage/construction","lane":2,"importance":0.75}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000005', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000005","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"experience","entityId":"00000000-0000-0000-1001-000000000002","title":"Design Research at IDEO","startDate":"2018-06-01","endDate":"2021-08-31","descriptionMarkdown":"Led design research for civic technology. Created participatory design toolkit adopted by 15 municipalities. 60+ co-design workshops.","tags":["design","user","stakeholder","collaboration","innovation"],"epochId":"consolidation","stageId":"stage/negotiation","lane":1,"importance":0.9}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000006', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000006","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"project","entityId":"00000000-0000-0000-1003-000000000002","title":"Civic Mirror Wins DIS Interaction Award","startDate":"2020-07-01","descriptionMarkdown":"Speculative design platform exploring future civic participation. Deployed in 4 cities. Won Interaction Award.","tags":["design","innovation","stakeholder","impact"],"epochId":"consolidation","stageId":"stage/transmission","lane":2,"importance":0.85}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000007', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000007","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"experience","entityId":"00000000-0000-0000-1001-000000000001","title":"Senior Design Researcher at UCL","startDate":"2021-09-01","descriptionMarkdown":"Leading ethnographic study on decentralized identity. Publishing at CHI/DIS/CSCW. Supervising 4 PhD students.","tags":["research","exploration","user","communication","documentation"],"epochId":"mastery","stageId":"stage/inquiry","lane":1,"importance":0.95}'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-20T00:00:00.000Z'),
('00000000-0000-0000-1010-000000000008', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1010-000000000008","profileId":"00000000-0000-0000-0000-000000000002","entityKind":"project","entityId":"00000000-0000-0000-1003-000000000001","title":"Building Persona Loom","startDate":"2023-01-01","descriptionMarkdown":"Interactive tool for constructing multi-faceted professional identities. 800+ research participants. Novel identity visualization.","tags":["craft","artifact","research","user","innovation","design"],"epochId":"mastery","stageId":"stage/construction","lane":2,"importance":0.85}'::jsonb,
 '2024-01-01T00:00:00.000Z','2025-01-20T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- ── Social Links — Marcus ───────────────────────────────────────────────────

INSERT INTO social_links (id, profile_id, data, created_at, updated_at) VALUES
('00000000-0000-0000-1008-000000000001', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1008-000000000001","profileId":"00000000-0000-0000-0000-000000000002","platform":"github","url":"https://github.com/marcus-okonkwo","sortOrder":1}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z'),
('00000000-0000-0000-1008-000000000002', '00000000-0000-0000-0000-000000000002',
 '{"id":"00000000-0000-0000-1008-000000000002","profileId":"00000000-0000-0000-0000-000000000002","platform":"website","url":"https://marcus-okonkwo.net","sortOrder":2}'::jsonb,
 '2024-01-01T00:00:00.000Z','2024-01-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

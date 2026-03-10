# MCA Platform: Full Suite Sandbox Environment

## Objective
Get the complete MCA (Merchant Cash Advance) software suite running locally in sandbox mode with realistic mock data populated in the database.

---

## Current State Assessment

### What Exists ✅
- **19 Backend Services**: Prospects, Contacts, Deals, Communications, Underwriting, Qualification, Scoring, Compliance, etc.
- **9 API Routes**: /api/prospects, /api/contacts, /api/deals, /api/webhooks, etc.
- **5 Integrations**: Twilio, SendGrid, Plaid, ACH, AWS S3 (stubs ready)
- **9 Database Migrations**: Full schema for multi-tenant MCA platform
- **3 Frontend Apps**: Web (React), Desktop (Tauri), Mobile (React Native)
- **Docker Compose**: PostgreSQL + Redis configured
- **Frontend Mock Data**: `apps/web/src/lib/mockData.ts` with industry-weighted generation

### What's Missing ❌
1. **No unified dev command** - Must run 3 terminals manually
2. **Seed script outdated** - References old database API
3. **No database seed data** - Tables are empty after migrations
4. **Plaid/ACH not wired** - Stubs exist but not exported
5. **No concurrent dev script** - Need `concurrently` for single command

---

## Implementation Plan

### Phase 1: Fix Development Scripts
**Files to modify:**
- `package.json` (root)

**Tasks:**
1. Add `concurrently` dev dependency
2. Create unified `npm run dev:full` command that runs:
   - Frontend (Vite on port 5173)
   - Backend API server (Express on port 3000)
   - Background worker process
3. Add `npm run seed` command

### Phase 2: Create Database Seed Script
**Files to create/modify:**
- `database/seed.sql` (NEW)
- `scripts/seed-database.ts` (UPDATE)

**Seed Data to Include:**
```
Organizations: 2 (Demo Broker LLC, Test Funding Corp)
Users: 5 (admin, broker x3, compliance officer)
Contacts: 50 (varied roles: CEO, CFO, Owner, Manager)
Prospects: 100 (across 10 industries, varied scores)
UCC Filings: 300 (linked to prospects)
Deals: 30 (across all pipeline stages)
Deal Documents: 60 (applications, bank statements)
Communications: 100 (emails, SMS, calls)
Audit Logs: 200 (realistic activity trail)
Consent Records: 50 (TCPA compliance)
Portfolio Companies: 20 (funded deals with health history)
```

### Phase 3: Wire Integrations for Sandbox Mode
**Files to modify:**
- `server/integrations/index.ts`
- `server/integrations/plaid/client.ts`
- `server/integrations/ach/client.ts`

**Tasks:**
1. Export Plaid integration (currently not exported)
2. Add sandbox mode detection (use mock responses when no API keys)
3. Configure Plaid sandbox environment

### Phase 4: Environment Configuration
**Files to create/modify:**
- `.env.sandbox` (NEW)
- `docker-compose.sandbox.yml` (NEW - optional)

**Configuration:**
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ucc_mca
REDIS_URL=redis://localhost:6379
JWT_SECRET=sandbox-secret-do-not-use-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:5000

# Sandbox Mode - Use stubs
PLAID_ENV=sandbox
TWILIO_SANDBOX=true
SENDGRID_SANDBOX=true
```

### Phase 5: Startup & Verification
**Commands to run:**
```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Run migrations
npm run db:migrate

# 3. Seed database
npm run seed

# 4. Start full stack
npm run dev:full
```

**Verification checklist:**
- [ ] Frontend loads at http://localhost:5173
- [ ] API health check: `curl http://localhost:3000/api/health`
- [ ] Swagger docs at http://localhost:3000/api/docs
- [ ] Database has seeded data (100 prospects, 50 contacts, etc.)
- [ ] Can create/update prospects via UI
- [ ] Can view deal pipeline with seeded deals
- [ ] Audit logs capture all actions

---

## Parallel Workstreams

```
┌─────────────────────────────────────────────────────────────┐
│              SANDBOX ENVIRONMENT SETUP                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│   WORKSTREAM A  │   WORKSTREAM B  │      WORKSTREAM C       │
│   Dev Scripts   │   Seed Data     │   Integration Wiring    │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • Add concur-   │ • Create seed   │ • Export Plaid          │
│   rently pkg    │   SQL file      │ • Add sandbox mode      │
│ • dev:full cmd  │ • Update seed   │ • Configure stubs       │
│ • seed command  │   TypeScript    │ • Test integrations     │
└─────────────────┴─────────────────┴─────────────────────────┘
```

All workstreams can run in parallel.

---

## Critical Files

| Task | File | Action |
|------|------|--------|
| A.1 | `package.json` | Add concurrently, dev:full, seed scripts |
| B.1 | `database/seed.sql` | NEW - SQL seed data |
| B.2 | `scripts/seed-database.ts` | UPDATE - Use correct DB API |
| C.1 | `server/integrations/index.ts` | Export Plaid, ACH |
| C.2 | `server/integrations/plaid/client.ts` | Add sandbox detection |
| D.1 | `.env.sandbox` | NEW - Sandbox environment config |

---

## Expected Outcome

After implementation:
1. Single command `npm run dev:full` starts entire platform
2. Database pre-populated with 100 prospects, 50 contacts, 30 deals
3. All integrations work in sandbox/stub mode
4. Full audit trail of seed data creation
5. Ready for demo/development immediately after `docker-compose up`

---

## Verification Commands

```bash
# Start everything
docker-compose up -d && npm run db:migrate && npm run seed && npm run dev:full

# Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM prospects;"  # Should be 100
psql $DATABASE_URL -c "SELECT COUNT(*) FROM contacts;"   # Should be 50
psql $DATABASE_URL -c "SELECT COUNT(*) FROM deals;"      # Should be 30

# Test API
curl http://localhost:3000/api/health
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/prospects

# Open UI
open http://localhost:5173
```

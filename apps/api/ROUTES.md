# API Route Authentication Audit

> Generated: 2026-02-06 | Status: Documents **current** auth state, not target state.

## Summary

- **Total routes**: 100+
- **Protected**: ~15 (ownership, admin, or token-based)
- **Unprotected**: ~85+
- **System (public by design)**: 3

## Available Middleware

| Middleware | Location | Purpose |
|---|---|---|
| `createAuthMiddleware` | `middleware/auth.ts` | JWT validation (401 if missing) |
| `createOptionalAuthMiddleware` | `middleware/auth.ts` | JWT optional (doesn't fail) |
| `createPermissionMiddleware` | `middleware/require-admin.ts` | Permission-based access |
| `createAdminMiddleware` | `middleware/require-admin.ts` | Admin role required |
| `createOwnershipMiddleware` | `middleware/auth.ts` | Ensures user owns resource |
| `createFeatureGateMiddleware` | `middleware/feature-gate.ts` | Feature entitlement check |
| `RateLimiter` / `createRateLimitMiddleware` | `middleware/rate-limit.ts` | Rate limiting |

## System Endpoints (Public by Design)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | None | Health check |
| GET | `/ready` | None | Readiness probe |
| GET | `/metrics` | None | Prometheus metrics |

## Protected Routes

| File | Method | Path | Auth Type |
|---|---|---|---|
| `profiles.ts` | DELETE | `/:id` | Ownership middleware |
| `billing.ts` | POST | `/checkout/:profileId` | Ownership middleware |
| `billing.ts` | GET | `/subscription/:profileId` | Ownership middleware |
| `billing.ts` | POST | `/subscription/:profileId/cancel` | Ownership middleware |
| `billing.ts` | POST | `/webhooks/stripe` | Stripe signature |
| `admin-licensing.ts` | GET | `/admin/licensing/entitlements/:profileId` | Admin middleware |
| `admin-licensing.ts` | POST | `/admin/licensing/entitlements/:profileId/reset` | Admin middleware |
| `admin-licensing.ts` | GET | `/admin/licensing/tiers` | Admin middleware |
| `admin-licensing.ts` | POST | `/admin/licensing/feature-check/:profileId/:feature` | Admin middleware |
| `agent-interface.ts` | GET | `/v1/query` | Bearer token (scopes) |
| `hunter/letter.ts` | POST | `/hunter/generate-letter/:jobId` | `request.user` check |

## GraphQL & DID Endpoints

| File | Method | Path | Auth | Notes |
|---|---|---|---|---|
| `graphql.ts` | POST | `/graphql` | None | GraphQL queries/mutations (depth-limited) |
| `graphql.ts` | GET | `/graphql` | None | GraphQL query params (dev only) |
| `graphql.ts` | GET | `/graphql/ws` | None | WebSocket subscriptions |
| `graphql.ts` | GET | `/graphql/schema` | None | SDL export (dev only) |
| `did.ts` | GET | `/resolve/:did` | None | DID Document resolution |
| `did.ts` | GET | `/methods` | None | List registered DID methods |

## Unprotected Routes (Need Auth)

### Profile Management

| File | Method | Path | Risk |
|---|---|---|---|
| `profiles.ts` | POST | `/` | Anyone can create profiles |
| `profiles.ts` | GET | `/` | Anyone can list all profiles |
| `profiles.ts` | GET | `/:id` | Anyone can read any profile |
| `profiles.ts` | PATCH | `/:id` | Anyone can modify any profile |
| `profiles.ts` | POST | `/:id/masks/select` | Mask selection unprotected |
| `profiles.ts` | POST | `/:id/agent-tokens` | Token management unprotected |
| `profiles.ts` | GET | `/:id/agent-tokens` | Token listing unprotected |
| `profiles.ts` | DELETE | `/:id/agent-tokens/:tokenId` | Token deletion unprotected |

### CV / Career Data

| File | Method | Path | Risk |
|---|---|---|---|
| `cv.ts` | ALL | `/:profileId/cv/*` | Full CV CRUD unprotected |
| `curriculum-vitae-multiplex.ts` | ALL | `/:id/cv/*` | CV filtering/generation |
| `curriculum-vitae-multiplex.ts` | ALL | `/:id/personae/*` | Persona management |

### Narrative / Resume Generation

| File | Method | Path | Risk |
|---|---|---|---|
| `narratives.ts` | GET/POST | `/:id/narrative/:maskId` | Generation unprotected |
| `masks.ts` | POST | `/narrative/generate` | Generation unprotected |
| `profiles.ts` | POST | `/:id/narrative` | Generation unprotected |
| `profiles.ts` | GET | `/:id/narratives` | Listing unprotected |
| `profiles.ts` | PATCH | `/:id/narratives/:narrativeId` | Update unprotected |
| `profiles.ts` | POST | `/:id/narratives/:narrativeId/approve` | Approval unprotected |

### Exports

| File | Method | Path | Risk |
|---|---|---|---|
| `exports.ts` | POST | `/export/json-ld` | Export unprotected |
| `exports.ts` | GET | `/:profileId/export/jsonld` | Export unprotected |
| `exports.ts` | GET | `/:profileId/export/pdf` | Export unprotected |
| `exports.ts` | GET | `/:profileId/export/vc` | VC export unprotected |

### Taxonomy (Admin-only operations)

| File | Method | Path | Risk |
|---|---|---|---|
| `masks.ts` | POST/PATCH/DELETE | `/masks/*` | Mutation unprotected |
| `masks.ts` | POST/PATCH/DELETE | `/epochs/*` | Mutation unprotected |
| `masks.ts` | POST/PATCH/DELETE | `/stages/*` | Mutation unprotected |

### Backup / Restore

| File | Method | Path | Risk |
|---|---|---|---|
| `backups.ts` | POST | `/:id/import/jsonld` | Import unprotected |
| `backups.ts` | POST | `/:id/backup` | Backup unprotected |
| `backups.ts` | POST | `/:id/restore` | Restore unprotected |

### Other Unprotected

| File | Method | Path | Risk |
|---|---|---|---|
| `attestation-blocks.ts` | ALL | `/profiles/:profileId/attestation-blocks/*` | CRUD unprotected |
| `artifacts.ts` | ALL | `/profiles/:profileId/artifacts/*` | CRUD unprotected |
| `jobs.ts` | ALL | `/postings/*`, `/applications/*` | CRUD unprotected |
| `interviews.ts` | ALL | `/interviews/*` | CRUD unprotected |
| `aetas/` | ALL | Various | CRUD unprotected |

## Intentionally Public Routes

| File | Method | Path | Reason |
|---|---|---|---|
| `public-profiles.ts` | GET | `/public-profiles` | Public directory |
| `public-profiles.ts` | GET | `/public-profiles/:slug` | Public profile view |
| `public-profiles.ts` | GET | `/public-profiles/search` | Public search |
| `billing.ts` | GET | `/plans` | Pricing info |
| `masks.ts` | GET | `/masks` | Taxonomy read |
| `masks.ts` | GET | `/epochs` | Taxonomy read |
| `masks.ts` | GET | `/stages` | Taxonomy read |

## Weak Auth (Optional Check, Not Enforced)

| File | Method | Path | Issue |
|---|---|---|---|
| `public-profiles.ts` | POST | `/:profileId/like` | `request.user?.id` not enforced |
| `public-profiles.ts` | GET | `/saved` | `request.user?.id` not enforced |
| `public-profiles.ts` | PATCH | `/:profileId/public-settings` | Ownership checked but not enforced |
| `developer-api.ts` | POST/GET/DELETE | `/developers/apps*` | `request.user?.id` not enforced |
| `developer-api.ts` | GET | `/oauth/authorize` | `request.user?.id` not enforced |

## Recommended Remediation Priority

1. **P0**: Add auth to profile GET/PATCH, CV CRUD, backup/restore
2. **P1**: Add ownership to narrative, export, artifact, attestation endpoints
3. **P2**: Add admin middleware to taxonomy mutations
4. **P3**: Enforce auth on developer API and weak-auth routes
5. **P4**: Add rate limiting to public-facing endpoints

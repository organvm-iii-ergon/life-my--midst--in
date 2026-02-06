# ADR 010: Authentication and Authorization — JWT with RBAC

**Status:** Accepted
**Date:** 2025-03-15
**Deciders:** Core Team

## Context

The API serves both authenticated users (profile owners, admins) and public consumers (JSON-LD exports, public profiles). We needed an auth system that:

- Works in a stateless, distributed environment (multiple API instances)
- Supports fine-grained access control beyond simple role checks
- Handles resource ownership (users can only modify their own profiles)
- Allows optional authentication for public endpoints

## Decision

### JWT Bearer Tokens with Role + Permission Claims

Use **JSON Web Tokens** (via the `jose` library) with a claims structure that combines roles and granular permissions:

```typescript
interface JWTClaims {
  sub: string;          // User/Profile ID
  email: string;        // User email
  roles: UserRole[];    // ["user", "admin"]
  permissions: string[]; // ["READ_PROFILE", "WRITE_PROFILE", ...]
  profileId?: string;   // Associated profile (optional)
  iss: string;          // Issuer
  aud: string;          // Audience
  exp: number;          // Expiration
  iat: number;          // Issued at
}
```

### Token Lifecycle

- **Access token**: Short-lived (1 hour default)
- **Refresh token**: Long-lived (7 days default)
- **Signing**: ECDSA or RS256 (configurable)
- **Secret**: Minimum 32 characters, sourced from environment

### Three-Tier Middleware

```typescript
// 1. Required auth — 401 if missing/invalid
createAuthMiddleware()

// 2. Optional auth — proceeds without user context if no token
createOptionalAuthMiddleware()

// 3. Permission-gated — 403 if user lacks required permissions
createPermissionMiddleware(['WRITE_PROFILE', 'DELETE_PROFILE'])
```

### Ownership Guard

A dedicated `createOwnershipMiddleware()` ensures users can only access their own resources. It extracts `profileId` from the route params and compares against the JWT `profileId` claim. Admins bypass ownership checks.

## Rationale

### Why JWT over Sessions?

| Aspect | JWT | Sessions |
|--------|-----|----------|
| **Statefulness** | Stateless (no server-side storage) | Stateful (requires session store) |
| **Scaling** | Works across any number of API instances | Requires shared session store (Redis) |
| **Performance** | No DB lookup per request | DB/cache lookup per request |
| **Revocation** | Harder (requires blocklist) | Easy (delete session) |
| **Size** | Larger headers (~1KB) | Small cookie |

JWT was chosen because:
- Multiple API instances serve requests (stateless is critical)
- Redis is used for caching, not as a session dependency
- Token expiration (1 hour) limits revocation risk
- Refresh tokens handle session continuity

### Why Hybrid Roles + Permissions?

**Roles alone** are too coarse:
- "admin" gets everything, "user" gets limited access
- No way to grant specific capabilities (e.g., "can export but not delete")

**Permissions alone** are too granular:
- Every route needs explicit permission lists
- Hard to reason about user capabilities

**Hybrid approach**:
- Roles provide default permission sets (e.g., `admin` implies all permissions)
- Individual permissions enable fine-grained overrides
- `getPermissionsForRole()` maps roles to permission arrays

### Permission Definitions

```typescript
type Permission =
  | 'READ_PROFILE' | 'WRITE_PROFILE' | 'DELETE_PROFILE'
  | 'READ_MASK' | 'WRITE_MASK'
  | 'EXPORT_DATA' | 'MANAGE_BILLING'
  | 'ADMIN_READ' | 'ADMIN_WRITE';
```

## Route Protection Categories

Based on the auth audit (`apps/api/ROUTES.md`):

| Category | Auth Required | Example Routes |
|----------|--------------|----------------|
| **Public** | None | `GET /health`, `GET /profiles/:id`, taxonomy endpoints |
| **Authenticated** | Valid JWT | `POST /profiles`, `PATCH /profiles/:id` |
| **Owner-only** | JWT + ownership | `DELETE /profiles/:id`, billing endpoints |
| **Admin-only** | JWT + admin role | System configuration, user management |

## Consequences

### Positive

- **Stateless**: No server-side session storage required
- **Flexible**: Granular permissions without rigid role hierarchies
- **GDPR-aligned**: Ownership middleware ensures data access control
- **Testable**: Mock user injection via `x-mock-user-id` header in tests

### Negative

- **Token revocation**: Cannot instantly revoke a compromised token (must wait for expiry)
- **Token size**: JWT payloads are larger than session cookies
- **Complexity**: Three middleware tiers require careful route configuration
- **Coverage gap**: Auth audit revealed ~85 of 100+ routes lack middleware (remediation ongoing)

### Neutral

- OAuth2 integration exists (`apps/api/src/routes/integrations/oauth.ts`) for third-party providers
- Refresh token rotation can be added for enhanced security
- Token blocklist (via Redis) can be added if revocation becomes critical

## References

- [apps/api/src/services/auth.ts](../../apps/api/src/services/auth.ts) — JWT service
- [apps/api/src/middleware/auth.ts](../../apps/api/src/middleware/auth.ts) — Auth middleware factories
- [apps/api/ROUTES.md](../../apps/api/ROUTES.md) — Route auth audit
- [docs/SECURITY.md](../SECURITY.md) — Security guidelines

# ADR 007: REST API with Hybrid URL/Header Versioning

**Status:** Accepted
**Date:** 2025-03-15
**Deciders:** Core Team

## Context

The platform exposes a comprehensive API for profile management, narrative generation, export, billing, and job search orchestration. We needed to choose:

1. An API paradigm (REST vs. GraphQL vs. gRPC)
2. A versioning strategy that allows non-breaking evolution

The API serves multiple clients: the Next.js web app, potential mobile apps, and third-party integrations. Different clients may adopt new API versions at different rates.

## Decision

### REST with Fastify

Adopt a **RESTful API** built on Fastify with an OpenAPI 3.0.1 specification as the contract.

- Standard HTTP verbs (GET/POST/PATCH/DELETE) for CRUD operations
- JSON request/response bodies
- Fastify for performance (schema-based serialization, low overhead)
- OpenAPI spec (`apps/api/openapi.yaml`) as single source of truth for routes

### Hybrid Versioning (URL + Header)

Implement dual-mode versioning with priority order:

1. **URL path** `/v1/` (highest priority, most explicit)
2. **`Accept-Version` header** (fallback for clients that prefer clean URLs)
3. **Default** to `CURRENT_VERSION` (v1) when neither is specified

Root paths (without `/v1/`) are registered as **deprecated aliases** with:
- `Deprecation: true` header
- `Sunset` header with 90-day window
- `Link` header pointing to versioned successor (RFC 8594)

## Rationale

### Why REST over GraphQL?

- **Simplicity**: Our data model is document-oriented (profiles, masks, exports) — natural REST resources
- **Caching**: HTTP caching works natively with REST; GraphQL requires custom cache layers
- **Tooling**: OpenAPI ecosystem (code generation, docs, testing) is more mature
- **Team familiarity**: Lower learning curve for contributors
- **Performance**: No over-fetching concern — our endpoints return focused payloads

GraphQL would add complexity without proportional benefit. If query flexibility becomes important (e.g., mobile clients needing partial data), we can add GraphQL as a separate layer without replacing REST.

### Why Hybrid Versioning?

- **URL versioning** is discoverable and explicit — ideal for documentation and debugging
- **Header versioning** allows clean URLs for clients that prefer it
- **Dual support** gives consumers flexibility without forcing a single approach
- **Deprecation headers** provide clear migration signals

## Implementation

```
apps/api/src/
├── middleware/versioning.ts   # Version extraction and detection
├── index.ts                   # Registers routes at /v1/ and root (deprecated)
└── routes/                    # All route handlers (version-agnostic)
```

Route registration in `index.ts`:
```typescript
// Canonical versioned routes
fastify.register((v1Scope, _opts, done) => {
  registerApiRoutes(v1Scope, false);
  done();
}, { prefix: versionPrefix(1) });

// Deprecated root aliases (90-day sunset)
fastify.register((rootScope, _opts, done) => {
  registerApiRoutes(rootScope, true);
  done();
});
```

## Consequences

### Positive

- Clear, predictable URL structure for API consumers
- Graceful migration path via deprecation headers
- OpenAPI spec enables automated client generation
- Fastify's schema-based validation catches malformed requests early

### Negative

- Dual registration doubles the route table (minor memory overhead)
- Must maintain backward compatibility within a version
- OpenAPI spec requires manual updates when routes change

### Neutral

- Future v2 can coexist with v1 during migration period
- GraphQL can be added alongside REST if needed

## References

- [apps/api/openapi.yaml](../../apps/api/openapi.yaml) — API specification
- [apps/api/src/middleware/versioning.ts](../../apps/api/src/middleware/versioning.ts) — Version middleware
- [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594) — Sunset header specification

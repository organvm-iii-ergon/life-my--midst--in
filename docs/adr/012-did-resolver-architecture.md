# ADR 012: DID Resolver Architecture

**Status:** Accepted
**Date:** 2026-02-06
**Deciders:** Core Team

## Context

The system issues and verifies W3C Verifiable Credentials, which require resolving Decentralized Identifiers (DIDs) to their DID Documents. Different DID methods (`did:key`, `did:web`, `did:jwk`, `did:pkh`) have distinct resolution algorithms and cryptographic dependencies. We needed an architecture that:

- Supports multiple DID methods without coupling the core resolution interface to any single method
- Makes it easy to add new methods as standards evolve
- Follows the W3C DID Core specification's universal resolution interface

## Decision

### Plugin-Based `DIDResolverRegistry`

A central `DIDResolverRegistry` dispatches resolution requests to method-specific resolvers. Each resolver is a standalone module implementing a common interface:

```typescript
interface DIDResolver {
  method: string;  // e.g., "key", "web", "jwk", "pkh"
  resolve(did: string): Promise<DIDResolutionResult>;
}
```

### Method-Specific Resolvers

Each DID method is isolated in its own file under `packages/core/src/did/resolvers/`:

| Method | File | Description |
|--------|------|-------------|
| `did:key` | `did-key.ts` | Ed25519/X25519 key-based DIDs (self-certifying) |
| `did:web` | `did-web.ts` | Domain-verified DIDs via HTTPS |
| `did:jwk` | `did-jwk.ts` | JWK-encoded public key DIDs |
| `did:pkh` | `did-pkh.ts` | Blockchain address DIDs (CAIP-10) |

### API Exposure

The API exposes two DID endpoints:

- `GET /resolve/:did` — Resolves any DID to its DID Document
- `GET /methods` — Lists all registered resolver methods

Error mapping follows HTTP conventions: `invalidDid` → 400, `notFound` → 404, resolver errors → 502.

## Rationale

### Why Plugin Pattern?

**Monolithic resolver** (single file handling all methods) would:
- Create a large, hard-to-maintain file with mixed cryptographic dependencies
- Require modifying existing code to add new methods
- Couple unrelated method logic

**Plugin pattern** provides:
- **Isolation**: Each method's cryptographic dependencies are self-contained
- **Extensibility**: New methods are added by creating a file and registering it
- **Testability**: Each resolver can be tested independently
- **Selective loading**: Only needed resolvers need to be imported

### Why These Four Methods?

| Method | Use Case |
|--------|----------|
| `did:key` | Default for self-issued VCs (no external infrastructure needed) |
| `did:web` | Enterprise identity verification via existing domain infrastructure |
| `did:jwk` | Interoperability with existing PKI systems using JWK format |
| `did:pkh` | Web3/blockchain identity for wallet-based authentication |

## Consequences

### Positive

- **Standards-compliant**: Resolution follows W3C DID Core specification
- **Extensible**: Adding `did:ion`, `did:ethr`, or other methods requires only a new resolver file
- **Decoupled**: API routes, VC issuance, and resolution are independent concerns

### Negative

- **No caching**: DID Documents are resolved fresh each time (acceptable for `did:key`/`did:jwk` which are deterministic, but `did:web` makes HTTP requests)
- **No universal resolver fallback**: If a method isn't registered, resolution fails rather than proxying to a Universal Resolver instance

### Neutral

- The registry is initialized at API startup with all available resolvers
- Resolution results include `didResolutionMetadata` for error details per the W3C spec

## References

- [packages/core/src/did/](../../packages/core/src/did/) — DID resolver registry and method resolvers
- [apps/api/src/routes/did.ts](../../apps/api/src/routes/did.ts) — API route handler
- [W3C DID Core](https://www.w3.org/TR/did-core/) — Specification

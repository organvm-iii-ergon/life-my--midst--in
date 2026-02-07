# @in-midst-my-life/core

Business logic for mask matching, DID resolution, cryptography, billing, licensing, and cloud integrations.

## Exports

The package has two entry points:

| Entry Point | Import Path | Use Case |
|-------------|-------------|----------|
| Main | `@in-midst-my-life/core` | Browser-safe exports (no native deps) |
| Server | `@in-midst-my-life/core/server` | Cloud storage integrations (ssh2, smb2) |

### Main Entry (`index.ts`)

**Mask Matching** (deprecated — use `@in-midst-my-life/content-model` instead):
- `matchMasksToContext(masks, contexts)` — Simple context intersection matching
- `rankMasksByPriority(matches)` — Sort by score descending

**Mask System** (`masks.ts`):
- `applyMaskRedaction(timeline, mask, options)` — Filter timeline entries by mask

**Cryptography** (`crypto.ts`):
- Key generation, hashing, and signature utilities

**Verifiable Credentials** (`vc.ts`):
- W3C Verifiable Credential creation and verification

**DID Resolution** (`did/`):
- `DIDResolverRegistry` — Universal resolver routing to method-specific resolvers
- `setRegistry()` / `getRegistry()` — Global DID registry management
- Method resolvers: `did:web`, `did:key`, `did:jwk`, `did:pkh`

**Errors** (`errors.ts`):
- `NotFoundError`, `ValidationError`, etc.

**Jobs** (`jobs.ts`):
- Job data structures and utilities

**Search** (`search.ts`):
- Full-text search utilities

**Hunter Protocol** (`hunter-protocol/`):
- `HunterAgent` / `createHunterProtocolAgent()` — Autonomous job evaluation agent
- `MockJobSearchProvider` / `createJobSearchProvider()` — Job search providers
- `DefaultCompatibilityAnalyzer` — Profile-to-job compatibility scoring
- `DocumentGenerator` — Cover letter and application document generation

**Licensing & Billing**:
- `LicensingService` — Tier-based feature gating and rate limiting
- `BillingService` — Stripe integration for subscriptions

**Analytics**:
- `AnalyticsService` — Event tracking
- Analytics event type definitions

**Embeddings**:
- `EmbeddingsService` — Vector embedding generation for semantic search

### Server Entry (`server.ts`)

Cloud storage integrations with native dependencies (ssh2, smb2).
Separated to prevent webpack from bundling native modules into the frontend.

- `CloudStorageProvider` interface
- `CloudFile`, `CloudCredentials`, `ListOptions` types
- Provider implementations for Dropbox, Google Drive, SFTP, SMB

## Dependencies

- `@in-midst-my-life/schema` — Zod schemas and TypeScript types
- `jose` — JWT/JWS/JWE operations
- `stripe` — Payment processing
- `openai` — Embeddings API
- `googleapis` — Google Drive integration
- `ssh2` / `smb2` — File server access (server entry only)

## Usage

```typescript
import { matchMasksToContext, LicensingService, DIDResolverRegistry } from '@in-midst-my-life/core';

// Resolve a DID
const registry = new DIDResolverRegistry();
const result = await registry.resolve('did:web:example.com');

// Check licensing tier
const licensing = new LicensingService(getTierFn, rateLimitStore);
await licensing.checkAccess(profileId, 'feature:exports');
```

## Testing

```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm typecheck      # Type checking only
```

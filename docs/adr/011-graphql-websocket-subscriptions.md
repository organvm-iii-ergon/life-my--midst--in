# ADR 011: GraphQL WebSocket Subscriptions

**Status:** Accepted
**Date:** 2026-02-06
**Deciders:** Core Team

## Context

The API needed real-time push capabilities for profile updates and narrative generation events. Clients polling for changes is inefficient and introduces latency. We needed a subscription transport that:

- Integrates with the existing Fastify server (no separate process)
- Uses a well-supported, modern GraphQL subscription protocol
- Works with the existing `buildSchema` + root resolvers pattern
- Avoids the deprecated `subscriptions-transport-ws` protocol

## Decision

### Transport: `@fastify/websocket` + `graphql-ws`

Use `@fastify/websocket` for WebSocket upgrade handling and `graphql-ws` for the GraphQL subscription protocol layer. The WebSocket endpoint is exposed at `GET /graphql/ws`.

### PubSub: EventEmitter-based `InMemoryPubSub`

An `InMemoryPubSub` engine backed by Node.js `EventEmitter` handles event distribution. Mutation resolvers publish events to named topics; subscription resolvers return `AsyncIterable` streams from those topics.

```typescript
// Publishing from a mutation
pubsub.publish(profileUpdatedTopic(profileId), { profile });

// Subscribing in a resolver
profileUpdated: (args, context) => context.pubsub.subscribe(profileUpdatedTopic(args.profileId))
```

### CJS/ESM Dual-Instance Workaround

The `graphql@16` package ships both CJS (`index.js`) and ESM (`index.mjs`) entry points without a proper `exports` map. In the CJS API app, `require('graphql')` loads the CJS copy, but `graphql-ws` may internally resolve the ESM copy. This causes `instanceof` checks to fail with "Cannot use GraphQLSchema from another module or realm."

**Solution**: Supply custom `onSubscribe`, `execute`, and `subscribe` handlers to `graphql-ws`'s `makeServer()` that use the app's own `graphql` import for parsing, validation, execution, and subscription iteration. This bypasses `graphql-ws`'s internal `graphql` dependency entirely.

## Rationale

### Why `graphql-ws` over `subscriptions-transport-ws`?

| Aspect | `graphql-ws` | `subscriptions-transport-ws` |
|--------|-------------|------------------------------|
| **Protocol** | Modern (graphql-ws) | Legacy (graphql-transport-ws) |
| **Maintenance** | Actively maintained | Archived, no updates |
| **Connection init** | Clean lifecycle hooks | Complex middleware chain |
| **Error handling** | Structured error payloads | Unstructured |

### Why EventEmitter PubSub?

- **Simplicity**: No external dependency (Redis PubSub) for single-process deployments
- **Swappable**: `InMemoryPubSub` implements a minimal interface (`publish`/`subscribe`); a Redis-backed implementation can replace it without changing resolvers
- **Sufficient**: Single API instance handles all subscriptions; horizontal scaling requires Redis PubSub (documented as future work)

### Why not Apollo Server?

Apollo Server bundles its own subscription handling, HTTP server, and middleware. The project already uses Fastify with a custom route structure; adopting Apollo would require significant refactoring for marginal benefit.

## Consequences

### Positive

- **Real-time updates**: Clients receive instant profile and narrative change notifications
- **Standard protocol**: Any `graphql-ws`-compatible client (Apollo Client, urql, Relay) works
- **Type augmentation**: `@fastify/websocket` adds WebSocket overloads to Fastify route types

### Negative

- **Process-local**: Subscriptions only work within a single API instance; Redis PubSub needed for multi-instance
- **Type augmentation side effects**: `@fastify/websocket` alters `fastify.post()` / `fastify.get()` overloads globally, which can break type inference in unrelated routes (see billing.ts cast removal)
- **No auth on WebSocket**: Connection-level auth is not enforced (future work)

### Neutral

- Depth limiting (max 10) applies to subscription queries via the same mechanism as HTTP queries
- Introspection is disabled in production for both HTTP and WebSocket transports

## References

- [apps/api/src/routes/graphql.ts](../../apps/api/src/routes/graphql.ts) — WebSocket route + graphql-ws bridge
- [apps/api/src/services/pubsub.ts](../../apps/api/src/services/pubsub.ts) — InMemoryPubSub engine
- [apps/api/src/services/graphql-resolvers.ts](../../apps/api/src/services/graphql-resolvers.ts) — Subscription resolvers

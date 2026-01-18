# ADR 001: Monorepo Structure with pnpm Workspaces

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Core Team

## Context

We need a repository structure that supports:
- Multiple applications (web, API, orchestrator)
- Shared packages (schema, core, content-model, design-system)
- Independent deployment of services
- Code sharing and type safety across packages
- Fast, efficient dependency management

## Decision

We will use a **monorepo structure** with **pnpm workspaces** and **Turborepo** for build orchestration.

### Structure

```
in-midst-my-life/
├── apps/
│   ├── api/           # Fastify REST API
│   ├── orchestrator/  # Background workers
│   └── web/           # Next.js frontend
├── packages/
│   ├── schema/        # Zod schemas
│   ├── core/          # Business logic
│   ├── content-model/ # Content graph
│   └── design-system/ # UI components
└── docs/              # Documentation
```

## Rationale

### Why Monorepo?

**Advantages:**
- **Type Safety**: Shared TypeScript types across all packages
- **Code Reuse**: Single source of truth for schemas and business logic
- **Atomic Changes**: Update API and frontend in single commit
- **Simplified CI/CD**: Single build pipeline
- **Developer Experience**: Single `git clone`, unified tooling

**Disadvantages Considered:**
- Build complexity (mitigated by Turborepo caching)
- Repository size (not an issue at our scale)

### Why pnpm?

**Advantages over npm/yarn:**
- **Disk Efficiency**: Content-addressable storage (~3x space savings)
- **Speed**: Faster installs via symlinks
- **Strict**: Better at catching missing peer dependencies
- **Workspace Support**: Native monorepo support

**Performance:**
- Cold install: ~40% faster than npm
- Cached install: ~80% faster than npm

### Why Turborepo?

**Advantages:**
- **Incremental Builds**: Only rebuild changed packages
- **Caching**: Remote cache for CI/CD
- **Parallelization**: Run tasks in optimal order
- **Simple Configuration**: Minimal setup

## Alternatives Considered

### 1. Polyrepo (Multiple Repositories)

**Rejected because:**
- Harder to maintain type consistency
- Requires versioning/publishing of shared packages
- Complex dependency updates
- Slower development iteration

### 2. Lerna

**Rejected because:**
- More complex than pnpm workspaces
- Slower than Turborepo
- Less actively maintained

### 3. Nx

**Rejected because:**
- Overkill for our needs
- More opinionated
- Steeper learning curve

## Consequences

### Positive

- Developers can work across all packages with single setup
- Type changes propagate immediately
- Simplified dependency management
- Faster CI builds with caching

### Negative

- Larger git repository (mitigated by proper `.gitignore`)
- Learning curve for developers new to monorepos
- All services share Node.js version

### Neutral

- Requires discipline to maintain package boundaries
- Build times scale with repository size (managed by Turborepo)

## Implementation

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

### Package References

```json
{
  "dependencies": {
    "@in-midst-my-life/schema": "workspace:*",
    "@in-midst-my-life/core": "workspace:*"
  }
}
```

## Metrics

**Developer Experience:**
- Setup time: <5 minutes
- Type-check time (full): ~15s
- Test time (full): ~30s
- Build time (full): ~2min
- Hot-reload time: <500ms

**CI/CD:**
- Cold build: ~3min
- Cached build: ~30s
- Cache hit rate: >80%

## References

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [ARCH-002-repository-layout.md](../../ARCH-002-repository-layout.md)

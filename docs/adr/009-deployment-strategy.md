# ADR 009: Deployment Strategy — Docker + Kubernetes with Helm

**Status:** Accepted
**Date:** 2025-03-15
**Deciders:** Core Team

## Context

The platform consists of three applications (API, Web, Orchestrator) plus PostgreSQL, Redis, and optional monitoring services. We needed a deployment strategy that supports:

- Local development with minimal setup
- CI/CD automation
- Production scaling and zero-downtime deploys
- Environment isolation (dev, staging, production)

## Decision

### Local Development: Docker Compose

Use Docker Compose for the local development stack:

- **PostgreSQL 15** with pgvector extension (port 5433 external, 5432 internal)
- **Redis 7** for caching and task queue (port 6379)
- **Prometheus + Grafana** for local observability
- Applications run natively via `pnpm dev` (not containerized in dev)

### Production: Kubernetes with Helm Charts

Deploy to Kubernetes using Helm charts stored in `infra/helm/`:

- Each application has its own Deployment, Service, and ConfigMap
- PostgreSQL and Redis provisioned as StatefulSets (or managed services)
- Namespace isolation between environments
- Resource limits and requests defined per container

### CI/CD: GitHub Actions

Automated pipeline in `.github/workflows/deploy.yml`:

1. **Build phase**: Docker Buildx with layer caching, push to GitHub Container Registry (GHCR)
2. **Image tagging**: Semantic version tags, branch refs, commit SHAs, and `latest`
3. **Deploy phase**: `helm upgrade --install` with dynamic image tags
4. **Verification**: Rollout status checks across all services
5. **Gating**: Deploy only triggers on pushes to the default branch

## Rationale

### Why Docker Compose for Local Dev?

- **Single command** (`scripts/dev-up.sh`) brings up all dependencies
- **Consistent** database/cache versions across developer machines
- **Lightweight** — apps themselves run natively for fast iteration (no container rebuild)
- **Parity** with production data stores without requiring cloud access

### Why Kubernetes over Alternatives?

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Kubernetes + Helm** | Scaling, self-healing, rolling deploys, ecosystem | Complexity, learning curve | **Chosen** |
| Serverless (Lambda/CF) | Zero ops, auto-scaling | Cold starts, vendor lock-in, stateful services hard | Rejected |
| VM-based (EC2/Droplets) | Simple, familiar | Manual scaling, no self-healing | Rejected |
| Docker Compose only | Simple | No orchestration, no scaling, single-host | Dev only |

Key factors:
- Three separate services need independent scaling
- PostgreSQL and Redis are stateful — K8s StatefulSets handle this well
- Rolling deployments required for zero-downtime updates
- Helm provides templated, repeatable deployments

### Why GHCR over DockerHub?

- Integrated with GitHub Actions (no additional credentials)
- Private by default (aligns with security posture)
- Free for public repositories

## Infrastructure Layout

```
infra/helm/
├── Chart.yaml                    # Helm chart metadata
├── values.yaml                   # Default configuration
└── templates/
    ├── api-deployment.yaml       # Fastify API (3001)
    ├── web-deployment.yaml       # Next.js frontend (3000)
    ├── orchestrator-deployment.yaml  # Worker service (3002)
    ├── postgres.yaml             # PostgreSQL StatefulSet
    ├── redis.yaml                # Redis deployment
    └── monitoring/               # Prometheus + Grafana

docker-compose.yml                # Local dev stack
.github/workflows/deploy.yml     # CI/CD pipeline
```

## Consequences

### Positive

- **Scalability**: Each service scales independently based on load
- **Reliability**: K8s self-healing restarts failed containers
- **Reproducibility**: Helm charts produce identical deployments across environments
- **Observability**: Prometheus/Grafana stack available locally and in production

### Negative

- **Complexity**: K8s has a steep learning curve
- **Resource overhead**: K8s control plane requires non-trivial compute
- **Local testing**: Cannot fully test K8s locally without kind/minikube

### Neutral

- Managed K8s services (GKE, EKS, AKS) reduce operational burden
- Helm chart values can be overridden per environment

## References

- [docker-compose.yml](../../docker-compose.yml) — Local development stack
- [infra/helm/](../../infra/helm/) — Kubernetes Helm charts
- [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) — CI/CD pipeline
- [ADR 002: PostgreSQL](./002-postgresql-primary-database.md) — Database choice
- [ADR 003: Redis](./003-redis-caching-queue.md) — Caching choice

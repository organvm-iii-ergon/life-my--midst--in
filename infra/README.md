# Infrastructure

Infrastructure-as-code and deployment configuration:
- `terraform/` – Cloud resources
- `helm/`      – Helm chart scaffold (`values.yaml` holds env overrides)
- `docker-compose.yml` – Local stack for Postgres, Redis, API, Orchestrator, Web

## Migrations & Seeds
- Local: `docker-compose run --rm migrations` (profile `init`) runs API + Orchestrator migrations/seeds against compose Postgres.
- CI: `.github/workflows/ci.yml` runs migrations before tests; integration jobs bring their own Postgres/Redis.
- Helm: `values.yaml` includes `migrations.env`; `templates/migrations-job.yaml` installs as a `pre-install,pre-upgrade` hook and runs `pnpm --filter @in-midst-my-life/api migrate && pnpm --filter @in-midst-my-life/orchestrator migrate`.

## Environments
- API: `DATABASE_URL`/`POSTGRES_URL` required when using Postgres repos.
- Orchestrator: `DATABASE_URL` + `ORCH_TASK_STORE=postgres`, `TASK_QUEUE=redis`, `REDIS_URL`.
- Web: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ORCH_BASE_URL`.

Keep dev/test/integration databases distinct (e.g., `midst_dev`, `midst_test`, `midst_integration`). Seeds are idempotent (`ON CONFLICT DO NOTHING`).

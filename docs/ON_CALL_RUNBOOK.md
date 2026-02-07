# On-Call Runbook

Operational procedures for responding to Prometheus alerts in the in-midst-my-life production environment. Each section corresponds to an alert rule in `infra/prometheus/alerts.yml`.

---

## high-api-error-rate

**Alert**: API 5xx error rate exceeds 5% for 5 minutes.

**Triage**:
1. Check API pod logs: `kubectl -n production logs -l app=inmidst-api --tail=200`
2. Identify the most common error codes: look for patterns (502, 503, 500)
3. Check recent deployments: `helm history in-midst-my-life -n production`

**Common causes**:
- Bad deployment: rollback with `helm rollback in-midst-my-life -n production`
- Database connection failures: see [#postgresql-down](#postgresql-down)
- Redis unavailable: see [#redis-down](#redis-down)
- Upstream dependency timeout: check external API keys and rate limits

**Resolution**: If caused by a bad deploy, rollback. Otherwise fix the root cause and monitor error rate returning below threshold.

---

## high-api-latency

**Alert**: API p95 latency exceeds 2 seconds for 10 minutes.

**Triage**:
1. Check database query performance: `kubectl -n production exec -it deploy/inmidst-postgres -- psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start LIMIT 20;"`
2. Check Redis connection pool: `kubectl -n production exec -it deploy/inmidst-redis -- redis-cli INFO clients`
3. Check pod resource usage: `kubectl -n production top pods -l app=inmidst-api`

**Common causes**:
- Slow database queries: see [#slow-database-queries](#slow-database-queries)
- Memory pressure causing GC pauses: check `memory` limits vs actual usage
- Connection pool exhaustion: check active connections
- Large response payloads: check request logs for unusual query patterns

**Resolution**: Scale API replicas if CPU/memory-bound. Optimize slow queries. Increase connection pool if exhausted.

---

## api-down

**Alert**: API health endpoint unreachable for 2 minutes.

**Triage**:
1. Check pod status: `kubectl -n production get pods -l app=inmidst-api`
2. Check events: `kubectl -n production describe pod -l app=inmidst-api`
3. Check restart history: `kubectl -n production get pods -l app=inmidst-api -o jsonpath='{.items[*].status.containerStatuses[*].restartCount}'`

**Common causes**:
- OOMKilled: increase memory limits in values.yaml
- CrashLoopBackOff: check logs for startup errors (missing env vars, DB connection)
- Node failure: check node status with `kubectl get nodes`
- Image pull failure: verify GHCR credentials and image tag

**Resolution**: Fix the underlying cause. For OOM, bump `api.resources.limits.memory`. For config errors, fix env vars and redeploy.

---

## high-database-connections

**Alert**: PostgreSQL active connections exceed 80% of max_connections.

**Triage**:
1. Check current connections: `SELECT count(*) FROM pg_stat_activity;`
2. Check connections by application: `SELECT application_name, count(*) FROM pg_stat_activity GROUP BY 1;`
3. Look for idle-in-transaction sessions: `SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction' AND query_start < now() - interval '5 minutes';`

**Common causes**:
- Connection leak: application not returning connections to pool
- Long-running transactions holding connections
- Misconfigured pool size (too large for max_connections)
- Spike in API traffic without autoscaling

**Resolution**: Kill idle-in-transaction sessions if safe. Reduce pool size per pod. Scale API horizontally instead of increasing connections.

---

## slow-database-queries

**Alert**: Average query duration exceeds 500ms for 10 minutes.

**Triage**:
1. Check slow queries: `SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;`
2. Check for missing indexes: `SELECT relname, seq_scan, idx_scan FROM pg_stat_user_tables WHERE seq_scan > idx_scan ORDER BY seq_scan DESC LIMIT 10;`
3. Check table bloat: `SELECT relname, n_dead_tup FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;`

**Common causes**:
- Missing indexes on frequently-queried columns
- Table bloat requiring VACUUM
- Lock contention from concurrent writes
- Inefficient queries (full table scans, N+1 patterns)

**Resolution**: Add indexes for hot queries. Run `VACUUM ANALYZE` on bloated tables. Optimize application queries.

---

## postgresql-down

**Alert**: PostgreSQL health check failing for 2 minutes.

**Triage**:
1. Check PV status: `kubectl -n production get pvc -l app=inmidst-postgres`
2. Check disk space: `kubectl -n production exec deploy/inmidst-postgres -- df -h /var/lib/postgresql/data`
3. Check OOM kills: `kubectl -n production describe pod -l app=inmidst-postgres | grep -A5 "Last State"`

**Common causes**:
- Disk full: PVC out of space
- OOM killed: insufficient memory limits
- Corrupted WAL files (rare, usually after unclean shutdown)
- Node failure or eviction

**Resolution**: Expand PVC if disk full. Increase memory limits. If corrupted, restore from latest backup (see backup CronJob).

---

## high-redis-memory

**Alert**: Redis memory usage exceeds 80% of maxmemory.

**Triage**:
1. Check memory usage: `redis-cli INFO memory`
2. Check key count by pattern: `redis-cli --scan --pattern '*' | head -100`
3. Check eviction policy: `redis-cli CONFIG GET maxmemory-policy`

**Common causes**:
- Large session/cache keys not expiring
- Missing TTLs on cached data
- Memory fragmentation (ratio > 1.5)
- Task queue backlog growing unbounded

**Resolution**: Set TTLs on all cache keys. Configure `maxmemory-policy allkeys-lru` if not set. Clear stale task queue entries.

---

## redis-down

**Alert**: Redis health check failing for 2 minutes.

**Triage**:
1. Check pod status: `kubectl -n production get pods -l app=inmidst-redis`
2. Check persistence config: `redis-cli CONFIG GET save` and `CONFIG GET appendonly`
3. Check memory limits vs usage

**Common causes**:
- OOM killed during BGSAVE
- Disk full (if AOF persistence enabled)
- Network policy blocking connections

**Resolution**: Increase memory limits. Disable BGSAVE if RDB snapshots cause OOM. Check network policies.

---

## slow-redis-operations

**Alert**: Redis operation latency exceeds 10ms for 5 minutes.

**Triage**:
1. Check slow log: `redis-cli SLOWLOG GET 10`
2. Check key sizes: look for large keys (`redis-cli --bigkeys`)
3. Check pipeline usage and network latency between pods

**Common causes**:
- Large hash/set operations (>10KB values)
- Missing pipeline for batch operations
- Network latency between API and Redis pods (different nodes)
- BGSAVE running during peak traffic

**Resolution**: Split large keys. Use pipeline for batch ops. Consider pod affinity rules to co-locate API and Redis.

---

## high-active-connections

**Alert**: Active API connections exceed 80% of capacity.

**Triage**:
1. Check current connection count from metrics
2. Check if autoscaling is enabled: `kubectl -n production get hpa`
3. Check for connection pooling issues at the load balancer level

**Common causes**:
- Traffic spike without autoscaling
- Keep-alive connections accumulating
- Slow responses holding connections open
- Client retry storms after temporary failure

**Resolution**: Enable autoscaling in values.yaml. Tune keep-alive timeouts. Fix slow endpoints causing connection buildup.

---

## low-cache-hit-ratio

**Alert**: Cache hit ratio drops below 50% for 15 minutes.

**Triage**:
1. Check Redis keyspace stats: `redis-cli INFO keyspace`
2. Check if cache was recently flushed
3. Check application logs for cache miss patterns

**Common causes**:
- Recent Redis restart flushing all keys
- Changed cache key patterns after deployment
- TTL too short for access patterns
- New endpoint or feature not populating cache

**Resolution**: Implement cache warming on startup. Review TTL settings. Check that new endpoints populate cache correctly.

---

## target-down

**Alert**: Prometheus scrape target unreachable for 5 minutes.

**Triage**:
1. Check which target is down from Prometheus UI targets page
2. Check network policies: `kubectl -n production get networkpolicy`
3. Check service mesh or DNS resolution: `kubectl -n production get svc`
4. Check if the metrics endpoint is responding: `kubectl -n production exec -it deploy/inmidst-api -- wget -qO- http://localhost:3001/metrics | head`

**Common causes**:
- Service not exposing metrics port
- Network policy blocking Prometheus scraper
- DNS resolution failure
- Pod crashed but service still registered

**Resolution**: Fix network policies to allow Prometheus ingress. Verify metrics endpoint is healthy. Check DNS and service discovery.

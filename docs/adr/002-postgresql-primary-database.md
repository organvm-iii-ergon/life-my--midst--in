# ADR 002: PostgreSQL as Primary Database

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Core Team

## Context

We need a database that supports:
- Relational data (profiles, experiences, skills)
- JSON/JSONB for flexible schema extensions
- Vector embeddings for semantic search
- ACID transactions
- High performance for read-heavy workloads
- Full-text search capabilities

## Decision

We will use **PostgreSQL 15** with the **pgvector** extension as our primary database.

## Rationale

### Why PostgreSQL?

**Advantages:**
- **Proven Technology**: Battle-tested, reliable, 30+ years of development
- **Rich Feature Set**: JSONB, full-text search, window functions, CTEs
- **pgvector Extension**: Native vector similarity search for embeddings
- **Performance**: Excellent for our read-heavy workload
- **Ecosystem**: Rich tooling (pgAdmin, DataGrip, psql)
- **Type Safety**: Strong typing aligns with TypeScript philosophy

**Specific Features Used:**
- `JSONB` columns for flexible mask configurations
- `ARRAY` types for tags and keywords
- `TIMESTAMP WITH TIME ZONE` for temporal data
- `SERIAL`/`UUID` for primary keys
- `FOREIGN KEY` constraints for referential integrity
- `UNIQUE` constraints for slugs

### Why Not NoSQL?

**MongoDB Rejected:**
- No native vector support (requires Atlas Search)
- Weaker consistency guarantees
- Schema flexibility not needed (we use TypeScript/Zod)

**DynamoDB Rejected:**
- Vendor lock-in
- Complex pricing model
- Limited query capabilities

**Cassandra Rejected:**
- Overkill for our scale
- Eventually consistent (we need ACID)

### Why pgvector?

**For semantic search capabilities:**
- Store embeddings directly in PostgreSQL
- No separate vector database needed
- Simpler architecture
- ACID guarantees for vectors + metadata

**Performance:**
- IVFFlat index for approximate nearest neighbor (ANN)
- Sufficient for <1M vectors (our expected scale)

## Schema Design Principles

1. **Normalization**: Entities in separate tables with foreign keys
2. **Soft Deletes**: `is_active` flags instead of DELETE
3. **Timestamps**: `created_at`, `updated_at` on all tables
4. **Slugs**: Human-readable identifiers alongside UUIDs
5. **JSON for Flexibility**: Use JSONB for truly variable data (mask configs)

## Migration Strategy

- **Tool**: Native SQL migrations (no ORM migrations)
- **Location**: `apps/api/migrations/`, `apps/orchestrator/migrations/`
- **Format**: Sequential numbered files (e.g., `001_initial_schema.sql`)
- **Execution**: Custom migration runner in TypeScript
- **Idempotency**: Use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE IF EXISTS`

## Consequences

### Positive

- Single source of truth for all data
- Strong consistency guarantees
- Excellent developer tooling
- Easy to reason about data model
- No vendor lock-in (portable SQL)

### Negative

- Vertical scaling limitations (mitigated by read replicas)
- Vector search performance limited vs. dedicated vector DBs
- Connection pooling required at scale

### Neutral

- Requires PostgreSQL expertise (common skill)
- Schema migrations need careful planning

## Alternatives Considered

### MySQL

**Rejected because:**
- No native vector support
- Weaker JSON support than PostgreSQL
- Less feature-rich

### CockroachDB

**Rejected because:**
- Overkill for our scale
- More complex operations
- Weaker JSON support

### Neo4j (as primary DB)

**Rejected because:**
- Graph queries not primary use case
- Less mature ecosystem
- Harder to model tabular data
- **Note**: We may add Neo4j as secondary store for graph visualization

## Performance Considerations

### Connection Pooling

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // Max connections
  idleTimeoutMillis: 30000, // Close idle connections
  connectionTimeoutMillis: 2000,
});
```

### Indexing Strategy

```sql
-- Profiles
CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_identity_id ON profiles(identity_id);

-- Experiences
CREATE INDEX idx_experiences_profile_id ON experiences(profile_id);
CREATE INDEX idx_experiences_start_date ON experiences(start_date);

-- Skills
CREATE INDEX idx_skills_profile_id ON skills(profile_id);
CREATE INDEX idx_skills_category ON skills(category);

-- Full-text search
CREATE INDEX idx_experiences_description_fts 
  ON experiences USING gin(to_tsvector('english', description));
```

### Query Optimization

- Use `EXPLAIN ANALYZE` for slow queries
- Avoid N+1 queries (use JOINs or batching)
- Paginate large result sets
- Use `SELECT` specific columns (avoid `SELECT *`)

## Backup Strategy

- **Automated Backups**: Daily pg_dump via CronJob
- **Point-in-Time Recovery**: WAL archiving enabled
- **Retention**: 30 days
- **Testing**: Monthly restore drills

## Monitoring

- **Metrics**: pg_stat_statements for query performance
- **Alerting**: Connection pool exhaustion, slow queries
- **Logging**: Log queries >1s in production

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [SPEC-001-data-schema.md](../../SPEC-001-data-schema.md)

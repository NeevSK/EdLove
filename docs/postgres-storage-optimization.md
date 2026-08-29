# PostgreSQL Storage Optimization Guide
**Stack:** Supabase (PostgreSQL 16+) · PowerSync Publication · ZenStack `.zmodel` SSOT
**Target:** Cloud cost control, query performance, unbounded table growth
**Status:** Active — cross-links `supabase`, `supabase-expert`, `zenstack-schema-modeling`

---

## 1. Table Partitioning Strategy

### 1.1 Target Tables (Unbounded Growth)
| Table | Partition Key | Strategy | Retention |
|-------|---------------|----------|-----------|
| `sentinel_audit_logs` | `created_at` | Range (monthly) | 3 years |
| `security_audit_logs` | `created_at` | Range (monthly) | 3 years |
| `growth_events` | `created_at` + `dimension` | Range (monthly) + sub-partition by `dimension` | 2 years |
| `ai_messages` | `created_at` | Range (monthly) | 90 days (matches `retention_days`) |
| `student_longitudinal_events` | `created_at` | Range (monthly) | 5 years |
| `privacy_ledger_entries` | `created_at` | Range (monthly) | 7 years (compliance) |

### 1.2 Declarative Partitioning Syntax
```sql
-- Parent partitioned table (example: growth_events)
CREATE TABLE growth_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at, dimension) -- must include partition keys
) PARTITION BY RANGE (created_at);

-- Sub-partition by dimension (high cardinality)
CREATE TABLE growth_events_y2026m01 PARTITION OF growth_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01')
  PARTITION BY LIST (dimension);

-- Leaf partitions
CREATE TABLE growth_events_y2026m01_bhumi PARTITION OF growth_events_y2026m01
  FOR VALUES IN ('bhumi');
CREATE TABLE growth_events_y2026m01_banyan PARTITION OF growth_events_y2026m01
  FOR VALUES IN ('banyan');
-- ... etc for each dimension value
```

### 1.3 Partition Bounds Convention
```sql
-- Monthly: inclusive lower, exclusive upper
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
-- Naming: {table}_y{year}m{month}[_subkey]
```
**Rule:** Adjacent partitions share bounds — upper bound exclusive.

### 1.4 Index Attachment (Zero-Downtime)
```sql
-- 1. Create invalid index on parent (fast, no lock on partitions)
CREATE INDEX CONCURRENTLY growth_events_created_at_idx ON ONLY growth_events (created_at);

-- 2. Create valid index on each partition CONCURRENTLY
CREATE INDEX CONCURRENTLY growth_events_y2026m01_created_at_idx
  ON growth_events_y2026m01 (created_at);

-- 3. Attach partition index to parent
ALTER INDEX growth_events_created_at_idx
  ATTACH PARTITION growth_events_y2026m01_created_at_idx;

-- Repeat for all existing partitions
-- New partitions: create index, then ATTACH
```

### 1.5 Unique/PK Constraints on Partitioned Tables
```sql
-- PK must include partition key(s)
ALTER TABLE growth_events ADD PRIMARY KEY (id, created_at, dimension);
-- Or use surrogate key with partition key
CREATE TABLE growth_events (
  id BIGSERIAL NOT NULL,  -- not UUID for sequential writes
  user_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at, dimension)
) PARTITION BY RANGE (created_at);
```

---

## 2. Partition Maintenance Automation

### 2.1 Monthly: Create Next Month's Partition
```sql
-- Supabase cron (pg_cron) or GitHub Actions
DO $$
DECLARE
  next_month TEXT := to_char(now() + interval '1 month', 'YYYY_"m"MM');
  start_date DATE := date_trunc('month', now() + interval '1 month');
  end_date DATE := start_date + interval '1 month';
BEGIN
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
    'growth_events_' || next_month, 'growth_events', start_date, end_date
  );
  -- Create sub-partitions for each dimension
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF %I FOR VALUES IN (%L)',
    'growth_events_' || next_month || '_bhumi', 'growth_events_' || next_month, 'bhumi'
  );
  -- ... repeat for banyan, river, crystal, etc.
END $$;
```

### 2.2 Quarterly: Detach + Archive Old Partitions
```sql
-- 1. Detach partition (CONCURRENTLY = SHARE UPDATE EXCLUSIVE lock)
ALTER TABLE growth_events DETACH PARTITION growth_events_y2023m01 CONCURRENTLY;

-- 2. Archive to cold storage (Supabase Storage / S3 / pg_dump)
\copy growth_events_y2023m01 TO 's3://gurudevi-archive/growth_events_y2023m01.csv' CSV HEADER;

-- 3. Verify archive integrity, then drop
DROP TABLE growth_events_y2023m01;
```

### 2.3 Default Partition (Catch-all)
```sql
-- Prevent insert errors for out-of-range data
CREATE TABLE growth_events_default PARTITION OF growth_events DEFAULT;
-- Monitor: SELECT count(*) FROM growth_events_default; -- should be 0
```

---

## 3. Denormalized Counter Hygiene

### 3.1 Counters Requiring Verification
| Table | Counter Column | Source of Truth |
|-------|----------------|-----------------|
| `community_groups` | `member_count` | `community_group_members` (status='active') |
| `sanctuary_manifestos` | `endorsement_count` | `manifesto_endorsements` |
| `nodes` (library) | `view_count`, `use_count`, `endorsement_count`, `bookmark_count` | respective engagement tables |
| `collections` | `used_by_count` | `collection_nodes` |

### 3.2 Nightly Recompute Job
```sql
-- Supabase Edge Function or pg_cron
UPDATE community_groups g
SET member_count = (
  SELECT count(*) FROM community_group_members m
  WHERE m.group_id = g.id AND m.status = 'active'
)
WHERE g.member_count != (
  SELECT count(*) FROM community_group_members m
  WHERE m.group_id = g.id AND m.status = 'active'
);

-- Verify drift
SELECT id, name, member_count,
       (SELECT count(*) FROM community_group_members WHERE group_id = g.id AND status = 'active') AS actual
FROM community_groups g
WHERE member_count != (
  SELECT count(*) FROM community_group_members WHERE group_id = g.id AND status = 'active'
);
```

### 3.3 Trigger Consistency (Already Exists — Verify)
```sql
-- Check existing triggers on source tables
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%counter%' OR action_statement ILIKE '%member_count%';
```
**Rule:** If trigger exists, trust it; add nightly verify as safety net. If no trigger, add trigger + nightly job.

---

## 4. Heavy Column Management

### 4.1 Server-Only Columns (Excluded from PowerSync)
| Table | Column | Type | Size Risk |
|-------|--------|------|-----------|
| `nodes` | `embedding` | `vector(1536)` | ~12KB/row |
| `nodes` | `search_vector` | `tsvector` | Variable |
| `nodes` | `title_si`, `title_ta`, `title_en` | `TEXT` | 3x duplication |
| `nodes` | `description_si`, `description_ta`, `description_en` | `TEXT` | 3x duplication |
| `edu_schools` | `name_si`, `name_ta`, `name_en` | `TEXT` | 3x duplication |

### 4.2 Confirmation: Excluded from Sync
```yaml
# powersync/sync-config.yaml — streams only include:
streams:
  identity:
    queries:
      - SELECT * FROM bonds WHERE user_id = auth.user_id()
      - SELECT * FROM school_memberships WHERE user_id = auth.user_id()
      - SELECT * FROM classroom_students WHERE student_id = auth.user_id()
  classroom_roster:
    query: |
      SELECT cs.* FROM classroom_students cs
      JOIN classrooms c ON c.id = cs.classroom_id
      WHERE c.teacher_id = auth.user_id() OR cs.student_id = auth.user_id()
```
**Verify:** No stream references `nodes`, `edu_schools`, or any heavy columns.

### 4.3 Embedding Index (pgvector)
```sql
-- HNSW index for ANN search (if embeddings are queried)
CREATE INDEX nodes_embedding_hnsw_idx ON nodes
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
-- Only create if ANN queries exist; otherwise TOAST handles storage
```

### 4.4 Localized Arrays — Consider Normalization
```sql
-- Current: 3 columns per locale (title_si, title_ta, title_en)
-- Alternative: JSONB + generated columns for each locale
ALTER TABLE nodes ADD COLUMN titles JSONB DEFAULT '{}';
UPDATE nodes SET titles = jsonb_build_object(
  'si', title_si, 'ta', title_ta, 'en', title_en
);
-- Generated columns for backward compat
ALTER TABLE nodes ADD COLUMN title_si TEXT GENERATED ALWAYS AS (titles->>'si') STORED;
-- Then DROP original columns after migration
```
**Benefit:** Single column, easier to add locales, TOAST compression on JSONB.

---

## 5. Autovacuum & Bloat Control

### 5.1 Per-Table Autovacuum Tuning
```sql
-- High-churn tables (audit logs, events)
ALTER TABLE sentinel_audit_logs SET (
  autovacuum_vacuum_scale_factor = 0.05,    -- default 0.2
  autovacuum_analyze_scale_factor = 0.02,   -- default 0.1
  autovacuum_vacuum_threshold = 5000,       -- default 50
  autovacuum_analyze_threshold = 2000,
  autovacuum_vacuum_cost_delay = 10,        -- default 20ms
  autovacuum_vacuum_cost_limit = 1000       -- default 200
);

-- Growth events (very high insert rate)
ALTER TABLE growth_events SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_max_workers = 3
);
```

### 5.2 pg_repack for Bloat Removal (Zero-Downtime)
```bash
# Supabase doesn't expose pg_repack directly; use alternative:
# 1. Create new partition, ATTACH, detach old
# 2. Or: pg_dump + pg_restore for non-partitioned tables
```

### 5.3 Monitoring Queries
```sql
-- Table bloat estimate
SELECT schemaname, relname,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
       pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) AS table_size,
       n_dead_tup, n_live_tup,
       round(n_dead_tup::numeric / nullif(n_live_tup,0) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_pct DESC;

-- Unused indexes
SELECT schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Autovacuum activity
SELECT schemaname, relname, last_autovacuum, last_autoanalyze,
       vacuum_count, analyze_count
FROM pg_stat_user_tables
WHERE last_autovacuum IS NOT NULL
ORDER BY last_autovacuum DESC;
```

---

## 6. Index Optimization

### 6.1 Composite Index Patterns (from ZenStack `@@index`)
```zmodel
// zenstack-schema-modeling skill: @@index([a, b]) syntax
model ClassroomStudent {
  @@index([studentId, status])   // for "my classrooms"
  @@index([classroomId, status]) // for "classroom roster"
}

model Grade {
  @@index([studentId, createdAt])
  @@index([classroomId, studentId])
  @@index([assignmentId])
}

model Attendance {
  @@index([classroomId, date])
  @@index([studentId, date])
}
```

### 6.2 Partial Indexes (Filtered)
```sql
-- Only index active classrooms
CREATE INDEX classrooms_active_idx ON classrooms (schoolId, teacherId)
WHERE is_archived = false;

-- Only index pending submissions
CREATE INDEX submissions_pending_idx ON submissions (assignmentId, studentId)
WHERE grade IS NULL;
```

### 6.3 Covering Indexes (Include Payload Columns)
```sql
-- Avoid heap fetch for common projections
CREATE INDEX attendance_covering_idx ON attendance (classroomId, date)
INCLUDE (status, markedBy, note);
```

---

## 7. PowerSync Publication Alignment

### 7.1 Current Publication (4 Tables Only)
```sql
-- apps/gurudevi-mobile/supabase/migrations/20260812000000_powersync_publication.sql
CREATE PUBLICATION powersync FOR TABLE
  public.bonds,
  public.school_memberships,
  public.classrooms,
  public.classroom_students;
ALTER TABLE public.bonds REPLICA IDENTITY FULL;
ALTER TABLE public.school_memberships REPLICA IDENTITY FULL;
ALTER TABLE public.classrooms REPLICA IDENTITY FULL;
ALTER TABLE public.classroom_students REPLICA IDENTITY FULL;
```

### 7.2 Drift Prevention (CI Gate)
```typescript
// packages/core/src/adapters/powersync/drift-check.test.ts
import { AppSchema } from '@repo/core/adapters/powersync';
import { supabase } from './supabase-client';

test('AppSchema columns match Postgres for synced tables', async () => {
  const syncedTables = ['bonds', 'school_memberships', 'classrooms', 'classroom_students'];
  for (const table of syncedTables) {
    const pgCols = await supabase.rpc('get_table_columns', { table_name: table });
    const drizzleCols = Object.keys(AppSchema[table].columns);
    // Compare types, nullability, defaults
    expect(drizzleCols).toEqual(expect.arrayContaining(pgCols.map(c => c.column_name)));
  }
});
```

---

## 8. Verification & Gates

| Gate | Command | Pass Condition |
|------|---------|----------------|
| Migration | `supabase db diff --schema public` | No unintended schema drift |
| Partition | `SELECT count(*) FROM pg_partitions WHERE parent = 'growth_events'` | New partition exists monthly |
| Counter Drift | Nightly job output | Zero rows returned |
| Bloat | `pgstattuple` / monitoring query | `dead_pct < 10%` for all partitioned tables |
| Unused Index | Monitoring query | Zero indexes with `idx_scan=0` > 10MB |
| Autovacuum | `pg_stat_user_tables` | `last_autovacuum < 24h ago` for high-churn tables |

---

## 9. Cross-Stack Contracts (SSOT)

| Layer | Source of Truth | Sync Direction |
|-------|-----------------|----------------|
| Postgres DDL | `apps/gurudevi-mobile/supabase/migrations/*.sql` | ↓ Generates |
| ZenStack Domain | `packages/schema/schema.zmodel` | ↑ Generates Prisma + Zod |
| Drizzle Local | `packages/core/src/adapters/powersync/schema.ts` | ↔ Manual alignment (drift-check test) |
| PowerSync Publication | `powersync/sync-config.yaml` + publication migration | Server → Mobile only (4 tables) |

**Rule:** Postgres columns for the 4 published tables = ZenStack `.zmodel` = Drizzle `AppSchema`. Any mismatch = build failure.

---

## 10. Quick Reference — Partition Maintenance Calendar

| Frequency | Action | Tables |
|-----------|--------|--------|
| Monthly (1st) | Create next month partition + sub-partitions | All partitioned |
| Monthly (1st) | Run `PRAGMA optimize` equivalent (`ANALYZE` partitions) | All partitioned |
| Quarterly | `DETACH PARTITION CONCURRENTLY` → archive → `DROP` | Partitions > retention |
| Nightly | Counter recompute + drift verify | `community_groups`, `nodes`, `sanctuary_manifestos` |
| Weekly | `pg_stat_user_tables` bloat check | All |
| Monthly | `pg_stat_user_indexes` unused index scan | All |
| On deploy | Drift-check test (CI) | 4 synced tables |
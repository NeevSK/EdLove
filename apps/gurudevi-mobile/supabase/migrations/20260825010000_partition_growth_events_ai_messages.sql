-- Partitioning for growth_events (sub-partitioned by dimension) and ai_messages
-- Phase 3: High-volume event tables with sub-partitioning

-- ============================================================
-- 1. GROWTH_EVENTS - Range by created_at + List by dimension
-- ============================================================

-- Create partitioned table
CREATE TABLE IF NOT EXISTS growth_events_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at, dimension)
) PARTITION BY RANGE (created_at);

-- Create monthly range partitions with list sub-partitioning by dimension
DO $$
DECLARE
  start_month DATE := '2024-01-01';
  end_month DATE := '2026-01-01';
  current_month DATE;
  partition_name TEXT;
  dimensions TEXT[] := ARRAY['bhumi', 'banyan', 'river', 'crystal', 'thuthimal', 'fire', 'decision', 'sanctuary'];
  dim TEXT;
BEGIN
  current_month := start_month;
  WHILE current_month < end_month LOOP
    partition_name := 'growth_events_' || to_char(current_month, 'YYYY_"m"MM');
    -- Create monthly range partition with list sub-partitioning
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF growth_events_partitioned
         FOR VALUES FROM (%L) TO (%L)
         PARTITION BY LIST (dimension)',
        partition_name, current_month, current_month + interval '1 month'
      );
    END IF;
    
    -- Create sub-partitions for each dimension
    FOREACH dim IN ARRAY dimensions LOOP
      IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name || '_' || dim) THEN
        EXECUTE format(
          'CREATE TABLE %I PARTITION OF %I FOR VALUES IN (%L)',
          partition_name || '_' || dim, partition_name, dim
        );
        EXECUTE format(
          'CREATE INDEX IF NOT EXISTS %I ON %I (user_id, created_at)',
          partition_name || '_' || dim || '_user_created_idx', partition_name || '_' || dim
        );
      END IF;
    END LOOP;
    
    current_month := current_month + interval '1 month';
  END LOOP;
END $$;

-- Default partition for out-of-range
CREATE TABLE IF NOT EXISTS growth_events_default PARTITION OF growth_events_partitioned DEFAULT;

-- Migrate data when the legacy source exists. The active ledger begins with
-- user_growth_state rather than a standalone growth_events source table.
DO $$
BEGIN
  IF to_regclass('public.growth_events') IS NOT NULL THEN
    INSERT INTO growth_events_partitioned (id, user_id, dimension, event_type, event_metadata, created_at)
    SELECT id, user_id, dimension, event_type, event_metadata, created_at
    FROM public.growth_events;
  END IF;
END $$;

-- Drop old table and rename
DROP TABLE IF EXISTS growth_events;
ALTER TABLE growth_events_partitioned RENAME TO growth_events;

-- Parent-level indexes (auto-propagate to new partitions via ATTACH)
CREATE INDEX IF NOT EXISTS growth_events_user_created_idx ON ONLY growth_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS growth_events_dimension_created_idx ON ONLY growth_events (dimension, created_at);

-- Attach indexes to existing partitions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT inhrelid::regclass AS part_name
    FROM pg_inherits
    WHERE inhparent = 'growth_events'::regclass
      AND inhrelid::regclass::text NOT LIKE '%_default'
  LOOP
    IF to_regclass(r.part_name::text || '_user_created_idx') IS NOT NULL THEN
      EXECUTE format('ALTER INDEX growth_events_user_created_idx ATTACH PARTITION %I_user_created_idx', r.part_name);
    END IF;
    IF to_regclass(r.part_name::text || '_dimension_created_idx') IS NOT NULL THEN
      EXECUTE format('ALTER INDEX growth_events_dimension_created_idx ATTACH PARTITION %I_dimension_created_idx', r.part_name);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 2. AI_MESSAGES - Range by created_at (90-day retention)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_messages_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  privacy_mode TEXT NOT NULL DEFAULT 'saved',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (90-day retention = keep ~4 months)
DO $$
DECLARE
  start_month DATE := '2024-01-01';
  end_month DATE := '2026-01-01';
  current_month DATE;
  partition_name TEXT;
BEGIN
  current_month := start_month;
  WHILE current_month < end_month LOOP
    partition_name := 'ai_messages_' || to_char(current_month, 'YYYY_"m"MM');
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF ai_messages_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        partition_name, current_month, current_month + interval '1 month'
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I (user_id, created_at)',
        partition_name || '_user_created_idx', partition_name
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I (thread_id, created_at)',
        partition_name || '_thread_created_idx', partition_name
      );
    END IF;
    current_month := current_month + interval '1 month';
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS ai_messages_default PARTITION OF ai_messages_partitioned DEFAULT;

INSERT INTO ai_messages_partitioned (id, user_id, thread_id, role, content, privacy_mode, expires_at, created_at)
SELECT id, user_id, thread_id, role, content, privacy_mode, expires_at, created_at
FROM ai_messages;

DROP TABLE IF EXISTS ai_messages;
ALTER TABLE ai_messages_partitioned RENAME TO ai_messages;

CREATE INDEX IF NOT EXISTS ai_messages_user_created_idx ON ONLY ai_messages (user_id, created_at);
CREATE INDEX IF NOT EXISTS ai_messages_thread_created_idx ON ONLY ai_messages (thread_id, created_at);

-- Attach indexes to existing partitions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT inhrelid::regclass AS part_name
    FROM pg_inherits
    WHERE inhparent = 'ai_messages'::regclass
      AND inhrelid::regclass::text NOT LIKE '%_default'
  LOOP
    IF to_regclass(r.part_name::text || '_user_created_idx') IS NOT NULL THEN
      EXECUTE format('ALTER INDEX ai_messages_user_created_idx ATTACH PARTITION %I_user_created_idx', r.part_name);
    END IF;
    IF to_regclass(r.part_name::text || '_thread_created_idx') IS NOT NULL THEN
      EXECUTE format('ALTER INDEX ai_messages_thread_created_idx ATTACH PARTITION %I_thread_created_idx', r.part_name);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- PARTITION MAINTENANCE FOR GROWTH_EVENTS + AI_MESSAGES
-- ============================================================

CREATE OR REPLACE FUNCTION create_next_month_partitions_growth_ai()
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  next_month_start DATE := date_trunc('month', now() + interval '1 month');
  next_month_end DATE := next_month_start + interval '1 month';
  partition_name TEXT;
  dimensions TEXT[] := ARRAY['bhumi', 'banyan', 'river', 'crystal', 'thuthimal', 'fire', 'decision', 'sanctuary'];
  dim TEXT;
BEGIN
  -- growth_events: monthly range + list sub-partitions
  partition_name := 'growth_events_' || to_char(next_month_start, 'YYYY_"m"MM');
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF growth_events
     FOR VALUES FROM (%L) TO (%L)
     PARTITION BY LIST (dimension)',
    partition_name, next_month_start, next_month_end
  );
  
  FOREACH dim IN ARRAY dimensions LOOP
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF %I FOR VALUES IN (%L)',
      partition_name || '_' || dim, partition_name, dim
    );
    EXECUTE format(
      'CREATE INDEX %I ON %I (user_id, created_at)',
      partition_name || '_' || dim || '_user_created_idx', partition_name || '_' || dim
    );
  END LOOP;

  -- ai_messages: monthly range
  partition_name := 'ai_messages_' || to_char(next_month_start, 'YYYY_"m"MM');
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF ai_messages
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, next_month_start, next_month_end
  );
  EXECUTE format('CREATE INDEX %I ON %I (user_id, created_at)',
    partition_name || '_user_created_idx', partition_name);
  EXECUTE format('CREATE INDEX %I ON %I (thread_id, created_at)',
    partition_name || '_thread_created_idx', partition_name);
END $$;

-- ============================================================
-- ARCHIVAL FOR GROWTH_EVENTS (2-year retention) + AI_MESSAGES (90-day)
-- ============================================================

CREATE OR REPLACE FUNCTION archive_old_partitions_growth_ai()
RETURNS TABLE(partition_name TEXT, status TEXT)
LANGUAGE plpgsql AS $$
DECLARE
  growth_cutoff DATE := date_trunc('month', now() - interval '24 months'); -- 2 years
  ai_cutoff DATE := date_trunc('month', now() - interval '4 months'); -- ~120 days buffer for 90-day retention
  r RECORD;
BEGIN
  -- Archive growth_events partitions older than 2 years
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_inherits i ON c.oid = i.inhrelid
    JOIN pg_class p ON i.inhparent = p.oid
    WHERE p.relname = 'growth_events'
      AND c.relname NOT LIKE '%_default'
      AND c.relname ~ '^growth_events_\d{4}_m\d{2}$'
  LOOP
    DECLARE
      partition_month DATE := (regexp_replace(r.relname, '^growth_events_(\d{4})_m(\d{2})$', '\1-\2-01'))::DATE;
    BEGIN
      IF partition_month < growth_cutoff THEN
        EXECUTE format('ALTER TABLE growth_events DETACH PARTITION %I CONCURRENTLY', r.relname);
        -- \copy to cold storage here
        EXECUTE format('DROP TABLE %I', r.relname);
        RETURN QUERY SELECT r.relname, 'archived_and_dropped';
      ELSE
        RETURN QUERY SELECT r.relname, 'retained';
      END IF;
    END;
  END LOOP;

  -- Archive ai_messages partitions older than 4 months
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_inherits i ON c.oid = i.inhrelid
    JOIN pg_class p ON i.inhparent = p.oid
    WHERE p.relname = 'ai_messages'
      AND c.relname NOT LIKE '%_default'
      AND c.relname ~ '^ai_messages_\d{4}_m\d{2}$'
  LOOP
    DECLARE
      partition_month DATE := (regexp_replace(r.relname, '^ai_messages_(\d{4})_m(\d{2})$', '\1-\2-01'))::DATE;
    BEGIN
      IF partition_month < ai_cutoff THEN
        EXECUTE format('ALTER TABLE ai_messages DETACH PARTITION %I CONCURRENTLY', r.relname);
        -- \copy to cold storage here
        EXECUTE format('DROP TABLE %I', r.relname);
        RETURN QUERY SELECT r.relname, 'archived_and_dropped';
      ELSE
        RETURN QUERY SELECT r.relname, 'retained';
      END IF;
    END;
  END LOOP;
END $$;

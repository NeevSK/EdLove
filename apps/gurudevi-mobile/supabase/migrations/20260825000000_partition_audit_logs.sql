-- Partitioning for unbounded audit/log tables (Phase 3)
-- Tables: sentinel_audit_logs, security_audit_logs, privacy_ledger_entries, student_longitudinal_events
-- Strategy: Range partitioning by created_at (monthly)

-- ============================================================
-- 1. SENTINEL_AUDIT_LOGS
-- ============================================================

-- Convert existing table to partitioned table
-- First, create the partitioned table structure
CREATE TABLE sentinel_audit_logs_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for existing data range (2024-01 to 2026-12)
-- Adjust start date based on actual data
DO $$
DECLARE
  start_month DATE := '2024-01-01';
  end_month DATE := '2027-01-01';
  current_month DATE;
  partition_name TEXT;
BEGIN
  current_month := start_month;
  WHILE current_month < end_month LOOP
    partition_name := 'sentinel_audit_logs_' || to_char(current_month, 'YYYY_"m"MM');
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF sentinel_audit_logs_partitioned
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, current_month, current_month + interval '1 month'
    );
    -- Create index on each partition
    EXECUTE format(
      'CREATE INDEX %I ON %I (actor_id, created_at)',
      partition_name || '_actor_created_idx', partition_name
    );
    EXECUTE format(
      'CREATE INDEX %I ON %I (action, created_at)',
      partition_name || '_action_created_idx', partition_name
    );
    current_month := current_month + interval '1 month';
  END LOOP;
END $$;

-- Create default partition for out-of-range data
CREATE TABLE sentinel_audit_logs_default PARTITION OF sentinel_audit_logs_partitioned DEFAULT;

-- Migrate data from old table to partitioned table
INSERT INTO sentinel_audit_logs_partitioned (id, actor_id, action, resource_type, resource_id, details, created_at)
SELECT id, actor_id, action, resource_type, resource_id, details, created_at
FROM sentinel_audit_logs;

-- Drop old table and rename
DROP TABLE sentinel_audit_logs;
ALTER TABLE sentinel_audit_logs_partitioned RENAME TO sentinel_audit_logs;

-- Create partitioned index on parent (auto-propagates to new partitions)
CREATE INDEX sentinel_audit_logs_actor_created_idx ON sentinel_audit_logs (actor_id, created_at);
CREATE INDEX sentinel_audit_logs_action_created_idx ON sentinel_audit_logs (action, created_at);

-- ============================================================
-- 2. SECURITY_AUDIT_LOGS
-- ============================================================

CREATE TABLE security_audit_logs_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  account_id UUID,
  device_id UUID,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

DO $$
DECLARE
  start_month DATE := '2024-01-01';
  end_month DATE := '2027-01-01';
  current_month DATE;
  partition_name TEXT;
BEGIN
  current_month := start_month;
  WHILE current_month < end_month LOOP
    partition_name := 'security_audit_logs_' || to_char(current_month, 'YYYY_"m"MM');
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF security_audit_logs_partitioned
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, current_month, current_month + interval '1 month'
    );
    EXECUTE format(
      'CREATE INDEX %I ON %I (account_id, created_at)',
      partition_name || '_account_created_idx', partition_name
    );
    EXECUTE format(
      'CREATE INDEX %I ON %I (action, created_at)',
      partition_name || '_action_created_idx', partition_name
    );
    current_month := current_month + interval '1 month';
  END LOOP;
END $$;

CREATE TABLE security_audit_logs_default PARTITION OF security_audit_logs_partitioned DEFAULT;

INSERT INTO security_audit_logs_partitioned (id, account_id, device_id, action, metadata, created_at)
SELECT id, account_id, device_id, action, metadata, created_at
FROM security_audit_logs;

DROP TABLE security_audit_logs;
ALTER TABLE security_audit_logs_partitioned RENAME TO security_audit_logs;

CREATE INDEX security_audit_logs_account_created_idx ON security_audit_logs (account_id, created_at);
CREATE INDEX security_audit_logs_action_created_idx ON security_audit_logs (action, created_at);

-- ============================================================
-- 3. PRIVACY_LEDGER_ENTRIES
-- ============================================================

CREATE TABLE privacy_ledger_entries_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

DO $$
DECLARE
  start_month DATE := '2024-01-01';
  end_month DATE := '2031-01-01'; -- 7-year retention
  current_month DATE;
  partition_name TEXT;
BEGIN
  current_month := start_month;
  WHILE current_month < end_month LOOP
    partition_name := 'privacy_ledger_entries_' || to_char(current_month, 'YYYY_"m"MM');
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF privacy_ledger_entries_partitioned
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, current_month, current_month + interval '1 month'
    );
    EXECUTE format(
      'CREATE INDEX %I ON %I (user_id, created_at)',
      partition_name || '_user_created_idx', partition_name
    );
    current_month := current_month + interval '1 month';
  END LOOP;
END $$;

CREATE TABLE privacy_ledger_entries_default PARTITION OF privacy_ledger_entries_partitioned DEFAULT;

INSERT INTO privacy_ledger_entries_partitioned (id, user_id, activity_type, resource_name, description, metadata, created_at)
SELECT id, user_id, activity_type, resource_name, description, metadata, created_at
FROM privacy_ledger_entries;

DROP TABLE privacy_ledger_entries;
ALTER TABLE privacy_ledger_entries_partitioned RENAME TO privacy_ledger_entries;

CREATE INDEX privacy_ledger_entries_user_created_idx ON privacy_ledger_entries (user_id, created_at);

-- ============================================================
-- 4. STUDENT_LONGITUDINAL_EVENTS
-- ============================================================

CREATE TABLE student_longitudinal_events_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  school_id UUID,
  grade_id UUID,
  classroom_id UUID,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  source_table TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  recorded_by UUID,
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

DO $$
DECLARE
  start_month DATE := '2024-01-01';
  end_month DATE := '2029-01-01'; -- 5-year retention
  current_month DATE;
  partition_name TEXT;
BEGIN
  current_month := start_month;
  WHILE current_month < end_month LOOP
    partition_name := 'student_longitudinal_events_' || to_char(current_month, 'YYYY_"m"MM');
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF student_longitudinal_events_partitioned
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, current_month, current_month + interval '1 month'
    );
    EXECUTE format(
      'CREATE INDEX %I ON %I (student_id, occurred_at DESC, recorded_at DESC)',
      partition_name || '_student_occurred_idx', partition_name
    );
    current_month := current_month + interval '1 month';
  END LOOP;
END $$;

CREATE TABLE student_longitudinal_events_default PARTITION OF student_longitudinal_events_partitioned DEFAULT;

INSERT INTO student_longitudinal_events_partitioned (
  id, student_id, school_id, grade_id, classroom_id, entity_type, entity_id, operation,
  source_table, snapshot, occurred_at, recorded_at, effective_from, effective_to, recorded_by
)
SELECT
  id, student_id, school_id, grade_id, classroom_id, entity_type, entity_id, operation,
  source_table, snapshot, occurred_at, recorded_at, effective_from, effective_to, recorded_by
FROM student_longitudinal_events;

DROP TABLE student_longitudinal_events;
ALTER TABLE student_longitudinal_events_partitioned RENAME TO student_longitudinal_events;

CREATE INDEX student_longitudinal_events_student_occurred_idx ON student_longitudinal_events (student_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX student_longitudinal_events_school_entity_idx ON student_longitudinal_events (school_id, entity_type, occurred_at DESC);
CREATE INDEX student_longitudinal_events_classroom_occurred_idx ON student_longitudinal_events (classroom_id, occurred_at DESC);

-- ============================================================
-- PARTITION MAINTENANCE FUNCTION
-- ============================================================

-- Function to create next month's partition for all partitioned tables
CREATE OR REPLACE FUNCTION create_next_month_partitions()
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  next_month_start DATE := date_trunc('month', now() + interval '1 month');
  next_month_end DATE := next_month_start + interval '1 month';
  partition_name TEXT;
BEGIN
  -- sentinel_audit_logs
  partition_name := 'sentinel_audit_logs_' || to_char(next_month_start, 'YYYY_"m"MM');
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF sentinel_audit_logs
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, next_month_start, next_month_end
  );
  EXECUTE format('CREATE INDEX %I ON %I (actor_id, created_at)',
    partition_name || '_actor_created_idx', partition_name);
  EXECUTE format('CREATE INDEX %I ON %I (action, created_at)',
    partition_name || '_action_created_idx', partition_name);

  -- security_audit_logs
  partition_name := 'security_audit_logs_' || to_char(next_month_start, 'YYYY_"m"MM');
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF security_audit_logs
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, next_month_start, next_month_end
  );
  EXECUTE format('CREATE INDEX %I ON %I (account_id, created_at)',
    partition_name || '_account_created_idx', partition_name);
  EXECUTE format('CREATE INDEX %I ON %I (action, created_at)',
    partition_name || '_action_created_idx', partition_name);

  -- privacy_ledger_entries
  partition_name := 'privacy_ledger_entries_' || to_char(next_month_start, 'YYYY_"m"MM');
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF privacy_ledger_entries
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, next_month_start, next_month_end
  );
  EXECUTE format('CREATE INDEX %I ON %I (user_id, created_at)',
    partition_name || '_user_created_idx', partition_name);

  -- student_longitudinal_events
  partition_name := 'student_longitudinal_events_' || to_char(next_month_start, 'YYYY_"m"MM');
  EXECUTE format(
    'CREATE TABLE %I PARTITION OF student_longitudinal_events
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, next_month_start, next_month_end
  );
  EXECUTE format('CREATE INDEX %I ON %I (student_id, occurred_at DESC, recorded_at DESC)',
    partition_name || '_student_occurred_idx', partition_name);
END $$;

-- ============================================================
-- ARCHIVAL FUNCTION (detach + archive old partitions)
-- ============================================================

CREATE OR REPLACE FUNCTION archive_old_partitions(retention_months INT DEFAULT 36)
RETURNS TABLE(partition_name TEXT, status TEXT)
LANGUAGE plpgsql AS $$
DECLARE
  cutoff DATE := date_trunc('month', now() - interval '1 month' * retention_months);
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_inherits i ON c.oid = i.inhrelid
    JOIN pg_class p ON i.inhparent = p.oid
    WHERE p.relname IN ('sentinel_audit_logs', 'security_audit_logs', 'privacy_ledger_entries', 'student_longitudinal_events')
      AND c.relname NOT LIKE '%_default'
      AND c.relname ~ '^\w+_\d{4}_m\d{2}$'
  LOOP
    -- Extract date from partition name (e.g., sentinel_audit_logs_2024_m01 -> 2024-01-01)
    DECLARE
      partition_date TEXT := regexp_replace(r.relname, '^.*_(\d{4})_m(\d{2})$', '\1-\2-01');
      partition_month DATE := partition_date::DATE;
    BEGIN
      IF partition_month < cutoff THEN
        -- Detach partition
        EXECUTE format('ALTER TABLE %I DETACH PARTITION %I CONCURRENTLY', 
          (SELECT inhparent::regclass FROM pg_inherits WHERE inhrelid = r.relname)::TEXT,
          r.relname);
        
        -- In production: COPY to S3/cold storage here
        -- \copy r.relname TO 's3://gurudevi-archive/r.relname.csv' CSV HEADER;
        
        -- Drop partition
        EXECUTE format('DROP TABLE %I', r.relname);
        RETURN QUERY SELECT r.relname, 'archived_and_dropped';
      ELSE
        RETURN QUERY SELECT r.relname, 'retained';
      END IF;
    END;
  END LOOP;
END $$;
-- PRE-FLIGHT CHECK: Run these queries manually to detect duplicate idempotency keys before executing this migration.
/*
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename IN ('student_grades', 'attendance', 'mood_logs', 'submissions', 'student_observations', 'principal_observations')
    LOOP
        EXECUTE format('
            CREATE TEMP TABLE temp_dupes AS 
            SELECT idempotency_key, count(*) 
            FROM public.%I 
            WHERE idempotency_key IS NOT NULL 
            GROUP BY idempotency_key 
            HAVING count(*) > 1;
        ', rec.tablename);
        
        IF (SELECT count(*) FROM temp_dupes) > 0 THEN
            RAISE NOTICE 'Duplicates found in %', rec.tablename;
        END IF;
        
        DROP TABLE temp_dupes;
    END LOOP;
END
$$;
*/

-- ==========================================
-- 1. UUID v7 PL/pgSQL Implementation
-- ==========================================
CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Extract milliseconds since epoch
  unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  -- Concatenate with 10 random bytes
  uuid_bytes = unix_ts_ms || gen_random_bytes(10);
  -- Set version (7)
  uuid_bytes = set_byte(uuid_bytes, 6, (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::integer);
  -- Set variant (RFC 4122)
  uuid_bytes = set_byte(uuid_bytes, 8, (b'10' || get_byte(uuid_bytes, 8)::bit(6))::integer);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$ LANGUAGE plpgsql VOLATILE;

-- ==========================================
-- 2. Apply UUID v7 Default to Primary Keys
-- ==========================================
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'audit.logs', 'public.security_audit_logs', 'public.notifications',
    'public.student_observations', 'public.principal_observations',
    'public.student_grades', 'public.mood_logs', 'public.submissions'
  ] LOOP
    IF to_regclass(table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %s ALTER COLUMN id SET DEFAULT public.uuid_generate_v7()', table_name);
    END IF;
  END LOOP;
END $$;

-- ==========================================
-- 3. Idempotency Key Guard & Constraints
-- ==========================================

DO $$
DECLARE
  table_name text;
  constraint_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'student_grades', 'attendance', 'mood_logs', 'submissions',
    'student_observations', 'principal_observations'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid()', table_name);
      constraint_name := table_name || '_idempotency_key_key';
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        WHERE c.conrelid = ('public.' || table_name)::regclass
          AND c.conname = constraint_name
      ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I UNIQUE(idempotency_key)', table_name, constraint_name);
      END IF;
    END IF;
  END LOOP;
END $$;

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
ALTER TABLE audit.logs ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.security_audit_logs ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.student_observations ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.principal_observations ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.student_grades ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.mood_logs ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();
ALTER TABLE public.submissions ALTER COLUMN id SET DEFAULT public.uuid_generate_v7();

-- ==========================================
-- 3. Idempotency Key Guard & Constraints
-- ==========================================

-- Ensure the column exists on all heavy-mutation tables
ALTER TABLE public.student_grades ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();
ALTER TABLE public.mood_logs ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();
ALTER TABLE public.student_observations ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();
ALTER TABLE public.principal_observations ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();

-- Apply UNIQUE constraints (act as indexing as well for idempotency guards)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_grades_idempotency_key_key') THEN
        ALTER TABLE public.student_grades ADD CONSTRAINT student_grades_idempotency_key_key UNIQUE(idempotency_key);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_idempotency_key_key') THEN
        ALTER TABLE public.attendance ADD CONSTRAINT attendance_idempotency_key_key UNIQUE(idempotency_key);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mood_logs_idempotency_key_key') THEN
        ALTER TABLE public.mood_logs ADD CONSTRAINT mood_logs_idempotency_key_key UNIQUE(idempotency_key);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_idempotency_key_key') THEN
        ALTER TABLE public.submissions ADD CONSTRAINT submissions_idempotency_key_key UNIQUE(idempotency_key);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_observations_idempotency_key_key') THEN
        ALTER TABLE public.student_observations ADD CONSTRAINT student_observations_idempotency_key_key UNIQUE(idempotency_key);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'principal_observations_idempotency_key_key') THEN
        ALTER TABLE public.principal_observations ADD CONSTRAINT principal_observations_idempotency_key_key UNIQUE(idempotency_key);
    END IF;
END $$;

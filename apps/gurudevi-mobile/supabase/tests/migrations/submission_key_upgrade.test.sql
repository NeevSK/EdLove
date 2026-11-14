BEGIN;
DO $$
BEGIN
  IF current_database() <> 'gurudevi_foundation_test' THEN
    RAISE EXCEPTION 'This upgrade rehearsal requires the isolated foundation database';
  END IF;
  IF EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261015130000') THEN
    RAISE EXCEPTION 'This fixture rehearses a legacy-to-scoped upgrade, not an already-applied migration';
  END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(8);

-- Ledger 26 predates the legacy UUID key migration. This prerequisite is test-only.
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS idempotency_key uuid;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.submissions'::regclass
    AND conname = 'submissions_idempotency_key_key') THEN
    ALTER TABLE public.submissions ADD CONSTRAINT submissions_idempotency_key_key UNIQUE (idempotency_key);
  END IF;
END;
$$;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('f0210000-0000-4000-8000-000000000001', 'submission-key-a@example.invalid', '{"full_name":"Key fixture A"}'),
  ('f0210000-0000-4000-8000-000000000002', 'submission-key-b@example.invalid', '{"full_name":"Key fixture B"}');
SELECT id AS user_a FROM public.users WHERE email = 'submission-key-a@example.invalid'
\gset
SELECT id AS user_b FROM public.users WHERE email = 'submission-key-b@example.invalid'
\gset

INSERT INTO public.classrooms (id, name, teacher_id)
VALUES ('f0220000-0000-4000-8000-000000000001', 'Key upgrade fixture', :'user_a');
INSERT INTO public.assignments (id, classroom_id, title) VALUES
  ('f0230000-0000-4000-8000-000000000001', 'f0220000-0000-4000-8000-000000000001', 'Assignment one'),
  ('f0230000-0000-4000-8000-000000000002', 'f0220000-0000-4000-8000-000000000001', 'Assignment two');
INSERT INTO public.submissions (assignment_id, student_id, content, idempotency_key)
VALUES ('f0230000-0000-4000-8000-000000000001', :'user_a', 'A work', 'f0240000-0000-4000-8000-000000000001');

SELECT throws_ok(format($sql$
  INSERT INTO public.submissions (assignment_id, student_id, idempotency_key)
  VALUES ('f0230000-0000-4000-8000-000000000001', %L, 'f0240000-0000-4000-8000-000000000001')
$sql$, :'user_b'), '23505', NULL, 'legacy global uniqueness rejects an unrelated account key');

\ir ../../migrations/20261015130000_account_scoped_submission_idempotency.sql

SELECT lives_ok(format($sql$
  INSERT INTO public.submissions (assignment_id, student_id, idempotency_key)
  VALUES ('f0230000-0000-4000-8000-000000000001', %L, 'f0240000-0000-4000-8000-000000000001')
$sql$, :'user_b'), 'different accounts can reuse the same caller key after upgrade');
SELECT throws_ok(format($sql$
  INSERT INTO public.submissions (assignment_id, student_id, idempotency_key)
  VALUES ('f0230000-0000-4000-8000-000000000002', %L, 'f0240000-0000-4000-8000-000000000001')
$sql$, :'user_a'), '23505', NULL, 'same account cannot reuse a key for a different assignment');
SELECT lives_ok(format($sql$
  INSERT INTO public.submissions (assignment_id, student_id, idempotency_key)
  VALUES ('f0230000-0000-4000-8000-000000000002', %L, 'f0240000-0000-4000-8000-000000000002')
$sql$, :'user_a'), 'same account can submit another assignment with a new key');
SELECT throws_ok(format($sql$
  INSERT INTO public.submissions (assignment_id, student_id, idempotency_key)
  VALUES ('f0230000-0000-4000-8000-000000000001', %L, 'f0240000-0000-4000-8000-000000000003')
$sql$, :'user_a'), '23505', NULL, 'assignment and student uniqueness remains intact');
SELECT ok(EXISTS (SELECT 1 FROM pg_constraint
  WHERE conrelid = 'public.submissions'::regclass AND conname = 'submissions_student_id_idempotency_key_key'),
  'account-scoped unique constraint exists');
SELECT ok(NOT EXISTS (SELECT 1 FROM pg_constraint
  WHERE conrelid = 'public.submissions'::regclass AND conname = 'submissions_idempotency_key_key'),
  'legacy global unique constraint is removed');

\ir ../../migrations/20261015130000_account_scoped_submission_idempotency.sql
SELECT pass('the actual upgrade migration can execute again without dropping account scope');
SELECT * FROM finish();
ROLLBACK;

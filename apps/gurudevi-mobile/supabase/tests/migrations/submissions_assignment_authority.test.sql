BEGIN;

DO $$
BEGIN
  IF current_database() <> 'gurudevi_foundation_test' THEN
    RAISE EXCEPTION 'Submission authority rehearsal requires the isolated foundation database';
  END IF;

  IF to_regclass('supabase_migrations.schema_migrations') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM supabase_migrations.schema_migrations
       WHERE version = '20260302093635'
     ) THEN
    RAISE EXCEPTION 'This fixture requires the submissions policy migration to be unapplied';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.submissions'::regclass
      AND polname IN (
        'Students can read their own submissions',
        'Students can create submissions',
        'Teachers can read submissions in their classrooms',
        'Teachers can grade submissions in their classrooms'
      )
  ) THEN
    RAISE EXCEPTION 'This fixture refuses pre-existing submissions policies';
  END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(13);

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('f0410000-0000-4000-8000-000000000001', 'submission-teacher-a@example.invalid', '{}'),
  ('f0410000-0000-4000-8000-000000000002', 'submission-teacher-b@example.invalid', '{}'),
  ('f0410000-0000-4000-8000-000000000003', 'submission-student-a@example.invalid', '{}'),
  ('f0410000-0000-4000-8000-000000000004', 'submission-student-b@example.invalid', '{}');

INSERT INTO public.classrooms (id, name, teacher_id) VALUES
  ('f0420000-0000-4000-8000-000000000001', 'Submission authority A', 'f0410000-0000-4000-8000-000000000001'),
  ('f0420000-0000-4000-8000-000000000002', 'Submission authority B', 'f0410000-0000-4000-8000-000000000002');

INSERT INTO public.assignments (id, classroom_id, title) VALUES
  ('f0430000-0000-4000-8000-000000000001', 'f0420000-0000-4000-8000-000000000001', 'Assignment A'),
  ('f0430000-0000-4000-8000-000000000002', 'f0420000-0000-4000-8000-000000000002', 'Assignment B'),
  ('f0430000-0000-4000-8000-000000000003', 'f0420000-0000-4000-8000-000000000001', 'Assignment C');

INSERT INTO public.submissions (id, assignment_id, student_id, content) VALUES
  ('f0440000-0000-4000-8000-000000000001', 'f0430000-0000-4000-8000-000000000001', 'f0410000-0000-4000-8000-000000000003', 'A submission'),
  ('f0440000-0000-4000-8000-000000000002', 'f0430000-0000-4000-8000-000000000002', 'f0410000-0000-4000-8000-000000000003', 'B submission'),
  ('f0440000-0000-4000-8000-000000000003', 'f0430000-0000-4000-8000-000000000001', 'f0410000-0000-4000-8000-000000000004', 'Another student submission');

-- Use the exact migration file. The dependency-table RLS precondition is
-- measured below instead of replaced with a fixture-only policy.
\ir ../../migrations/20260302093635_submissions_rls_fixed.sql

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'f0410000-0000-4000-8000-000000000001';
SELECT is((SELECT count(*) FROM public.assignments WHERE id = 'f0430000-0000-4000-8000-000000000001'), 1::bigint,
  'prerequisite: authenticated teacher can read their assignment under existing assignments RLS');
SELECT is(current_user::text, 'authenticated', 'assertions use the authenticated role');
SELECT is(auth.uid(), 'f0410000-0000-4000-8000-000000000001'::uuid, 'database identity is teacher A');
SELECT is((SELECT count(*) FROM public.submissions WHERE id = 'f0440000-0000-4000-8000-000000000001'), 1::bigint,
  'teacher A can read a submission in A classroom');
SELECT is((SELECT count(*) FROM public.submissions WHERE id = 'f0440000-0000-4000-8000-000000000002'), 0::bigint,
  'teacher A cannot read a submission in B classroom');
WITH changed AS (
  UPDATE public.submissions SET grade = 95, feedback = 'Reviewed'
  WHERE id = 'f0440000-0000-4000-8000-000000000001'
  RETURNING id
)
SELECT is((SELECT count(*) FROM changed), 1::bigint, 'teacher A can grade a submission in A classroom');
SELECT throws_ok($sql$
  UPDATE public.submissions SET assignment_id = 'f0430000-0000-4000-8000-000000000002'
  WHERE id = 'f0440000-0000-4000-8000-000000000001'
$sql$, '42501', NULL, 'teacher A cannot reparent a submission into B classroom');
SELECT is((SELECT grade FROM public.submissions WHERE id = 'f0440000-0000-4000-8000-000000000001'), 95,
  'failed reparent leaves the teacher grading update intact');

SET LOCAL request.jwt.claim.sub = 'f0410000-0000-4000-8000-000000000003';
SELECT is((SELECT count(*) FROM public.submissions WHERE id = 'f0440000-0000-4000-8000-000000000001'), 1::bigint,
  'student A can read their own submission');
SELECT is((SELECT count(*) FROM public.submissions WHERE id = 'f0440000-0000-4000-8000-000000000003'), 0::bigint,
  'student A cannot read another student submission');
SELECT lives_ok($sql$
  INSERT INTO public.submissions (assignment_id, student_id, content)
  VALUES ('f0430000-0000-4000-8000-000000000003', 'f0410000-0000-4000-8000-000000000003', 'Own new work')
$sql$, 'student A can create their own submission');
SELECT throws_ok($sql$
  INSERT INTO public.submissions (assignment_id, student_id, content)
  VALUES ('f0430000-0000-4000-8000-000000000003', 'f0410000-0000-4000-8000-000000000004', 'Forged work')
$sql$, '42501', NULL, 'student A cannot create a submission for student B');
WITH changed AS (
  UPDATE public.submissions SET grade = 100
  WHERE id = 'f0440000-0000-4000-8000-000000000001'
  RETURNING id
)
SELECT is((SELECT count(*) FROM changed), 0::bigint, 'student A cannot update their submission');

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;

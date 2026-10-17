BEGIN;

DO $$
BEGIN
  IF current_database() <> 'gurudevi_foundation_test' THEN
    RAISE EXCEPTION 'This fixture requires the isolated foundation test database';
  END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(19);

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('f0110000-0000-4000-8000-000000000001', 'foundation-rls-a@example.invalid', '{"full_name":"RLS fixture A"}'),
  ('f0110000-0000-4000-8000-000000000002', 'foundation-rls-b@example.invalid', '{"full_name":"RLS fixture B"}');

SELECT id AS user_a FROM public.users WHERE email = 'foundation-rls-a@example.invalid'
\gset
SELECT id AS user_b FROM public.users WHERE email = 'foundation-rls-b@example.invalid'
\gset

INSERT INTO public.mood_logs (id, user_id, mood_score, note) VALUES
  ('f0120000-0000-4000-8000-000000000001', :'user_a'::uuid, 3, 'A private note'),
  ('f0120000-0000-4000-8000-000000000002', :'user_b'::uuid, 4, 'B private note');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'f0110000-0000-4000-8000-000000000001';

SELECT is(current_user::text, 'authenticated', 'assertions use the authenticated role');
SELECT ok(NOT (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname = current_user),
  'assertion role has neither superuser nor RLS bypass');
SELECT isnt((SELECT pg_get_userbyid(relowner)::text FROM pg_class WHERE oid = 'public.mood_logs'::regclass),
  current_user::text, 'assertion role does not own the table');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.mood_logs'::regclass),
  'mood-log row security is enabled');
SELECT is(auth.uid(), 'f0110000-0000-4000-8000-000000000001'::uuid, 'database identity is account A');
SELECT is((SELECT count(*) FROM mood_logs WHERE id = 'f0120000-0000-4000-8000-000000000001'),
  1::bigint, 'A can read its own mood');
SELECT is((SELECT count(*) FROM mood_logs WHERE id = 'f0120000-0000-4000-8000-000000000002'),
  0::bigint, 'A cannot read B private mood');

SELECT lives_ok(format($sql$
  INSERT INTO public.mood_logs (id, user_id, mood_score, note)
  VALUES ('f0120000-0000-4000-8000-000000000003', %L, 5, 'A allowed write')
$sql$, :'user_a'), 'A can create its own mood');
WITH changed AS (
  UPDATE public.mood_logs SET note = 'A allowed update'
  WHERE id = 'f0120000-0000-4000-8000-000000000001' RETURNING id
)
SELECT is((SELECT count(*) FROM changed), 1::bigint, 'A can update its own mood');
WITH removed AS (
  DELETE FROM public.mood_logs
  WHERE id = 'f0120000-0000-4000-8000-000000000003' RETURNING id
)
SELECT is((SELECT count(*) FROM removed), 1::bigint, 'A can delete its own mood');
SELECT throws_ok(format($sql$
  INSERT INTO public.mood_logs (user_id, mood_score, note)
  VALUES (%L, 5, 'A forged owner')
$sql$, :'user_b'), '42501', NULL, 'A cannot insert as B');

WITH changed AS (
  UPDATE public.mood_logs SET note = 'A overwrite attempt'
  WHERE id = 'f0120000-0000-4000-8000-000000000002' RETURNING id
)
SELECT is((SELECT count(*) FROM changed), 0::bigint, 'A cannot update B mood');
WITH removed AS (
  DELETE FROM public.mood_logs
  WHERE id = 'f0120000-0000-4000-8000-000000000002' RETURNING id
)
SELECT is((SELECT count(*) FROM removed), 0::bigint, 'A cannot delete B mood');
SELECT throws_ok(format($sql$
  UPDATE public.mood_logs SET user_id = %L
  WHERE id = 'f0120000-0000-4000-8000-000000000001'
$sql$, :'user_b'), '42501', NULL, 'A cannot transfer ownership to B');

SET LOCAL request.jwt.claim.sub = 'f0110000-0000-4000-8000-000000000002';
SELECT is(auth.uid(), 'f0110000-0000-4000-8000-000000000002'::uuid, 'database identity switches to B');
SELECT is((SELECT count(*) FROM mood_logs WHERE id = 'f0120000-0000-4000-8000-000000000002'),
  1::bigint, 'B can still read its own unmodified mood');
SELECT is((SELECT count(*) FROM mood_logs WHERE user_id = :'user_a'::uuid),
  0::bigint, 'B cannot read A moods');

SET LOCAL request.jwt.claim.sub = '';
SELECT is((SELECT count(*) FROM mood_logs), 0::bigint, 'missing identity sees no private moods');
SET LOCAL ROLE anon;
SELECT is((SELECT count(*) FROM mood_logs), 0::bigint, 'anonymous role sees no private moods');

SELECT * FROM finish();
ROLLBACK;

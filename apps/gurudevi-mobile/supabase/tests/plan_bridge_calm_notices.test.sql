-- Plan & Bridge (20261017210000) behaviour test. Run against a throwaway
-- database that has the migration chain replayed:
--   psql "$DB" -v ON_ERROR_STOP=1 -f supabase/tests/plan_bridge_calm_notices.test.sql
-- Everything happens inside one transaction that is rolled back.
\set ON_ERROR_STOP 1
BEGIN;

\ir plan_bridge_fixtures.sql

-- Constraints -----------------------------------------------------------------
DO $$ BEGIN
  BEGIN
    INSERT INTO public.announcements (school_id, title, content, status) VALUES ('a0000000-0000-4000-8000-000000000001', 'x', 'scheduled without time', 'scheduled');
    RAISE EXCEPTION 'expected status check to fail';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.announcements (school_id, title, content, overridden_by, overridden_at, override_reason)
    VALUES ('a0000000-0000-4000-8000-000000000001', 'x', 'override', 'b0000000-0000-4000-8000-0000000000a2', now(), 'short');
    RAISE EXCEPTION 'expected override reason check to fail';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.school_mode_policies (school_id, mode_key, lock, override_roles, schedule) VALUES ('a0000000-0000-4000-8000-000000000001', 'party_mode', 'locked', '{}', '{"weekly":[]}');
    RAISE EXCEPTION 'expected mode_key check to fail';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.school_mode_policies (school_id, mode_key, lock, override_roles, schedule) VALUES ('a0000000-0000-4000-8000-000000000002', 'good_night', 'strict', '{}', '{"weekly":[]}');
    RAISE EXCEPTION 'expected lock check to fail';
  EXCEPTION WHEN check_violation THEN NULL; END;
  RAISE NOTICE 'ok constraints';
END $$;

-- Usage signal: opt-in only, aggregate, k>=5 on read --------------------------
DO $$
DECLARE n int; v int;
BEGIN
  PERFORM public.bump_school_mode_usage('a0000000-0000-4000-8000-000000000001', 'good_night', 'held', 'teacher');
  ASSERT (SELECT count(*) FROM public.school_mode_usage_daily) = 0, 'nothing recorded without opt-in';
  UPDATE public.schools SET usage_signal_opt_in = true WHERE id = 'a0000000-0000-4000-8000-000000000001';
  FOR n IN 1..4 LOOP
    PERFORM public.bump_school_mode_usage('a0000000-0000-4000-8000-000000000001', 'good_night', 'held', 'teacher');
  END LOOP;
  PERFORM public.bump_school_mode_usage('a0000000-0000-4000-8000-000000000001', 'good_night', 'override', 'principal');
  SELECT count INTO v FROM public.read_school_mode_usage('a0000000-0000-4000-8000-000000000001', current_date - 1) WHERE event = 'held';
  ASSERT v IS NULL, 'a cell of 4 is suppressed';
  PERFORM public.bump_school_mode_usage('a0000000-0000-4000-8000-000000000001', 'good_night', 'held', 'teacher');
  SELECT count INTO v FROM public.read_school_mode_usage('a0000000-0000-4000-8000-000000000001', current_date - 1, 1) WHERE event = 'held';
  ASSERT v = 5, 'a cell of 5 is shown, and k cannot be lowered below 5';
  SELECT count INTO v FROM public.read_school_mode_usage('a0000000-0000-4000-8000-000000000001', current_date - 1, 1) WHERE event = 'override';
  ASSERT v IS NULL, 'single override stays suppressed';
  RAISE NOTICE 'ok usage signal';
END $$;

-- Release: recipients, idempotency, versions ----------------------------------
DO $$
DECLARE r record; n int;
BEGIN
  SELECT * INTO r FROM public.release_school_notice('f0000000-0000-4000-8000-000000000001', 0);
  ASSERT r.outcome = 'sent', 'first release sends: ' || r.outcome;
  -- GA (A and B, deduped) + GA2 (A). Not GB (pending), not GC (other class).
  ASSERT r.recipients = 2, 'recipients = verified guardians of enrolled students, got ' || r.recipients;
  SELECT count(*) INTO n FROM public.notifications WHERE reference_id = 'f0000000-0000-4000-8000-000000000001';
  ASSERT n = 2, 'two notification rows';
  ASSERT NOT EXISTS (SELECT 1 FROM public.notifications WHERE reference_id = 'f0000000-0000-4000-8000-000000000001'
                     AND user_id IN ('b0000000-0000-4000-8000-0000000000c3', 'b0000000-0000-4000-8000-0000000000c4')),
         'pending and other-class guardians get nothing';

  SELECT * INTO r FROM public.release_school_notice('f0000000-0000-4000-8000-000000000001', 0);
  ASSERT r.outcome = 'already_sent' AND r.recipients = 2, 'second release is a no-op';
  -- Even forcing the row back to scheduled cannot duplicate rows.
  UPDATE public.announcements SET status = 'scheduled' WHERE id = 'f0000000-0000-4000-8000-000000000001';
  SELECT * INTO r FROM public.release_school_notice('f0000000-0000-4000-8000-000000000001', NULL);
  SELECT count(*) INTO n FROM public.notifications WHERE reference_id = 'f0000000-0000-4000-8000-000000000001';
  ASSERT n = 2, 'idempotency key prevents duplicates, got ' || n;

  SELECT * INTO r FROM public.release_school_notice('f0000000-0000-4000-8000-000000000002', 1);
  ASSERT r.outcome = 'superseded', 'stale version releases nothing: ' || r.outcome;
  SELECT * INTO r FROM public.release_school_notice('f0000000-0000-4000-8000-000000000003', 0);
  ASSERT r.outcome = 'not_due', 'future notice waits: ' || r.outcome;
  SELECT * INTO r FROM public.release_school_notice('f0000000-0000-4000-8000-000000000004', 1);
  ASSERT r.outcome = 'not_scheduled:cancelled', 'cancelled stays cancelled: ' || r.outcome;

  -- Sweep releases the version-2 notice (no expected version) but not the future one.
  ASSERT public.release_due_school_notices() = 1, 'sweep releases exactly the due notice';
  ASSERT (SELECT status FROM public.announcements WHERE id = 'f0000000-0000-4000-8000-000000000003') = 'scheduled';
  ASSERT public.release_due_school_notices(now() + interval '10 hours') = 1, 'sweep later releases the held notice';
  ASSERT (SELECT count(*) FROM public.school_notice_events WHERE event = 'released'
          AND school_id = 'a0000000-0000-4000-8000-000000000001') = 4, 'every release is logged';
  RAISE NOTICE 'ok release';
END $$;

-- RLS as signed-in users ----------------------------------------------------------
-- Supabase grants table privileges to `authenticated` by default; a bare
-- replay does not. Mirror that so RLS (not GRANTs) is what is being tested.
GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
CREATE TEMP TABLE rls_result (check_name text, value bigint);
GRANT ALL ON rls_result TO authenticated;

CREATE OR REPLACE FUNCTION pg_temp.as_user(p uuid) RETURNS void LANGUAGE sql AS $$
  SELECT set_config('request.jwt.claim.sub', p::text, true),
         set_config('request.jwt.claims', json_build_object('sub', p, 'role', 'authenticated')::text, true);
$$;

SET LOCAL ROLE authenticated;

SELECT pg_temp.as_user('b0000000-0000-4000-8000-0000000000c1');
INSERT INTO rls_result SELECT 'ga_sees_class_notice', count(*) FROM public.announcements WHERE id = 'f0000000-0000-4000-8000-000000000001';
INSERT INTO rls_result SELECT 'ga_sees_class_event', count(*) FROM public.calendar_events WHERE id = 'e0000000-0000-4000-8000-000000000001';
INSERT INTO rls_result SELECT 'ga_own_notifications', count(*) FROM public.notifications WHERE reference_id = 'f0000000-0000-4000-8000-000000000001';
INSERT INTO rls_result SELECT 'ga_reads_notice_log', count(*) FROM public.school_notice_events;

SELECT pg_temp.as_user('b0000000-0000-4000-8000-0000000000c3');
INSERT INTO rls_result SELECT 'gb_pending_sees_class_notice', count(*) FROM public.announcements WHERE id = 'f0000000-0000-4000-8000-000000000001';
INSERT INTO rls_result SELECT 'gb_pending_sees_class_event', count(*) FROM public.calendar_events WHERE id = 'e0000000-0000-4000-8000-000000000001';
INSERT INTO rls_result SELECT 'gb_sees_others_notifications', count(*) FROM public.notifications WHERE reference_id = 'f0000000-0000-4000-8000-000000000001';
WITH u AS (UPDATE public.student_guardian_relationships SET verification_status = 'verified',
             verified_by = 'b0000000-0000-4000-8000-0000000000c3', verified_at = now()
           WHERE guardian_id = 'b0000000-0000-4000-8000-0000000000c3' RETURNING 1)
INSERT INTO rls_result SELECT 'gb_self_verify_updated', count(*) FROM u;

SELECT pg_temp.as_user('b0000000-0000-4000-8000-0000000000d1');
INSERT INTO rls_result SELECT 'stranger_sees_class_notice', count(*) FROM public.announcements WHERE grade_class_id IS NOT NULL;
INSERT INTO rls_result SELECT 'stranger_reads_mode_policies', count(*) FROM public.school_mode_policies;
INSERT INTO rls_result SELECT 'stranger_sees_links', count(*) FROM public.student_guardian_relationships;
INSERT INTO public.student_guardian_relationships (student_id, guardian_id) VALUES
  ('b0000000-0000-4000-8000-0000000000b3', 'b0000000-0000-4000-8000-0000000000d1');
INSERT INTO rls_result SELECT 'stranger_pending_request', count(*) FROM public.student_guardian_relationships WHERE verification_status = 'pending';
SAVEPOINT self_verified;
DO $$ BEGIN
  INSERT INTO public.student_guardian_relationships (student_id, guardian_id, verification_status, verified_by, verified_at)
  VALUES ('b0000000-0000-4000-8000-0000000000b1', 'b0000000-0000-4000-8000-0000000000d1', 'verified', 'b0000000-0000-4000-8000-0000000000d1', now());
  INSERT INTO rls_result VALUES ('stranger_self_verified_insert', 1);
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO rls_result VALUES ('stranger_self_verified_insert', 0);
END $$;
DO $$ BEGIN
  PERFORM public.read_school_mode_usage('a0000000-0000-4000-8000-000000000001', current_date);
  INSERT INTO rls_result VALUES ('authenticated_reads_usage', 1);
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO rls_result VALUES ('authenticated_reads_usage', 0);
END $$;
DO $$ BEGIN
  PERFORM public.release_school_notice('f0000000-0000-4000-8000-000000000003');
  INSERT INTO rls_result VALUES ('authenticated_can_release', 1);
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO rls_result VALUES ('authenticated_can_release', 0);
END $$;

SELECT pg_temp.as_user('b0000000-0000-4000-8000-0000000000a1');
INSERT INTO rls_result SELECT 'teacher_sees_class_event', count(*) FROM public.calendar_events WHERE id = 'e0000000-0000-4000-8000-000000000001';
INSERT INTO rls_result SELECT 'teacher_sees_own_cancelled', count(*) FROM public.announcements WHERE id = 'f0000000-0000-4000-8000-000000000004';
INSERT INTO rls_result SELECT 'teacher_reads_mode_policies', count(*) FROM public.school_mode_policies;

RESET ROLE;

DO $$
DECLARE expected jsonb := '{
  "ga_sees_class_notice": 1, "ga_sees_class_event": 1, "ga_own_notifications": 1, "ga_reads_notice_log": 0,
  "gb_pending_sees_class_notice": 0, "gb_pending_sees_class_event": 0, "gb_sees_others_notifications": 0,
  "gb_self_verify_updated": 0,
  "stranger_sees_class_notice": 0, "stranger_sees_links": 0, "stranger_pending_request": 1,
  "stranger_self_verified_insert": 0, "authenticated_can_release": 0, "authenticated_reads_usage": 0,
  "teacher_sees_class_event": 1, "teacher_sees_own_cancelled": 1, "teacher_reads_mode_policies": 1, "stranger_reads_mode_policies": 0
}';
r record; failures int := 0;
BEGIN
  FOR r IN SELECT check_name, value, (expected ->> check_name)::bigint AS want FROM rls_result LOOP
    IF r.want IS DISTINCT FROM r.value THEN
      failures := failures + 1;
      RAISE WARNING 'FAIL %: got %, want %', r.check_name, r.value, r.want;
    ELSE
      RAISE NOTICE 'ok %', r.check_name;
    END IF;
  END LOOP;
  ASSERT (SELECT count(*) FROM rls_result) = (SELECT count(*) FROM jsonb_object_keys(expected)), 'every RLS check ran';
  ASSERT failures = 0, failures || ' RLS check(s) failed';
  ASSERT (SELECT verification_status FROM public.student_guardian_relationships
          WHERE guardian_id = 'b0000000-0000-4000-8000-0000000000c3') = 'pending', 'GB still pending';
  RAISE NOTICE 'ok rls';
END $$;

ROLLBACK;

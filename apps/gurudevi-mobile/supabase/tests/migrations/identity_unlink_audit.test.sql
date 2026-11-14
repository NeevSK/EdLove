\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database() NOT LIKE '%test%' AND current_setting('edlove.rehearsal_tag',true) IS DISTINCT FROM '20261025' THEN
  RAISE EXCEPTION 'Identity unlink audit requires an isolated test database';
 END IF;
END $$;
SET search_path=public,extensions;
BEGIN;
SELECT plan(5);
INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data) VALUES
 ('f0560000-0000-4000-8000-000000000001','unlink-audit@example.invalid','{}','{}');
SELECT user_id AS account FROM public.auth_identities WHERE provider='supabase'
 AND provider_user_id='f0560000-0000-4000-8000-000000000001' \gset
SELECT public.append_auth_operation_audit(:'account','f0560000-0000-4000-8000-000000000002','identity_unlink','initiated') AS event \gset
SELECT is((SELECT action FROM public.security_audit_logs WHERE id=:'event'),'AUTH_IDENTITY_UNLINK_STARTED','unlink initiation has its own event');
SELECT is(public.append_auth_operation_audit(:'account','f0560000-0000-4000-8000-000000000002','identity_unlink','initiated'),:'event'::uuid,'retry retains the same receipt');
SELECT is((SELECT metadata->>'credential_class' FROM public.security_audit_logs WHERE id=:'event'),'oauth_identity','audit stores credential class rather than credential value');
SELECT lives_ok(format('SELECT public.append_auth_operation_audit(%L,%L,%L,%L)',:'account',
 'f0560000-0000-4000-8000-000000000002','identity_unlink','confirmed'),'server can confirm unlink');
SET LOCAL ROLE authenticated;
SELECT throws_ok(format('SELECT public.append_auth_operation_audit(%L,%L,%L,%L)',:'account',
 'f0560000-0000-4000-8000-000000000002','identity_unlink','confirmed'),'42501',NULL,'client cannot claim a server-confirmed unlink');
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;

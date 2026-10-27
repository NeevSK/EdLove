\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database() NOT LIKE '%test%' AND current_setting('edlove.rehearsal_tag',true) IS DISTINCT FROM '20261025' THEN
  RAISE EXCEPTION 'Password audit requires an isolated test database';
 END IF;
END $$;
SET search_path=public,extensions;
BEGIN;
SELECT plan(6);
INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data) VALUES
 ('f0550000-0000-4000-8000-000000000001','password-audit@example.invalid','{}','{}');
SELECT user_id AS account FROM public.auth_identities WHERE provider='supabase'
 AND provider_user_id='f0550000-0000-4000-8000-000000000001' \gset
SELECT public.append_auth_operation_audit(:'account','f0550000-0000-4000-8000-000000000002','password_change','initiated') AS event \gset
SELECT is((SELECT action FROM public.security_audit_logs WHERE id=:'event'),'AUTH_PASSWORD_CHANGE_STARTED','password initiation has its own event class');
SELECT is(public.append_auth_operation_audit(:'account','f0550000-0000-4000-8000-000000000002','password_change','initiated'),:'event'::uuid,'phase retry preserves the receipt');
SELECT lives_ok(format('SELECT public.append_auth_operation_audit(%L,%L,%L,%L)',:'account',
 'f0550000-0000-4000-8000-000000000002','password_change','confirmed'),'server can append confirmed password outcome');
SELECT is((SELECT metadata->>'credential_class' FROM public.security_audit_logs WHERE id=:'event'),'password','receipt does not use a raw credential as its class');
SELECT throws_ok(format('SELECT public.append_auth_operation_audit(%L,%L,%L,%L)',:'account',
 'f0550000-0000-4000-8000-000000000002','arbitrary_client_action','confirmed'),'22023','Invalid auth operation audit request','action inventory is closed');
SET LOCAL ROLE authenticated;
SELECT throws_ok(format('SELECT public.append_auth_operation_audit(%L,%L,%L,%L)',:'account',
 'f0550000-0000-4000-8000-000000000002','password_change','confirmed'),'42501',NULL,'clients cannot claim password confirmation');
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;

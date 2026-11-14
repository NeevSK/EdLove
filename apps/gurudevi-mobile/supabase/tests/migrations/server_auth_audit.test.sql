\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database() NOT LIKE '%test%' AND
  current_setting('edlove.rehearsal_tag',true) IS DISTINCT FROM '20261025' THEN
  RAISE EXCEPTION 'Server auth audit requires an isolated test database';
 END IF;
END $$;
SET search_path=public,extensions;
BEGIN;
SELECT plan(17);
INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data) VALUES
 ('f0530000-0000-4000-8000-000000000001','auth-audit@example.invalid','{}','{}'),
 ('f0530000-0000-4000-8000-000000000004','auth-audit-b@example.invalid','{}','{}');
SELECT user_id AS account FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0530000-0000-4000-8000-000000000001' \gset
SELECT user_id AS other_account FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0530000-0000-4000-8000-000000000004' \gset
SELECT public.append_auth_session_audit(:'other_account','f0530000-0000-4000-8000-000000000005','initiated') AS other_event \gset
SELECT tableoid::regclass AS other_partition FROM public.security_audit_logs WHERE id=:'other_event' \gset
SELECT public.append_auth_session_audit(:'account','f0530000-0000-4000-8000-000000000002','initiated') AS event \gset
SELECT is((SELECT event_source FROM public.security_audit_logs WHERE id=:'event'),
 'server_observed','server provenance is durable');
SELECT is(public.append_auth_session_audit(:'account','f0530000-0000-4000-8000-000000000002','initiated'),
 :'event'::uuid,'same operation phase reuses its receipt');
SELECT throws_ok(format('UPDATE public.security_audit_logs SET action=%L WHERE id=%L','forged',:'event'),
 '42501','Server auth audit events are immutable','server event cannot be edited even by ordinary owner writes');
SELECT throws_ok(format('DELETE FROM public.security_audit_logs WHERE id=%L',:'event'),
 '42501','Server auth audit events are immutable','server event cannot be deleted');
SELECT throws_ok(format('SELECT public.append_auth_session_audit(%L,%L,%L)',:'account',
 'f0530000-0000-4000-8000-000000000002','pretend_success'),'22023','Invalid auth session audit request','unknown outcomes are denied');
SELECT set_config('request.jwt.claim.sub','f0530000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
SELECT throws_ok(format('SELECT count(*) FROM %s',:'other_partition'),'42501',NULL,
 'direct partition access cannot bypass parent account RLS');
SELECT is((SELECT count(*)::integer FROM public.security_audit_logs WHERE id=:'other_event'),0,
 'other account receipts are hidden');
SELECT throws_ok(format('INSERT INTO public.security_audit_logs(account_id,action) VALUES (%L,%L)',
 :'other_account','AUTH_DIRECT_CLIENT_REPORT'),'42501',NULL,'client cannot write a report for another account');
SELECT lives_ok(format('INSERT INTO public.security_audit_logs(account_id,action) VALUES (%L,%L)',
 :'account','AUTH_DIRECT_CLIENT_REPORT'),'own direct client reports retain their bounded insert path');
SELECT is((SELECT count(*)::integer FROM public.security_audit_logs WHERE id=:'event'),1,
 'caller can read their server-observed event');
SELECT throws_ok(format('SELECT public.append_auth_session_audit(%L,%L,%L)',:'account',
 'f0530000-0000-4000-8000-000000000003','confirmed'),'42501',NULL,'client cannot invoke the server audit writer');
SELECT throws_ok(format('INSERT INTO public.security_audit_logs(account_id,action,event_source) VALUES (%L,%L,%L)',
 :'account','AUTH_SESSION_REVOCATION_CONFIRMED','server_observed'),'42501',NULL,'direct insert cannot forge server provenance');
SELECT lives_ok($q$SELECT public.log_my_device_audit('AUTH_CLIENT_REPORTED',NULL,NULL,
 '{"idempotency_key":"server-auth-fixture","event_source":"server_observed"}'::jsonb)$q$,'existing client device audit writer remains operational');
SELECT is((SELECT metadata->>'event_source' FROM public.list_my_auth_events(50)
 WHERE action='AUTH_CLIENT_REPORTED'),'client_report','read model overrides forged metadata provenance');
RESET ROLE;
SELECT is((SELECT event_source FROM public.security_audit_logs WHERE action='AUTH_CLIENT_REPORTED'
 AND account_id=:'account'),'client_report','client report stays distinguishable');
SELECT ok(has_function_privilege('service_role','public.append_auth_session_audit(uuid,uuid,text)','EXECUTE'),
 'server role has explicit writer capability');
-- Rehearse future creation without deleting pre-created partitions or their
-- indexes: detached fixture tables move into a transaction-local namespace.
CREATE SCHEMA auth_audit_partition_fixture;
DO $$ DECLARE parent_name text; child_name text; BEGIN
 FOREACH parent_name IN ARRAY ARRAY['sentinel_audit_logs','security_audit_logs','privacy_ledger_entries','student_longitudinal_events'] LOOP
  child_name := parent_name||'_'||to_char(date_trunc('month',now()+interval '1 month'),'YYYY_"m"MM');
  EXECUTE format('ALTER TABLE public.%I DETACH PARTITION public.%I',parent_name,child_name);
  EXECUTE format('ALTER TABLE public.%I SET SCHEMA auth_audit_partition_fixture',child_name);
 END LOOP;
END $$;
SELECT public.create_next_month_partitions();
SELECT ok(NOT has_table_privilege('authenticated',
 'public.security_audit_logs_'||to_char(date_trunc('month',now()+interval '1 month'),'YYYY_"m"MM'),'SELECT'),
 'future maintenance creates an inaccessible audit child while preserving other partitions');
SELECT * FROM finish();
ROLLBACK;

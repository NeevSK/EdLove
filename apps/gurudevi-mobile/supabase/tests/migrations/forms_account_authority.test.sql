\set ON_ERROR_STOP on
DO $$ BEGIN
  IF current_database() NOT LIKE '%test%' AND
    current_setting('edlove.rehearsal_tag',true) IS DISTINCT FROM '20261025' THEN
    RAISE EXCEPTION 'Form authority fixture requires an isolated test database';
  END IF;
END $$;
SET search_path=public,extensions;
BEGIN;
SELECT plan(6);
INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data) VALUES
 ('f0410000-0000-4000-8000-000000000001','forms-a@example.invalid','{}','{}'),
 ('f0410000-0000-4000-8000-000000000002','forms-b@example.invalid','{}','{}');
SELECT user_id AS account_a FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0410000-0000-4000-8000-000000000001' \gset
SELECT user_id AS account_b FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0410000-0000-4000-8000-000000000002' \gset
INSERT INTO public.form_templates(id,owner_id,title,is_published) VALUES
 ('f0420000-0000-4000-8000-000000000001',:'account_a','Public fixture',true),
 ('f0420000-0000-4000-8000-000000000002',:'account_a','Private fixture',false);
SELECT set_config('request.jwt.claim.sub','f0410000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
SELECT lives_ok(format('INSERT INTO public.form_responses(template_id,responder_id,data) VALUES (%L,%L,%L)',
 'f0420000-0000-4000-8000-000000000001',:'account_a','{}'),'authenticated canonical responder accepted');
SELECT throws_ok(format('INSERT INTO public.form_responses(template_id,responder_id,data) VALUES (%L,%L,%L)',
 'f0420000-0000-4000-8000-000000000001',:'account_b','{}'),'42501',NULL,'cannot impersonate another account');
SELECT lives_ok($q$INSERT INTO public.form_responses(template_id,data) VALUES
 ('f0420000-0000-4000-8000-000000000001','{}')$q$,'authenticated unattributed submission remains available');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','{}',true);
SET LOCAL ROLE anon;
SELECT lives_ok($q$INSERT INTO public.form_responses(template_id,data) VALUES
 ('f0420000-0000-4000-8000-000000000001','{}')$q$,'anonymous submission remains unattributed');
SELECT throws_ok(format('INSERT INTO public.form_responses(template_id,responder_id,data) VALUES (%L,%L,%L)',
 'f0420000-0000-4000-8000-000000000001',:'account_a','{}'),'42501',NULL,'anonymous caller cannot claim an account');
SELECT throws_ok($q$INSERT INTO public.form_responses(template_id,data) VALUES
 ('f0420000-0000-4000-8000-000000000002','{}')$q$,'42501',NULL,'unpublished form remains unavailable');
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;

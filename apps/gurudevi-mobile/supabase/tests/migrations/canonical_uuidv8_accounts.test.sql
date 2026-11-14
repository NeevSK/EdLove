-- Run against an isolated pre-cutover database with -v cutover_migration=<file>.
\set ON_ERROR_STOP on
DO $$ BEGIN
  IF current_database() NOT LIKE '%test%' AND
    current_setting('edlove.rehearsal_tag',true) IS DISTINCT FROM '20261025' THEN
    RAISE EXCEPTION 'Canonical cutover fixture requires an isolated test database';
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path=public,extensions;
SELECT no_plan();
BEGIN;

INSERT INTO auth.users (id,email,raw_user_meta_data,raw_app_meta_data) VALUES
 ('f0310000-0000-4000-8000-000000000001','canonical-a@example.invalid','{}','{}'),
 ('f0310000-0000-4000-8000-000000000002','canonical-b@example.invalid','{}','{}');
INSERT INTO public.bonds(user_id,entity_id,entity_type,capacity) VALUES
 ('f0310000-0000-4000-8000-000000000001','canonical-school','SCHOOL','teacher');
INSERT INTO public.mood_logs(id,user_id,mood_score) VALUES
 ('f0320000-0000-4000-8000-000000000001','f0310000-0000-4000-8000-000000000001',5),
 ('f0320000-0000-4000-8000-000000000002','f0310000-0000-4000-8000-000000000002',4);
INSERT INTO public.form_templates(owner_id,title) VALUES
 ('f0310000-0000-4000-8000-000000000001','Canonical form');
-- Editorial authors are separate entities, even when their text keys happen
-- to equal a legacy account key.
INSERT INTO public.editorial_authors(id,display_name) VALUES
 ('f0310000-0000-4000-8000-000000000001','Independent author');
INSERT INTO public.editorial_submissions(publication,content_kind,title,summary,body,language,submitter_id,author_id)
 VALUES ('gurudevi','original','Canonical editorial','Editorial test summary',repeat('x',60),'en',
 'f0310000-0000-4000-8000-000000000001','f0310000-0000-4000-8000-000000000001');
ALTER TABLE public.users DISABLE TRIGGER reject_unconfigured_edlove_account_id_write;
UPDATE public.users SET edlove_id='01234567-89ab-8101-8100-010203040506'
 WHERE id='f0310000-0000-4000-8000-000000000002';
ALTER TABLE public.users ENABLE TRIGGER reject_unconfigured_edlove_account_id_write;
SELECT is((SELECT id::text FROM public.users WHERE email='canonical-a@example.invalid'),
 'f0310000-0000-4000-8000-000000000001','fixture starts with provider-coupled keys');

\i :cutover_migration

BEGIN;
SELECT user_id AS account_a FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0310000-0000-4000-8000-000000000001' \gset
SELECT user_id AS account_b FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0310000-0000-4000-8000-000000000002' \gset
SELECT ok(public.is_edlove_account_uuid_v8_profile_v1(:'account_a'::uuid),'existing account rekeyed to UUIDv8');
SELECT isnt(:'account_a'::text,'f0310000-0000-4000-8000-000000000001','credential subject is not the account key');
SELECT isnt(:'account_a'::text,:'account_b'::text,'accounts remain distinct');
SELECT is(:'account_b'::text,'01234567-89ab-8101-8100-010203040506','existing assigned handle becomes the canonical key');
SELECT is((SELECT user_id::text FROM public.bonds WHERE entity_id='canonical-school'),:'account_a','domain FK follows rekey');
SELECT is((SELECT owner_id::text FROM public.form_templates WHERE title='Canonical form'),:'account_a','direct auth FK becomes an account FK');
SELECT is((SELECT submitter_id::text FROM public.editorial_submissions WHERE title='Canonical editorial'),
 :'account_a','editorial submitter follows the account rekey');
SELECT is((SELECT author_id FROM public.editorial_submissions WHERE title='Canonical editorial'),
 'f0310000-0000-4000-8000-000000000001','separate editorial author identity is preserved');
SELECT is((SELECT count(*)::integer FROM public.mood_logs WHERE user_id=:'account_a'::uuid),1,'private data follows rekey');
SELECT is((SELECT count(*)::integer FROM pg_constraint k JOIN pg_namespace n ON n.oid=k.connamespace
 WHERE k.contype='f' AND k.confrelid='auth.users'::regclass AND n.nspname IN ('public','private','audit')),0,'no domain FK points at credential users');
SELECT is((SELECT count(*)::integer FROM information_schema.columns WHERE table_schema='public'
 AND table_name='users' AND column_name='edlove_id'),0,'no second account identity column');
SELECT is((SELECT count(*)::integer FROM pg_policies WHERE schemaname='public' AND tablename<>'auth_identities'
 AND (coalesce(qual,'')||coalesce(with_check,'')) LIKE '%auth.uid()%'),0,'domain policies use canonical resolution');

INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data) VALUES
 ('f0310000-0000-4000-8000-000000000003','canonical-new@example.invalid','{}','{}');
SELECT ok((SELECT public.is_edlove_account_uuid_v8_profile_v1(user_id) FROM public.auth_identities
 WHERE provider='supabase' AND provider_user_id='f0310000-0000-4000-8000-000000000003'),'new account is canonical at transaction commit');
UPDATE auth.users SET raw_user_meta_data='{"full_name":"Updated"}'
 WHERE id='f0310000-0000-4000-8000-000000000001';
SELECT is((SELECT user_id::text FROM public.auth_identities WHERE provider='supabase'
 AND provider_user_id='f0310000-0000-4000-8000-000000000001'),:'account_a','credential updates never rekey an account');
SELECT throws_ok('INSERT INTO public.users(id,full_name) VALUES (''f0310000-0000-4000-8000-000000000099'',''Invalid'')',
 '23514','CANONICAL_ACCOUNT_ID_MUST_BE_EDLOVE_UUIDV8','legacy account writes fail loudly');
SELECT throws_ok('UPDATE public.users SET id=public.new_edlove_account_id() WHERE id='''||:'account_a'||'''::uuid',
 '23514','CANONICAL_ACCOUNT_ID_IS_IMMUTABLE','canonical ID cannot change after creation');

SELECT set_config('request.jwt.claims','{"sub":"f0310000-0000-4000-8000-000000000001","role":"authenticated"}',true);
SELECT set_config('request.jwt.claim.sub','f0310000-0000-4000-8000-000000000001',true);
GRANT USAGE ON SCHEMA public,extensions TO authenticated;
GRANT SELECT ON public.mood_logs,public.auth_identities TO authenticated;
SET LOCAL ROLE authenticated;
SELECT is(public.get_my_id()::text,:'account_a','RLS resolves a different credential subject');
SELECT is((SELECT count(*)::integer FROM public.mood_logs WHERE user_id=:'account_a'::uuid),1,'owner can read private data');
SELECT is((SELECT count(*)::integer FROM public.mood_logs WHERE user_id=:'account_b'::uuid),0,'other account private data is denied');
RESET ROLE;

SELECT is(public.canonical_account_access_token_hook(
 '{"user_id":"f0310000-0000-4000-8000-000000000001","claims":{"sub":"f0310000-0000-4000-8000-000000000001"}}')
 #>> '{claims,canonical_account_id}',:'account_a','token hook signs the resolved canonical account');
SELECT is(public.canonical_account_access_token_hook(
 '{"user_id":"f0310000-0000-4000-8000-000000000001","claims":{"canonical_account_id":"attacker-supplied"}}')
 #>> '{claims,canonical_account_id}',:'account_a','hook overwrites caller-provided account claims');
SELECT throws_ok($q$SELECT public.canonical_account_access_token_hook(
 '{"user_id":"f0310000-0000-4000-8000-000000000099","claims":{}}')$q$,
 '28000','CANONICAL_ACCOUNT_BINDING_REQUIRED','unbound subject cannot mint a canonical claim');
SELECT ok(NOT has_function_privilege('authenticated','public.canonical_account_access_token_hook(jsonb)','EXECUTE'),
 'clients cannot invoke token issuance hook');
SELECT ok(NOT has_function_privilege('authenticated','public.new_edlove_account_id()','EXECUTE'),
 'clients cannot invoke the account issuer as a public RPC');
SELECT is((SELECT count(DISTINCT candidate)::integer FROM
 (SELECT public.new_edlove_account_id() AS candidate FROM generate_series(1,1000)) minted),1000,
 'consecutive account issuance produces distinct values');
SELECT ok((SELECT bool_and(public.is_edlove_account_uuid_v8_profile_v1(public.new_edlove_account_id()))
 FROM generate_series(1,100)),'SQL issuer always conforms to the cross-language profile');
UPDATE private.edlove_account_clock SET last_issued_at_ms=
 floor(extract(epoch FROM clock_timestamp())*1000)::bigint+60000;
SELECT throws_ok('SELECT public.new_edlove_account_id()',
 '22008','EDLOVE_ACCOUNT_CLOCK_ROLLBACK_EXCEEDED','large clock rollback fails loudly');
SELECT * FROM finish();
ROLLBACK;

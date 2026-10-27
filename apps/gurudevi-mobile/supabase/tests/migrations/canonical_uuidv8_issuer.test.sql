\set ON_ERROR_STOP on
DO $$ BEGIN
  IF current_database() NOT LIKE '%test%' AND
    current_setting('edlove.rehearsal_tag',true) IS DISTINCT FROM '20261025' THEN
    RAISE EXCEPTION 'Issuer fault injection requires an isolated test database';
  END IF;
END $$;
BEGIN;
SET LOCAL search_path=public,extensions;
SELECT plan(18);

SELECT is((SELECT mint_origin::integer FROM private.edlove_account_clock WHERE singleton),
  1,'development issuer uses the registered non-production origin');
SELECT ok(NOT has_any_column_privilege('authenticated','private.edlove_account_clock','INSERT,UPDATE'),
  'authenticated cannot choose issuer provenance or clock');
SELECT ok(NOT has_any_column_privilege('service_role','private.edlove_account_clock','INSERT,UPDATE'),
  'application service cannot change issuer provenance or clock');

UPDATE private.edlove_account_clock SET
  last_issued_at_ms=floor(extract(epoch FROM clock_timestamp())*1000)+10000 WHERE singleton;
CREATE TEMP SEQUENCE issuer_entropy_attempt;
-- Substitute only the entropy call in this transaction's issuer definition.
-- ROLLBACK restores it; no test entropy hook exists in application SQL.
CREATE FUNCTION pg_temp.issuer_test_entropy()
RETURNS uuid LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE AS $$
BEGIN
  PERFORM nextval('pg_temp.issuer_entropy_attempt');
  RETURN '00112233-4455-4677-8899-aabbccddeeff'::uuid;
END;
$$;
DO $$
DECLARE definition text := pg_get_functiondef('public.new_edlove_account_id()'::regprocedure);
BEGIN
  IF position('pg_catalog.gen_random_uuid()' IN definition)=0 THEN
    RAISE EXCEPTION 'Issuer entropy substitution no longer matches source';
  END IF;
  EXECUTE replace(definition,'pg_catalog.gen_random_uuid()','pg_temp.issuer_test_entropy()');
END;
$$;
INSERT INTO public.users(email,full_name)
  VALUES ('issuer-collision-fixture@example.invalid','Issuer collision fixture');
SELECT is(right((SELECT id::text FROM public.users WHERE email='issuer-collision-fixture@example.invalid'),17),
  '8199-aabbccddeeff','issuer preserves registered profile and exact entropy bytes');
SELECT throws_ok('SELECT public.new_edlove_account_id()', '54000',
  'EDLOVE_ACCOUNT_ENTROPY_COLLISION_EXHAUSTED','repeated entropy collision fails loudly');
SELECT is(currval('pg_temp.issuer_entropy_attempt'),6::bigint,
  'one initial issue plus exactly five failed entropy attempts');

ALTER SEQUENCE pg_temp.issuer_entropy_attempt RESTART WITH 1;
CREATE OR REPLACE FUNCTION pg_temp.issuer_test_entropy()
RETURNS uuid LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE AS $$
BEGIN
  IF nextval('pg_temp.issuer_entropy_attempt')=1 THEN
    RETURN '00112233-4455-4677-8899-aabbccddeeff'::uuid;
  END IF;
  RETURN '00112233-4455-4677-8899-aabbccddeef0'::uuid;
END;
$$;
SELECT is(right(public.new_edlove_account_id()::text,17),'8199-aabbccddeef0',
  'a collision retries with fresh entropy and succeeds');
SELECT is(currval('pg_temp.issuer_entropy_attempt'),2::bigint,
  'successful retry stops after its second entropy attempt');
UPDATE private.edlove_account_clock SET mint_origin=0 WHERE singleton;
SELECT is(get_byte(uuid_send(public.new_edlove_account_id()),8),128,
  'owner-configured production provenance uses registered origin zero');
UPDATE private.edlove_account_clock SET
  last_issued_at_ms=floor(extract(epoch FROM clock_timestamp())*1000)+60000 WHERE singleton;
SELECT throws_ok('SELECT public.new_edlove_account_id()', '22008',
  'EDLOVE_ACCOUNT_CLOCK_ROLLBACK_EXCEEDED','large rollback fails before generating entropy');

-- Exercise the real auth INSERT trigger with only its issuer substituted.
-- Other uniqueness errors must not be retried as entropy failures.
CREATE OR REPLACE FUNCTION public.new_edlove_account_id()
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
BEGIN
  PERFORM nextval('pg_temp.issuer_entropy_attempt');
  RETURN (SELECT id FROM public.users WHERE email='issuer-collision-fixture@example.invalid');
END;
$$;
ALTER SEQUENCE pg_temp.issuer_entropy_attempt RESTART WITH 1;
SELECT throws_ok(
  $query$INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data)
    VALUES ('f0340000-0000-4000-8000-000000000001','issuer-pkey-fixture@example.invalid','{}','{}')$query$,
  '23505',NULL,'actual primary-key collision exhausts its bounded provisioning retry');
SELECT is(currval('pg_temp.issuer_entropy_attempt'),5::bigint,
  'auth provisioning retries exactly five account primary-key failures');
SELECT is((SELECT count(*) FROM public.auth_identities
  WHERE provider_user_id='f0340000-0000-4000-8000-000000000001'),0::bigint,
  'exhaustion leaves no credential binding to the colliding account');

ALTER SEQUENCE pg_temp.issuer_entropy_attempt RESTART WITH 1;
CREATE OR REPLACE FUNCTION public.new_edlove_account_id()
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF nextval('pg_temp.issuer_entropy_attempt')=1 THEN
    RETURN (SELECT id FROM public.users WHERE email='issuer-collision-fixture@example.invalid');
  END IF;
  RETURN '01234567-89ab-8101-8100-010203040507'::uuid;
END;
$$;
INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data)
  VALUES ('f0340000-0000-4000-8000-000000000002','issuer-retry-fixture@example.invalid','{}','{}');
SELECT is(currval('pg_temp.issuer_entropy_attempt'),2::bigint,
  'auth provisioning succeeds after one primary-key collision');
SELECT is((SELECT user_id::text FROM public.auth_identities
  WHERE provider_user_id='f0340000-0000-4000-8000-000000000002'),
  '01234567-89ab-8101-8100-010203040507','new credential binds only to its successfully created account');
SELECT is((SELECT count(*) FROM public.users WHERE email='issuer-collision-fixture@example.invalid'),
  1::bigint,'successful retry preserves the original colliding account');

ALTER SEQUENCE pg_temp.issuer_entropy_attempt RESTART WITH 1;
CREATE OR REPLACE FUNCTION public.new_edlove_account_id()
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
BEGIN
  PERFORM nextval('pg_temp.issuer_entropy_attempt');
  RETURN '01234567-89ab-8101-8100-010203040508'::uuid;
END;
$$;
SELECT throws_ok(
  $query$INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data)
    VALUES ('f0340000-0000-4000-8000-000000000003','issuer-collision-fixture@example.invalid','{}','{}')$query$,
  '23505','duplicate key value violates unique constraint "users_email_key"',
  'credential email conflict remains its real constraint failure');
SELECT is(currval('pg_temp.issuer_entropy_attempt'),1::bigint,
  'email uniqueness conflict is never retried as an account-ID collision');

SELECT * FROM finish();
ROLLBACK;

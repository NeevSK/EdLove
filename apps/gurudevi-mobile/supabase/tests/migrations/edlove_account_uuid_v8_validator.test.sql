BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(10);

\ir ../../migrations/20261023100000_edlove_account_uuid_v8_validator.sql

SELECT ok(
  public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-8101-8000-010203040506'::uuid),
  'accepts the canonical profile-v1 Identity/account vector'
);
SELECT ok(
  NOT public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-7101-8000-010203040506'::uuid),
  'rejects a non-v8 UUID'
);
SELECT ok(
  NOT public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-8101-c000-010203040506'::uuid),
  'rejects a non-IETF variant'
);
SELECT ok(
  NOT public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-8e01-8000-010203040506'::uuid),
  'rejects an unregistered domain'
);
SELECT ok(
  NOT public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-8102-8000-010203040506'::uuid),
  'rejects an Identity subtype other than account'
);
SELECT ok(
  NOT public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-8101-8200-010203040506'::uuid),
  'rejects a globally registered but account-unapproved edge mint origin'
);
SELECT ok(
  NOT public.is_edlove_account_uuid_v8_profile_v1('01234567-89ab-8101-8600-010203040506'::uuid),
  'rejects an unregistered mint origin'
);
SELECT is(
  public.is_edlove_account_uuid_v8_profile_v1(NULL::uuid),
  NULL::boolean,
  'keeps null handling with the future nullable column constraint'
);
SELECT ok(
  NOT has_function_privilege(
    'authenticated',
    'public.is_edlove_account_uuid_v8_profile_v1(uuid)',
    'EXECUTE'
  ),
  'authenticated clients cannot invoke the validator as an RPC'
);
SELECT ok(
  has_function_privilege(
    'service_role',
    'public.is_edlove_account_uuid_v8_profile_v1(uuid)',
    'EXECUTE'
  ),
  'service role retains validation execution for the server-owned path'
);

SELECT * FROM finish();
ROLLBACK;

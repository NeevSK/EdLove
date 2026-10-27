BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(61);

\ir ../../migrations/20261023100000_edlove_account_uuid_v8_validator.sql
\ir ../../migrations/20261023101000_edlove_account_id_dark_schema.sql
\ir ../../migrations/20261023102000_edlove_account_id_server_writer.sql
\ir ../../migrations/20261023103000_edlove_account_id_writer_role_hardening.sql
\ir ../../migrations/20261024010000_edlove_durable_account_assignment_handoff.sql
\ir ../../migrations/20261024200000_edlove_historical_assignment_operations.sql
\ir ../../migrations/20261024201000_edlove_historical_assignment_operation_summary.sql
\ir ../../migrations/20261024202000_edlove_historical_assignment_checkpoint_guard.sql
\ir ../../migrations/20261024203000_edlove_historical_assignment_failure_threshold_order.sql
\ir ../fixtures/edlove_uuid_v8_profile_v1_vectors.sql

SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'canonical_account'),
  'accepts the canonical profile-v1 Identity/account vector'
);
SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'wrong_version'),
  'rejects a non-v8 UUID'
);
SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'wrong_variant'),
  'rejects a non-IETF variant'
);
SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'unregistered_domain'),
  'rejects an unregistered domain'
);
SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'wrong_identity_subtype'),
  'rejects an Identity subtype other than account'
);
SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'unapproved_edge_origin'),
  'rejects a globally registered but account-unapproved edge mint origin'
);
SELECT ok(
  (SELECT public.is_edlove_account_uuid_v8_profile_v1(candidate) = expected_profile_valid
     FROM edlove_uuid_v8_profile_v1_vectors
    WHERE name = 'unregistered_mint_origin'),
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

SELECT ok(
  EXISTS (
    SELECT 1
      FROM pg_proc
     WHERE pronamespace = 'private'::regnamespace
       AND proname = 'assign_edlove_account_id'
       AND prosecdef
  ),
  'keeps the assignment function private and security definer'
);
SELECT ok(
  NOT has_schema_privilege('anon', 'private', 'USAGE'),
  'anon cannot use the private assignment schema'
);
SELECT ok(
  NOT has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated cannot use the private assignment schema'
);
SELECT ok(
  NOT has_function_privilege(
    'anon',
    'private.assign_edlove_account_id(uuid, uuid)',
    'EXECUTE'
  ),
  'anon cannot execute the account assignment function'
);
SELECT ok(
  NOT has_function_privilege(
    'authenticated',
    'private.assign_edlove_account_id(uuid, uuid)',
    'EXECUTE'
  ),
  'authenticated cannot execute the account assignment function'
);
SELECT ok(
  NOT has_function_privilege(
    'service_role',
    'private.assign_edlove_account_id(uuid, uuid)',
    'EXECUTE'
  ),
  'service role cannot reach the private direct-database assignment function'
);
SELECT ok(
  EXISTS (
    SELECT 1
      FROM pg_roles
     WHERE rolname = 'edlove_identity_writer'
       AND NOT rolcanlogin
       AND NOT rolinherit
       AND rolbypassrls
  ),
  'the assignment owner is a non-login non-inheriting RLS-bypass role'
);
SELECT is(
  (SELECT pg_get_userbyid(proowner)
     FROM pg_proc
    WHERE oid = 'private.assign_edlove_account_id(uuid, uuid)'::regprocedure),
  'edlove_identity_writer',
  'the private assignment function is owned by the dedicated writer role'
);
SELECT ok(
  NOT pg_has_role('postgres', 'edlove_identity_writer', 'set'),
  'the direct server role cannot assume the writer role'
);
SELECT ok(
  EXISTS (
    SELECT 1
      FROM pg_trigger trigger
      JOIN pg_proc routine ON routine.oid = trigger.tgfoid
     WHERE trigger.tgrelid = 'public.users'::regclass
       AND trigger.tgname = 'reject_unconfigured_edlove_account_id_write'
       AND pg_get_functiondef(routine.oid) LIKE '%current_user = ''edlove_identity_writer''%'
  ),
  'the users write guard admits only the dedicated writer execution identity'
);
SELECT ok(
  (SELECT relrowsecurity
     FROM pg_class
    WHERE oid = 'private.edlove_account_assignment_requests'::regclass),
  'the private durable-account handoff ledger has row level security enabled'
);
SELECT ok(
  NOT has_table_privilege('anon', 'private.edlove_account_assignment_requests', 'SELECT, INSERT, UPDATE, DELETE'),
  'anon cannot read or mutate the durable-account handoff ledger'
);
SELECT ok(
  NOT has_table_privilege('authenticated', 'private.edlove_account_assignment_requests', 'SELECT, INSERT, UPDATE, DELETE'),
  'authenticated cannot read or mutate the durable-account handoff ledger'
);
SELECT ok(
  pg_get_functiondef('public.sync_canonical_auth_account()'::regprocedure)
    LIKE '%edlove_account_assignment_requests%'
    AND pg_get_functiondef('public.sync_canonical_auth_account()'::regprocedure)
      LIKE '%inserted_new_canonical_account_count%'
    AND pg_get_functiondef('public.sync_canonical_auth_account()'::regprocedure)
      LIKE '%became_durable%',
  'the canonical trigger has an explicit new-or-newly-durable private handoff condition'
);

-- Exercise the real Auth trigger. This test transaction rolls back, so the
-- synthetic subjects and retry requests never leave the isolated rehearsal.
SET LOCAL ROLE supabase_auth_admin;
INSERT INTO auth.users (id, email, is_anonymous, raw_user_meta_data) VALUES
 ('f0410000-0000-4000-8000-000000000001', 'handoff-new@example.invalid', false, '{"display_name":"New durable"}'),
 ('f0410000-0000-4000-8000-000000000002', NULL, true, '{"display_name":"Anonymous"}');
RESET ROLE;
SELECT is(
  (SELECT count(*) FROM private.edlove_account_assignment_requests
    WHERE account_id = 'f0410000-0000-4000-8000-000000000001'),
  1::bigint,
  'new durable Auth subject creates one assignment request'
);
SELECT is(
  (SELECT user_id FROM public.auth_identities
    WHERE provider = 'supabase' AND provider_user_id = 'f0410000-0000-4000-8000-000000000001'),
  'f0410000-0000-4000-8000-000000000001'::uuid,
  'new durable subject keeps its canonical identity binding'
);
SELECT is(
  (SELECT count(*) FROM private.edlove_account_assignment_requests
    WHERE account_id = 'f0410000-0000-4000-8000-000000000002'),
  0::bigint,
  'new anonymous Auth subject does not create an assignment request'
);
SELECT is(
  (SELECT user_id FROM public.auth_identities
    WHERE provider = 'supabase' AND provider_user_id = 'f0410000-0000-4000-8000-000000000002'),
  'f0410000-0000-4000-8000-000000000002'::uuid,
  'anonymous subject keeps its canonical identity binding'
);
SET LOCAL ROLE supabase_auth_admin;
UPDATE auth.users SET is_anonymous = false
 WHERE id = 'f0410000-0000-4000-8000-000000000002';
UPDATE auth.users SET email = 'handoff-new-updated@example.invalid'
 WHERE id = 'f0410000-0000-4000-8000-000000000001';
RESET ROLE;
SELECT is(
  (SELECT count(*) FROM private.edlove_account_assignment_requests
    WHERE account_id = 'f0410000-0000-4000-8000-000000000002'),
  1::bigint,
  'anonymous-to-durable transition creates one assignment request'
);
SELECT is(
  (SELECT user_id FROM public.auth_identities
    WHERE provider = 'supabase' AND provider_user_id = 'f0410000-0000-4000-8000-000000000002'),
  'f0410000-0000-4000-8000-000000000002'::uuid,
  'anonymous-to-durable transition preserves its canonical binding'
);
SELECT is(
  (SELECT count(*) FROM private.edlove_account_assignment_requests
    WHERE account_id = 'f0410000-0000-4000-8000-000000000001'),
  1::bigint,
  'updating an existing durable subject does not enqueue another request'
);
SELECT is(
  (SELECT count(*) FROM public.users WHERE id = 'f0410000-0000-4000-8000-000000000001'),
  1::bigint,
  'durable update does not create a duplicate canonical profile'
);
SELECT is(
  (SELECT count(*) FROM public.users WHERE id = 'f0410000-0000-4000-8000-000000000002'),
  1::bigint,
  'anonymous conversion does not create a duplicate canonical profile'
);
SELECT is(
  (SELECT count(*) FROM public.auth_identities
    WHERE provider = 'supabase' AND provider_user_id IN (
      'f0410000-0000-4000-8000-000000000001', 'f0410000-0000-4000-8000-000000000002')),
  2::bigint,
  'both Auth subjects retain exactly one identity binding'
);

SELECT ok(
  has_function_privilege('postgres', 'private.claim_edlove_account_assignment_requests(integer)', 'EXECUTE'),
  'postgres can claim durable-account assignment requests'
);
SELECT ok(
  NOT has_function_privilege('service_role', 'private.claim_edlove_account_assignment_requests(integer)', 'EXECUTE')
    AND NOT has_function_privilege('authenticated', 'private.claim_edlove_account_assignment_requests(integer)', 'EXECUTE')
    AND NOT has_function_privilege('anon', 'private.claim_edlove_account_assignment_requests(integer)', 'EXECUTE'),
  'client and service roles cannot claim private assignment requests'
);
SELECT ok(
  pg_get_functiondef('private.claim_edlove_account_assignment_requests(integer)'::regprocedure)
    LIKE '%SKIP LOCKED%',
  'claim selection uses row-level skip-locked concurrency control'
);
SELECT is(
  (SELECT count(*) FROM private.claim_edlove_account_assignment_requests(100)),
  2::bigint,
  'claim atomically returns both pending durable accounts and excludes anonymous accounts'
);
SELECT ok(
  (SELECT count(*) = 2 AND count(DISTINCT claim_token) = 2
          AND bool_and(claim_token IS NOT NULL AND claim_expires_at > now())
     FROM private.edlove_account_assignment_requests
    WHERE account_id IN ('f0410000-0000-4000-8000-000000000001', 'f0410000-0000-4000-8000-000000000002')
      AND completed_at IS NULL),
  'each returned claim has a distinct token and future expiry'
);
SELECT is(
  (SELECT count(*) FROM private.claim_edlove_account_assignment_requests(100)),
  0::bigint,
  'active leases prevent a second worker from claiming the same requests'
);
SELECT claim_token AS prior_claim_token
  FROM private.edlove_account_assignment_requests
 WHERE account_id = 'f0410000-0000-4000-8000-000000000001' \gset
UPDATE private.edlove_account_assignment_requests
   SET claim_expires_at = now() - interval '1 second'
 WHERE account_id = 'f0410000-0000-4000-8000-000000000001';
SELECT account_id AS reclaimed_account_id, claim_token AS reclaimed_claim_token
  FROM private.claim_edlove_account_assignment_requests(1) \gset
SELECT is(:'reclaimed_account_id'::uuid, 'f0410000-0000-4000-8000-000000000001'::uuid,
 'expired lease is eligible for another worker');
SELECT isnt(:'reclaimed_claim_token'::uuid, :'prior_claim_token'::uuid,
 'reclaimed lease receives a fresh ownership token');
WITH stale_completion AS (
  UPDATE private.edlove_account_assignment_requests
     SET completed_at = now(), claim_token = NULL, claim_expires_at = NULL
   WHERE account_id = :'reclaimed_account_id'::uuid
     AND claim_token = :'prior_claim_token'::uuid
     AND completed_at IS NULL
   RETURNING account_id
)
SELECT is(
  (SELECT count(*) FROM stale_completion),
  0::bigint,
  'stale worker completion updates no row after lease reclamation'
);
SELECT ok(
  (SELECT completed_at IS NULL AND claim_token = :'reclaimed_claim_token'::uuid
          AND claim_expires_at > now()
     FROM private.edlove_account_assignment_requests
    WHERE account_id = :'reclaimed_account_id'::uuid),
  'stale completion cannot clear the new lease or complete its request'
);
WITH stale_failure AS (
  UPDATE private.edlove_account_assignment_requests
     SET attempts = attempts + 1, last_error_code = 'STALE_WORKER',
         claim_token = NULL, claim_expires_at = NULL
   WHERE account_id = :'reclaimed_account_id'::uuid
     AND claim_token = :'prior_claim_token'::uuid
     AND completed_at IS NULL
   RETURNING account_id
)
SELECT is(
  (SELECT count(*) FROM stale_failure),
  0::bigint,
  'stale worker failure updates no row after lease reclamation'
);
SELECT ok(
  (SELECT attempts = 0 AND last_error_code IS NULL
          AND claim_token = :'reclaimed_claim_token'::uuid
          AND claim_expires_at > now()
     FROM private.edlove_account_assignment_requests
    WHERE account_id = :'reclaimed_account_id'::uuid),
  'stale failure cannot overwrite attempts, error, or the new lease'
);
SELECT throws_ok(
  'SELECT * FROM private.claim_edlove_account_assignment_requests(0)',
  '22023', 'max_requests must be between 1 and 100',
  'claim rejects a non-positive batch limit'
);

SELECT ok(
  has_function_privilege('postgres', 'private.create_edlove_historical_assignment_operation(uuid, integer, integer)', 'EXECUTE')
    AND has_function_privilege('postgres', 'private.get_edlove_historical_assignment_operation_summary(uuid)', 'EXECUTE'),
  'postgres can create and inspect private historical assignment operations'
);
SELECT ok(
  NOT has_function_privilege('service_role', 'private.create_edlove_historical_assignment_operation(uuid, integer, integer)', 'EXECUTE')
    AND NOT has_function_privilege('authenticated', 'private.create_edlove_historical_assignment_operation(uuid, integer, integer)', 'EXECUTE')
    AND NOT has_function_privilege('anon', 'private.create_edlove_historical_assignment_operation(uuid, integer, integer)', 'EXECUTE'),
  'client and service roles cannot create historical assignment operations'
);
SELECT private.create_edlove_historical_assignment_operation(
  'f0500000-0000-4000-8000-000000000001'::uuid, 1, 1
) AS phase_1b_operation_id \gset
SELECT ok(
  (SELECT state = 'planned' AND candidate_count > 0 AND assigned_count = 0
     FROM private.get_edlove_historical_assignment_operation_summary(:'phase_1b_operation_id'::uuid)),
  'historical operation is a dry-run snapshot and starts planned'
);
SELECT is(
  (SELECT count(*) FROM public.users WHERE edlove_id IS NOT NULL),
  0::bigint,
  'creating a historical operation does not assign any EdLove identifiers'
);
SELECT private.approve_edlove_historical_assignment_operation(:'phase_1b_operation_id'::uuid);
SELECT throws_ok(
  'SELECT private.start_edlove_historical_assignment_operation(''' || :'phase_1b_operation_id' || '''::uuid)',
  'P0001', 'historical EdLove assignment execution is disabled',
  'approved operation cannot start while the default-off kill switch is disabled'
);
SELECT private.set_edlove_historical_assignment_execution_enabled(true);
SELECT private.start_edlove_historical_assignment_operation(:'phase_1b_operation_id'::uuid);
SELECT account_id AS phase_1b_account_id, claim_token AS phase_1b_claim_token
  FROM private.claim_edlove_historical_assignment_operation_items(:'phase_1b_operation_id'::uuid, 1) \gset
SELECT ok(
  :'phase_1b_account_id'::uuid IS NOT NULL AND :'phase_1b_claim_token'::uuid IS NOT NULL,
  'enabled, approved operation issues one leased private work item'
);
SELECT ok(
  NOT private.complete_edlove_historical_assignment_operation_item(
    :'phase_1b_operation_id'::uuid, :'phase_1b_account_id'::uuid,
    'f0500000-0000-4000-8000-000000000099'::uuid
  ),
  'stale historical worker cannot complete another worker claim'
);
SELECT ok(
  NOT private.complete_edlove_historical_assignment_operation_item(
    :'phase_1b_operation_id'::uuid, :'phase_1b_account_id'::uuid, :'phase_1b_claim_token'::uuid
  ),
  'claimed item cannot be marked assigned before the durable EdLove value exists'
);
SELECT private.assign_edlove_account_id(
  :'phase_1b_account_id'::uuid,
  (SELECT candidate FROM edlove_uuid_v8_profile_v1_vectors WHERE name = 'canonical_account')
);
SELECT ok(
  private.complete_edlove_historical_assignment_operation_item(
    :'phase_1b_operation_id'::uuid, :'phase_1b_account_id'::uuid, :'phase_1b_claim_token'::uuid
  ),
  'claim owner can checkpoint its assigned item'
);
SELECT private.set_edlove_historical_assignment_execution_enabled(false);
SELECT is(
  (SELECT state FROM private.get_edlove_historical_assignment_operation_summary(:'phase_1b_operation_id'::uuid)),
  'paused',
  'kill switch pauses a running historical assignment operation'
);
SELECT throws_ok(
  'SELECT * FROM private.claim_edlove_historical_assignment_operation_items(''' || :'phase_1b_operation_id' || '''::uuid, 1)',
  'P0001', 'operation is not running',
  'paused operation cannot issue more work'
);
SELECT private.set_edlove_historical_assignment_execution_enabled(true);
SELECT private.start_edlove_historical_assignment_operation(:'phase_1b_operation_id'::uuid);
SELECT account_id AS phase_1b_failure_account_id, claim_token AS phase_1b_failure_claim_token
  FROM private.claim_edlove_historical_assignment_operation_items(:'phase_1b_operation_id'::uuid, 1) \gset
SELECT ok(
  private.release_edlove_historical_assignment_operation_item(
    :'phase_1b_operation_id'::uuid, :'phase_1b_failure_account_id'::uuid,
    :'phase_1b_failure_claim_token'::uuid, 'TEST_FAILURE'
  ),
  'failed leased item is released for its bounded retry budget'
);
SELECT account_id AS phase_1b_failure_account_id, claim_token AS phase_1b_failure_claim_token
  FROM private.claim_edlove_historical_assignment_operation_items(:'phase_1b_operation_id'::uuid, 1) \gset
SELECT ok(
  private.release_edlove_historical_assignment_operation_item(
    :'phase_1b_operation_id'::uuid, :'phase_1b_failure_account_id'::uuid,
    :'phase_1b_failure_claim_token'::uuid, 'TEST_FAILURE'
  ),
  'second failed lease remains bounded and retryable'
);
SELECT account_id AS phase_1b_failure_account_id, claim_token AS phase_1b_failure_claim_token
  FROM private.claim_edlove_historical_assignment_operation_items(:'phase_1b_operation_id'::uuid, 1) \gset
SELECT ok(
  private.release_edlove_historical_assignment_operation_item(
    :'phase_1b_operation_id'::uuid, :'phase_1b_failure_account_id'::uuid,
    :'phase_1b_failure_claim_token'::uuid, 'TEST_FAILURE'
  ) AND (SELECT state = 'paused' AND failed_count >= 1
           FROM private.get_edlove_historical_assignment_operation_summary(:'phase_1b_operation_id'::uuid)),
  'third failed lease records a durable failure and pauses at the approved threshold'
);

SELECT * FROM finish();
ROLLBACK;

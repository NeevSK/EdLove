BEGIN;

-- This is a rollback-only rehearsal for the isolated foundation fixture. The
-- runner must copy this file and the exact migration source to their matching
-- repository paths inside the disposable database container before invoking
-- psql, so the relative include below cannot silently exercise a different
-- source file.
DO $$
BEGIN
  IF current_database() <> 'gurudevi_foundation_test' THEN
    RAISE EXCEPTION 'Omnichannel authority rehearsal requires the isolated foundation database';
  END IF;

  IF to_regclass('public.channel_identities') IS NOT NULL
     OR to_regclass('public.channel_link_attempts') IS NOT NULL
     OR to_regclass('public.channel_consent_grants') IS NOT NULL
     OR to_regclass('public.channel_delegations') IS NOT NULL
     OR to_regclass('public.channel_ingress_events') IS NOT NULL
     OR to_regclass('public.channel_delivery_intents') IS NOT NULL
     OR to_regclass('public.channel_media_jobs') IS NOT NULL
     OR to_regclass('public.channel_ai_proposals') IS NOT NULL THEN
    RAISE EXCEPTION 'Omnichannel authority fixture refuses an already-migrated database';
  END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(50);

-- The full migration ledger currently stops before this foundation. Seed only
-- the canonical-account prerequisites declared by this migration, and keep all
-- synthetic identities inside this transaction.
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('f1600000-0000-4000-8000-000000000001', 'channel-owner@example.invalid', '{}'),
  ('f1600000-0000-4000-8000-000000000002', 'channel-subject-shaped@example.invalid', '{}');

\ir ../../migrations/20261015160000_omnichannel_authority_foundation.sql

-- Complete schema contract: all server-owned ledgers are present and protected.
SELECT has_table('public', 'channel_identities', 'channel identities table exists');
SELECT has_table('public', 'channel_link_attempts', 'channel link attempts table exists');
SELECT has_table('public', 'channel_consent_grants', 'channel consent grants table exists');
SELECT has_table('public', 'channel_delegations', 'channel delegations table exists');
SELECT has_table('public', 'channel_ingress_events', 'channel ingress events table exists');
SELECT has_table('public', 'channel_delivery_intents', 'channel delivery intents table exists');
SELECT has_table('public', 'channel_media_jobs', 'channel media jobs table exists');
SELECT has_table('public', 'channel_ai_proposals', 'channel AI proposals table exists');

SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_identities'::regclass), 'identities RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_link_attempts'::regclass), 'link attempts RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_consent_grants'::regclass), 'consent grants RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_delegations'::regclass), 'delegations RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_ingress_events'::regclass), 'ingress events RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_delivery_intents'::regclass), 'delivery intents RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_media_jobs'::regclass), 'media jobs RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.channel_ai_proposals'::regclass), 'AI proposals RLS enabled');

SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_identities', privilege_name)), 'anon has no identity-table privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_identities', privilege_name)), 'authenticated has no identity-table privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_link_attempts', privilege_name)), 'anon has no link-attempt privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_link_attempts', privilege_name)), 'authenticated has no link-attempt privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_consent_grants', privilege_name)), 'anon has no consent privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_consent_grants', privilege_name)), 'authenticated has no consent privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_delegations', privilege_name)), 'anon has no delegation privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_delegations', privilege_name)), 'authenticated has no delegation privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_ingress_events', privilege_name)), 'anon has no ingress privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_ingress_events', privilege_name)), 'authenticated has no ingress privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_delivery_intents', privilege_name)), 'anon has no delivery privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_delivery_intents', privilege_name)), 'authenticated has no delivery privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_media_jobs', privilege_name)), 'anon has no media-job privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_media_jobs', privilege_name)), 'authenticated has no media-job privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('anon', 'public.channel_ai_proposals', privilege_name)), 'anon has no AI-proposal privileges');
SELECT ok(NOT EXISTS (SELECT 1 FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS privilege_name WHERE has_table_privilege('authenticated', 'public.channel_ai_proposals', privilege_name)), 'authenticated has no AI-proposal privileges');

-- A provider-shaped value cannot choose or merge the canonical account. Its
-- only interpretation is provider-scoped opaque data on a server-owned row.
INSERT INTO public.channel_identities (account_id, provider, external_subject_key, state)
VALUES ('f1600000-0000-4000-8000-000000000001', 'telegram',
        'f1600000-0000-4000-8000-000000000002', 'verified');
SELECT is((SELECT account_id FROM public.channel_identities
 WHERE provider = 'telegram' AND external_subject_key = 'f1600000-0000-4000-8000-000000000002'),
 'f1600000-0000-4000-8000-000000000001'::uuid,
 'provider subject-shaped value does not auto-merge to a canonical account');
SELECT is((SELECT count(*) FROM public.users WHERE id = 'f1600000-0000-4000-8000-000000000002'),
 1::bigint, 'subject-shaped account remains an unrelated existing account');
SELECT throws_ok($sql$INSERT INTO public.channel_identities (provider, external_subject_key, state)
 VALUES ('telegram', 'f1600000-0000-4000-8000-000000000002', 'verified')$sql$,
 '23505', NULL, 'provider-scoped external subject is unique');
SELECT throws_ok($sql$INSERT INTO public.channel_identities (provider, external_subject_key, state)
 VALUES ('signal', 'opaque-subject', 'verified')$sql$,
 '23514', NULL, 'unsupported provider is rejected');
SELECT throws_ok($sql$INSERT INTO public.channel_consent_grants
 (account_id, channel_identity_id, purpose, capabilities, status)
 VALUES ('f1600000-0000-4000-8000-000000000001', (SELECT id FROM public.channel_identities LIMIT 1),
 'test', ARRAY[]::text[], 'active')$sql$,
 '23514', NULL, 'empty consent capabilities are rejected');
SELECT throws_ok($sql$INSERT INTO public.channel_link_attempts
 (account_id, provider, nonce_hash, purpose, state, expires_at, consumed_at)
 VALUES ('f1600000-0000-4000-8000-000000000001', 'telegram', 'nonce-test', 'test', 'pending', now(), now())$sql$,
 '23514', NULL, 'unconfirmed link attempts cannot be consumed');

INSERT INTO public.channel_ingress_events
 (provider, provider_event_id, replay_key, channel_identity_id, endpoint_kind, payload_kind,
  verification_ref, payload_fingerprint, correlation_id, received_at, status)
VALUES
 ('telegram', 'fixture-event-1', repeat('a', 64),
  (SELECT id FROM public.channel_identities WHERE provider = 'telegram' LIMIT 1), 'private', 'text',
  'fixture-verification-ref', repeat('b', 64), 'f1600000-0000-4000-8000-000000000010', now(), 'accepted');
SELECT throws_ok($sql$INSERT INTO public.channel_ingress_events
 (provider, provider_event_id, replay_key, endpoint_kind, payload_kind, verification_ref,
  payload_fingerprint, correlation_id, received_at, status)
 VALUES ('telegram', 'fixture-event-1', repeat('c', 64), 'private', 'text', 'fixture-verification-ref',
  repeat('d', 64), 'f1600000-0000-4000-8000-000000000011', now(), 'accepted')$sql$,
 '23505', NULL, 'duplicate provider event is rejected');
SELECT throws_ok($sql$INSERT INTO public.channel_ingress_events
 (provider, provider_event_id, replay_key, endpoint_kind, payload_kind, verification_ref,
  payload_fingerprint, correlation_id, received_at, status)
 VALUES ('telegram', 'fixture-event-2', repeat('a', 64), 'private', 'text', 'fixture-verification-ref',
  repeat('d', 64), 'f1600000-0000-4000-8000-000000000012', now(), 'accepted')$sql$,
 '23505', NULL, 'duplicate provider replay key is rejected');

INSERT INTO public.channel_delivery_intents
 (account_id, provider, channel_identity_id, endpoint_kind, capability, resource_scope,
  idempotency_key, payload_ref, status)
VALUES
 ('f1600000-0000-4000-8000-000000000001', 'telegram',
  (SELECT id FROM public.channel_identities WHERE provider = 'telegram' LIMIT 1), 'private', 'notify',
  '{}'::jsonb, 'f1600000-0000-4000-8000-000000000020', 'fixture-payload-ref', 'pending');
SELECT throws_ok($sql$INSERT INTO public.channel_delivery_intents
 (provider, endpoint_kind, capability, idempotency_key, payload_ref, status)
 VALUES ('telegram', 'private', 'notify', 'f1600000-0000-4000-8000-000000000020',
  'different-fixture-payload-ref', 'pending')$sql$,
 '23505', NULL, 'duplicate provider delivery idempotency key is rejected');
SELECT has_column('public', 'channel_delivery_intents', 'attempts', 'delivery attempts column exists');
SELECT has_column('public', 'channel_delivery_intents', 'locked_until', 'delivery lease column exists');
SELECT has_column('public', 'channel_media_jobs', 'attempts', 'media attempts column exists');
SELECT has_column('public', 'channel_media_jobs', 'locked_until', 'media lease column exists');
SELECT has_column('public', 'channel_media_jobs', 'processing_token', 'media processing token column exists');

SET LOCAL ROLE authenticated;
SELECT ok(NOT (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname = current_user), 'authenticated assertion role has no superuser or bypass');
SELECT isnt((SELECT pg_get_userbyid(relowner)::text FROM pg_class WHERE oid = 'public.channel_identities'::regclass), current_user::text, 'authenticated assertion role is not the identity-table owner');
SELECT throws_ok($sql$INSERT INTO public.channel_identities (provider, external_subject_key, state)
 VALUES ('whatsapp', 'forged-client-subject', 'verified')$sql$,
 '42501', NULL, 'authenticated client cannot forge a channel identity');
SET LOCAL ROLE anon;
SELECT throws_ok($sql$INSERT INTO public.channel_delegations
 (account_id, agent_key, capabilities, status)
 VALUES ('f1600000-0000-4000-8000-000000000001', 'forged-agent', ARRAY['write'], 'active')$sql$,
 '42501', NULL, 'anon client cannot forge a delegation');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;

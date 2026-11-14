-- Canonical cross-runtime UUIDv8 profile-v1 test vectors. This fixture is
-- imported by pgTAP and parsed by the TypeScript conformance test; production
-- code must not load it or use it as an authority source.
CREATE TEMP TABLE edlove_uuid_v8_profile_v1_vectors (
  name text PRIMARY KEY,
  candidate uuid NOT NULL,
  expected_profile_valid boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO edlove_uuid_v8_profile_v1_vectors (name, candidate, expected_profile_valid)
VALUES
  ('canonical_account', '01234567-89ab-8101-8000-010203040506', true),
  ('wrong_version', '01234567-89ab-7101-8000-010203040506', false),
  ('wrong_variant', '01234567-89ab-8101-c000-010203040506', false),
  ('unregistered_domain', '01234567-89ab-8e01-8000-010203040506', false),
  ('wrong_identity_subtype', '01234567-89ab-8102-8000-010203040506', false),
  ('unapproved_edge_origin', '01234567-89ab-8101-8200-010203040506', false),
  ('unregistered_mint_origin', '01234567-89ab-8101-8600-010203040506', false);

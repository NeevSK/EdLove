-- Profile-v1 validation only. This migration deliberately does not add a
-- users column, mint an identifier, or alter authentication/RLS behavior.
CREATE OR REPLACE FUNCTION public.is_edlove_account_uuid_v8_profile_v1(candidate uuid)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = pg_catalog
AS $$
  SELECT
    (get_byte(uuid_send(candidate), 6) >> 4) = 8
    AND (get_byte(uuid_send(candidate), 6) & 15) = 1
    AND get_byte(uuid_send(candidate), 7) = 1
    AND (get_byte(uuid_send(candidate), 8) >> 6) = 2
    AND ((get_byte(uuid_send(candidate), 8) & 63) IN (0, 1));
$$;

COMMENT ON FUNCTION public.is_edlove_account_uuid_v8_profile_v1(uuid) IS
  'Validates the EdLove UUIDv8 profile-v1 Identity/account storage shape. It is not an authorization check.';

-- A validator is not a client RPC surface. The eventual users.edlove_id write
-- boundary will be deployed separately after the API database-role preflight.
REVOKE ALL ON FUNCTION public.is_edlove_account_uuid_v8_profile_v1(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_edlove_account_uuid_v8_profile_v1(uuid) TO service_role;

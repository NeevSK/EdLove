-- Enables the server-owned assignment seam without exposing a public RPC.
-- `private` is intentionally not an exposed Data API schema. Sanctuary reaches
-- this function only through its protected direct DATABASE_URL connection.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.assign_edlove_account_id(
  p_canonical_account_id uuid,
  p_edlove_account_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing_edlove_id uuid;
BEGIN
  IF p_edlove_account_id IS NULL
     OR NOT public.is_edlove_account_uuid_v8_profile_v1(p_edlove_account_id) THEN
    RAISE EXCEPTION 'EdLove account identifier is outside the registered UUIDv8 profile'
      USING ERRCODE = '22023';
  END IF;

  SELECT account.edlove_id
    INTO v_existing_edlove_id
    FROM public.users AS account
   WHERE account.id = p_canonical_account_id
     AND account.deleted_at IS NULL
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account is not eligible for EdLove account identifier assignment'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_existing_edlove_id IS NOT NULL THEN
    RETURN v_existing_edlove_id;
  END IF;

  UPDATE public.users
     SET edlove_id = p_edlove_account_id
   WHERE id = p_canonical_account_id
     AND edlove_id IS NULL;

  RETURN p_edlove_account_id;
END;
$$;

-- Supabase migrations are owned by postgres. The trigger below recognizes
-- current_user only while this SECURITY DEFINER function is executing; callers
-- cannot set current_user themselves.
ALTER FUNCTION private.assign_edlove_account_id(uuid, uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.assign_edlove_account_id(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reject_unconfigured_edlove_account_id_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF current_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.edlove_id IS NOT NULL THEN
    RAISE EXCEPTION 'EdLove account ID writer role is not configured'
      USING ERRCODE = 'P0001';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.edlove_id IS DISTINCT FROM OLD.edlove_id THEN
    RAISE EXCEPTION 'EdLove account ID writer role is not configured'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_unconfigured_edlove_account_id_write()
  FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION private.assign_edlove_account_id(uuid, uuid) IS
  'Server-only idempotent EdLove account UUIDv8 assignment. Not exposed through the Data API.';

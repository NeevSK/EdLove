-- Corrects the first server-writer design. A postgres-owned SECURITY DEFINER
-- function made `current_user = 'postgres'` too broad: a direct postgres
-- connection could update users.edlove_id without using the assignment seam.
--
-- This role has no login and no membership grant. It exists solely as the
-- execution identity of the private assignment function.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edlove_identity_writer') THEN
    CREATE ROLE edlove_identity_writer NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA public TO edlove_identity_writer;
-- PostgreSQL requires CREATE on the containing schema for function ownership.
-- The role is NOLOGIN and has no memberships, so this does not create a
-- caller-controlled object-creation path.
GRANT USAGE, CREATE ON SCHEMA private TO edlove_identity_writer;
GRANT EXECUTE ON FUNCTION public.is_edlove_account_uuid_v8_profile_v1(uuid)
  TO edlove_identity_writer;
GRANT SELECT (id, edlove_id, deleted_at), UPDATE (edlove_id)
  ON public.users TO edlove_identity_writer;

-- PostgreSQL requires the migration owner to be able to SET ROLE to a new
-- function owner. The membership exists only for this transactional transfer
-- and is removed before the migration commits.
GRANT edlove_identity_writer TO postgres;
ALTER FUNCTION private.assign_edlove_account_id(uuid, uuid)
  OWNER TO edlove_identity_writer;

-- Sanctuary's direct database connection remains the only intended caller.
-- It receives execution permission, not writer-role membership or column
-- privileges. Do not grant this function to any Data API role.
SET ROLE edlove_identity_writer;
GRANT EXECUTE ON FUNCTION private.assign_edlove_account_id(uuid, uuid) TO postgres;
REVOKE ALL ON FUNCTION private.assign_edlove_account_id(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON FUNCTION private.assign_edlove_account_id(uuid, uuid) IS
  'Server-only EdLove assignment. Executes as non-login edlove_identity_writer; not a Data API RPC.';
RESET ROLE;
REVOKE edlove_identity_writer FROM postgres;

CREATE OR REPLACE FUNCTION public.reject_unconfigured_edlove_account_id_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF current_user = 'edlove_identity_writer' THEN
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


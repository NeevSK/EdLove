-- Dark-schema phase: establish storage invariants without enabling assignment.
-- The later writer-role migration may replace only the fail-closed trigger.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS edlove_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND conname = 'users_edlove_id_profile_v1_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_edlove_id_profile_v1_check
      CHECK (edlove_id IS NULL OR public.is_edlove_account_uuid_v8_profile_v1(edlove_id));
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS users_edlove_id_unique
  ON public.users (edlove_id)
  WHERE edlove_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.reject_unconfigured_edlove_account_id_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
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

DROP TRIGGER IF EXISTS reject_unconfigured_edlove_account_id_write ON public.users;
CREATE TRIGGER reject_unconfigured_edlove_account_id_write
  BEFORE INSERT OR UPDATE OF edlove_id ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.reject_unconfigured_edlove_account_id_write();

COMMENT ON COLUMN public.users.edlove_id IS
  'Nullable EdLove UUIDv8 Identity/account secondary handle. Not an authorization key.';

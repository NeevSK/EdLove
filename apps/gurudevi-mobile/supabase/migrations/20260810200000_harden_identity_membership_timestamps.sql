-- Identity membership hardening. Live linked-database scans found zero NULL
-- rows in these timestamp/status columns; creator/target IDs remain nullable on
-- join requests because that is the existing request-table contract.
ALTER TABLE public.school_memberships
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.school_join_requests') IS NOT NULL THEN
    ALTER TABLE public.school_join_requests
      ALTER COLUMN status SET NOT NULL,
      ALTER COLUMN created_at SET NOT NULL,
      ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

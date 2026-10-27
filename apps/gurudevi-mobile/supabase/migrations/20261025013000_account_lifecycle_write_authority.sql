BEGIN;

-- Account soft deletion already propagates to preferences. Restore the missing
-- storage column rather than dropping that propagation from the lifecycle.
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Direct account/profile mutations are authorized by Sanctuary. Supabase
-- credentials do not grant table-write access. Existing domain SQL commands
-- retain their separate function grants and authorization checks.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.users FROM PUBLIC, anon, authenticated;
DO $$
DECLARE columns_sql text;
BEGIN
  SELECT string_agg(quote_ident(attname), ', ' ORDER BY attnum)
    INTO columns_sql
    FROM pg_catalog.pg_attribute
    WHERE attrelid='public.users'::regclass AND attnum>0 AND NOT attisdropped;
  EXECUTE format(
    'REVOKE INSERT (%s), UPDATE (%s) ON TABLE public.users FROM PUBLIC, anon, authenticated',
    columns_sql, columns_sql
  );
END;
$$;

COMMIT;

-- ============================================================================
-- Migration: 20260318100000_fix_username_constraint_for_auth_signups
-- Purpose:
--   Prevent auth signup failures caused by legacy username constraints.
--
-- Root cause:
--   20260314141500_add_handles.sql created `username_format_check` as:
--     CHECK (username ~* '^[a-z0-9_-]{3,30}$')
--   That rejects NULL usernames.
--
--   Later migration 20260314142000_add_handles.sql added a nullable-safe
--   check (`users_username_format`) but did not remove the original
--   `username_format_check`, so both constraints can coexist and still fail
--   inserts from `handle_new_user()` where username is not provided.
-- ============================================================================

-- Remove both possible legacy check-constraint names.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS username_format_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_format;

-- Re-create a single nullable-safe constraint.
ALTER TABLE public.users
ADD CONSTRAINT users_username_format
CHECK (username IS NULL OR username ~* '^[a-z0-9_-]{3,30}$');

COMMENT ON CONSTRAINT users_username_format ON public.users
IS 'Allows NULL usernames for new auth signups while enforcing handle format when present.';

-- ============================================================================
-- Users: school-admin read policy without RLS recursion (forward fix)
-- ============================================================================
-- Intent carried forward from:
--   20260303000000_auth_final_fix.sql      "Admins can view users in their school"
--   20260309000000_identity_rls_fix.sql    same policy, recreated via get_my_id()
-- Both define a SELECT policy on public.users whose USING clause selects from
-- public.users again. Postgres evaluates that inner select under the same RLS, so
-- any signed-in read of users fails with "infinite recursion detected in policy".
-- (auth_final_fix also aliased the table as `current_user`, a reserved word, so
-- it never parsed. History is left untouched on purpose; this migration only
-- defines the end state.)
--
-- Fix: read the caller's own school and capacity through a SECURITY DEFINER
-- helper, which runs as the function owner and so is not subject to the users
-- policies. Identity resolves through public.get_my_id(), the canonical resolver.
--
-- Not carried forward: founder_dashboard's "Founders can manage all users"
-- (FOR ALL on every user for founder/admin/developer). It is a platform-wide
-- write grant that also matched school-level admins, it never applied (that
-- migration fails on the missing public.communities table), and it is absent
-- from the live schema backup. Only the recursive form is dropped here.
-- Idempotent: safe to run on databases where none of these policies exist.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_viewer_school_scope()
RETURNS TABLE (school_id uuid, capacity text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT account.school_id, account.capacity
  FROM public.users AS account
  -- get_my_id() already excludes soft-deleted accounts where that column exists.
  WHERE account.id = public.get_my_id()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_viewer_school_scope() IS
  'Caller''s own school_id and capacity, read without users RLS. Used by users policies to avoid self-referencing recursion.';

REVOKE ALL ON FUNCTION public.current_viewer_school_scope() FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.current_viewer_school_scope() FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.current_viewer_school_scope() TO authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.current_viewer_school_scope() TO service_role';
  END IF;
END
$$;

-- Recursive forms (auth_final_fix / identity_rls_fix / founder_dashboard).
DROP POLICY IF EXISTS "Admins can view users in their school" ON public.users;
DROP POLICY IF EXISTS "Founders can manage all users" ON public.users;

CREATE POLICY "Admins can view users in their school"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    users.school_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.current_viewer_school_scope() AS viewer
      WHERE viewer.school_id = users.school_id
        AND viewer.capacity IN ('admin', 'principal', 'founder', 'developer')
    )
  );

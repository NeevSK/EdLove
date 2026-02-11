-- ============================================================
-- MIGRATION: Fix Infinite Recursion in Users Policy (v1.0)
-- Problem: The policy "Users can view users in their school" queries the "users" table
--          to find the current user's school_id, which triggers the policy again (Loop).
-- Solution: Use a SECURITY DEFINER function to bypass RLS for the lookup.
-- ============================================================

-- 1. Create a secure function to get the current user's school ID
--    'SECURITY DEFINER' means it runs with the privileges of the creator (Admin),
--    bypassing Row Level Security checks on the users table.
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT school_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Users can view users in their school" ON public.users;

-- 3. Re-create the policy using the secure function
--    Now checking "school_id" does NOT trigger a recursive lookup on "users"
CREATE POLICY "Users can view users in their school"
  ON public.users FOR SELECT
  USING (
    school_id = get_my_school_id()
  );

-- 4. Verification (Optional - helpful for debugging)
COMMENT ON FUNCTION get_my_school_id IS 'Helper to safely fetch school_id without triggering RLS recursion';

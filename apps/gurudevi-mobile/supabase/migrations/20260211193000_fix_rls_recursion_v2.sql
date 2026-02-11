-- ============================================
-- FIX RLS RECURSION IN USERS TABLE (v2)
-- Date: 2026-02-11
-- ============================================

-- 1. Create a helper function to fetch current user's school_id
-- We use SECURITY DEFINER to bypass RLS for this specific lookup,
-- which prevents infinite recursion when the users table policy checks itself.
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop all potentially recursive select policies
DROP POLICY IF EXISTS "Users can view users in their school" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can see school members" ON public.users;

-- 3. Create clean, non-recursive SELECT policy
-- This allows:
--  a) Seeing your own profile
--  b) Seeing other members of your school
CREATE POLICY "Users can select own and school members" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() OR 
  school_id = get_auth_user_school_id()
);

-- 4. Ensure UPDATE policy is also clean
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

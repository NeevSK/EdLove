-- ============================================
-- FIX RLS RECURSION IN USERS TABLE
-- Date: 2026-02-11
-- ============================================

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view users in their school" ON public.users;

-- 2. Create non-recursive policies
-- Policy: Allow users to see their own data (ALWAYS SAFE)
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy: Allow users to see others in their school
-- Note: We use a subquery but target auth.uid() specifically to avoid full table recursion checks
CREATE POLICY "Users can see school members" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  school_id = (
    SELECT school_id FROM public.users WHERE id = auth.uid()
  )
);

-- 3. Fix ON UPDATE recursion (if any)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------
-- ADD FALLBACK FOR ONBOARDING
-- During onboarding, users might not have a school_id yet,
-- so we ensure they can always see and update themselves.
-- --------------------------------------------------------

-- Ensure handle_new_user_preferences function exists and is robust
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

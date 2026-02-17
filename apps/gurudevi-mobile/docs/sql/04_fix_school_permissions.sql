-- ============================================================
-- 🛡️ FIX: School Table RLS Permissions
-- Run this in your Supabase SQL Editor to fix the 
-- "permission denied for table schools" error.
-- ============================================================

-- 1. Ensure RLS is enabled (it usually is)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 2. Drop any old potentially conflicting policies on the schools table
DROP POLICY IF EXISTS "Anyone can create schools during signup" ON public.schools;
DROP POLICY IF EXISTS "Creators can view their schools" ON public.schools;
DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;

-- 3. Policy: Allow authenticated users to create a school (required for workspace setup)
CREATE POLICY "authenticated_create_schools" 
ON public.schools FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Policy: Allow users to view schools they created (even if not yet linked in users table)
CREATE POLICY "creators_select_schools" 
ON public.schools FOR SELECT 
TO authenticated 
USING (created_by = auth.uid());

-- 5. Policy: Allow users to view the school they belong to
CREATE POLICY "members_select_schools" 
ON public.schools FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT school_id FROM public.users WHERE id = auth.uid()
  )
);

-- 6. Policy: Allow creators to update their own school details
CREATE POLICY "creators_update_schools" 
ON public.schools FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ✅ Permissions Fixed!
-- You can now go back to the app and create your classroom.

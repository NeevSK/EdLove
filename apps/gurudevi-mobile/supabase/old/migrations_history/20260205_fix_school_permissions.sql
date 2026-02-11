-- ============================================================
-- MIGRATION: Fix School Creation Permissions (v1.0)
-- Problem: When a user signs up and creates a school, RLS blocks them
--          from seeing the school they just created because they aren't
--          linked in the 'users' table yet.
-- Solution: 1. Add 'created_by' column to schools.
--           2. Allow users to see schools they created.
-- ============================================================

-- 1. Add the column
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS created_by UUID;

-- 2. Create Policy: Creators can view their own schools
--    (This bridges the gap between creating a school and creating the user profile)
CREATE POLICY "Creators can view their schools"
  ON public.schools FOR SELECT
  USING (created_by = auth.uid());

-- 3. (Optional) Auto-set created_by via trigger if client forgets
--    But we will update the client code to send it explicitly.

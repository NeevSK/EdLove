-- ============================================================
-- 🛡️ CHANGE: Make school_id optional in Classrooms
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. Remove the NOT NULL constraint from school_id
ALTER TABLE public.classrooms ALTER COLUMN school_id DROP NOT NULL;

-- 2. Drop the restrictive RLS policies that mandate a school_id
-- We drop both potential names commonly found in the codebase
DROP POLICY IF EXISTS "classrooms_insert_teacher" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_teacher_all" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers manage their classrooms" ON public.classrooms;

-- 3. Create a new, simple policy that allows teachers to manage their classrooms
-- regardless of whether they are linked to a school or not.
CREATE POLICY "classrooms_teacher_all_access" 
ON public.classrooms FOR ALL 
TO authenticated 
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- ✅ Change Applied!
-- You can now create classrooms without needing a school workspace.

-- ============================================================
-- MIGRATION: Fix RLS Recursion in Classrooms (v1.0)
-- Problem: Circular dependency between classrooms <-> classroom_students
-- Solution: Security Definer functions to break the loop.
-- ============================================================

-- 1. Get My School ID safely
CREATE OR REPLACE FUNCTION get_my_school_id() 
RETURNS UUID AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS classrooms_select_principal ON public.classrooms;
DROP POLICY IF EXISTS classrooms_select_student ON public.classrooms;
DROP POLICY IF EXISTS classrooms_all_teacher ON public.classrooms;
DROP POLICY IF EXISTS enrollment_select_teacher ON public.classroom_students;

-- 3. Re-create Policies correctly

-- Principals see all school classrooms (Uses function to break loop if users policy queries classrooms)
CREATE POLICY classrooms_select_principal ON public.classrooms 
FOR SELECT TO authenticated 
USING (
  school_id = get_my_school_id() 
  AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'principal'
);

-- Teachers manage their own classrooms (Simple ownership check)
CREATE POLICY classrooms_all_teacher ON public.classrooms 
FOR ALL TO authenticated 
USING (teacher_id = auth.uid());

-- Students see classrooms they are enrolled in 
-- (This lookup into classroom_students is now safe as long as classroom_students policy doesn't query classrooms recursively)
CREATE POLICY classrooms_select_student ON public.classrooms 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = public.classrooms.id 
    AND student_id = auth.uid()
  )
);

-- Teachers see students in their classes
-- (Note: This queries classrooms. Since teachers have a simple 'teacher_id = auth.uid()' policy, this is safe.)
CREATE POLICY enrollment_select_teacher ON public.classroom_students 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE id = classroom_id 
    AND teacher_id = auth.uid()
  )
);

-- Final Check
COMMENT ON FUNCTION get_my_school_id IS 'Safely fetches current user school_id to avoid RLS loops';

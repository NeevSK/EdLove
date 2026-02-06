-- ============================================
-- FIX ENROLLMENT RLS POLICIES
-- Allows Principals and Section Heads to view student lists
-- ============================================

-- 1. Helper for Section Head check
CREATE OR REPLACE FUNCTION public.get_my_section_id() 
RETURNS UUID AS $$
  SELECT section_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing restrictive policies if necessary (Wait, they are already named)
DROP POLICY IF EXISTS "enrollment_principal_select" ON public.classroom_students;
DROP POLICY IF EXISTS "enrollment_section_head_select" ON public.classroom_students;

-- 3. Add Principal Policy
CREATE POLICY "enrollment_principal_select" ON public.classroom_students
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = classroom_students.classroom_id
    AND school_id = public.get_my_school_id()
  )
  AND public.get_my_role() = 'principal'
);

-- 4. Add Section Head Policy
CREATE POLICY "enrollment_section_head_select" ON public.classroom_students
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = classroom_students.classroom_id
    AND section_id = public.get_my_section_id()
  )
  AND public.get_my_role() = 'section_head'
);

-- 5. Comments
COMMENT ON FUNCTION public.get_my_section_id IS 'Recursion-proof section lookup';

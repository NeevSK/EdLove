-- ============================================================
-- ☢️ NUCLEAR RLS RECURSION FIX (v2.0)
-- This script wipes all conflicting policies and rebuilds them
-- using "SECURITY DEFINER" functions to prevent recursion.
-- ============================================================

-- 1. Create SECURITY DEFINER functions (These bypass RLS check on the tables they query)
-- -------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_school_id() 
RETURNS UUID AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_classroom_teacher(class_id UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE id = class_id AND teacher_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop EVERY potential policy name found in the codebase
-- ---------------------------------------------------------

-- Classrooms
DROP POLICY IF EXISTS "Users view school classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers create classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers update own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Principals update school classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers delete own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS classrooms_select_principal ON public.classrooms;
DROP POLICY IF EXISTS classrooms_all_teacher ON public.classrooms;
DROP POLICY IF EXISTS classrooms_select_student ON public.classrooms;

-- Classroom Students
DROP POLICY IF EXISTS "Students view own enrollments" ON public.classroom_students;
DROP POLICY IF EXISTS "Teachers view classroom enrollments" ON public.classroom_students;
DROP POLICY IF EXISTS "Teachers add students to classrooms" ON public.classroom_students;
DROP POLICY IF EXISTS "Teachers remove students from classrooms" ON public.classroom_students;
DROP POLICY IF EXISTS enrollment_select_student ON public.classroom_students;
DROP POLICY IF EXISTS enrollment_select_teacher ON public.classroom_students;

-- Users
DROP POLICY IF EXISTS "Users can view users in their school" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

-- Schools
DROP POLICY IF EXISTS "Creators can view their schools" ON public.schools;


-- 3. Re-create Clean, Recursion-Proof Policies
-- --------------------------------------------

-- [USERS TABLE]
-- Users can see others in the same school (Uses SD function to avoid user-to-user recursion)
CREATE POLICY "Users view same school" ON public.users 
FOR SELECT TO authenticated 
USING (school_id = get_my_school_id());

-- [CLASSROOMS TABLE]
-- Teachers manage their own classes (Simple equality check)
CREATE POLICY "classrooms_teacher_all" ON public.classrooms 
FOR ALL TO authenticated 
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Principals view all school classes (Uses SD functions)
CREATE POLICY "classrooms_principal_select" ON public.classrooms 
FOR SELECT TO authenticated 
USING (school_id = get_my_school_id() AND get_my_role() = 'principal');

-- Students view enrolled classes (Checks enrollment table - safe as long as enrollment policy is simple)
CREATE POLICY "classrooms_student_select" ON public.classrooms 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = public.classrooms.id AND student_id = auth.uid()
  )
);

-- Enrollment (Classroom Students)
-- Teachers manage enrollments for their own classes
CREATE POLICY "enrollment_teacher_all" ON public.classroom_students 
FOR ALL TO authenticated 
USING (is_classroom_teacher(classroom_id));

-- Students see their own enrollments
CREATE POLICY "enrollment_student_select" ON public.classroom_students 
FOR SELECT TO authenticated 
USING (student_id = auth.uid());


-- 4. Final Verification Comment
COMMENT ON FUNCTION get_my_school_id IS 'Recursion-proof school lookup';
COMMENT ON FUNCTION get_my_role IS 'Recursion-proof role lookup';
COMMENT ON FUNCTION is_classroom_teacher IS 'Recursion-proof owner lookup';

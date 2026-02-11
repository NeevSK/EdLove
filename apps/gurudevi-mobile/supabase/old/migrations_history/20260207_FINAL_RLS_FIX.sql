-- ============================================
-- 🛡️ FINAL RLS RECURSION & ADMIN FIX (v3.0)
-- Fixes circular dependencies between classrooms and enrollments
-- ============================================

-- 1. Create SECURITY DEFINER helpers (Bypasses RLS recursively)
-- -------------------------------------------------------------------------------------

-- Check if a user is a student in a specific classroom
CREATE OR REPLACE FUNCTION public.is_classroom_student(class_id UUID, user_uid UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = class_id AND student_id = user_uid
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Check if a classroom belongs to a principal's school
CREATE OR REPLACE FUNCTION public.is_school_principal_for_class(class_id UUID, user_uid UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms c
    JOIN public.users u ON c.school_id = u.school_id
    WHERE c.id = class_id AND u.id = user_uid AND u.role = 'principal'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Check if an enrollment record is accessible to a principal
CREATE OR REPLACE FUNCTION public.is_principal_authorized_for_enrollment(enrollment_id UUID, user_uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_students cs
    JOIN public.classrooms c ON cs.classroom_id = c.id
    JOIN public.users u ON c.school_id = u.school_id
    WHERE cs.id = enrollment_id AND u.id = user_uid AND u.role = 'principal'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Clean up conflicting policies
-- ---------------------------------------------------------

-- Classroom Enrollments (classroom_students)
DROP POLICY IF EXISTS "enrollment_principal_select" ON public.classroom_students;
DROP POLICY IF EXISTS "enrollment_section_head_select" ON public.classroom_students;
DROP POLICY IF EXISTS "enrollment_teacher_all" ON public.classroom_students;
DROP POLICY IF EXISTS "enrollment_student_select" ON public.classroom_students;

-- Classrooms
DROP POLICY IF EXISTS "classrooms_student_select" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_teacher_all" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_principal_select" ON public.classrooms;


-- 3. Re-create Clean, SAFE Policies
-- --------------------------------------------

-- [CLASSROOMS TABLE]
-- Teachers manage their own classes (Simple equality check - safe)
CREATE POLICY "classrooms_teacher_all" ON public.classrooms 
FOR ALL TO authenticated 
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Principals view all school classes (Uses SD function)
CREATE POLICY "classrooms_principal_select" ON public.classrooms 
FOR SELECT TO authenticated 
USING (public.get_my_role() = 'principal' AND school_id = public.get_my_school_id());

-- Students view enrolled classes (Uses SD function to avoid recursion)
CREATE POLICY "classrooms_student_select" ON public.classrooms 
FOR SELECT TO authenticated 
USING (public.is_classroom_student(id, auth.uid()));


-- [CLASSROOM_STUDENTS TABLE]
-- Teachers manage enrollments for their own classes (Uses existing SD function)
CREATE POLICY "enrollment_teacher_all" ON public.classroom_students 
FOR ALL TO authenticated 
USING (public.is_classroom_teacher(classroom_id));

-- Students see their own enrollments
CREATE POLICY "enrollment_student_select" ON public.classroom_students 
FOR SELECT TO authenticated 
USING (student_id = auth.uid());

-- Principals see school enrollments (Uses SD function)
CREATE POLICY "enrollment_principal_select" ON public.classroom_students
FOR SELECT TO authenticated
USING (public.is_principal_authorized_for_enrollment(id, auth.uid()));


-- 4. Final Verification
COMMENT ON FUNCTION public.is_classroom_student IS 'Recursion-safe student check';
COMMENT ON FUNCTION public.is_principal_authorized_for_enrollment IS 'Recursion-safe principal enrollment check';

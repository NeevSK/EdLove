-- ============================================================================
-- CRITICAL SECURITY POLICIES (Grades, Teacher Notes, Enrollments)
-- ============================================================================
-- These are the most sensitive tables that need strong RLS policies
-- ============================================================================

-- ============================================================================
-- GRADES TABLE (MOST CRITICAL)
-- ============================================================================
-- Risk: Students viewing other students' grades
-- Risk: Teachers modifying grades outside their classroom
-- Risk: Unauthorized users viewing grade data

CREATE POLICY "grades_student_read_own"
  ON public.grades FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "grades_teacher_read_own_classroom"
  ON public.grades FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "grades_principal_read_school"
  ON public.grades FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND classroom_id IN (
      SELECT id FROM public.classrooms
      WHERE school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Only teacher can create grades
CREATE POLICY "grades_insert_teacher_only"
  ON public.grades FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Only teacher of the classroom can update
CREATE POLICY "grades_update_teacher_only"
  ON public.grades FOR UPDATE
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- TEACHER_NOTES TABLE (PRIVATE - NO ADMIN ACCESS)
-- ============================================================================
-- These are private venting/reflection notes
-- PRINCIPLE: Only the teacher can access their own notes
-- NOT EVEN PRINCIPALS SHOULD SEE THESE

CREATE POLICY "teacher_notes_read_own"
  ON public.teacher_notes FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "teacher_notes_insert_own"
  ON public.teacher_notes FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teacher_notes_update_own"
  ON public.teacher_notes FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "teacher_notes_delete_own"
  ON public.teacher_notes FOR DELETE
  USING (teacher_id = auth.uid());

-- ============================================================================
-- CLASSROOM_STUDENTS TABLE (Enrollment)
-- ============================================================================

CREATE POLICY "classroom_students_teacher_read"
  ON public.classroom_students FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "classroom_students_student_read"
  ON public.classroom_students FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "classroom_students_principal_read"
  ON public.classroom_students FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND classroom_id IN (
      SELECT id FROM public.classrooms
      WHERE school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "classroom_students_insert_teacher"
  ON public.classroom_students FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "classroom_students_delete_teacher"
  ON public.classroom_students FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- CLASSROOMS TABLE
-- ============================================================================

CREATE POLICY "classrooms_teacher_read"
  ON public.classrooms FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "classrooms_student_read"
  ON public.classrooms FOR SELECT
  USING (
    id IN (
      SELECT classroom_id FROM public.classroom_students
      WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "classrooms_principal_read"
  ON public.classrooms FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "classrooms_insert_teacher"
  ON public.classrooms FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "classrooms_update_teacher"
  ON public.classrooms FOR UPDATE
  USING (teacher_id = auth.uid());

-- ============================================================================
-- DEPLOYMENT CHECKLIST
-- ============================================================================
-- 1. [ ] Run: 01_enable_rls.sql
-- 2. [ ] Run: 02_users_policies.sql
-- 3. [ ] Run: 03_critical_tables_policies.sql
-- 4. [ ] Test as teacher reading student grades (should work)
-- 5. [ ] Test as student reading own grades (should work)
-- 6. [ ] Test as student reading other student grades (should fail)
-- 7. [ ] Test as teacher reading other teacher's notes (should fail)
-- 8. [ ] Test as principal reading grades in school (should work)
-- 9. [ ] Test as principal reading grades outside school (should fail)

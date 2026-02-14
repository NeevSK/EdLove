-- ============================================================================
-- USERS TABLE RLS POLICIES
-- ============================================================================
-- Table: users
-- Purpose: User profiles and roles
-- Columns: id, email, full_name, role, school_id, created_at, updated_at, avatar_url
--
-- Security Principle: Each user can read their own profile and colleagues in the same school
-- ============================================================================

-- Policy 1: Users can read their own profile
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Teachers can read other teachers and students in their school
CREATE POLICY "users_read_colleagues"
  ON public.users FOR SELECT
  USING (
    -- Both user and auth user are in same school
    school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
    -- And viewing user is teacher/admin (not student looking at other students)
    AND (
      (SELECT role FROM public.users WHERE id = auth.uid()) IN ('teacher', 'principal', 'founder', 'admin')
      OR role = 'teacher' -- Students can see teachers
    )
  );

-- Policy 3: Principals can read all users in their school
CREATE POLICY "users_read_school_admin"
  ON public.users FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- Policy 4: Users can update their own profile (non-role fields)
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Can only update own user
    auth.uid() = id
    -- Cannot escalate role (must remain same)
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
    -- Cannot change school_id
    AND school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- Policy 5: New signups create their record (via auth trigger)
CREATE POLICY "users_insert_new_auth"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TESTING (Run in SQL Editor to verify)
-- ============================================================================

-- Test 1: User can read own profile
-- SELECT * FROM users WHERE id = auth.uid();
-- Expected: Returns own user record

-- Test 2: Teacher can read teacher in same school
-- SELECT * FROM users WHERE role = 'teacher' AND school_id = (SELECT school_id FROM users WHERE id = auth.uid());
-- Expected: Returns all teachers in school

-- Test 3: Teacher cannot read user in different school
-- SELECT * FROM users WHERE school_id != (SELECT school_id FROM users WHERE id = auth.uid());
-- Expected: Returns 0 rows (denied)

-- Test 4: Student cannot read other students
-- SELECT * FROM users WHERE role = 'student' AND id != auth.uid();
-- Expected: Returns 0 rows (denied)

-- ============================================================================
-- Migration: 20260504000000_rebac_purge_legacy
-- Purpose: 
--   1. Purge legacy 'authority' and 'role' columns from public.users.
--   2. Replace legacy RBAC logic with Sovereign ReBAC (Bonds).
--   3. Implement public.has_capacity() helper for manual RLS.
--   4. Update sensitive RLS policies (Student Records, Profiles) to ReBAC.
-- ============================================================================

BEGIN;

-- 1. DEFINE REBAC HELPERS
-- These functions allow manual RLS policies to check the bonds table efficiently.
CREATE OR REPLACE FUNCTION public.has_capacity(p_capacity text, p_entity_id text DEFAULT 'GLOBAL')
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bonds 
    WHERE user_id = public.get_my_id() 
    AND capacity = p_capacity 
    AND entity_id = p_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_capacity_in_school(p_capacity text, p_school_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bonds 
    WHERE user_id = public.get_my_id() 
    AND capacity = p_capacity 
    AND entity_id = p_school_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CLEANUP GHOST ARTIFACTS
-- Drop the trigger and function that synced legacy roles to profiles.
DROP TRIGGER IF EXISTS tr_user_profile_sync ON public.users;
DROP FUNCTION IF EXISTS public.handle_user_profile_sync();

-- Drop the unified view that exposed legacy roles.
DROP VIEW IF EXISTS public.unified_user_profiles CASCADE;

-- 3. REFACTOR MANUAL RLS POLICIES
-- Update Teacher Profiles RLS
DROP POLICY IF EXISTS "Users can view their own teacher profile" ON public.teacher_profiles;
CREATE POLICY "Users can view their own teacher profile" ON public.teacher_profiles 
FOR SELECT USING (
    public.get_my_id() = user_id 
    OR public.has_capacity('admin') 
    OR public.has_capacity_in_school('principal', school_id)
);

-- Update Student Profiles RLS
DROP POLICY IF EXISTS "Users can view their own student profile" ON public.student_profiles;
CREATE POLICY "Users can view their own student profile" ON public.student_profiles 
FOR SELECT USING (
    public.get_my_id() = user_id 
    OR public.has_capacity('admin')
    OR EXISTS (
        -- Principals and Teachers in the same school can see student profiles
        SELECT 1 FROM public.bonds b
        JOIN public.users u ON u.id = student_profiles.user_id
        WHERE b.user_id = public.get_my_id()
        AND b.entity_id = u.school_id::text
        AND b.capacity IN ('principal', 'teacher', 'section_head', 'grade_head')
    )
);

-- Update Student Record Access Grants RLS
DROP POLICY IF EXISTS "manage_grants" ON public.student_record_access_grants;
CREATE POLICY "manage_grants" ON public.student_record_access_grants
FOR ALL TO authenticated
USING (
    -- Original school's Principal/Admin
    EXISTS (
        SELECT 1 FROM public.users student
        WHERE student.id = student_id
          AND public.has_capacity_in_school('principal', student.school_id)
    )
    OR
    -- Guardian
    EXISTS (
        SELECT 1 FROM public.student_guardian_relationships sgr
        WHERE sgr.student_id = student_record_access_grants.student_id
          AND sgr.guardian_id = public.get_my_id()
    )
    OR
    -- Student themselves
    student_id = public.get_my_id()
    OR
    -- Platform Admin
    public.has_capacity('admin')
);

-- Update Student Longitudinal Events RLS
DROP POLICY IF EXISTS "Student longitudinal self or elevated read" ON public.student_longitudinal_events;
CREATE POLICY "Student longitudinal self or elevated read" ON public.student_longitudinal_events
FOR SELECT TO authenticated
USING (
    student_id = public.get_my_id()
    OR EXISTS (
        SELECT 1 FROM public.student_guardian_relationships sgr
        WHERE sgr.student_id = student_longitudinal_events.student_id
          AND sgr.guardian_id = public.get_my_id()
    )
    OR
    -- School-level access via Bonds
    EXISTS (
        SELECT 1 FROM public.bonds b
        WHERE b.user_id = public.get_my_id()
        AND b.entity_id = student_longitudinal_events.school_id::text
        AND b.capacity IN ('principal', 'section_head', 'grade_head', 'teacher')
    )
    OR
    -- Platform Admin
    public.has_capacity('admin')
);

-- 4. THE FINAL PURGE: DROP LEGACY COLUMNS
-- WARNING: This is destructive. Only execute after logic is migrated.
ALTER TABLE public.users 
DROP COLUMN IF EXISTS authority CASCADE,
DROP COLUMN IF EXISTS role CASCADE,
DROP COLUMN IF EXISTS school_role CASCADE,
DROP COLUMN IF EXISTS platform_roles CASCADE,
DROP COLUMN IF EXISTS work_roles CASCADE,
DROP COLUMN IF EXISTS language CASCADE,
DROP COLUMN IF EXISTS theme CASCADE,
DROP COLUMN IF EXISTS invitations_remaining CASCADE,
DROP COLUMN IF EXISTS invitations_sent CASCADE,
DROP COLUMN IF EXISTS gender CASCADE,
DROP COLUMN IF EXISTS date_of_birth CASCADE,
DROP COLUMN IF EXISTS is_thuthimal CASCADE,
DROP COLUMN IF EXISTS thuthimal_gifter CASCADE,
DROP COLUMN IF EXISTS thuthimal_gifted_at CASCADE;

COMMIT;

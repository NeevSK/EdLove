-- ============================================================================
-- Migration: 20260416183000_fix_anon_auth_trigger_circularity
-- Purpose: 
--   1. Fix 500 errors during anonymous sign-up by splitting BEFORE/AFTER triggers.
--   2. Fix 'target recording has no field school_id' crash by using resilient snapshots.
--   3. Implement Universal Student Ontology (Nullable School/Classroom context).
--   4. Automate Context Backfill upon classroom enrollment.
-- ============================================================================

BEGIN;

-- 1. UNIVERSAL STUDENT SCHEMA ALIGNMENT
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS active_classroom_id uuid REFERENCES public.classrooms(id) ON DELETE SET NULL;

-- 2. RESILIENT PROFILE SNAPSHOTTING (Fixes school_id crash)
CREATE OR REPLACE FUNCTION public.capture_user_profile_version()
RETURNS TRIGGER AS $$
DECLARE
    target_row JSONB;
BEGIN
    -- Use to_jsonb to make snapshotting immune to missing/added columns
    target_row := to_jsonb(NEW);
    
    INSERT INTO public.user_profile_versions (
        user_id,
        version_data,
        captured_at
    ) VALUES (
        NEW.id,
        target_row,
        now()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. REFACTORED PROFILE SYNCHRONIZATION (Resolves 500 Circularity)
-- Step A: Row-level defaults (BEFORE INSERT)
CREATE OR REPLACE FUNCTION public.handle_user_row_defaults() 
RETURNS trigger AS $$
BEGIN
    -- Set critical system defaults that don't depend on other tables
    IF (NEW.tier_id IS NULL) THEN
        NEW.tier_id := '8a45d2cf-0201-45d8-8ea9-e5a67fa24401';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step B: Facet initialization (AFTER INSERT)
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync_after() 
RETURNS trigger AS $$
BEGIN
    -- Initialize basic growth and preference facets (Essential for every human)
    INSERT INTO public.user_growth_state (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    INSERT INTO public.user_social_state (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

    -- Role-specific facet initialization
    -- Note: school_id sync from users is deprecated; handles directly in facets/memberships
    IF (NEW.role = 'teacher') THEN
        INSERT INTO public.teacher_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSIF (NEW.role = 'principal') THEN
        INSERT INTO public.principal_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSIF (NEW.role = 'student') THEN
        INSERT INTO public.student_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step C: Trigger wiring
DROP TRIGGER IF EXISTS tr_user_profile_sync ON public.users;
DROP TRIGGER IF EXISTS tr_user_row_defaults ON public.users;
DROP TRIGGER IF EXISTS tr_user_profile_sync_after ON public.users;

CREATE TRIGGER tr_user_row_defaults 
    BEFORE INSERT ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_row_defaults();

CREATE TRIGGER tr_user_profile_sync_after 
    AFTER INSERT OR UPDATE OF role ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_profile_sync_after();

-- 4. ENROLLMENT-DRIVEN CONTEXT BACKFILL
CREATE OR REPLACE FUNCTION public.sync_student_context_on_enrollment()
RETURNS trigger AS $$
DECLARE
    v_school_id uuid;
BEGIN
    -- Derive school_id from the classroom being joined
    SELECT school_id INTO v_school_id FROM public.classrooms WHERE id = NEW.classroom_id;
    
    -- Sync context to the student_profiles facet
    IF NEW.student_id IS NOT NULL THEN
        UPDATE public.student_profiles 
        SET 
            school_id = v_school_id, 
            active_classroom_id = NEW.classroom_id
        WHERE user_id = NEW.student_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_student_context ON public.classroom_students;
CREATE TRIGGER tr_sync_student_context 
    AFTER INSERT ON public.classroom_students 
    FOR EACH ROW EXECUTE FUNCTION public.sync_student_context_on_enrollment();

-- 5. UNIFIED VIEW UPGRADE (Hardened Ontology)
-- Maintaining Security Hardening and Lifecycle Metadata while adding Classroom Context
DROP VIEW IF EXISTS public.unified_user_profiles;
CREATE OR REPLACE VIEW public.unified_user_profiles AS
 SELECT u.id,
    u.full_name,
    u.email,
    u.role AS primary_role,
    u.authority,
    u.tier_id,
    COALESCE(m.school_id, tp.school_id, pp.school_id, sp.school_id) AS active_school_id,
    sp.active_classroom_id,
    s.name AS display_school_name,
    es.name AS official_census_name,
    COALESCE(tp.nic_number, pp.nic_number) AS nic_number,
    sp.index_number,
    tp.is_section_head,
    ugs.bhumi_stage,
    ugs.onboarding_completed,
    up.language AS preferred_language,
    up.theme AS preferred_theme,
    u.deleted_at AS user_deleted_at,
        CASE
            WHEN u.deleted_at IS NOT NULL THEN 'deleted'::text
            WHEN m.school_id IS NOT NULL THEN 'institutional'::text
            WHEN tp.id IS NOT NULL OR sp.id IS NOT NULL OR pp.id IS NOT NULL THEN 'citizen'::text
            WHEN ugs.onboarding_completed = true THEN 'traveler'::text
            ELSE 'wanderer'::text
        END AS citizenship_status
   FROM users u
     LEFT JOIN school_memberships m ON u.id = m.user_id AND m.status = 'active'::text AND m.is_primary = true AND m.deleted_at IS NULL
     LEFT JOIN schools s ON m.school_id = s.id AND s.deleted_at IS NULL
     LEFT JOIN edu_schools es ON s.census_id = es.id
     LEFT JOIN teacher_profiles tp ON u.id = tp.user_id AND tp.deleted_at IS NULL
     LEFT JOIN principal_profiles pp ON u.id = pp.user_id AND pp.deleted_at IS NULL
     LEFT JOIN student_profiles sp ON u.id = sp.user_id AND sp.deleted_at IS NULL
     LEFT JOIN user_preferences up ON u.id = up.user_id
     LEFT JOIN user_growth_state ugs ON u.id = ugs.user_id
  WHERE u.deleted_at IS NULL;

COMMIT;

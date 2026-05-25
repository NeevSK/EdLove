-- ============================================================================
-- Migration: 20260522130000_readd_user_role
-- Purpose:
--   1. Re-add the 'role' column to public.users to resolve schema drift
--      and fix "column does not exist" errors in auth triggers.
--   2. Establish the 'users_role_check' constraint.
--   3. Re-create the AFTER trigger 'tr_user_profile_sync_after' to ensure
--      role-specific profile facets (teacher_profiles, student_profiles, etc.)
--      are automatically initialized.
-- ============================================================================

BEGIN;

-- 1. ADD ROLE COLUMN AND CONSTRAINT
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (
    role IS NULL OR role = ANY (ARRAY[
      'founder'::text,
      'admin'::text,
      'principal'::text,
      'section_head'::text,
      'grade_head'::text,
      'teacher'::text,
      'student'::text,
      'member'::text,
      'guest'::text,
      'developer'::text
    ])
  );

COMMENT ON COLUMN public.users.role IS 'Legacy and compatibility role representation aligned with Cedar / ReBAC.';

-- 2. BACKFILL ROLE FOR EXISTING USERS
UPDATE public.users
SET role = COALESCE(role, CASE WHEN is_anonymous THEN 'member' ELSE 'teacher' END)
WHERE role IS NULL;

-- 3. RESTORE USER PROFILE SYNC LOGIC AND TRIGGER
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync_after() 
RETURNS trigger AS $$
BEGIN
    -- Initialize basic growth and preference facets (Essential for every user)
    INSERT INTO public.user_growth_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_social_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

    -- Role-specific facet initialization
    IF (NEW.role = 'teacher') THEN
        INSERT INTO public.teacher_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.role = 'principal') THEN
        INSERT INTO public.principal_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.role = 'student') THEN
        INSERT INTO public.student_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Wire the trigger
DROP TRIGGER IF EXISTS tr_user_profile_sync_after ON public.users;

CREATE TRIGGER tr_user_profile_sync_after 
    AFTER INSERT OR UPDATE OF role ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_profile_sync_after();

COMMIT;

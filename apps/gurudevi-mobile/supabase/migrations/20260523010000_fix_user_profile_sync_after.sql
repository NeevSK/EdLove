-- ============================================================================
-- Migration: 20260523010000_fix_user_profile_sync_after
-- Purpose:
--   Update handle_user_profile_sync_after trigger function to reference capacity
--   instead of role to resolve anonymous signup 500 crashes.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync_after() 
RETURNS trigger AS $$
BEGIN
    -- Initialize basic growth and preference facets (Essential for every human)
    INSERT INTO public.user_growth_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_social_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

    -- Capacity-specific facet initialization
    -- Note: school_id sync from users is deprecated; handles directly in facets/memberships
    IF (NEW.capacity = 'teacher') THEN
        INSERT INTO public.teacher_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.capacity = 'principal') THEN
        INSERT INTO public.principal_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.capacity = 'student') THEN
        INSERT INTO public.student_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

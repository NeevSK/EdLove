-- ============================================================================
-- Migration: 20260416100000_resilience_and_soft_deletion
-- Purpose: 
--   1. Install 'deleted_at' safety nets across all faceted tables.
--   2. Propagate soft-deletions from 'users' to facets.
--   3. Enforce CASCADE behaviors for hard deletions.
-- ============================================================================

BEGIN;

-- 1. ADD SOFT-DELETE COLUMN TO ALL FACETS
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN 
        SELECT name FROM (
            VALUES 
                ('user_preferences'), 
                ('user_growth_state'), 
                ('user_social_state'), 
                ('teacher_profiles'), 
                ('principal_profiles'), 
                ('student_profiles'),
                ('thuthimal_gifts')
        ) as t(name)
    LOOP 
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at timestamptz', t);
    END LOOP;
END $$;

-- 2. HARDEN REFERENTIAL INTEGRITY (ORPHAN MITIGATION)
-- We ensure that if a user is HARD deleted, the facets are wiped.
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey, ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_growth_state DROP CONSTRAINT IF EXISTS user_growth_state_user_id_fkey, ADD CONSTRAINT user_growth_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.teacher_profiles DROP CONSTRAINT IF EXISTS teacher_profiles_user_id_fkey, ADD CONSTRAINT teacher_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.principal_profiles DROP CONSTRAINT IF EXISTS principal_profiles_user_id_fkey, ADD CONSTRAINT principal_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey, ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. SOFT-DELETE PROPAGATION ENGINE
-- This trigger ensures that when a user is soft-deleted, all their facets are also marked.
CREATE OR REPLACE FUNCTION public.propagate_user_soft_delete() RETURNS trigger AS $$
BEGIN
    IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        UPDATE public.user_preferences SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.user_growth_state SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.user_social_state SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.teacher_profiles SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.principal_profiles SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.student_profiles SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.thuthimal_gifts SET deleted_at = NEW.deleted_at WHERE recipient_id = NEW.id;
    ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
        -- Handle Restore
        UPDATE public.user_preferences SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.user_growth_state SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.user_social_state SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.teacher_profiles SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.principal_profiles SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.student_profiles SET deleted_at = NULL WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_propagate_soft_delete ON public.users;
CREATE TRIGGER tr_propagate_soft_delete AFTER UPDATE OF deleted_at ON public.users FOR EACH ROW EXECUTE FUNCTION public.propagate_user_soft_delete();

-- 4. VIEW HARDENING (The "Living View")
-- Update the view to ONLY show non-deleted profiles by default.
CREATE OR REPLACE VIEW public.unified_user_profiles AS
SELECT 
    u.id, 
    u.full_name, 
    u.email, 
    u.role, 
    u.authority, 
    u.tier_id, 
    t.slug as tier_slug, 
    COALESCE(tp.nic_number, pp.nic_number) as nic_number, 
    sp.index_number as index_number, 
    COALESCE(tp.school_id, pp.school_id) as active_school_id, 
    tp.is_section_head, 
    ugs.bhumi_stage,
    ugs.onboarding_completed,
    ugs.profile_completed,
    up.language as preferred_language,
    up.theme as preferred_theme,
    uss.invitations_remaining,
    u.deleted_at as user_deleted_at
FROM public.users u
LEFT JOIN public.tiers t ON u.tier_id = t.id
LEFT JOIN public.teacher_profiles tp ON u.id = tp.user_id AND tp.deleted_at IS NULL
LEFT JOIN public.principal_profiles pp ON u.id = pp.user_id AND pp.deleted_at IS NULL
LEFT JOIN public.student_profiles sp ON u.id = sp.user_id AND sp.deleted_at IS NULL
LEFT JOIN public.user_preferences up ON u.id = up.user_id
LEFT JOIN public.user_growth_state ugs ON u.id = ugs.user_id
LEFT JOIN public.user_social_state uss ON u.id = uss.user_id
WHERE u.deleted_at IS NULL; -- The core identity must be alive

-- 5. AUDIT LOG INITIALIZATION (Safety Net)
-- Ensure any modification to profiles is audited if the feature exists
-- [Placeholder for future Audit Engine integration]

COMMIT;

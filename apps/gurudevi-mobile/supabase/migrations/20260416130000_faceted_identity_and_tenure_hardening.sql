-- 20260416130000_faceted_identity_and_tenure_hardening.sql
-- Focused on Closing the Truth Gap and Institutional integrity.

-- 01. Tenure Tracking Evolution
-- Evolving memberships into a historical record of professional residence.
ALTER TABLE public.school_memberships 
    ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS left_at TIMESTAMP WITH TIME ZONE;

-- 02. The Onboarding Gate Helper
-- This function will be the cornerstone of our "No Onboarding, No Access" protocol.
CREATE OR REPLACE FUNCTION public.is_onboarded(u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_growth_state 
        WHERE user_id = u_id AND onboarding_completed = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 03. Hardening RLS: The "Institutional Trust" Refactor
-- Removing reliance on 'users.role' strings and moving to profile-based school linkage.

-- Hardening Teacher Profiles: Only Principals of the SAME School can view staff.
DROP POLICY IF EXISTS "Principals can view staff profiles" ON public.teacher_profiles;
CREATE POLICY "Principals can view staff profiles" ON public.teacher_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.principal_profiles pp
            WHERE pp.user_id = auth.uid() 
              AND pp.school_id = teacher_profiles.school_id
              AND pp.deleted_at IS NULL
        )
    );

-- Hardening Classroom Access: Ensure only Onboarded professionals can list nodes.
-- We add the onboarding gate to the public visibility policy.
DROP POLICY IF EXISTS "Public library nodes are viewable by everyone" ON public.nodes;
CREATE POLICY "Public library nodes are viewable by onboarded citizens" ON public.nodes
    FOR SELECT
    TO authenticated, anon
    USING (
        (visibility = 'public'::text OR verified = true)
        AND public.is_onboarded(auth.uid())
    );

-- 04. Role Inconsistency "Auto-Healer"
-- A trigger that ensures if a specific facet is created, the users.role is synchronized.
-- This keeps legacy code compatible while we move toward full facet-loyalty.

CREATE OR REPLACE FUNCTION public.fn_sync_user_role_from_facets()
RETURNS TRIGGER AS $$
DECLARE
    v_new_role TEXT;
BEGIN
    -- Determine role based on which table triggered this
    IF TG_TABLE_NAME = 'teacher_profiles' THEN v_new_role := 'teacher';
    ELSIF TG_TABLE_NAME = 'student_profiles' THEN v_new_role := 'student';
    ELSIF TG_TABLE_NAME = 'principal_profiles' THEN v_new_role := 'principal';
    END IF;

    IF (NEW.deleted_at IS NULL) THEN
        UPDATE public.users SET role = v_new_role WHERE id = NEW.user_id AND (role IS NULL OR role = 'pending');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_role_teacher ON public.teacher_profiles;
CREATE TRIGGER tr_sync_role_teacher
    AFTER INSERT ON public.teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_user_role_from_facets();

DROP TRIGGER IF EXISTS tr_sync_role_student ON public.student_profiles;
CREATE TRIGGER tr_sync_role_student
    AFTER INSERT ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_user_role_from_facets();

DROP TRIGGER IF EXISTS tr_sync_role_principal ON public.principal_profiles;
CREATE TRIGGER tr_sync_role_principal
    AFTER INSERT ON public.principal_profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_user_role_from_facets();

-- 05. Census Sync Tracking
-- Strengthening the official data link.
ALTER TABLE public.schools 
    ADD COLUMN IF NOT EXISTS last_census_sync TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced';

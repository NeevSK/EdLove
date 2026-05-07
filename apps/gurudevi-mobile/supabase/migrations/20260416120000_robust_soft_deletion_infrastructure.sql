-- 01. Create Cleanup Infrastructure
-- Standardizing deleted_by and deletion_reason across core tables for absolute auditability.

DO $$ 
BEGIN
    -- Add columns to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.users ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.users ADD COLUMN deletion_reason TEXT;
    END IF;

    -- Add columns to schools
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.schools ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.schools ADD COLUMN deletion_reason TEXT;
    END IF;

    -- Add columns to classrooms
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classrooms' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.classrooms ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.classrooms ADD COLUMN deletion_reason TEXT;
    END IF;

    -- Add columns to profile facets
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teacher_profiles' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.teacher_profiles ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.teacher_profiles ADD COLUMN deletion_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.student_profiles ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.student_profiles ADD COLUMN deletion_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'principal_profiles' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.principal_profiles ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.principal_profiles ADD COLUMN deletion_reason TEXT;
    END IF;

    -- Add columns to memberships
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_memberships' AND column_name = 'deleted_by') THEN
        ALTER TABLE public.school_memberships ADD COLUMN deleted_by UUID REFERENCES auth.users(id);
        ALTER TABLE public.school_memberships ADD COLUMN deletion_reason TEXT;
    END IF;
END $$;

-- 02. Redefine Soft-Delete Propagation Logic
-- This ensures that when a parent is deleted, all professional and institutional facets follow.

OR REPLACE FUNCTION public.propagate_school_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        -- Cascade to classrooms
        UPDATE public.classrooms 
        SET 
            deleted_at = NEW.deleted_at,
            deleted_by = NEW.deleted_by,
            deletion_reason = 'Cascaded from school deletion: ' || COALESCE(NEW.deletion_reason, 'No reason provided')
        WHERE school_id = NEW.id AND deleted_at IS NULL;

        -- Cascade to memberships
        UPDATE public.school_memberships 
        SET 
            deleted_at = NEW.deleted_at,
            deleted_by = NEW.deleted_by,
            status = 'archived'
        WHERE school_id = NEW.id AND deleted_at IS NULL;
    
    ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
        -- Restoration logic
        UPDATE public.school_memberships 
        SET 
            deleted_at = NULL,
            deleted_by = NULL,
            status = 'active'
        WHERE school_id = NEW.id AND deleted_at = OLD.deleted_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

OR REPLACE FUNCTION public.propagate_user_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        -- Identity Facets
        UPDATE public.teacher_profiles SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by WHERE user_id = NEW.id;
        UPDATE public.principal_profiles SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by WHERE user_id = NEW.id;
        UPDATE public.student_profiles SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by WHERE user_id = NEW.id;
        
        -- State & Preferences
        UPDATE public.user_preferences SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.user_growth_state SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.user_social_state SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        
        -- Engagement
        UPDATE public.thuthimal_gifts SET deleted_at = NEW.deleted_at WHERE recipient_id = NEW.id;
        
    ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
        -- Restore Facets
        UPDATE public.teacher_profiles SET deleted_at = NULL, deleted_by = NULL WHERE user_id = NEW.id;
        UPDATE public.principal_profiles SET deleted_at = NULL, deleted_by = NULL WHERE user_id = NEW.id;
        UPDATE public.student_profiles SET deleted_at = NULL, deleted_by = NULL WHERE user_id = NEW.id;
        
        -- Restore State
        UPDATE public.user_preferences SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.user_growth_state SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.user_social_state SET deleted_at = NULL WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 03. Apply Triggers
DROP TRIGGER IF EXISTS tr_school_soft_delete ON public.schools;
CREATE TRIGGER tr_school_soft_delete
    AFTER UPDATE OF deleted_at ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.propagate_school_soft_delete();

-- Note: tr_propagate_soft_delete on users already exists, we are just updating the function.

-- 04. Unified View Refresh
-- Closing the "lying" gap by ensuring the view is clean and accounts for all facets.

OR REPLACE VIEW public.unified_user_profiles AS
 SELECT u.id,
    u.full_name,
    u.email,
    u.role AS primary_role,
    u.authority,
    u.tier_id,
    m.school_id AS active_school_id,
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
        WHEN u.deleted_at IS NOT NULL THEN 'deleted'
        WHEN m.school_id IS NOT NULL THEN 'institutional'
        WHEN tp.id IS NOT NULL OR sp.id IS NOT NULL OR pp.id IS NOT NULL THEN 'citizen'
        WHEN ugs.onboarding_completed = true THEN 'traveler'
        ELSE 'wanderer'
    END AS citizenship_status
   FROM ((((((((public.users u
     LEFT JOIN public.school_memberships m ON (((u.id = m.user_id) AND (m.status = 'active'::text) AND (m.is_primary = true) AND (m.deleted_at IS NULL)))))
     LEFT JOIN public.schools s ON ((m.school_id = s.id AND s.deleted_at IS NULL)))
     LEFT JOIN public.edu_schools es ON ((s.census_id = es.id)))
     LEFT JOIN public.teacher_profiles tp ON ((u.id = tp.user_id AND tp.deleted_at IS NULL)))
     LEFT JOIN public.principal_profiles pp ON ((u.id = pp.user_id AND pp.deleted_at IS NULL)))
     LEFT JOIN public.student_profiles sp ON ((u.id = sp.user_id AND sp.deleted_at IS NULL)))
     LEFT JOIN public.user_preferences up ON ((u.id = up.user_id)))
     LEFT JOIN public.user_growth_state ugs ON ((u.id = ugs.user_id)))
  WHERE (u.deleted_at IS NULL);

COMMENT ON VIEW public.unified_user_profiles IS 'The authoritative source for user identity, facets, and citizenship status.';

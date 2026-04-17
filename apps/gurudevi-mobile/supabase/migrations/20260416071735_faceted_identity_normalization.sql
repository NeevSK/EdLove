-- ============================================================================
-- Migration: 20260416071735_faceted_identity_normalization
-- Purpose: 
--   1. Backfill Thuthimal Gifts
--   2. Initialize Profiles
--   3. Create Profile Sync Trigger
--   4. Build Unified View for UI Bridge
-- ============================================================================

BEGIN;

-- 1. TIER STANDARDIZATION & BACKFILL
UPDATE public.users SET tier_id = '4bbc88cc-bd13-4c09-872f-6f5d0cf1e4f6' WHERE is_thuthimal = true AND tier_id IS NULL;
UPDATE public.users SET tier_id = '8a45d2cf-0201-45d8-8ea9-e5a67fa24401' WHERE tier_id IS NULL;

-- 2. THUTHIMAL GIFT LEDGER BACKFILL
INSERT INTO public.thuthimal_gifts (
    id, gift_token, gifter_id, recipient_id, gifter_name, recipient_role, claimed, claimed_at, created_at
)
SELECT 
    gen_random_uuid(), 
    gen_random_uuid(), 
    (SELECT id FROM public.users WHERE role = 'founder' LIMIT 1), 
    id, 
    COALESCE(thuthimal_gifter, 'Founder'), 
    CASE 
        WHEN role IN ('teacher', 'principal') THEN role 
        ELSE 'teacher' -- Fallback to allow 'founder' gifts in legacy
    END,
    true, 
    COALESCE(thuthimal_gifted_at, created_at), 
    COALESCE(thuthimal_gifted_at, created_at)
FROM public.users 
WHERE is_thuthimal = true 
ON CONFLICT DO NOTHING;

-- 3. FACETED PROFILE INITIALIZATION
INSERT INTO public.user_growth_state (user_id) SELECT id FROM public.users ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.student_profiles (user_id) SELECT id FROM public.users WHERE role = 'student' ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.teacher_profiles (user_id, school_id) SELECT id, school_id FROM public.users WHERE role = 'teacher' ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.principal_profiles (user_id, school_id) SELECT id, school_id FROM public.users WHERE role = 'principal' ON CONFLICT (user_id) DO NOTHING;

-- 4. PROFILE SYNCHRONIZATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync() RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_growth_state (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    IF (NEW.role = 'teacher') THEN
        INSERT INTO public.teacher_profiles (user_id, school_id) VALUES (NEW.id, NEW.school_id) ON CONFLICT (user_id) DO UPDATE SET school_id = EXCLUDED.school_id;
    ELSIF (NEW.role = 'principal') THEN
        INSERT INTO public.principal_profiles (user_id, school_id) VALUES (NEW.id, NEW.school_id) ON CONFLICT (user_id) DO UPDATE SET school_id = EXCLUDED.school_id;
    ELSIF (NEW.role = 'student') THEN
        INSERT INTO public.student_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    END IF;
    IF (NEW.role IS NOT NULL AND NEW.tier_id IS NULL) THEN
        NEW.tier_id := '8a45d2cf-0201-45d8-8ea9-e5a67fa24401';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_user_profile_sync ON public.users;
CREATE TRIGGER tr_user_profile_sync BEFORE INSERT OR UPDATE OF role, school_id ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_profile_sync();

-- 5. IDENTITY DISCOVERY VIEW
CREATE OR REPLACE VIEW public.unified_user_profiles AS
SELECT u.id, u.full_name, u.email, u.role, u.authority, u.tier_id, t.slug as tier_slug, COALESCE(tp.nic_number, pp.nic_number) as nic_number, sp.index_number as index_number, COALESCE(tp.school_id, pp.school_id) as active_school_id, tp.is_section_head, ugs.bhumi_stage
FROM public.users u
LEFT JOIN public.tiers t ON u.tier_id = t.id
LEFT JOIN public.teacher_profiles tp ON u.id = tp.user_id
LEFT JOIN public.principal_profiles pp ON u.id = pp.user_id
LEFT JOIN public.student_profiles sp ON u.id = sp.user_id
LEFT JOIN public.user_growth_state ugs ON u.id = ugs.user_id;

-- 6. SECURITY HARDENING
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thuthimal_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own teacher profile" ON public.teacher_profiles;
CREATE POLICY "Users can view their own teacher profile" ON public.teacher_profiles FOR SELECT USING (auth.uid() = user_id OR (SELECT authority FROM public.users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can view their own student profile" ON public.student_profiles;
CREATE POLICY "Users can view their own student profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id OR (SELECT authority FROM public.users WHERE id = auth.uid()) = 'admin');

COMMIT;

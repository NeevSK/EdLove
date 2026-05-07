-- ============================================================================
-- Migration: 20260416080000_surgical_identity_decoupling
-- Purpose: 
--   1. Decouple Preferences, Growth, Social, and Profile specifics from 'users'
--   2. Make legacy columns nullable to allow decommissioning
--   3. Backfill data to faceted tables
-- ============================================================================

BEGIN;

-- 1. PREPARE FACETED TABLES
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS data_saver_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS orientation_seeds jsonb;

ALTER TABLE public.user_growth_state
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

ALTER TABLE public.teacher_profiles
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS school_role text,
ADD COLUMN IF NOT EXISTS work_roles text[];

ALTER TABLE public.principal_profiles
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS school_role text,
ADD COLUMN IF NOT EXISTS work_roles text[];

CREATE TABLE IF NOT EXISTS public.user_social_state (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    invitations_remaining integer DEFAULT 5,
    invitations_sent integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. PREPARE USERS TABLE FOR DECOMMISSIONING (Make Nullable)
ALTER TABLE public.users 
ALTER COLUMN language DROP NOT NULL,
ALTER COLUMN theme DROP NOT NULL,
ALTER COLUMN onboarding_completed DROP NOT NULL,
ALTER COLUMN profile_completed DROP NOT NULL,
ALTER COLUMN invitations_remaining DROP NOT NULL,
ALTER COLUMN invitations_sent DROP NOT NULL,
ALTER COLUMN is_thuthimal DROP NOT NULL,
ALTER COLUMN data_saver_mode DROP NOT NULL;

-- 3. SURGICAL BACKFILL
UPDATE public.user_preferences up
SET 
  language = COALESCE(u.language, 'en'),
  theme = COALESCE(u.theme, 'dark'),
  data_saver_mode = COALESCE(u.data_saver_mode, false),
  orientation_seeds = u.orientation_seeds
FROM public.users u
WHERE up.user_id = u.id;

UPDATE public.user_growth_state ugs
SET 
  onboarding_completed = COALESCE(u.onboarding_completed, false),
  onboarding_completed_at = u.onboarding_completed_at,
  profile_completed = COALESCE(u.profile_completed, false)
FROM public.users u
WHERE ugs.user_id = u.id;

INSERT INTO public.user_social_state (user_id, invitations_remaining, invitations_sent)
SELECT id, COALESCE(invitations_remaining, 5), COALESCE(invitations_sent, 0)
FROM public.users
ON CONFLICT (user_id) DO UPDATE SET 
  invitations_remaining = EXCLUDED.invitations_remaining,
  invitations_sent = EXCLUDED.invitations_sent;

UPDATE public.teacher_profiles tp
SET 
  gender = u.gender,
  date_of_birth = u.date_of_birth,
  school_role = u.school_role,
  work_roles = u.work_roles
FROM public.users u
WHERE tp.user_id = u.id;

UPDATE public.principal_profiles pp
SET 
  gender = u.gender,
  date_of_birth = u.date_of_birth,
  school_role = u.school_role,
  work_roles = u.work_roles
FROM public.users u
WHERE pp.user_id = u.id;

-- 4. IDENTITY VIEW UPGRADE
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
    uss.invitations_remaining
FROM public.users u
LEFT JOIN public.tiers t ON u.tier_id = t.id
LEFT JOIN public.teacher_profiles tp ON u.id = tp.user_id
LEFT JOIN public.principal_profiles pp ON u.id = pp.user_id
LEFT JOIN public.student_profiles sp ON u.id = sp.user_id
LEFT JOIN public.user_preferences up ON u.id = up.user_id
LEFT JOIN public.user_growth_state ugs ON u.id = ugs.user_id
LEFT JOIN public.user_social_state uss ON u.id = uss.user_id;

-- 5. SECURITY
ALTER TABLE public.user_social_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own social state" ON public.user_social_state;
CREATE POLICY "Users can view their own social state" ON public.user_social_state FOR SELECT USING (auth.uid() = user_id);

-- 6. THE SURGICAL DECOMMISSIONING
UPDATE public.users 
SET 
  language = NULL,
  theme = NULL,
  data_saver_mode = NULL,
  orientation_seeds = NULL,
  onboarding_completed = NULL,
  onboarding_completed_at = NULL,
  profile_completed = NULL,
  invitations_remaining = NULL,
  invitations_sent = NULL,
  gender = NULL,
  date_of_birth = NULL,
  school_role = NULL,
  work_roles = NULL,
  is_thuthimal = NULL,
  thuthimal_gifter = NULL,
  thuthimal_gifted_at = NULL;

COMMIT;

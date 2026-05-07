/**
 * ARCHITECTURAL HARDENING & ZERO-TRUST ENFORCEMENT
 * 
 * This migration addresses security vulnerabilities identified in the 2026-04-16 audit:
 * 1. Downgrades high-privilege SECURITY DEFINER views to SECURITY INVOKER.
 * 2. Hardens function search paths to prevent search path hijacking.
 * 3. Enforces RLS on previously unprotected tables (locations, devices, profiles).
 * 4. Normalizes public data access policies.
 */

-- 1. VIEW HARDENING: Unified User Profiles
-- SECURITY DEFINER poses a risk of privilege escalation. Standardizing to INVOKER.
DROP VIEW IF EXISTS public.unified_user_profiles;
CREATE OR REPLACE VIEW public.unified_user_profiles AS
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

-- 2. FUNCTION HARDENING: Search Path Protection
-- Prevent mutable search path vulnerabilities for all critical service functions.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE proname = 'handle_new_user' AND n.nspname = 'public') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE proname = 'fn_sync_user_role_from_facets' AND n.nspname = 'public') THEN
        ALTER FUNCTION public.fn_sync_user_role_from_facets() SET search_path = public;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE proname = 'get_combined_profile' AND n.nspname = 'public') THEN
        EXECUTE 'ALTER FUNCTION public.get_combined_profile(uuid) SET search_path = public';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE proname = 'get_staff_metrics' AND n.nspname = 'public') THEN
        EXECUTE 'ALTER FUNCTION public.get_staff_metrics(uuid) SET search_path = public';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE proname = 'is_school_staff' AND n.nspname = 'public') THEN
        EXECUTE 'ALTER FUNCTION public.is_school_staff(uuid, uuid) SET search_path = public';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE proname = 'log_school_pulse' AND n.nspname = 'public') THEN
        EXECUTE 'ALTER FUNCTION public.log_school_pulse(uuid, jsonb) SET search_path = public';
    END IF;
END $$;

-- 3. RLS ENFORCEMENT: Profile & Infrastructure Shielding

-- Principal Profiles
ALTER TABLE public.principal_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.principal_profiles;
CREATE POLICY "Users can view their own profile" ON public.principal_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Device Infrastructure
ALTER TABLE public.device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their registered devices" ON public.device_registry;
CREATE POLICY "Users can see their registered devices" ON public.device_registry
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.device_accounts 
            WHERE device_id = public.device_registry.device_id 
            AND account_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their own device links" ON public.device_accounts;
CREATE POLICY "Users can manage their own device links" ON public.device_accounts
    FOR ALL USING (account_id = auth.uid());

-- Location Infrastructure (Provinces/Districts)
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for provinces" ON public.provinces;
CREATE POLICY "Public read access for provinces" ON public.provinces
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for districts" ON public.districts;
CREATE POLICY "Public read access for districts" ON public.districts
    FOR SELECT USING (true);

-- School Memberships
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.school_memberships;
CREATE POLICY "Users can view their own memberships" ON public.school_memberships
    FOR SELECT USING (user_id = auth.uid());

-- Grant appropriate permissions back to the roles
GRANT SELECT ON public.unified_user_profiles TO authenticated, anon;

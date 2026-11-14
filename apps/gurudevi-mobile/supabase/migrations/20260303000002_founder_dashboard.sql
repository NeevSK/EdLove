-- ============================================================
-- Founder & Admin Global Access (RBAC Refinement)
-- Enabling cross-school management and ecosystem aggregation.
-- ============================================================

-- 1. Ecosystem Stats RPC
-- Aggregates data across the entire platform for Founders/Admins.
CREATE OR REPLACE FUNCTION public.get_ecosystem_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check if caller is Founder or Admin (Strict check)
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('founder', 'admin', 'developer')
    ) THEN
        RAISE EXCEPTION 'Access Denied: Founder privileges required.';
    END IF;

    SELECT jsonb_build_object(
        'total_schools', (SELECT count(*) FROM public.schools),
        'total_users', (SELECT count(*) FROM public.users),
        'total_students', (SELECT count(*) FROM public.users WHERE role = 'student'),
        'total_teachers', (SELECT count(*) FROM public.users WHERE role = 'teacher'),
        'total_classrooms', (SELECT count(*) FROM public.classrooms),
        'active_communities', (SELECT count(*) FROM public.communities),
        'ecosystem_health', 98 -- Placeholder for future health metrics
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. RLS Refinement for Founders/Admins
-- Founders and Admins should see ALL data in key tables.

-- Schools: Global CRUD visibility
DROP POLICY IF EXISTS "Founders can view all schools" ON public.schools;
DROP POLICY IF EXISTS "Founders can manage all schools" ON public.schools;
CREATE POLICY "Founders can manage all schools"
    ON public.schools FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('founder', 'admin', 'developer')
        )
    );

-- Users: Global visibility
DROP POLICY IF EXISTS "Founders can view all users" ON public.users;
DROP POLICY IF EXISTS "Founders can manage all users" ON public.users;
CREATE POLICY "Founders can manage all users"
    ON public.users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users AS requesting_user
            WHERE requesting_user.id = auth.uid()
            AND requesting_user.role IN ('founder', 'admin', 'developer')
        )
    );

-- Classrooms: Global CRUD visibility
DROP POLICY IF EXISTS "Founders can view all classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Founders can manage all classrooms" ON public.classrooms;
CREATE POLICY "Founders can manage all classrooms"
    ON public.classrooms FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('founder', 'admin', 'developer')
        )
    );

-- Communities: Global CRUD visibility
-- Some historical baselines did not include this abandoned table. Preserve
-- the policy when it exists rather than making a fresh replay depend on it.
DO $$
BEGIN
  IF to_regclass('public.communities') IS NOT NULL THEN
    ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Founders can manage all communities" ON public.communities;
    CREATE POLICY "Founders can manage all communities"
      ON public.communities FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid()
            AND role IN ('founder', 'admin', 'developer')
        )
      );
  END IF;
END;
$$;

-- 3. Grant founder role to specific users (If requested, but here we just ensure the RBAC check works)
-- Note: Roles are managed in public.users via the UI or direct DB edits.

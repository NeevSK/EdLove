-- ========================================================
-- Migration: 20260503235959_create_bonds_table
-- Purpose: 
--   1. Create the core ReBAC 'bonds' table
--   2. Establish the base ReBAC helpers (has_capacity)
-- ========================================================

BEGIN;

-- 1. CREATE BONDS TABLE
CREATE TABLE IF NOT EXISTS public.bonds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    entity_id TEXT NOT NULL,   -- 'GLOBAL' for platform, or specific School/Classroom UUID as text
    entity_type TEXT NOT NULL, -- 'PLATFORM', 'SCHOOL', 'CLASSROOM', 'COMMUNITY'
    capacity TEXT NOT NULL,    -- 'admin', 'teacher', 'student', etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for fast ReBAC resolution
CREATE INDEX IF NOT EXISTS idx_bonds_user_id ON public.bonds(user_id);
CREATE INDEX IF NOT EXISTS idx_bonds_entity_id ON public.bonds(entity_id);
CREATE INDEX IF NOT EXISTS idx_bonds_composite ON public.bonds(user_id, entity_type, capacity);

-- 2. CREATE REBAC HELPERS
-- These functions allow manual RLS policies to check the bonds table efficiently.
CREATE OR REPLACE FUNCTION public.has_capacity(p_capacity text, p_entity_id text DEFAULT 'GLOBAL')
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bonds 
    WHERE user_id = public.get_my_id() 
    AND capacity = p_capacity 
    AND entity_id = p_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_capacity_in_school(p_capacity text, p_school_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bonds 
    WHERE user_id = public.get_my_id() 
    AND capacity = p_capacity 
    AND entity_id = p_school_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. ENABLE RLS
ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;

-- Everyone can see their own bonds
DROP POLICY IF EXISTS "Users can view their own bonds" ON public.bonds;
CREATE POLICY "Users can view their own bonds" 
ON public.bonds FOR SELECT 
USING (public.get_my_id() = user_id);

-- Users can insert their own bonds (onboarding/bootstrap path)
DROP POLICY IF EXISTS "Users can insert their own bonds" ON public.bonds;
CREATE POLICY "Users can insert their own bonds"
ON public.bonds FOR INSERT
WITH CHECK (public.get_my_id() = user_id);

-- Admins can do everything (ReBAC recursion starts here)
DROP POLICY IF EXISTS "Platform admins can manage all bonds" ON public.bonds;
CREATE POLICY "Platform admins can manage all bonds" 
ON public.bonds FOR ALL 
USING (
    public.has_capacity('admin', 'GLOBAL')
);

-- 4. GRANT ACCESS
GRANT ALL ON public.bonds TO authenticated;
GRANT ALL ON public.bonds TO service_role;

COMMIT;

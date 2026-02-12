-- ============================================
-- GURUDEVI INVITE SYSTEM - IMPROVED VERSION
-- Incorporates GPT recommendations + full features
-- ============================================

-- 1. INVITE CODES TABLE
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_school ON public.invite_codes(school_id);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can SELECT active codes (for validation during signup)
CREATE POLICY invite_codes_select_active
  ON public.invite_codes 
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Policy 2: Principals can INSERT codes for their school
CREATE POLICY invite_codes_insert_principal
  ON public.invite_codes 
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );

-- Policy 3: Creators can UPDATE their codes
CREATE POLICY invite_codes_update_own
  ON public.invite_codes 
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Policy 4: Principals can DELETE their school's codes
CREATE POLICY invite_codes_delete_principal
  ON public.invite_codes 
  FOR DELETE
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );

-- 2. PROFILE COMPLETION TABLE
CREATE TABLE IF NOT EXISTS public.profile_completion (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  completion_percentage INTEGER DEFAULT 30,
  has_phone BOOLEAN DEFAULT false,
  has_avatar BOOLEAN DEFAULT false,
  has_bio BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profile_completion ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can SELECT their own completion
CREATE POLICY profile_completion_select_own
  ON public.profile_completion 
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can INSERT their own completion
CREATE POLICY profile_completion_insert_own
  ON public.profile_completion 
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can UPDATE their own completion
CREATE POLICY profile_completion_update_own
  ON public.profile_completion 
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

--  COMPLETE WITH ALL POLICIES!

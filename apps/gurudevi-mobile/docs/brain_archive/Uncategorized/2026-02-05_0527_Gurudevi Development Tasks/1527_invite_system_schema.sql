-- GURUDEVI INVITE SYSTEM SCHEMA
-- Run this in Supabase SQL Editor after minimal_schema.sql

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
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY 'Anyone can view active codes'
  ON public.invite_codes FOR SELECT
  USING (is_active = true);

-- Profile completion table
CREATE TABLE IF NOT EXISTS public.profile_completion (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  completion_percentage INTEGER DEFAULT 30,
  has_phone BOOLEAN DEFAULT false,
  has_avatar BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profile_completion ENABLE ROW LEVEL SECURITY;
CREATE POLICY 'Users view own completion'
  ON public.profile_completion FOR SELECT
  USING (user_id = auth.uid());

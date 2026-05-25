-- ============================================================================
-- Migration: 20260523000000_personal_classrooms
-- Purpose:
--   1. Create public.personal_classrooms table to support school-less onboarding.
--   2. Setup index on user_id for optimal relationship querying.
--   3. Setup update_updated_at_column trigger for modified time tracking.
--   4. Enable RLS and establish owner-only policy.
-- ============================================================================

BEGIN;

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS public.personal_classrooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT personal_classrooms_pkey PRIMARY KEY (id),
  CONSTRAINT personal_classrooms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT personal_classrooms_type_check CHECK (type = ANY (ARRAY['teacher_classroom'::text, 'student_classroom'::text, 'unrelated_classroom'::text, 'undefined'::text]))
);

-- 2. CREATE INDEX
CREATE INDEX IF NOT EXISTS personal_classrooms_user_id_idx ON public.personal_classrooms (user_id);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.personal_classrooms ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
DROP POLICY IF EXISTS personal_classrooms_owner_access ON public.personal_classrooms;
CREATE POLICY personal_classrooms_owner_access ON public.personal_classrooms
  FOR ALL USING (auth.uid() = user_id);

-- 5. SETUP TRIGGER FOR UPDATED_AT
DROP TRIGGER IF EXISTS set_updated_at ON public.personal_classrooms;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.personal_classrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

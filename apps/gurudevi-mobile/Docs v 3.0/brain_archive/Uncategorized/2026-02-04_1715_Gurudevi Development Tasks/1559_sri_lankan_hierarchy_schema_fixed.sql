-- ============================================
-- SRI LANKAN HIERARCHY - IMPROVED VERSION
-- Fixed policy names (no spaces/quotes needed)
-- ============================================

-- 1. UPDATE SCHOOLS TABLE - Add SL School Types
ALTER TABLE IF EXISTS public.schools DROP CONSTRAINT IF EXISTS schools_type_check;

ALTER TABLE public.schools ADD CONSTRAINT schools_type_check 
  CHECK (type IN (
    '1AB', '1C', 'Type_2', 'Type_3',
    'semi_government', 'private', 'international', 'pirivena',
    'personal_workspace'
  ));

-- 2. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  grade_range TEXT,
  section_head_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sections_school ON public.sections(school_id);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users view sections in their school
CREATE POLICY sections_select_school
  ON public.sections 
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- 3. GRADES TABLE
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  grade_number INTEGER CHECK (grade_number >= 1 AND grade_number <= 13),
  grade_head_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, grade_number)
);

CREATE INDEX IF NOT EXISTS idx_grades_school ON public.grades(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_section ON public.grades(section_id);

-- Enable RLS
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Policy: Users view grades in their school
CREATE POLICY grades_select_school
  ON public.grades 
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- 4. UPDATE USERS TABLE - Add New Roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('principal', 'section_head', 'grade_head', 'teacher', 'student'));

-- Add section and grade references
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_section ON public.users(section_id);
CREATE INDEX IF NOT EXISTS idx_users_grade ON public.users(grade_id);

--  SRI LANKAN HIERARCHY COMPLETE!

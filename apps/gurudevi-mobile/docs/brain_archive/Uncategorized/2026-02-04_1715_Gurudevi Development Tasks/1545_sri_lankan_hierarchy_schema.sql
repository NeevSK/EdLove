-- ============================================
-- SRI LANKAN SCHOOL HIERARCHY SCHEMA
-- ============================================
-- Adds: Proper school types, sections, grades
-- Run AFTER minimal_schema.sql
-- ============================================

-- --------------------------------------------
-- 1. Update Schools Table - Add SL School Types
-- --------------------------------------------

-- Drop old constraint if exists
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_type_check;

-- Add new constraint with Sri Lankan school types
ALTER TABLE public.schools ADD CONSTRAINT schools_type_check 
  CHECK (type IN (
    -- Government Schools
    '1AB',           -- National Schools (best facilities)
    '1C',            -- Provincial Schools  
    'Type_2',        -- Up to O/L
    'Type_3',        -- Primary only
    -- Other Schools
    'semi_government',
    'private',
    'international',
    'pirivena',      -- Buddhist education
    -- Special
    'personal_workspace'  -- For solo teachers
  ));

COMMENT ON COLUMN public.schools.type IS 'Sri Lankan school classification: 1AB (National), 1C (Provincial), Type_2 (O/L), Type_3 (Primary), semi_government, private, international, pirivena, personal_workspace';

-- --------------------------------------------
-- 2. Sections Table (Primary, Junior, Senior)
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- e.g., 'Primary', 'Junior Secondary', 'Senior Secondary'
  name_si TEXT,       -- Sinhala: 'පරථමක', 'කනෂඨ', 'ජයෂඨ'
  name_ta TEXT,       -- Tamil translations
  
  grade_range TEXT,   -- e.g., '1-5', '6-9', '10-13'
  section_head_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(school_id, name)
);

CREATE INDEX idx_sections_school ON public.sections(school_id);
CREATE INDEX idx_sections_head ON public.sections(section_head_id);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- RLS: View sections in your school
CREATE POLICY "Users view school sections"
  ON public.sections FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

COMMENT ON TABLE public.sections IS 'School sections: Primary (1-5), Junior (6-9), Senior (10-13)';

-- --------------------------------------------
-- 3. Grades Table (1-13)
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  
  grade_number INTEGER CHECK (grade_number >= 1 AND grade_number <= 13),
  grade_head_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(school_id, grade_number)
);

CREATE INDEX idx_grades_school ON public.grades(school_id);
CREATE INDEX idx_grades_section ON public.grades(section_id);
CREATE INDEX idx_grades_head ON public.grades(grade_head_id);

-- Enable RLS
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- RLS: View grades in your school
CREATE POLICY "Users view school grades"
  ON public.grades FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

COMMENT ON TABLE public.grades IS 'Grade levels (1-13) with optional grade heads';

-- --------------------------------------------
-- 4. Update Users Table - Add New Roles
-- --------------------------------------------

-- Drop old role constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN (
    'principal',
    'section_head',    -- NEW: Head of section (Primary/Junior/Senior)
    'grade_head',      -- NEW: Head of specific grade
    'teacher',
    'student'
  ));

-- Add section and grade references
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_section ON public.users(section_id);
CREATE INDEX IF NOT EXISTS idx_users_grade ON public.users(grade_id);

COMMENT ON COLUMN public.users.section_id IS 'For section_head role - which section they manage';
COMMENT ON COLUMN public.users.grade_id IS 'For grade_head role - which grade they manage';

-- --------------------------------------------
-- 5. Update Classrooms (if table exists)
-- --------------------------------------------

-- Link classrooms to grades
ALTER TABLE IF EXISTS public.classrooms 
  ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_classrooms_grade ON public.classrooms(grade_id);

--  SRI LANKAN HIERARCHY SETUP COMPLETE!

-- ============================================
-- CLASSROOMS TABLE SCHEMA
-- ============================================
-- Creates the classrooms table for the Gurudevi app
-- Run this if the table doesn't exist yet
-- ============================================

-- Create classrooms table
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT classrooms_name_school_unique UNIQUE(school_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classrooms_school ON public.classrooms(school_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_grade ON public.classrooms(grade_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view classrooms in their school
CREATE POLICY "Users view school classrooms"
  ON public.classrooms FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- RLS Policy: Teachers can create classrooms
CREATE POLICY "Teachers create classrooms"
  ON public.classrooms FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'principal')
    )
  );

-- RLS Policy: Teachers can update their own classrooms
CREATE POLICY "Teachers update own classrooms"
  ON public.classrooms FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- RLS Policy: Principals can update any classroom in their school
CREATE POLICY "Principals update school classrooms"
  ON public.classrooms FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );

-- RLS Policy: Teachers and principals can delete classrooms
CREATE POLICY "Teachers delete own classrooms"
  ON public.classrooms FOR DELETE
  USING (
    teacher_id = auth.uid() OR
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.classrooms IS 'Classrooms in schools, linked to teachers and grades';

-- ============================================
-- CLASSROOM_STUDENTS LINKING TABLE
-- ============================================
-- Links students to classrooms for enrollment

CREATE TABLE IF NOT EXISTS public.classroom_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  roll_number INTEGER,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT classroom_students_unique UNIQUE(classroom_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classroom_students_classroom ON public.classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_students_student ON public.classroom_students(student_id);

-- Enable RLS
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can view their own enrollments
CREATE POLICY "Students view own enrollments"
  ON public.classroom_students FOR SELECT
  USING (student_id = auth.uid());

-- RLS Policy: Teachers can view enrollments in their classrooms
CREATE POLICY "Teachers view classroom enrollments"
  ON public.classroom_students FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can add students to their classrooms
CREATE POLICY "Teachers add students to classrooms"
  ON public.classroom_students FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policy: Teachers can remove students from their classrooms
CREATE POLICY "Teachers remove students from classrooms"
  ON public.classroom_students FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

COMMENT ON TABLE public.classroom_students IS 'Links students to classrooms for enrollment tracking';

-- ✅ CLASSROOMS SCHEMA COMPLETE!

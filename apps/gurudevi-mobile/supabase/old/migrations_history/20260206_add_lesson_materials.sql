-- ============================================
-- LESSON MATERIALS & MONTHLY GROUPING
-- ============================================

-- 1. Create Lesson Materials Table (Academic Content)
CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE, -- Link to the "Month" Lesson
  
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf', 'link', 'note')) NOT NULL,
  url TEXT, -- For PDF or External Link
  content TEXT, -- For Note type
  
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_materials_class ON public.lesson_materials(classroom_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON public.lesson_materials(lesson_id);

-- Enable RLS
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their lesson materials
CREATE POLICY "Teachers manage lesson materials"
  ON public.lesson_materials FOR ALL TO authenticated
  USING (
    classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid())
  );

-- Everyone with class access can see materials
CREATE POLICY "Users view lesson materials"
  ON public.lesson_materials FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
      UNION
      SELECT classroom_id FROM public.classroom_students WHERE student_id = auth.uid()
    )
  );

-- 2. Update Lessons Table for custom ordering
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Update Assignments Table to support monthly grouping
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON public.assignments(lesson_id);

COMMENT ON TABLE public.lesson_materials IS 'Academic materials (PDF, Link, Note) grouped under Monthly Lessons';

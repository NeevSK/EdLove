-- ============================================
-- GURUDEVI FEATURES SCHEMA (v0.1)
-- Covers: Self, Classroom, Community
-- Dependencies: minimal_schema.sql, sri_lankan_hierarchy_schema.sql
-- ============================================

-- --------------------------------------------
-- 1. CLASSROOM MANAGEMENT
-- --------------------------------------------

-- 1.1 Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Primary teacher
  
  -- Hierarchy Links (Optional - flexible for solo teachers)
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL, -- e.g. "Grade 10-A Science"
  subject TEXT,
  description TEXT,
  color_theme TEXT DEFAULT 'blue', -- For UI customization
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_archived BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_classrooms_school ON public.classrooms(school_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- RLS: Principals see all school classrooms
CREATE POLICY classrooms_select_principal
  ON public.classrooms FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );

-- RLS: Teachers manage their own classrooms
CREATE POLICY classrooms_all_teacher
  ON public.classrooms FOR ALL TO authenticated
  USING (teacher_id = auth.uid());

-- 1.2 Classroom Students (Enrollment)
CREATE TABLE IF NOT EXISTS public.classroom_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_students_user ON public.classroom_students(student_id);

ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- RLS: Students see their own enrollments
CREATE POLICY enrollment_select_student
  ON public.classroom_students FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- RLS: Teachers see students in their classes
CREATE POLICY enrollment_select_teacher
  ON public.classroom_students FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
    )
  );

-- RLS: Students can see classrooms they are enrolled in
CREATE POLICY classrooms_select_student
  ON public.classrooms FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT classroom_id FROM public.classroom_students WHERE student_id = auth.uid()
    )
  );

-- --------------------------------------------
-- 2. LEARNING CONTENT
-- --------------------------------------------

-- 2.1 Lessons (Container for content)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- Rich text description
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_classroom ON public.lessons(classroom_id);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- RLS: Visible to anyone with access to the classroom
CREATE POLICY lessons_select_access
  ON public.lessons FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      -- As Teacher
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
      UNION
      -- As Student
      SELECT classroom_id FROM public.classroom_students WHERE student_id = auth.uid()
      UNION
      -- As Principal
      SELECT id FROM public.classrooms WHERE school_id IN (
        SELECT school_id FROM public.users WHERE id = auth.uid() AND role = 'principal'
      )
    )
  );

-- RLS: Teachers manage lessons
CREATE POLICY lessons_modify_teacher
  ON public.lessons FOR ALL TO authenticated
  USING (
    classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid())
  );

-- 2.2 Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- RLS: Same read rules as lessons
CREATE POLICY assignments_select_access
  ON public.assignments FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
      UNION
      SELECT classroom_id FROM public.classroom_students WHERE student_id = auth.uid()
      UNION
      SELECT id FROM public.classrooms WHERE school_id IN (
        SELECT school_id FROM public.users WHERE id = auth.uid() AND role = 'principal'
      )
    )
  );

-- RLS: Teachers manage assignments
CREATE POLICY assignments_modify_teacher
  ON public.assignments FOR ALL TO authenticated
  USING (
    classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid())
  );

-- 2.3 Submissions (Student work)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT, -- Text answer or file URL
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grade INTEGER,
  feedback TEXT,
  
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS: Students manage own submissions
CREATE POLICY submissions_all_student
  ON public.submissions FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- RLS: Teachers view/grade submissions for their assignments
CREATE POLICY submissions_teacher_access
  ON public.submissions FOR ALL TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM public.assignments WHERE classroom_id IN (
        SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
      )
    )
  );

-- --------------------------------------------
-- 3. SELF (WELLBEING)
-- --------------------------------------------

-- 3.1 Mood Logs
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
  note TEXT, -- Optional journal entry
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS: STRICTLY PRIVATE - Only the user sees their mood
CREATE POLICY mood_logs_privacy
  ON public.mood_logs FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 3.2 Fire Journal (Venting)
CREATE TABLE IF NOT EXISTS public.fire_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_preview TEXT, -- Only first few words if kept
  is_burned BOOLEAN DEFAULT false,
  burned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.fire_journal ENABLE ROW LEVEL SECURITY;

-- RLS: STRICTLY PRIVATE
CREATE POLICY fire_journal_privacy
  ON public.fire_journal FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- --------------------------------------------
-- 4. COMMUNITY 
-- --------------------------------------------

-- 4.1 Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone in school can read
CREATE POLICY announcements_read_school
  ON public.announcements FOR SELECT TO authenticated
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- RLS: Principals can manage
CREATE POLICY announcements_manage_principal
  ON public.announcements FOR ALL TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );

-- ✅ FEATURES SCHEMA COMPLETE!

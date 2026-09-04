-- Academic lifecycle foundation (additive only).
--
-- This migration deliberately creates new tables instead of renaming, dropping,
-- or reinterpreting legacy classrooms, grade_levels, student_grades, marks, or
-- attendance tables. It is safe to review and apply independently of the
-- eventual demo-data reset.
--
-- Eventual reset/drop plan (NOT performed here): after consumers are migrated,
-- snapshot/clear demo rows, backfill or recreate approved lifecycle rows, cut
-- consumers over, and only then use a separate reviewed migration to retire
-- legacy tables. No legacy table is modified by this migration.

BEGIN;

CREATE TABLE IF NOT EXISTS public.academic_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'completed', 'archived')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_cycles_dates_check CHECK (ends_at > starts_at),
  CONSTRAINT academic_cycles_school_name_key UNIQUE (school_id, name)
);

-- The linked project already has a legacy academic_cycles table using
-- start_date/end_date/is_current. Reconcile it in place without dropping or
-- renaming existing columns/data, then expose the authoritative lifecycle
-- columns used by the new contract.
ALTER TABLE public.academic_cycles
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE public.academic_cycles
SET starts_at = COALESCE(starts_at, start_date::timestamptz),
    ends_at = COALESCE(ends_at, end_date::timestamptz),
    status = COALESCE(status, CASE WHEN is_current IS TRUE THEN 'active' ELSE 'planned' END),
    updated_at = COALESCE(updated_at, created_at)
WHERE starts_at IS NULL OR ends_at IS NULL OR status IS NULL OR updated_at IS NULL;

ALTER TABLE public.academic_cycles
  ALTER COLUMN starts_at SET NOT NULL,
  ALTER COLUMN ends_at SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'planned',
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'academic_cycles_lifecycle_status_check'
  ) THEN
    ALTER TABLE public.academic_cycles
      ADD CONSTRAINT academic_cycles_lifecycle_status_check
        CHECK (status IN ('planned', 'active', 'completed', 'archived'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS academic_cycles_school_name_lifecycle_key
  ON public.academic_cycles (school_id, name);

CREATE TABLE IF NOT EXISTS public.academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  name TEXT NOT NULL,
  term_kind TEXT NOT NULL DEFAULT 'term'
    CHECK (term_kind IN ('term', 'semester')),
  sequence INTEGER NOT NULL CHECK (sequence > 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_terms_dates_check CHECK (ends_at > starts_at),
  CONSTRAINT academic_terms_cycle_sequence_key UNIQUE (academic_cycle_id, sequence),
  CONSTRAINT academic_terms_cycle_name_key UNIQUE (academic_cycle_id, name)
);

CREATE TABLE IF NOT EXISTS public.academic_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_subjects_school_code_key UNIQUE (school_id, code)
);

CREATE TABLE IF NOT EXISTS public.academic_grade_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  grade_number INTEGER NOT NULL CHECK (grade_number BETWEEN 1 AND 13),
  label TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_grade_levels_section_grade_key UNIQUE (section_id, grade_number)
);

CREATE TABLE IF NOT EXISTS public.academic_cycle_leadership_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  assignee_id UUID NOT NULL REFERENCES public.users(id),
  role TEXT NOT NULL CHECK (role IN ('principal', 'section_head', 'grade_head')),
  section_id UUID REFERENCES public.sections(id),
  grade_level_id UUID REFERENCES public.academic_grade_levels(id),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'ended')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT academic_cycle_leadership_dates_check
    CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT academic_cycle_leadership_scope_check CHECK (
    (role = 'principal' AND section_id IS NULL AND grade_level_id IS NULL)
    OR (role = 'section_head' AND section_id IS NOT NULL AND grade_level_id IS NULL)
    OR (role = 'grade_head' AND section_id IS NULL AND grade_level_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.grade_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  grade_level_id UUID NOT NULL REFERENCES public.academic_grade_levels(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT grade_classes_cycle_level_name_key UNIQUE (academic_cycle_id, grade_level_id, name)
);

CREATE TABLE IF NOT EXISTS public.grade_class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_class_id UUID NOT NULL REFERENCES public.grade_classes(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  subject_id UUID NOT NULL REFERENCES public.academic_subjects(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT grade_class_subjects_class_term_subject_key
    UNIQUE (grade_class_id, term_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.grade_class_teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_class_id UUID NOT NULL REFERENCES public.grade_classes(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  teacher_id UUID NOT NULL REFERENCES public.users(id),
  subject_id UUID REFERENCES public.academic_subjects(id),
  role TEXT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'ended')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT grade_class_teacher_assignment_dates_check
    CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT grade_class_teacher_assignment_role_check CHECK (length(trim(role)) > 0)
);

CREATE TABLE IF NOT EXISTS public.student_grade_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  grade_class_id UUID NOT NULL REFERENCES public.grade_classes(id),
  student_id UUID NOT NULL REFERENCES public.users(id),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'withdrawn')),
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT student_grade_class_enrollment_dates_check
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  grade_class_id UUID NOT NULL REFERENCES public.grade_classes(id),
  student_id UUID NOT NULL REFERENCES public.users(id),
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  note TEXT,
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT daily_attendance_student_class_date_key
    UNIQUE (student_id, grade_class_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_attendance_id UUID NOT NULL REFERENCES public.daily_attendance(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  grade_class_id UUID NOT NULL REFERENCES public.grade_classes(id),
  term_id UUID REFERENCES public.academic_terms(id),
  student_id UUID NOT NULL REFERENCES public.users(id),
  teacher_id UUID REFERENCES public.users(id),
  subject_id UUID REFERENCES public.academic_subjects(id),
  session_kind TEXT NOT NULL CHECK (session_kind IN ('lesson', 'arrival', 'departure')),
  session_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT attendance_sessions_lesson_teacher_check CHECK (
    session_kind <> 'lesson' OR teacher_id IS NOT NULL
  ),
  CONSTRAINT attendance_sessions_lesson_subject_check CHECK (
    session_kind <> 'lesson' OR subject_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.teacher_daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  teacher_id UUID NOT NULL REFERENCES public.users(id),
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'on_leave')),
  note TEXT,
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT teacher_daily_attendance_teacher_date_key UNIQUE (teacher_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.teacher_attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_daily_attendance_id UUID NOT NULL REFERENCES public.teacher_daily_attendance(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  grade_class_id UUID REFERENCES public.grade_classes(id),
  term_id UUID REFERENCES public.academic_terms(id),
  teacher_id UUID NOT NULL REFERENCES public.users(id),
  subject_id UUID REFERENCES public.academic_subjects(id),
  session_kind TEXT NOT NULL CHECK (session_kind IN ('lesson', 'arrival', 'departure')),
  session_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grade_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  academic_cycle_id UUID NOT NULL REFERENCES public.academic_cycles(id),
  grade_class_id UUID NOT NULL REFERENCES public.grade_classes(id),
  term_id UUID NOT NULL REFERENCES public.academic_terms(id),
  subject_id UUID NOT NULL REFERENCES public.academic_subjects(id),
  student_id UUID NOT NULL REFERENCES public.users(id),
  assignment_id UUID,
  submission_id UUID,
  marks_earned DOUBLE PRECISION NOT NULL CHECK (marks_earned >= 0),
  max_points DOUBLE PRECISION NOT NULL CHECK (max_points > 0),
  percentage DOUBLE PRECISION NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  gpa DOUBLE PRECISION NOT NULL CHECK (gpa BETWEEN 0 AND 5),
  letter_grade TEXT NOT NULL CHECK (letter_grade ~ '^[A-Z]+$'),
  publication_state TEXT NOT NULL DEFAULT 'draft'
    CHECK (publication_state IN ('draft', 'published')),
  graded_by UUID NOT NULL REFERENCES public.users(id),
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES public.users(id),
  published_at TIMESTAMPTZ,
  feedback TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT grade_marks_earned_max_check CHECK (marks_earned <= max_points)
);

-- Scope constraints that can be enforced without changing legacy tables.
-- Cross-table cycle/level/subject/term alignment that depends on multiple
-- rows remains a service-level validation gap and must be checked by writes.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'academic_cycles_id_school_key') THEN
    ALTER TABLE public.academic_cycles ADD CONSTRAINT academic_cycles_id_school_key UNIQUE (id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'academic_terms_id_cycle_key') THEN
    ALTER TABLE public.academic_terms ADD CONSTRAINT academic_terms_id_cycle_key UNIQUE (id, academic_cycle_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'academic_subjects_id_school_key') THEN
    ALTER TABLE public.academic_subjects ADD CONSTRAINT academic_subjects_id_school_key UNIQUE (id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'academic_grade_levels_id_school_key') THEN
    ALTER TABLE public.academic_grade_levels ADD CONSTRAINT academic_grade_levels_id_school_key UNIQUE (id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_classes_id_school_key') THEN
    ALTER TABLE public.grade_classes ADD CONSTRAINT grade_classes_id_school_key UNIQUE (id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_classes_id_cycle_key') THEN
    ALTER TABLE public.grade_classes ADD CONSTRAINT grade_classes_id_cycle_key UNIQUE (id, academic_cycle_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_classes_grade_level_school_fkey') THEN
    ALTER TABLE public.grade_classes ADD CONSTRAINT grade_classes_grade_level_school_fkey
      FOREIGN KEY (grade_level_id, school_id) REFERENCES public.academic_grade_levels (id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_classes_cycle_school_fkey') THEN
    ALTER TABLE public.grade_classes ADD CONSTRAINT grade_classes_cycle_school_fkey
      FOREIGN KEY (academic_cycle_id, school_id) REFERENCES public.academic_cycles (id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_class_teacher_assignments_class_cycle_fkey') THEN
    ALTER TABLE public.grade_class_teacher_assignments ADD CONSTRAINT grade_class_teacher_assignments_class_cycle_fkey
      FOREIGN KEY (grade_class_id, academic_cycle_id) REFERENCES public.grade_classes (id, academic_cycle_id);
  END IF;
END $$;

-- RLS/ReBAC helpers. These are SECURITY DEFINER and do not query the new
-- lifecycle tables, avoiding policy recursion.
CREATE OR REPLACE FUNCTION public.academic_lifecycle_is_school_member(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_capacity_in_school('student', p_school_id)
    OR public.has_capacity_in_school('teacher', p_school_id)
    OR public.has_capacity_in_school('principal', p_school_id)
    OR public.has_capacity_in_school('section_head', p_school_id)
    OR public.has_capacity_in_school('grade_head', p_school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );
$$;

CREATE OR REPLACE FUNCTION public.academic_lifecycle_is_leader(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_capacity_in_school('principal', p_school_id)
    OR public.has_capacity_in_school('section_head', p_school_id)
    OR public.has_capacity_in_school('grade_head', p_school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  );
$$;

CREATE OR REPLACE FUNCTION public.academic_lifecycle_is_assigned_teacher(
  p_grade_class_id uuid,
  p_subject_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.grade_class_teacher_assignments a
    JOIN public.grade_classes c ON c.id = a.grade_class_id
    WHERE a.grade_class_id = p_grade_class_id
      AND a.teacher_id = auth.uid()
      AND a.status = 'active'
      AND a.effective_from <= now()
      AND (a.effective_to IS NULL OR a.effective_to >= now())
      AND (p_subject_id IS NULL OR a.subject_id IS NULL OR a.subject_id = p_subject_id)
      AND public.academic_lifecycle_is_school_member(c.school_id)
  );
$$;

REVOKE ALL ON FUNCTION public.academic_lifecycle_is_school_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.academic_lifecycle_is_leader(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.academic_lifecycle_is_assigned_teacher(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.academic_lifecycle_is_school_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.academic_lifecycle_is_leader(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.academic_lifecycle_is_assigned_teacher(uuid, uuid) TO authenticated, service_role;

-- Every newly-created public lifecycle table is RLS-protected. Policies are
-- explicitly granted only to authenticated users; anon has no policy.
ALTER TABLE public.academic_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_cycle_leadership_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_class_teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grade_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_marks ENABLE ROW LEVEL SECURITY;

-- Cycle/catalog/structure: school members read; school leadership writes.
DROP POLICY IF EXISTS academic_cycles_member_read ON public.academic_cycles;
CREATE POLICY academic_cycles_member_read ON public.academic_cycles FOR SELECT TO authenticated
  USING (public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS academic_cycles_leader_write ON public.academic_cycles;
CREATE POLICY academic_cycles_leader_write ON public.academic_cycles FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id));

DROP POLICY IF EXISTS academic_terms_member_read ON public.academic_terms;
CREATE POLICY academic_terms_member_read ON public.academic_terms FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.academic_cycles c WHERE c.id = academic_cycle_id AND public.academic_lifecycle_is_school_member(c.school_id)));
DROP POLICY IF EXISTS academic_terms_leader_write ON public.academic_terms;
CREATE POLICY academic_terms_leader_write ON public.academic_terms FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.academic_cycles c WHERE c.id = academic_cycle_id AND public.academic_lifecycle_is_leader(c.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.academic_cycles c WHERE c.id = academic_cycle_id AND public.academic_lifecycle_is_leader(c.school_id)));

DROP POLICY IF EXISTS academic_subjects_member_read ON public.academic_subjects;
CREATE POLICY academic_subjects_member_read ON public.academic_subjects FOR SELECT TO authenticated
  USING (public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS academic_subjects_leader_write ON public.academic_subjects;
CREATE POLICY academic_subjects_leader_write ON public.academic_subjects FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id));

DROP POLICY IF EXISTS academic_grade_levels_member_read ON public.academic_grade_levels;
CREATE POLICY academic_grade_levels_member_read ON public.academic_grade_levels FOR SELECT TO authenticated
  USING (public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS academic_grade_levels_leader_write ON public.academic_grade_levels;
CREATE POLICY academic_grade_levels_leader_write ON public.academic_grade_levels FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id));

DROP POLICY IF EXISTS academic_cycle_leadership_member_read ON public.academic_cycle_leadership_assignments;
CREATE POLICY academic_cycle_leadership_member_read ON public.academic_cycle_leadership_assignments FOR SELECT TO authenticated
  USING (public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS academic_cycle_leadership_leader_write ON public.academic_cycle_leadership_assignments;
CREATE POLICY academic_cycle_leadership_leader_write ON public.academic_cycle_leadership_assignments FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id));

DROP POLICY IF EXISTS grade_classes_member_read ON public.grade_classes;
CREATE POLICY grade_classes_member_read ON public.grade_classes FOR SELECT TO authenticated
  USING (public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS grade_classes_leader_write ON public.grade_classes;
CREATE POLICY grade_classes_leader_write ON public.grade_classes FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id));

DROP POLICY IF EXISTS grade_class_subjects_member_read ON public.grade_class_subjects;
CREATE POLICY grade_class_subjects_member_read ON public.grade_class_subjects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grade_classes c WHERE c.id = grade_class_id AND public.academic_lifecycle_is_school_member(c.school_id)));
DROP POLICY IF EXISTS grade_class_subjects_authorized_write ON public.grade_class_subjects;
CREATE POLICY grade_class_subjects_authorized_write ON public.grade_class_subjects FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grade_classes c WHERE c.id = grade_class_id AND (public.academic_lifecycle_is_leader(c.school_id) OR public.academic_lifecycle_is_assigned_teacher(c.id, subject_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.grade_classes c WHERE c.id = grade_class_id AND (public.academic_lifecycle_is_leader(c.school_id) OR public.academic_lifecycle_is_assigned_teacher(c.id, subject_id))));

DROP POLICY IF EXISTS grade_class_teacher_assignments_member_read ON public.grade_class_teacher_assignments;
CREATE POLICY grade_class_teacher_assignments_member_read ON public.grade_class_teacher_assignments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grade_classes c WHERE c.id = grade_class_id AND public.academic_lifecycle_is_school_member(c.school_id)));
DROP POLICY IF EXISTS grade_class_teacher_assignments_leader_write ON public.grade_class_teacher_assignments;
CREATE POLICY grade_class_teacher_assignments_leader_write ON public.grade_class_teacher_assignments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grade_classes c WHERE c.id = grade_class_id AND public.academic_lifecycle_is_leader(c.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.grade_classes c WHERE c.id = grade_class_id AND public.academic_lifecycle_is_leader(c.school_id)));

-- Student enrollment and attendance: students read their own rows; school
-- leaders and assigned teachers manage relevant class rows.
DROP POLICY IF EXISTS student_grade_class_enrollments_self_or_school_read ON public.student_grade_class_enrollments;
CREATE POLICY student_grade_class_enrollments_self_or_school_read ON public.student_grade_class_enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS student_grade_class_enrollments_authorized_write ON public.student_grade_class_enrollments;
CREATE POLICY student_grade_class_enrollments_authorized_write ON public.student_grade_class_enrollments FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id) OR public.academic_lifecycle_is_assigned_teacher(grade_class_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id) OR public.academic_lifecycle_is_assigned_teacher(grade_class_id));

DROP POLICY IF EXISTS daily_attendance_self_or_school_read ON public.daily_attendance;
CREATE POLICY daily_attendance_self_or_school_read ON public.daily_attendance FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS daily_attendance_authorized_write ON public.daily_attendance;
CREATE POLICY daily_attendance_authorized_write ON public.daily_attendance FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id) OR public.academic_lifecycle_is_assigned_teacher(grade_class_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id) OR public.academic_lifecycle_is_assigned_teacher(grade_class_id));

DROP POLICY IF EXISTS attendance_sessions_self_or_school_read ON public.attendance_sessions;
CREATE POLICY attendance_sessions_self_or_school_read ON public.attendance_sessions FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.academic_lifecycle_is_school_member(school_id));
DROP POLICY IF EXISTS attendance_sessions_authorized_write ON public.attendance_sessions;
CREATE POLICY attendance_sessions_authorized_write ON public.attendance_sessions FOR ALL TO authenticated
  USING (public.academic_lifecycle_is_leader(school_id) OR public.academic_lifecycle_is_assigned_teacher(grade_class_id, subject_id))
  WITH CHECK (public.academic_lifecycle_is_leader(school_id) OR public.academic_lifecycle_is_assigned_teacher(grade_class_id, subject_id));

-- Teacher attendance: teachers can read/write their own records; leaders can
-- administer school records. No student or guardian policy is granted.
DROP POLICY IF EXISTS teacher_daily_attendance_self_or_leader_read ON public.teacher_daily_attendance;
CREATE POLICY teacher_daily_attendance_self_or_leader_read ON public.teacher_daily_attendance FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR public.academic_lifecycle_is_leader(school_id));
DROP POLICY IF EXISTS teacher_daily_attendance_self_or_leader_write ON public.teacher_daily_attendance;
CREATE POLICY teacher_daily_attendance_self_or_leader_write ON public.teacher_daily_attendance FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (teacher_id = auth.uid() OR public.academic_lifecycle_is_leader(school_id));

DROP POLICY IF EXISTS teacher_attendance_sessions_self_or_leader_read ON public.teacher_attendance_sessions;
CREATE POLICY teacher_attendance_sessions_self_or_leader_read ON public.teacher_attendance_sessions FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR public.academic_lifecycle_is_leader(school_id));
DROP POLICY IF EXISTS teacher_attendance_sessions_self_or_leader_write ON public.teacher_attendance_sessions;
CREATE POLICY teacher_attendance_sessions_self_or_leader_write ON public.teacher_attendance_sessions FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR public.academic_lifecycle_is_leader(school_id))
  WITH CHECK (teacher_id = auth.uid() OR public.academic_lifecycle_is_leader(school_id));

-- Grade marks: drafts are visible only to the student, assigned teacher, or
-- authorized school leadership. There is intentionally NO guardian policy;
-- TODO: add a dedicated guardian read path after guardian permissions define
-- published-mark visibility. Anon receives no access through these policies.
DROP POLICY IF EXISTS grade_marks_student_or_authorized_read ON public.grade_marks;
CREATE POLICY grade_marks_student_or_authorized_read ON public.grade_marks FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.academic_lifecycle_is_leader(school_id)
    OR public.academic_lifecycle_is_assigned_teacher(grade_class_id, subject_id)
  );
DROP POLICY IF EXISTS grade_marks_authorized_write ON public.grade_marks;
CREATE POLICY grade_marks_authorized_write ON public.grade_marks FOR ALL TO authenticated
  USING (
    public.academic_lifecycle_is_leader(school_id)
    OR public.academic_lifecycle_is_assigned_teacher(grade_class_id, subject_id)
  )
  WITH CHECK (
    public.academic_lifecycle_is_leader(school_id)
    OR public.academic_lifecycle_is_assigned_teacher(grade_class_id, subject_id)
  );

CREATE INDEX IF NOT EXISTS academic_cycles_school_status_idx
  ON public.academic_cycles (school_id, status);
CREATE INDEX IF NOT EXISTS academic_terms_cycle_start_idx
  ON public.academic_terms (academic_cycle_id, starts_at);
CREATE INDEX IF NOT EXISTS grade_classes_school_cycle_status_idx
  ON public.grade_classes (school_id, academic_cycle_id, status);
CREATE INDEX IF NOT EXISTS grade_class_teacher_assignments_teacher_start_idx
  ON public.grade_class_teacher_assignments (teacher_id, effective_from);
CREATE INDEX IF NOT EXISTS student_grade_class_enrollments_student_start_idx
  ON public.student_grade_class_enrollments (student_id, effective_from);
CREATE INDEX IF NOT EXISTS daily_attendance_class_date_idx
  ON public.daily_attendance (grade_class_id, attendance_date);
CREATE INDEX IF NOT EXISTS attendance_sessions_class_time_idx
  ON public.attendance_sessions (grade_class_id, session_at);
CREATE INDEX IF NOT EXISTS teacher_attendance_sessions_teacher_time_idx
  ON public.teacher_attendance_sessions (teacher_id, session_at);
CREATE INDEX IF NOT EXISTS grade_marks_student_term_idx
  ON public.grade_marks (student_id, term_id);
CREATE INDEX IF NOT EXISTS grade_marks_class_subject_term_idx
  ON public.grade_marks (grade_class_id, subject_id, term_id);

CREATE OR REPLACE FUNCTION public.touch_academic_lifecycle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'academic_cycles', 'academic_terms', 'academic_subjects',
    'academic_grade_levels', 'academic_cycle_leadership_assignments',
    'grade_classes', 'grade_class_subjects', 'grade_class_teacher_assignments',
    'student_grade_class_enrollments', 'daily_attendance', 'attendance_sessions',
    'teacher_daily_attendance', 'teacher_attendance_sessions', 'grade_marks'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', table_name || '_updated_at', table_name);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_academic_lifecycle_updated_at()',
      table_name || '_updated_at', table_name
    );
  END LOOP;
END
$$;

COMMENT ON TABLE public.academic_cycles IS
  'Canonical school-scoped academic years for the lifecycle foundation.';
COMMENT ON TABLE public.grade_classes IS
  'Canonical academic-cycle-scoped classes; intentionally separate from legacy classrooms.';
COMMENT ON TABLE public.grade_marks IS
  'Canonical assessment results scoped by grade class, term, and subject.';
COMMENT ON TABLE public.daily_attendance IS
  'Canonical student daily attendance aggregate; granular records live in attendance_sessions.';
COMMENT ON TABLE public.teacher_daily_attendance IS
  'Canonical teacher daily attendance aggregate; granular records live in teacher_attendance_sessions.';

COMMIT;

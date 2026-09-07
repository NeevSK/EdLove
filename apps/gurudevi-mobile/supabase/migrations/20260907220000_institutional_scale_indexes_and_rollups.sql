-- Institutional Scale Indexes & Daily Attendance Rollups
-- Optimization for high-throughput OLTP and fast O(1) school dashboards.

-- ============================================================
-- 1. COMPOSITE INSTITUTIONAL INDEXES
-- ============================================================

-- Fast lookup for classrooms by school, academic year, and active status
CREATE INDEX IF NOT EXISTS classrooms_school_academic_year_idx 
  ON public.classrooms (school_id, academic_year, is_archived);

-- Fast lookup for student roster lookups in classroom
CREATE INDEX IF NOT EXISTS classroom_students_classroom_status_roll_idx 
  ON public.classroom_students (classroom_id, status, roll_number);

-- Compound index for classroom daily attendance lookup
CREATE INDEX IF NOT EXISTS attendance_classroom_date_status_idx 
  ON public.attendance (classroom_id, date, status);

-- Compound index for school-wide student enrollment registry
CREATE INDEX IF NOT EXISTS student_grade_class_enrollments_school_status_idx 
  ON public.student_grade_class_enrollments (school_id, status);

-- ============================================================
-- 2. SCHOOL DAILY ATTENDANCE SUMMARY (O(1) Rollup Projection)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.school_daily_attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  date DATE NOT NULL,
  total_enrolled INT NOT NULL DEFAULT 0,
  present_count INT NOT NULL DEFAULT 0,
  absent_count INT NOT NULL DEFAULT 0,
  late_count INT NOT NULL DEFAULT 0,
  excused_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_school_date UNIQUE (school_id, date)
);

CREATE INDEX IF NOT EXISTS school_daily_attendance_summary_school_date_idx 
  ON public.school_daily_attendance_summary (school_id, date DESC);

-- Enable RLS
ALTER TABLE public.school_daily_attendance_summary ENABLE ROW LEVEL SECURITY;

-- Allow institutional members (teachers, principals) with bonds to read their school's daily summary
CREATE POLICY "Institutional members can read daily attendance summary"
  ON public.school_daily_attendance_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_memberships sm
      WHERE sm.school_id = school_daily_attendance_summary.school_id
        AND sm.user_id = auth.uid()
        AND sm.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.bonds b
      WHERE b.entity_id = school_daily_attendance_summary.school_id::text
        AND b.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. INCREMENTAL RECOMPUTE / SYNC TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.recompute_school_daily_attendance(
  target_school_id UUID,
  target_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_enrolled INT := 0;
  v_present INT := 0;
  v_absent INT := 0;
  v_late INT := 0;
  v_excused INT := 0;
BEGIN
  -- Count total active enrolled students in school
  SELECT COUNT(DISTINCT cs.student_id) INTO v_enrolled
  FROM public.classroom_students cs
  JOIN public.classrooms c ON cs.classroom_id = c.id
  WHERE c.school_id = target_school_id AND cs.status = 'active';

  IF v_enrolled = 0 THEN
    SELECT COUNT(DISTINCT se.student_id) INTO v_enrolled
    FROM public.student_grade_class_enrollments se
    WHERE se.school_id = target_school_id AND se.status = 'enrolled';
  END IF;

  -- Count attendance statuses for the date across classrooms belonging to this school
  SELECT
    COUNT(a.id) FILTER (WHERE a.status = 'present'),
    COUNT(a.id) FILTER (WHERE a.status = 'absent'),
    COUNT(a.id) FILTER (WHERE a.status = 'late'),
    COUNT(a.id) FILTER (WHERE a.status = 'excused')
  INTO v_present, v_absent, v_late, v_excused
  FROM public.attendance a
  JOIN public.classrooms c ON a.classroom_id = c.id
  WHERE c.school_id = target_school_id AND a.date = target_date::text;

  -- Upsert summary row
  INSERT INTO public.school_daily_attendance_summary (
    school_id,
    date,
    total_enrolled,
    present_count,
    absent_count,
    late_count,
    excused_count,
    updated_at
  )
  VALUES (
    target_school_id,
    target_date,
    v_enrolled,
    v_present,
    v_absent,
    v_late,
    v_excused,
    now()
  )
  ON CONFLICT (school_id, date) DO UPDATE SET
    total_enrolled = EXCLUDED.total_enrolled,
    present_count = EXCLUDED.present_count,
    absent_count = EXCLUDED.absent_count,
    late_count = EXCLUDED.late_count,
    excused_count = EXCLUDED.excused_count,
    updated_at = now();
END;
$$;

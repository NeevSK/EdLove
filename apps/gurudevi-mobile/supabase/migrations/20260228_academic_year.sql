-- ============================================================
-- Academic Year Temporal Dimension
-- 
-- Adds `academic_year` to classrooms and timetable so that
-- historical records are never overwritten when a new school
-- year starts.  Also creates student_academic_records as a
-- per-year snapshot that preserves each student's class,
-- teacher, grade summary and enrollment for long-term
-- progress tracking and pattern analysis.
--
-- Year format convention: 'YYYY' e.g. '2026'
-- Sri Lanka academic year typically runs Jan–Dec.
-- ============================================================

-- ── 1. classrooms ─────────────────────────────────────────
ALTER TABLE public.classrooms
    ADD COLUMN IF NOT EXISTS academic_year TEXT
        DEFAULT TO_CHAR(NOW(), 'YYYY')
        NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classrooms_academic_year
    ON public.classrooms (school_id, academic_year);

-- ── 2. timetable ──────────────────────────────────────────
-- The timetable is rebuilt each year; archive old rows by
-- year so teachers/students can look back.
ALTER TABLE public.timetable
    ADD COLUMN IF NOT EXISTS academic_year TEXT
        DEFAULT TO_CHAR(NOW(), 'YYYY')
        NOT NULL;

-- Drop the existing unique constraint (user, day, period) so
-- the same slot can exist in multiple years, then recreate
-- it scoped to the year.
ALTER TABLE public.timetable
    DROP CONSTRAINT IF EXISTS timetable_user_id_day_of_week_period_number_key;

ALTER TABLE public.timetable
    ADD CONSTRAINT timetable_user_day_period_year_key
        UNIQUE (user_id, day_of_week, period_number, academic_year);

CREATE INDEX IF NOT EXISTS idx_timetable_user_year
    ON public.timetable (user_id, academic_year);

-- ── 3. student_academic_records ───────────────────────────
-- One row per (student, classroom, academic_year).
-- Populated by a school-end rollover (manual or scheduled).
-- Preserves the relationship even after classrooms are
-- archived and teachers change, so multi-year progress
-- patterns can be analysed.
CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    classroom_id    UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE SET NULL,
    teacher_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    school_id       UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year   TEXT NOT NULL,                      -- e.g. '2026'
    grade_number    INTEGER,                            -- grade/year level at time of record
    subject         TEXT,                               -- subject taught in this classroom
    -- Aggregated grade summary (populated at year-end)
    avg_grade       NUMERIC(5,2),                       -- average score across submissions
    highest_grade   NUMERIC(5,2),
    lowest_grade    NUMERIC(5,2),
    assignments_total    INTEGER DEFAULT 0,
    assignments_submitted INTEGER DEFAULT 0,
    -- Free-form teacher note for the record
    teacher_note    TEXT,
    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, classroom_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_student_academic_records_student_year
    ON public.student_academic_records (student_id, academic_year);

CREATE INDEX IF NOT EXISTS idx_student_academic_records_school_year
    ON public.student_academic_records (school_id, academic_year);

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;

-- Students can read their own records
CREATE POLICY "sar_student_read_own"
    ON public.student_academic_records FOR SELECT
    USING (student_id = auth.uid());

-- Teachers / principals / founders can read records for their school
CREATE POLICY "sar_staff_read_school"
    ON public.student_academic_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.school_id = student_academic_records.school_id
              AND u.role IN ('teacher', 'grade_head', 'section_head', 'principal', 'founder', 'admin')
        )
    );

-- Only staff can insert/update records
CREATE POLICY "sar_staff_write"
    ON public.student_academic_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.school_id = student_academic_records.school_id
              AND u.role IN ('teacher', 'grade_head', 'section_head', 'principal', 'founder', 'admin')
        )
    );

CREATE POLICY "sar_staff_update"
    ON public.student_academic_records FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.school_id = student_academic_records.school_id
              AND u.role IN ('teacher', 'grade_head', 'section_head', 'principal', 'founder', 'admin')
        )
    );

-- ── 4. Helper view: current-year classrooms ───────────────
-- Convenience view so all existing queries that don't filter
-- by year still see only the active year's classrooms.
CREATE OR REPLACE VIEW public.active_classrooms AS
    SELECT *
    FROM public.classrooms
    WHERE academic_year = TO_CHAR(NOW(), 'YYYY')
      AND is_archived = false;

-- ── 5. Helper view: current-year timetable ────────────────
CREATE OR REPLACE VIEW public.active_timetable AS
    SELECT *
    FROM public.timetable
    WHERE academic_year = TO_CHAR(NOW(), 'YYYY');

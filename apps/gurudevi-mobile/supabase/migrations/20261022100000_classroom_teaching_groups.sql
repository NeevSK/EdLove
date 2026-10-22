-- #149 (institutional structure canonical model), C3 "teaching group", minimal slice:
-- a classroom says what kind of teaching group it is, and links explicitly to the
-- grade class(es) it teaches. Attendance and enrollment look the link up first; name
-- matching is only a fallback for classrooms that have no link yet.
--
-- kind: 'homeroom' (exactly one grade class), 'subject' (one or more grade classes),
-- 'cohort' (optional links). NULL = existing rows, not yet classified; they get no
-- links until someone classifies them (no backfill here, #149 open question 3).
-- subject_id / term_id from the #149 design are not added yet.
ALTER TABLE public.classrooms
  ADD COLUMN IF NOT EXISTS kind text
  CONSTRAINT classrooms_kind_check CHECK (kind IN ('homeroom', 'subject', 'cohort'));

CREATE TABLE IF NOT EXISTS public.classroom_grade_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  grade_class_id uuid NOT NULL REFERENCES public.grade_classes(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classroom_grade_classes_unique UNIQUE (classroom_id, grade_class_id)
);

CREATE INDEX IF NOT EXISTS classroom_grade_classes_grade_class_idx
  ON public.classroom_grade_classes (grade_class_id);

-- Written and read through the API only (policy-enforced). No direct client access.
ALTER TABLE public.classroom_grade_classes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.classroom_grade_classes FROM anon, authenticated;

-- 20260306120000_student_insights.sql
-- Adds structured student observations for holistic teacher tracking

CREATE TABLE IF NOT EXISTS public.student_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    classroom_student_id UUID NOT NULL REFERENCES public.classroom_students(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Denormalized for global student profile
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    observation_type TEXT NOT NULL DEFAULT 'neutral' CHECK (observation_type IN ('positive', 'growth', 'neutral', 'concern')),
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'student_visible', 'handover_visible')),
    is_finalized BOOLEAN NOT NULL DEFAULT FALSE, -- Once finalized, cannot be edited (even by author)
    honesty_declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE, -- For professional integrity
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_student_observations_classroom ON public.student_observations(classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_observations_classroom_student ON public.student_observations(classroom_student_id);
CREATE INDEX IF NOT EXISTS idx_student_observations_student ON public.student_observations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_observations_author ON public.student_observations(author_id);

-- RLS Policies
ALTER TABLE public.student_observations ENABLE ROW LEVEL SECURITY;

-- Split into per-command policies so that:
--   SELECT: authors can always view their own observations (including finalised ones)
--   INSERT/UPDATE/DELETE: only allowed while is_finalized = false
-- (Note: cmd() is not a valid Postgres function and cannot be used in policies.)

CREATE POLICY "Teachers can view their own observations"
ON public.student_observations
FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Teachers can insert their own non-finalized observations"
ON public.student_observations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id AND is_finalized = false);

CREATE POLICY "Teachers can update their own non-finalized observations"
ON public.student_observations
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id AND is_finalized = false)
WITH CHECK (auth.uid() = author_id AND is_finalized = false);

CREATE POLICY "Teachers can delete their own non-finalized observations"
ON public.student_observations
FOR DELETE
TO authenticated
USING (auth.uid() = author_id AND is_finalized = false);

-- Current teachers can view history if student is in their current classroom
CREATE POLICY "Current teachers can view historical observations"
ON public.student_observations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_students cs
        JOIN public.classrooms c ON cs.classroom_id = c.id
        WHERE cs.student_id = student_observations.student_id
        AND c.teacher_id = auth.uid()
        AND c.academic_year = TO_CHAR(NOW(), 'YYYY')
    )
    AND (visibility = 'handover_visible' OR visibility = 'student_visible')
);

-- Principals can view all observations in their school
CREATE POLICY "Principals can view all observations in their school"
ON public.student_observations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'principal'
        AND users.school_id = (SELECT school_id FROM public.classrooms WHERE id = student_observations.classroom_id)
    )
);

-- Students can view observations marked as 'student_visible'
CREATE POLICY "Students can view their own visible observations"
ON public.student_observations
FOR SELECT
TO authenticated
USING (
    auth.uid() = student_id 
    AND visibility = 'student_visible'
);

-- Trigger for updated_at
CREATE TRIGGER update_student_observations_updated_at
BEFORE UPDATE ON public.student_observations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

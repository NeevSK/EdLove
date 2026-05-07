-- ─────────────────────────────────────────────────────────────────────────────
-- school_echo_feedback
-- Teacher-to-principal feedback loop.  A teacher sends an echo; the principal
-- sees it, marks it read, and writes a response; the teacher can then read
-- the principal's reply.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.school_echo_feedback (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id        UUID         NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id       UUID         NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,

    -- Teacher-authored fields
    source           TEXT         NOT NULL DEFAULT 'teacher',
    category         TEXT         NOT NULL DEFAULT 'support',
        -- 'support' | 'morale' | 'facility' | 'recognition'
    content          TEXT         NOT NULL,
    priority         TEXT         NOT NULL DEFAULT 'medium',
        -- 'low' | 'medium' | 'high'

    -- Read / response state (written by the principal)
    is_read          BOOLEAN      NOT NULL DEFAULT FALSE,
    principal_response TEXT,
    responded_by     UUID         REFERENCES public.users(id),
    responded_at     TIMESTAMPTZ,

    -- Timestamps
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_echo_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS echo_updated_at ON public.school_echo_feedback;
CREATE TRIGGER echo_updated_at
    BEFORE UPDATE ON public.school_echo_feedback
    FOR EACH ROW EXECUTE FUNCTION public.touch_echo_updated_at();

-- ── Row-level security ───────────────────────────────────────────────────────
ALTER TABLE public.school_echo_feedback ENABLE ROW LEVEL SECURITY;

-- Teachers can INSERT their own echoes
CREATE POLICY "echo_teacher_insert"
    ON public.school_echo_feedback FOR INSERT
    WITH CHECK (
        teacher_id = get_my_id()
        AND school_id = (SELECT school_id FROM public.users WHERE id = get_my_id())
    );

-- Teachers can SELECT their own echoes (to see history + principal response)
CREATE POLICY "echo_teacher_read_own"
    ON public.school_echo_feedback FOR SELECT
    USING (teacher_id = get_my_id());

-- Principals/admins/founders can SELECT all echoes for their school
CREATE POLICY "echo_principal_read"
    ON public.school_echo_feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = get_my_id()
              AND school_id = school_echo_feedback.school_id
              AND role IN ('principal', 'admin', 'founder')
        )
    );

-- Principals/admins/founders can UPDATE echoes in their school
-- (to mark as read and write a response)
CREATE POLICY "echo_principal_update"
    ON public.school_echo_feedback FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = get_my_id()
              AND school_id = school_echo_feedback.school_id
              AND role IN ('principal', 'admin', 'founder')
        )
    )
    WITH CHECK (
        -- Principals may only update is_read, principal_response,
        -- responded_by, responded_at — not alter school_id or teacher_id.
        school_id = school_echo_feedback.school_id
        AND teacher_id = school_echo_feedback.teacher_id
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = get_my_id()
              AND school_id = school_echo_feedback.school_id
              AND role IN ('principal', 'admin', 'founder')
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- POLLS & STUDENT ECHO (STRETEGIC IMPLEMENTATION)
-- 1. Polls: Integrated into community_posts for resonance.
-- 2. Student Echo: Student-to-Teacher feedback (Mirroring school_echo_feedback).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. COMMUNITY POLLS ENHANCEMENT
DO $$ 
BEGIN
    -- Ensure post_type allows 'poll'
    -- (The constraint might be in post_type check if it exists)
    
    -- Add poll_data storage to community_posts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'poll_data') THEN
        ALTER TABLE public.community_posts ADD COLUMN poll_data JSONB DEFAULT NULL;
    END IF;

    -- Ensure post_type column exists (it should based on API code)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'post_type') THEN
        ALTER TABLE public.community_posts ADD COLUMN post_type TEXT DEFAULT 'post';
    END IF;
END $$;

-- Table to track poll votes to prevent duplicates and allow results calculation
CREATE TABLE IF NOT EXISTS public.community_poll_votes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id       UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    option_id     TEXT NOT NULL, -- The ID of the option selected from poll_data
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- RLS for Poll Votes
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poll_votes_select" ON public.community_poll_votes
    FOR SELECT USING (TRUE); -- Everyone can see counts/participation

CREATE POLICY "poll_votes_insert" ON public.community_poll_votes
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 2. STUDENT ECHO FEEDBACK (Principal Echo for Students)
-- A way for students to let their voice heard to class teacher.
CREATE TABLE IF NOT EXISTS public.classroom_echo_feedback (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id     UUID         NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    school_id        UUID         NOT NULL REFERENCES public.schools(id)      ON DELETE CASCADE,
    student_id       UUID         NOT NULL REFERENCES public.users(id)      ON DELETE CASCADE,

    content          TEXT         NOT NULL,
    is_anonymous     BOOLEAN      NOT NULL DEFAULT FALSE,
    
    -- Interaction State
    is_read          BOOLEAN      NOT NULL DEFAULT FALSE,
    teacher_response TEXT,
    responded_by     UUID         REFERENCES public.users(id),
    responded_at     TIMESTAMPTZ,

    -- Timestamps
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at for classroom_echo
DROP TRIGGER IF EXISTS trg_classroom_echo_updated_at ON public.classroom_echo_feedback;
CREATE TRIGGER trg_classroom_echo_updated_at
    BEFORE UPDATE ON public.classroom_echo_feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for Classroom Echo
ALTER TABLE public.classroom_echo_feedback ENABLE ROW LEVEL SECURITY;

-- Students can INSERT their own echoes
CREATE POLICY "classroom_echo_student_insert"
    ON public.classroom_echo_feedback FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
             SELECT 1 FROM public.classroom_students cs
             WHERE cs.classroom_id = classroom_echo_feedback.classroom_id
               AND cs.student_id = auth.uid()
        )
    );

-- Students can SELECT their own echoes
CREATE POLICY "classroom_echo_student_read_own"
    ON public.classroom_echo_feedback FOR SELECT
    USING (student_id = auth.uid());

-- Teachers can SELECT echoes for their classrooms
CREATE POLICY "classroom_echo_teacher_read"
    ON public.classroom_echo_feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.classrooms c
            WHERE c.id = classroom_echo_feedback.classroom_id
              AND c.teacher_id = auth.uid()
        )
    );

-- Teachers can UPDATE echoes (mark read, respond)
CREATE POLICY "classroom_echo_teacher_update"
    ON public.classroom_echo_feedback FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.classrooms c
            WHERE c.id = classroom_echo_feedback.classroom_id
              AND c.teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.classrooms c
            WHERE c.id = classroom_echo_feedback.classroom_id
              AND c.teacher_id = auth.uid()
        )
    );

-- Principals can also see these for school-wide awareness (Healing Ecosystem)
CREATE POLICY "classroom_echo_principal_read"
    ON public.classroom_echo_feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
              AND school_id = classroom_echo_feedback.school_id
              AND role IN ('principal', 'admin', 'founder')
        )
    );

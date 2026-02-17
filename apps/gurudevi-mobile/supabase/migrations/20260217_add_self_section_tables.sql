-- ============================================
-- SELF SECTION TABLES MIGRATION
-- Date: 2026-02-17
-- Purpose: Add timetable, mood_logs, journal_entries, and students tables
-- Required for: Guest data sync functionality
-- ============================================

-- --------------------------------------------
-- 1. TIMETABLE (Self Section - Daily Rhythm)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL, -- 0=Sunday, 6=Saturday
    period_number INTEGER CHECK (period_number >= 1) NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT,
    type TEXT CHECK (type IN ('subject', 'relief', 'interval')) DEFAULT 'subject' NOT NULL,
    start_time TEXT NOT NULL, -- Format: "HH:MM" (24-hour)
    end_time TEXT NOT NULL,   -- Format: "HH:MM" (24-hour)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(user_id, day_of_week, period_number)
);

CREATE INDEX IF NOT EXISTS idx_timetable_user ON public.timetable(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON public.timetable(user_id, day_of_week);

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see/modify their own timetable
CREATE POLICY timetable_user_policy
    ON public.timetable FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- --------------------------------------------
-- 2. MOOD LOGS (Self Section - Mood Lotus)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    mood TEXT CHECK (mood IN ('joyful', 'calm', 'curious', 'anxious', 'frustrated', 'sad')) NOT NULL,
    note TEXT, -- Optional reflection
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mood_logs_user ON public.mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_created ON public.mood_logs(user_id, created_at DESC);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS: STRICTLY PRIVATE - Only the user sees their mood
CREATE POLICY mood_logs_privacy
    ON public.mood_logs FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- --------------------------------------------
-- 3. JOURNAL ENTRIES (Self Section - Fire Journal)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON public.journal_entries(user_id, created_at DESC);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS: STRICTLY PRIVATE - Only the user sees their journal
CREATE POLICY journal_entries_privacy
    ON public.journal_entries FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- --------------------------------------------
-- 4. STUDENTS (Classroom Section)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    index_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    UNIQUE(classroom_id, index_number)
);

CREATE INDEX IF NOT EXISTS idx_students_classroom ON public.students(classroom_id);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS: Teachers see students in their classrooms
CREATE POLICY students_teacher_policy
    ON public.students FOR ALL TO authenticated
    USING (
        classroom_id IN (
            SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
        )
    );

-- RLS: Principals see all students in their school
CREATE POLICY students_principal_policy
    ON public.students FOR SELECT TO authenticated
    USING (
        classroom_id IN (
            SELECT c.id FROM public.classrooms c
            INNER JOIN public.users u ON u.id = auth.uid()
            WHERE u.role = 'principal' AND c.school_id = u.school_id
        )
    );

-- --------------------------------------------
-- TRIGGERS
-- --------------------------------------------

-- Auto-update updated_at on students table
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ✅ SELF SECTION TABLES COMPLETE!

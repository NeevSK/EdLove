-- Migration: submissions table RLS policies
-- Purpose: Enable students to read/submit their own submissions (with grades/feedback)
--          and teachers to read/grade submissions for their classrooms.
-- Context: RLS was enabled on submissions in the baseline migration but no
--          policies were created, so ALL rows were inaccessible.

-- 1a. Students can read their own submissions (including grade + feedback)
CREATE POLICY "Students can read their own submissions"
    ON public.submissions
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

-- 1b. Students can insert new submissions (but not update/delete after grading)
CREATE POLICY "Students can create submissions"
    ON public.submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- 2. Teachers can read submissions for their classrooms (SELECT only — no INSERT/DELETE)
CREATE POLICY "Teachers can read submissions in their classrooms"
    ON public.submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.classrooms
            WHERE id = classroom_id AND teacher_id = auth.uid()
        )
    );

-- 3. Teachers can update (grade/feedback) submissions for their classrooms (no INSERT/DELETE)
CREATE POLICY "Teachers can grade submissions in their classrooms"
    ON public.submissions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.classrooms
            WHERE id = classroom_id AND teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.classrooms
            WHERE id = classroom_id AND teacher_id = auth.uid()
        )
    );

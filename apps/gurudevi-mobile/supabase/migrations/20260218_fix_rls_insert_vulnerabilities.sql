-- ========================================================
-- SECURITY FIX: RLS Insert Vulnerabilities
-- Issue: FOR ALL policies lacked WITH CHECK, allowing unconstrained inserts
-- Severity: HIGH
-- Date: 2026-02-18
-- ========================================================

-- 1. Correct Mood Logs Policy
DROP POLICY IF EXISTS "mood_logs_privacy" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can update their own mood logs" ON public.mood_logs;

CREATE POLICY "mood_logs_privacy" 
ON public.mood_logs FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Correct Journal Entries Policy
DROP POLICY IF EXISTS "journal_entries_privacy" ON public.journal_entries;

CREATE POLICY "journal_entries_privacy" 
ON public.journal_entries FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Correct Fire Journal Policy
DROP POLICY IF EXISTS "fire_journal_privacy" ON public.fire_journal;

CREATE POLICY "fire_journal_privacy" 
ON public.fire_journal FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Verify Users Update Policy (Double Check)
-- Ensure the users update policy is the secure one (from previous fix)
-- This is idempotent - if the policy exists as expected, good. 
-- If not, we re-apply the fix to be absolutely sure.

DO $$
BEGIN
    -- Check if the INSECURE policy still exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own profile'
    ) THEN
        DROP POLICY "Users can update own profile" ON public.users;
    END IF;

    -- Check if the SECURE policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update safe profile fields'
    ) THEN
        -- Re-create secure policy if missing
        CREATE POLICY "Users can update safe profile fields" 
        ON public.users FOR UPDATE TO authenticated
        USING (id = auth.uid())
        WITH CHECK (
          id = auth.uid() AND
          role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
          school_id IS NOT DISTINCT FROM (SELECT school_id FROM public.users WHERE id = auth.uid()) AND
          section_id IS NOT DISTINCT FROM (SELECT section_id FROM public.users WHERE id = auth.uid()) AND
          grade_id IS NOT DISTINCT FROM (SELECT grade_id FROM public.users WHERE id = auth.uid()) AND
          is_pro = (SELECT is_pro FROM public.users WHERE id = auth.uid()) AND
          is_thuthimal = (SELECT is_thuthimal FROM public.users WHERE id = auth.uid()) AND
          invitations_remaining = (SELECT invitations_remaining FROM public.users WHERE id = auth.uid()) AND
          invitations_sent = (SELECT invitations_sent FROM public.users WHERE id = auth.uid())
        );
    END IF;
END
$$;

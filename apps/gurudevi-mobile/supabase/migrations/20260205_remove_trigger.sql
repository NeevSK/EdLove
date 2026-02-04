-- ============================================================
-- MIGRATION: Remove Auto-Sync Trigger (v1.1)
-- Reason: The App creates the School *after* Signup, so the Trigger 
--         (which runs *during* Signup) fails because it has no School ID yet.
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- We will rely on the App (AuthScreen.tsx) to insert the user ROW
-- which it does in Step 3 of handleAuth().

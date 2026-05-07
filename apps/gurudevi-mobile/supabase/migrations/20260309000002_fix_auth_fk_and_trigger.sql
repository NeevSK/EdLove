-- ============================================================================
-- Migration: 20260309000002_fix_auth_fk_and_trigger
-- Purpose:   Fix broken auth flow after identity architecture refactor.
--
-- Root Cause:
--   The identity_architecture migration (20260308000000) changed handle_new_user()
--   to insert public.users with a gen_random_uuid() as the ID. However, the old
--   FK constraint `users_id_fkey` (FOREIGN KEY (id) REFERENCES auth.users(id))
--   was never dropped. This causes both Gmail OAuth and anonymous sign-in to fail
--   with:
--     ERROR: insert or update on table "users" violates foreign key constraint
--     "users_id_fkey" (SQLSTATE 23503)
--
-- Fix Strategy (Architect's choice):
--   The cleanest fix that unblocks login NOW while keeping the Sovereign Identity
--   Architecture intact is:
--   1. DROP the `users_id_fkey` constraint (complete the decoupling).
--   2. Rewrite handle_new_user() so it:
--      a. Uses new.id (= auth.uid for trigger context) as the public user id
--         for ALL sign-ins so get_my_id() resolves correctly.
--      b. Handles ON CONFLICT so re-sign-ins (existing users) don't fail.
--      c. Detects the actual provider from raw_app_meta_data for proper mapping.
--      d. Handles anonymous users (new.is_anonymous = true).
-- ============================================================================

-- Step 1: Drop the blocking FK constraint on public.users.id
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Replace handle_new_user with a robust, production-safe version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_provider TEXT;
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_is_anonymous BOOLEAN;
    existing_user_id UUID;
BEGIN
    -- Determine provider from raw_app_meta_data
    v_provider := COALESCE(
        new.raw_app_meta_data->>'provider',
        'supabase'
    );
    
    v_is_anonymous := COALESCE(new.is_anonymous, false);

    -- Resolve full_name from multiple possible sources
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        CASE WHEN v_is_anonymous THEN 'Guest' ELSE 'Sanctuary User' END
    );
    
    v_avatar_url := new.raw_user_meta_data->>'avatar_url';

    -- Check if this auth.uid already has a mapping in auth_identities
    SELECT user_id INTO existing_user_id
    FROM public.auth_identities
    WHERE provider = v_provider
      AND provider_user_id = new.id::text
    LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
        -- User already exists, update their profile details (e.g. new avatar from Google)
        UPDATE public.users
        SET
            full_name  = COALESCE(v_full_name, full_name),
            avatar_url = COALESCE(v_avatar_url, avatar_url),
            updated_at = now()
        WHERE id = existing_user_id;
        RETURN new;
    END IF;

    -- Insert a new app user.
    -- We use new.id as the public user ID to maintain 1:1 mapping with auth.users
    -- for the current users so get_my_id() works cleanly.
    INSERT INTO public.users (id, full_name, email, avatar_url, role, is_anonymous)
    VALUES (
        new.id,   -- Use auth UID as public user ID (simplest, correct)
        v_full_name,
        CASE WHEN v_is_anonymous THEN NULL ELSE new.email END,
        v_avatar_url,
        CASE WHEN v_is_anonymous THEN 'guest' ELSE 'teacher' END,
        v_is_anonymous
    )
    ON CONFLICT (id) DO UPDATE
        SET
            full_name  = EXCLUDED.full_name,
            avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
            email      = COALESCE(EXCLUDED.email, public.users.email),
            updated_at = now();

    -- Create or update the identity mapping
    INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
    VALUES (new.id, v_provider, new.id::text)
    ON CONFLICT (provider, provider_user_id) DO NOTHING;

    RETURN new;
END;
$$;

-- Step 3: Also update get_my_id() so it works for all users
CREATE OR REPLACE FUNCTION public.get_my_id()
RETURNS uuid AS $$
    -- Try the identity mapping table (works for all users)
    SELECT user_id FROM public.auth_identities
    WHERE provider_user_id = auth.uid()::text
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Step 4: Ensure anonymous users can also write to auth_identities
GRANT INSERT ON public.auth_identities TO anon;
GRANT INSERT ON public.auth_identities TO authenticated;
GRANT SELECT ON public.auth_identities TO anon;
GRANT SELECT ON public.auth_identities TO authenticated;
GRANT SELECT ON public.auth_identities TO service_role;

-- Step 5: Back-fill auth_identities for any existing users
INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
SELECT 
    u.id,
    COALESCE(au.raw_app_meta_data->>'provider', 'supabase') AS provider,
    u.id::text AS provider_user_id
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
ON CONFLICT (provider, provider_user_id) DO NOTHING;

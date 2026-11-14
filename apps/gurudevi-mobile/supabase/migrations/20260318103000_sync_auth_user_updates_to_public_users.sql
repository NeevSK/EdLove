-- ============================================================================
-- Migration: 20260318103000_sync_auth_user_updates_to_public_users
-- Purpose:
--   Keep public.users in sync when an auth user is UPDATED (not only inserted).
--
-- Why this matters:
--   Anonymous -> registered upgrades usually update auth.users in place.
--   If we only have AFTER INSERT trigger logic, public.users can remain stale:
--   - is_anonymous stays true
--   - email/full_name/role/avatar don't reflect upgraded account
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_provider text;
    v_full_name text;
    v_avatar_url text;
    v_is_anonymous boolean;
    v_role text;
BEGIN
    v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'supabase');
    v_is_anonymous := COALESCE((to_jsonb(new)->>'is_anonymous')::boolean, false);
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        CASE WHEN v_is_anonymous THEN 'Guest' ELSE 'Sanctuary User' END
    );
    v_avatar_url := new.raw_user_meta_data->>'avatar_url';
    v_role := new.raw_user_meta_data->>'role';

    INSERT INTO public.users (id, email, full_name, avatar_url, role, is_anonymous)
    VALUES (
        new.id,
        CASE WHEN v_is_anonymous THEN NULL ELSE new.email END,
        v_full_name,
        v_avatar_url,
        CASE
            WHEN v_role IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer')
                THEN v_role
            WHEN v_is_anonymous THEN 'guest'
            ELSE 'teacher'
        END,
        v_is_anonymous
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = CASE
            WHEN EXCLUDED.is_anonymous THEN public.users.email
            ELSE COALESCE(EXCLUDED.email, public.users.email)
        END,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        is_anonymous = EXCLUDED.is_anonymous,
        role = CASE
            WHEN v_role IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer')
                THEN v_role
            WHEN EXCLUDED.is_anonymous THEN COALESCE(public.users.role, 'guest')
            ELSE COALESCE(public.users.role, 'teacher')
        END,
        updated_at = now();

    -- Ensure supabase identity mapping exists for current auth uid.
    INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
    VALUES (new.id, v_provider, new.id::text)
    ON CONFLICT (provider, provider_user_id) DO UPDATE
        SET user_id = EXCLUDED.user_id,
            updated_at = now();

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_updated();

-- Backfill current state so existing upgraded users are corrected immediately.
UPDATE public.users u
SET
    email = CASE WHEN COALESCE((to_jsonb(au)->>'is_anonymous')::boolean, false) THEN u.email ELSE COALESCE(au.email, u.email) END,
    full_name = COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        u.full_name
    ),
    avatar_url = COALESCE(au.raw_user_meta_data->>'avatar_url', u.avatar_url),
    is_anonymous = COALESCE((to_jsonb(au)->>'is_anonymous')::boolean, u.is_anonymous),
    updated_at = now()
FROM auth.users au
WHERE au.id = u.id;

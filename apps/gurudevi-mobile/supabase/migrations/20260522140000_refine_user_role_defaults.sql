-- ============================================================================
-- Migration: 20260522140000_refine_user_role_defaults
-- Purpose:
--   1. Remove default value of 'member' on public.users.role.
--   2. Update triggers to set role = 'guest' for anonymous users,
--      and leave it NULL (no default) for non-anonymous users unless specified.
--   3. Align with user's mental model where 'member' is not a system role.
-- ============================================================================

BEGIN;

-- 1. REMOVE COLUMN DEFAULT FOR ROLE AND RECONCILE DATA
ALTER TABLE public.users 
  ALTER COLUMN role DROP DEFAULT;

-- Drop the old constraint first to allow data updates
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

-- Convert any historical 'member' roles to 'guest' (if anonymous) or NULL BEFORE adding the new constraint
UPDATE public.users
SET role = CASE WHEN is_anonymous THEN 'guest' ELSE NULL END
WHERE role = 'member';

-- Add the new constraint which does not contain 'member'
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (
    role IS NULL OR role = ANY (ARRAY[
      'founder'::text,
      'admin'::text,
      'principal'::text,
      'section_head'::text,
      'grade_head'::text,
      'teacher'::text,
      'student'::text,
      'guest'::text,
      'developer'::text
    ])
  );

-- 2. REFINE HANDLE_NEW_USER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_username text;
  v_is_anonymous boolean;
BEGIN
  v_is_anonymous := COALESCE((new.raw_user_meta_data->>'is_anonymous')::boolean, (new.email IS NULL));
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
  v_first_name := NULLIF(new.raw_user_meta_data->>'first_name', '');
  v_last_name := NULLIF(new.raw_user_meta_data->>'last_name', '');
  v_username := NULLIF(new.raw_user_meta_data->>'username', '');

  INSERT INTO public.users (id, email, display_name, full_name, first_name, last_name, username, role, is_anonymous, identity_state)
  VALUES (
    new.id,
    COALESCE(new.email, 'anonymous@' || new.id::text),
    COALESCE(v_display_name, v_full_name, CASE WHEN v_is_anonymous THEN 'Guest User' ELSE 'Sanctuary User' END),
    COALESCE(v_full_name, CASE WHEN v_is_anonymous THEN 'Guest User' ELSE 'Sanctuary User' END),
    v_first_name,
    v_last_name,
    v_username,
    COALESCE(
      new.raw_user_meta_data->>'role', 
      CASE WHEN v_is_anonymous THEN 'guest' ELSE NULL END
    ),
    v_is_anonymous,
    CASE WHEN v_is_anonymous THEN 'anonymous' ELSE 'onboarded' END
  )
  ON CONFLICT (id) DO UPDATE SET
    is_anonymous = EXCLUDED.is_anonymous,
    display_name = CASE
      WHEN EXCLUDED.display_name IS NOT NULL THEN EXCLUDED.display_name
      WHEN EXCLUDED.first_name IS NOT NULL OR EXCLUDED.last_name IS NOT NULL
        THEN TRIM(CONCAT_WS(' ', COALESCE(EXCLUDED.first_name, public.users.first_name), COALESCE(EXCLUDED.last_name, public.users.last_name)))
      ELSE public.users.display_name
    END,
    full_name = CASE
      WHEN EXCLUDED.full_name IS NOT NULL THEN EXCLUDED.full_name
      WHEN EXCLUDED.first_name IS NOT NULL OR EXCLUDED.last_name IS NOT NULL
        THEN TRIM(CONCAT_WS(' ', COALESCE(EXCLUDED.first_name, public.users.first_name), COALESCE(EXCLUDED.last_name, public.users.last_name)))
      ELSE public.users.full_name
    END,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    username = COALESCE(EXCLUDED.username, public.users.username),
    identity_state = CASE WHEN EXCLUDED.is_anonymous THEN 'anonymous' ELSE COALESCE(public.users.identity_state, 'onboarded') END,
    email = CASE WHEN EXCLUDED.is_anonymous = false AND users.is_anonymous = true THEN EXCLUDED.email ELSE users.email END;

  RETURN new;
END;
$$;

-- 3. REFINE HANDLE_AUTH_USER_UPDATED FUNCTION
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider text;
  v_is_anonymous boolean;
  v_display_name text;
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_username text;
  v_role text;
BEGIN
  v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'supabase');
  v_is_anonymous := COALESCE(new.is_anonymous, false);
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
  v_first_name := NULLIF(new.raw_user_meta_data->>'first_name', '');
  v_last_name := NULLIF(new.raw_user_meta_data->>'last_name', '');
  v_username := NULLIF(new.raw_user_meta_data->>'username', '');
  v_role := new.raw_user_meta_data->>'role';

  INSERT INTO public.users (id, email, display_name, full_name, first_name, last_name, username, avatar_url, role, is_anonymous, identity_state)
  VALUES (
    new.id,
    CASE WHEN v_is_anonymous THEN NULL ELSE new.email END,
    COALESCE(v_display_name, v_full_name, CASE WHEN v_is_anonymous THEN 'Guest' ELSE 'Sanctuary User' END),
    COALESCE(
      v_full_name,
      CASE
        WHEN v_first_name IS NOT NULL OR v_last_name IS NOT NULL
          THEN TRIM(CONCAT_WS(' ', COALESCE(v_first_name, ''), COALESCE(v_last_name, '')))
        WHEN v_is_anonymous THEN 'Guest'
        ELSE 'Sanctuary User'
      END
    ),
    v_first_name,
    v_last_name,
    v_username,
    new.raw_user_meta_data->>'avatar_url',
    CASE
        WHEN v_role IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer') THEN v_role
        WHEN v_is_anonymous THEN 'guest'
        ELSE NULL
      END,
    v_is_anonymous,
    CASE WHEN v_is_anonymous THEN 'anonymous' ELSE 'onboarded' END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = CASE WHEN EXCLUDED.is_anonymous THEN public.users.email ELSE COALESCE(EXCLUDED.email, public.users.email) END,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    username = COALESCE(EXCLUDED.username, public.users.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    is_anonymous = EXCLUDED.is_anonymous,
    identity_state = CASE WHEN EXCLUDED.is_anonymous THEN 'anonymous' ELSE COALESCE(public.users.identity_state, 'onboarded') END,
    role = CASE
      WHEN v_role IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer') THEN v_role
      WHEN EXCLUDED.is_anonymous THEN COALESCE(public.users.role, 'guest')
      ELSE public.users.role
    END,
    updated_at = now();

  INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
  VALUES (new.id, v_provider, new.id::text)
  ON CONFLICT (provider, provider_user_id) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        updated_at = now();

  RETURN new;
END;
$$;

COMMIT;

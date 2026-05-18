-- ============================================================================
-- Migration: 20260511000000_split_display_name_profile_identity
-- Purpose:
--   Normalize user naming so onboarding collects a display name, while profile
--   completion can store first name, last name, and unique username/handle.
--
--   Identity flow:
--   - display_name: canonical in-app display name
--   - full_name: compatibility mirror for older code paths
--   - first_name + last_name: structured profile identity
--   - username: unique public handle
--   - identity_state: anonymous | onboarded | verified
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS identity_state TEXT DEFAULT 'anonymous';

COMMENT ON COLUMN public.users.display_name IS 'Canonical in-app display name shown throughout Gurudevi.';
COMMENT ON COLUMN public.users.first_name IS 'Preferred first name for profile and structured identity.';
COMMENT ON COLUMN public.users.last_name IS 'Preferred last name for profile and structured identity.';
COMMENT ON COLUMN public.users.identity_state IS 'Lifecycle state for the user identity: anonymous, onboarded, or verified.';

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
    COALESCE(new.raw_user_meta_data->>'role', CASE WHEN v_is_anonymous THEN 'member' ELSE 'teacher' END),
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
        WHEN v_role IN ('founder','admin','principal','section_head','grade_head','teacher','student','member','developer') THEN v_role
        WHEN v_is_anonymous THEN 'member'
        ELSE 'teacher'
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
      WHEN v_role IN ('founder','admin','principal','section_head','grade_head','teacher','student','member','developer') THEN v_role
      WHEN EXCLUDED.is_anonymous THEN COALESCE(public.users.role, 'member')
      ELSE COALESCE(public.users.role, 'teacher')
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

UPDATE public.users
SET
  display_name = COALESCE(display_name, full_name, TRIM(CONCAT_WS(' ', COALESCE(first_name, ''), COALESCE(last_name, ''))), 'Gurudevi User'),
  first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
  last_name = COALESCE(
    last_name,
    NULLIF(regexp_replace(full_name, '^[^ ]+\s*', ''), '')
  ),
  full_name = COALESCE(
    NULLIF(full_name, ''),
    display_name,
    TRIM(CONCAT_WS(' ', COALESCE(first_name, ''), COALESCE(last_name, ''))),
    'Gurudevi User'
  ),
  identity_state = COALESCE(identity_state, CASE WHEN COALESCE(is_anonymous, false) THEN 'anonymous' ELSE 'onboarded' END)
WHERE full_name IS NOT NULL;

-- ============================================================================
-- Migration: 20260522150000_migrate_role_to_capacity
-- Purpose:
--   1. Rename public.users.role to capacity.
--   2. Drop old check constraint and establish new users_capacity_check constraint.
--   3. Update handle_new_user and handle_auth_user_updated trigger functions
--      to read/write capacity while maintaining backwards compatibility.
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT TRIGGER BEFORE COLUMN ALTERATIONS
DROP TRIGGER IF EXISTS tr_user_profile_sync_after ON public.users;

-- Update trigger function to use capacity instead of role
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync_after() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_growth_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_social_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

    IF (NEW.capacity = 'teacher') THEN
        INSERT INTO public.teacher_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.capacity = 'principal') THEN
        INSERT INTO public.principal_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.capacity = 'student') THEN
        INSERT INTO public.student_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- CONDITIONAL RENAME OR CLEANUP OF ROLE/CAPACITY
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
      AND table_schema = 'public'
      AND column_name = 'capacity'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN role TO capacity;
  ELSE
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND table_schema = 'public'
        AND column_name = 'role'
    ) THEN
      ALTER TABLE public.users DROP COLUMN role;
    END IF;
  END IF;
END $$;

-- RECREATE TRIGGER TARGETING CAPACITY
CREATE TRIGGER tr_user_profile_sync_after 
    AFTER INSERT OR UPDATE OF capacity ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_profile_sync_after();

-- 2. UPDATE CHECK CONSTRAINT
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check,
  DROP CONSTRAINT IF EXISTS users_capacity_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_capacity_check CHECK (
    capacity IS NULL OR capacity = ANY (ARRAY[
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

-- 3. UPDATE HANDLE_NEW_USER FUNCTION
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
  v_capacity text;
BEGIN
  v_is_anonymous := COALESCE((new.raw_user_meta_data->>'is_anonymous')::boolean, (new.email IS NULL));
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
  v_first_name := NULLIF(new.raw_user_meta_data->>'first_name', '');
  v_last_name := NULLIF(new.raw_user_meta_data->>'last_name', '');
  v_username := NULLIF(new.raw_user_meta_data->>'username', '');
  
  -- Prioritize capacity but fall back to role for older clients/tests
  v_capacity := COALESCE(new.raw_user_meta_data->>'capacity', new.raw_user_meta_data->>'role');

  INSERT INTO public.users (id, email, display_name, full_name, first_name, last_name, username, capacity, is_anonymous, identity_state)
  VALUES (
    new.id,
    COALESCE(new.email, 'anonymous@' || new.id::text),
    COALESCE(v_display_name, v_full_name, CASE WHEN v_is_anonymous THEN 'Guest User' ELSE 'Sanctuary User' END),
    COALESCE(v_full_name, CASE WHEN v_is_anonymous THEN 'Guest User' ELSE 'Sanctuary User' END),
    v_first_name,
    v_last_name,
    v_username,
    COALESCE(
      v_capacity, 
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

-- 4. UPDATE HANDLE_AUTH_USER_UPDATED FUNCTION
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
  v_capacity text;
BEGIN
  v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'supabase');
  v_is_anonymous := COALESCE(new.is_anonymous, false);
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
  v_first_name := NULLIF(new.raw_user_meta_data->>'first_name', '');
  v_last_name := NULLIF(new.raw_user_meta_data->>'last_name', '');
  v_username := NULLIF(new.raw_user_meta_data->>'username', '');
  
  -- Prioritize capacity but fall back to role for older clients/tests
  v_capacity := COALESCE(new.raw_user_meta_data->>'capacity', new.raw_user_meta_data->>'role');

  INSERT INTO public.users (id, email, display_name, full_name, first_name, last_name, username, avatar_url, capacity, is_anonymous, identity_state)
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
        WHEN v_capacity IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer') THEN v_capacity
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
    capacity = CASE
      WHEN v_capacity IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer') THEN v_capacity
      WHEN EXCLUDED.is_anonymous THEN COALESCE(public.users.capacity, 'guest')
      ELSE public.users.capacity
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

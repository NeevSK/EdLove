-- Migration: canonical_account_email_binding
-- Description: Correctly let public.users generate UUIDv8 canonical account id via default new_edlove_account_id()
--              and bind existing canonical accounts by email.

CREATE OR REPLACE FUNCTION public.sync_canonical_auth_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE account_id uuid; display_label text;
BEGIN
  -- 1. Try finding an existing binding for this provider_user_id
  SELECT identity.user_id INTO account_id FROM public.auth_identities AS identity
    WHERE identity.provider='supabase' AND identity.provider_user_id=NEW.id::text FOR UPDATE;

  -- 2. If no binding exists, check if a canonical account exists with the same email
  IF account_id IS NULL AND NULLIF(NEW.email, '') IS NOT NULL THEN
    SELECT account.id INTO account_id FROM public.users AS account
    WHERE account.email = NEW.email AND account.deleted_at IS NULL
    LIMIT 1;

    IF account_id IS NOT NULL THEN
      INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
      VALUES (account_id, 'supabase', NEW.id::text)
      ON CONFLICT (provider, provider_user_id) DO NOTHING;
    END IF;
  END IF;

  display_label := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''),
    NULLIF(NEW.raw_user_meta_data->>'full_name',''),'Gurudevi User');

  -- 3. If still no account, insert without explicit id so default new_edlove_account_id() generates UUIDv8
  IF account_id IS NULL THEN
    INSERT INTO public.users (email,phone,full_name,display_name,first_name,last_name,username,
      avatar_url,is_anonymous,identity_state)
    VALUES (NULLIF(NEW.email,''),NULLIF(to_jsonb(NEW)->>'phone',''),display_label,display_label,
      NULLIF(NEW.raw_user_meta_data->>'first_name',''),NULLIF(NEW.raw_user_meta_data->>'last_name',''),
      NULLIF(NEW.raw_user_meta_data->>'username',''),NEW.raw_user_meta_data->>'avatar_url',
      COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean,false),'anonymous')
    RETURNING id INTO account_id;

    INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
    VALUES (account_id, 'supabase', NEW.id::text)
    ON CONFLICT (provider, provider_user_id) DO NOTHING;
  END IF;

  -- 4. Sync profile attributes to the canonical user
  UPDATE public.users AS account SET
    email = COALESCE(NULLIF(NEW.email, ''), account.email),
    phone = COALESCE(NULLIF(to_jsonb(NEW)->>'phone', ''), account.phone),
    display_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), account.display_name),
    full_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), account.full_name),
    first_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), account.first_name),
    last_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), account.last_name),
    username = COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), account.username),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', account.avatar_url),
    is_anonymous = COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean, false),
    identity_state = CASE WHEN COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean, false) THEN 'anonymous'
      ELSE COALESCE(NULLIF(account.identity_state, 'anonymous'), 'onboarded') END,
    updated_at = now()
  WHERE account.id = account_id AND account.deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canonical account is unavailable' USING ERRCODE = '28000';
  END IF;

  RETURN NEW;
END;
$$;

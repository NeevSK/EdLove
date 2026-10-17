-- Identity bindings are created by trusted Auth provisioning, never client healing.
LOCK TABLE public.auth_identities IN SHARE ROW EXCLUSIVE MODE;
-- A new account has no role until the existing explicit onboarding flow assigns it.
ALTER TABLE public.users ALTER COLUMN capacity DROP NOT NULL, ALTER COLUMN capacity DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users AS subject
    JOIN public.auth_identities AS historical ON historical.provider_user_id = subject.id::text
    WHERE NOT EXISTS (
      SELECT 1 FROM public.auth_identities AS canonical
      WHERE canonical.provider = 'supabase' AND canonical.provider_user_id = subject.id::text
    ) AND historical.user_id <> subject.id
  ) THEN
    RAISE EXCEPTION 'Identity mappings require explicit reconciliation before canonical backfill';
  END IF;
END;
$$;

INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
SELECT account.id, 'supabase', subject.id::text
FROM auth.users AS subject JOIN public.users AS account ON account.id = subject.id
WHERE account.deleted_at IS NULL
ON CONFLICT (provider, provider_user_id) DO NOTHING;

ALTER TABLE public.auth_identities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auth_identities FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.auth_identities TO authenticated;
DROP POLICY IF EXISTS "Users can manage their own auth identities" ON public.auth_identities;
DROP POLICY IF EXISTS "Anonymous users can manage their own identities" ON public.auth_identities;
DROP POLICY IF EXISTS "Read current Supabase binding" ON public.auth_identities;
CREATE POLICY "Read current Supabase binding" ON public.auth_identities
FOR SELECT TO authenticated
USING (provider = 'supabase' AND provider_user_id = (SELECT auth.uid())::text);
DROP POLICY IF EXISTS "Fence current Supabase binding" ON public.auth_identities;
CREATE POLICY "Fence current Supabase binding" ON public.auth_identities AS RESTRICTIVE
FOR SELECT TO authenticated
USING (provider = 'supabase' AND provider_user_id = (SELECT auth.uid())::text);

CREATE OR REPLACE FUNCTION public.get_my_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT account.id FROM public.auth_identities AS identity
  JOIN public.users AS account ON account.id = identity.user_id
  WHERE identity.provider = 'supabase' AND identity.provider_user_id = auth.uid()::text
    AND account.deleted_at IS NULL;
$$;
REVOKE ALL ON FUNCTION public.get_my_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_id() TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION public.sync_canonical_auth_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  account_id uuid;
  display_label text;
BEGIN
  SELECT identity.user_id INTO account_id FROM public.auth_identities AS identity
  WHERE identity.provider = 'supabase' AND identity.provider_user_id = NEW.id::text
  FOR UPDATE;

  display_label := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Sanctuary User');
  IF account_id IS NULL THEN
    account_id := NEW.id;
    INSERT INTO public.users (id, email, phone, full_name, display_name, first_name,
      last_name, username, avatar_url, is_anonymous, identity_state)
    VALUES (account_id, NULLIF(NEW.email, ''), NULLIF(NEW.phone, ''), display_label,
      display_label, NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'last_name', ''), NULLIF(NEW.raw_user_meta_data->>'username', ''),
      NEW.raw_user_meta_data->>'avatar_url', COALESCE(NEW.is_anonymous, false),
      CASE WHEN COALESCE(NEW.is_anonymous, false) THEN 'anonymous' ELSE 'onboarded' END)
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
    VALUES (account_id, 'supabase', NEW.id::text)
    ON CONFLICT (provider, provider_user_id) DO NOTHING;
    SELECT identity.user_id INTO STRICT account_id FROM public.auth_identities AS identity
    WHERE identity.provider = 'supabase' AND identity.provider_user_id = NEW.id::text;
  END IF;

  UPDATE public.users AS account SET
    email = COALESCE(NULLIF(NEW.email, ''), account.email),
    phone = COALESCE(NULLIF(NEW.phone, ''), account.phone),
    display_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), account.display_name),
    full_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), account.full_name),
    first_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), account.first_name),
    last_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), account.last_name),
    username = COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), account.username),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', account.avatar_url),
    is_anonymous = COALESCE(NEW.is_anonymous, false),
    identity_state = CASE WHEN COALESCE(NEW.is_anonymous, false) THEN 'anonymous'
      ELSE COALESCE(NULLIF(account.identity_state, 'anonymous'), 'onboarded') END,
    updated_at = now()
  WHERE account.id = account_id AND account.deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canonical account is unavailable' USING ERRCODE = '28000';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_canonical_auth_account() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_canonical_auth_account();

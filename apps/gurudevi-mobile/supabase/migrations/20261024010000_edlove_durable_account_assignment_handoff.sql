-- A transactional handoff request for newly durable accounts, consumed by the
-- server worker only after commit. Existing accounts are never seeded: this
-- table is populated only by future auth.users inserts or an anonymous-to-
-- durable transition observed by the canonical-auth trigger.
CREATE TABLE IF NOT EXISTS private.edlove_account_assignment_requests (
  account_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error_code text,
  claim_token uuid,
  claim_expires_at timestamptz
);

ALTER TABLE private.edlove_account_assignment_requests
  ADD COLUMN IF NOT EXISTS claim_token uuid,
  ADD COLUMN IF NOT EXISTS claim_expires_at timestamptz;

ALTER TABLE private.edlove_account_assignment_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.edlove_account_assignment_requests
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.claim_edlove_account_assignment_requests(max_requests integer)
RETURNS TABLE (account_id uuid, claim_token uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF max_requests IS NULL OR max_requests < 1 OR max_requests > 100 THEN
    RAISE EXCEPTION 'max_requests must be between 1 and 100' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT request.account_id
      FROM private.edlove_account_assignment_requests AS request
      JOIN public.users AS account ON account.id = request.account_id
     WHERE request.completed_at IS NULL
       AND (request.claim_expires_at IS NULL OR request.claim_expires_at <= pg_catalog.clock_timestamp())
       AND account.deleted_at IS NULL
       AND account.is_anonymous = false
     ORDER BY request.requested_at ASC, request.account_id ASC
     LIMIT max_requests
     FOR UPDATE OF request SKIP LOCKED
  )
  UPDATE private.edlove_account_assignment_requests AS request
     SET claim_token = pg_catalog.gen_random_uuid(),
         claim_expires_at = pg_catalog.clock_timestamp() + interval '5 minutes'
    FROM candidates
   WHERE request.account_id = candidates.account_id
  RETURNING request.account_id, request.claim_token;
END;
$$;

REVOKE ALL ON FUNCTION private.claim_edlove_account_assignment_requests(integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.claim_edlove_account_assignment_requests(integer) TO postgres;

CREATE OR REPLACE FUNCTION public.sync_canonical_auth_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  canonical_account_id uuid;
  display_label text;
  inserted_new_canonical_account_count integer := 0;
  became_durable boolean := false;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    became_durable := COALESCE((to_jsonb(OLD)->>'is_anonymous')::boolean, false)
      AND NOT COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean, false);
  END IF;

  SELECT identity.user_id INTO canonical_account_id FROM public.auth_identities AS identity
  WHERE identity.provider = 'supabase' AND identity.provider_user_id = NEW.id::text
  FOR UPDATE;

  display_label := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Sanctuary User');
  IF canonical_account_id IS NULL THEN
    canonical_account_id := NEW.id;
    INSERT INTO public.users (id, email, phone, full_name, display_name, first_name,
      last_name, username, avatar_url, is_anonymous, identity_state)
    VALUES (canonical_account_id, NULLIF(NEW.email, ''), NULLIF(to_jsonb(NEW)->>'phone', ''), display_label,
      display_label, NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'last_name', ''), NULLIF(NEW.raw_user_meta_data->>'username', ''),
      NEW.raw_user_meta_data->>'avatar_url', COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean, false),
      CASE WHEN COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean, false) THEN 'anonymous' ELSE 'onboarded' END)
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS inserted_new_canonical_account_count = ROW_COUNT;
    INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
    VALUES (canonical_account_id, 'supabase', NEW.id::text)
    ON CONFLICT (provider, provider_user_id) DO NOTHING;
    SELECT identity.user_id INTO STRICT canonical_account_id FROM public.auth_identities AS identity
    WHERE identity.provider = 'supabase' AND identity.provider_user_id = NEW.id::text;
  END IF;

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
  WHERE account.id = canonical_account_id AND account.deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canonical account is unavailable' USING ERRCODE = '28000';
  END IF;

  IF NOT COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean, false)
     AND (inserted_new_canonical_account_count > 0 OR became_durable) THEN
    INSERT INTO private.edlove_account_assignment_requests (account_id)
    VALUES (canonical_account_id)
    ON CONFLICT (account_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON TABLE private.edlove_account_assignment_requests IS
  'Private retry ledger for UUIDv8 assignment after a newly durable canonical account commits. Existing accounts are never automatically enqueued.';

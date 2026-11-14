BEGIN;

-- This pre-production programme defaults to the registered non-production
-- origin. A production admission must explicitly set the singleton to 0.
ALTER TABLE private.edlove_account_clock
  ADD COLUMN IF NOT EXISTS mint_origin smallint NOT NULL DEFAULT 1
    CHECK (mint_origin IN (0,1));

CREATE OR REPLACE FUNCTION public.new_edlove_account_id()
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = '' SET lock_timeout = '5s' AS $$
DECLARE
  observed bigint;
  stamp bigint;
  origin smallint;
  bytes bytea;
  candidate uuid;
BEGIN
  INSERT INTO private.edlove_account_clock(singleton,last_issued_at_ms)
    VALUES (true,0) ON CONFLICT (singleton) DO NOTHING;
  SELECT last_issued_at_ms,mint_origin INTO STRICT stamp,origin
    FROM private.edlove_account_clock WHERE singleton FOR UPDATE;
  -- Sample after waiting for the issuer lock: contention is not clock drift.
  observed := floor(extract(epoch FROM pg_catalog.clock_timestamp()) * 1000);
  IF stamp-observed>30000 THEN
    RAISE LOG 'EDLOVE_ACCOUNT_CLOCK_ROLLBACK_EXCEEDED';
    RAISE EXCEPTION 'EDLOVE_ACCOUNT_CLOCK_ROLLBACK_EXCEEDED' USING ERRCODE='22008';
  ELSIF stamp>observed THEN
    RAISE WARNING 'EDLOVE_ACCOUNT_CLOCK_ROLLBACK_RETAINED';
  ELSE
    stamp := observed;
  END IF;
  UPDATE private.edlove_account_clock SET last_issued_at_ms=stamp WHERE singleton;
  FOR attempt IN 1..5 LOOP
    bytes := pg_catalog.uuid_send(pg_catalog.gen_random_uuid());
    FOR i IN 0..5 LOOP
      bytes := pg_catalog.set_byte(bytes, i, ((stamp >> ((5-i)*8)) & 255)::integer);
    END LOOP;
    bytes := pg_catalog.set_byte(bytes, 6, 129);
    bytes := pg_catalog.set_byte(bytes, 7, 1);
    bytes := pg_catalog.set_byte(bytes, 8, 128+origin);
    candidate := pg_catalog.encode(bytes, 'hex')::uuid;
    -- All default issuers hold this singleton lock through their insert/commit.
    -- The primary key remains the final guard against privileged explicit IDs.
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id=candidate) THEN RETURN candidate; END IF;
    RAISE LOG 'EDLOVE_ACCOUNT_ID_COLLISION attempt=%', attempt;
  END LOOP;
  RAISE EXCEPTION 'EDLOVE_ACCOUNT_ENTROPY_COLLISION_EXHAUSTED' USING ERRCODE='54000';
END;
$$;
REVOKE ALL ON FUNCTION public.new_edlove_account_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.new_edlove_account_id() TO service_role;

CREATE OR REPLACE FUNCTION public.sync_canonical_auth_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  account_id uuid;
  display_label text;
  violation_constraint text;
  violation_table text;
  violation_schema text;
BEGIN
  SELECT identity.user_id INTO account_id FROM public.auth_identities AS identity
    WHERE identity.provider='supabase' AND identity.provider_user_id=NEW.id::text FOR UPDATE;
  display_label := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''),
    NULLIF(NEW.raw_user_meta_data->>'full_name',''),'Sanctuary User');
  IF account_id IS NULL THEN
    FOR attempt IN 1..5 LOOP
      BEGIN
        INSERT INTO public.users (email,phone,full_name,display_name,first_name,last_name,username,
          avatar_url,is_anonymous,identity_state)
        VALUES (NULLIF(NEW.email,''),NULLIF(to_jsonb(NEW)->>'phone',''),display_label,display_label,
          NULLIF(NEW.raw_user_meta_data->>'first_name',''),NULLIF(NEW.raw_user_meta_data->>'last_name',''),
          NULLIF(NEW.raw_user_meta_data->>'username',''),NEW.raw_user_meta_data->>'avatar_url',
          COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean,false),'anonymous')
        RETURNING id INTO account_id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS violation_constraint=CONSTRAINT_NAME,
          violation_table=TABLE_NAME, violation_schema=SCHEMA_NAME;
        IF violation_constraint<>'users_pkey' OR violation_table<>'users' OR violation_schema<>'public' THEN
          RAISE;
        END IF;
        RAISE LOG 'EDLOVE_ACCOUNT_INSERT_COLLISION attempt=%', attempt;
        IF attempt=5 THEN RAISE; END IF;
      END;
    END LOOP;
    INSERT INTO public.auth_identities (user_id,provider,provider_user_id)
      VALUES (account_id,'supabase',NEW.id::text);
  END IF;
  UPDATE public.users AS account SET
    email=COALESCE(NULLIF(NEW.email,''),account.email),
    phone=COALESCE(NULLIF(to_jsonb(NEW)->>'phone',''),account.phone),
    display_name=COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''),account.display_name),
    full_name=COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''),account.full_name),
    first_name=COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name',''),account.first_name),
    last_name=COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name',''),account.last_name),
    username=COALESCE(NULLIF(NEW.raw_user_meta_data->>'username',''),account.username),
    avatar_url=COALESCE(NEW.raw_user_meta_data->>'avatar_url',account.avatar_url),
    is_anonymous=COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean,false),updated_at=now()
    WHERE account.id=account_id AND account.deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'CANONICAL_ACCOUNT_UNAVAILABLE' USING ERRCODE='28000'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_canonical_auth_account() FROM PUBLIC, anon, authenticated;

COMMIT;

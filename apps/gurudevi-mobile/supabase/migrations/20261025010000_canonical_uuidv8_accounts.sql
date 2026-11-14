-- Pre-production cutover authorized on 2026-10-25: account keys, not aliases.
BEGIN;
SET LOCAL lock_timeout = '10s';
LOCK TABLE public.users, public.auth_identities IN ACCESS EXCLUSIVE MODE;

CREATE TABLE private.edlove_account_clock (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  last_issued_at_ms bigint NOT NULL CHECK (last_issued_at_ms BETWEEN 0 AND 281474976710655),
  mint_origin smallint NOT NULL DEFAULT 1 CHECK (mint_origin IN (0,1))
);
REVOKE ALL ON private.edlove_account_clock FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.new_edlove_account_id()
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  observed bigint := floor(extract(epoch FROM pg_catalog.clock_timestamp()) * 1000);
  stamp bigint;
  origin smallint;
  bytes bytea := pg_catalog.uuid_send(pg_catalog.gen_random_uuid());
BEGIN
  INSERT INTO private.edlove_account_clock(singleton,last_issued_at_ms) VALUES (true,observed)
    ON CONFLICT (singleton) DO UPDATE
    SET last_issued_at_ms=greatest(private.edlove_account_clock.last_issued_at_ms,excluded.last_issued_at_ms)
    RETURNING last_issued_at_ms,mint_origin INTO stamp,origin;
  IF stamp-observed>30000 THEN
    RAISE EXCEPTION 'EDLOVE_ACCOUNT_CLOCK_ROLLBACK_EXCEEDED' USING ERRCODE='22008';
  ELSIF stamp>observed THEN
    RAISE WARNING 'EdLove account issuer retained its logical timestamp after clock rollback';
  END IF;
  FOR i IN 0..5 LOOP
    bytes := pg_catalog.set_byte(bytes, i, ((stamp >> ((5-i)*8)) & 255)::integer);
  END LOOP;
  bytes := pg_catalog.set_byte(bytes, 6, 129);
  bytes := pg_catalog.set_byte(bytes, 7, 1);
  bytes := pg_catalog.set_byte(bytes, 8, 128+origin);
  RETURN pg_catalog.encode(bytes, 'hex')::uuid;
END;
$$;
REVOKE ALL ON FUNCTION public.new_edlove_account_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.new_edlove_account_id() TO service_role;

-- Keep the remapping inside this transaction; no second public identity remains.
CREATE TEMP TABLE edlove_account_rekey ON COMMIT DROP AS
SELECT id AS old_id,
  CASE WHEN public.is_edlove_account_uuid_v8_profile_v1(id) THEN id
       WHEN edlove_id IS NOT NULL THEN edlove_id
       ELSE public.new_edlove_account_id() END AS new_id
FROM public.users;
ALTER TABLE edlove_account_rekey ADD PRIMARY KEY (old_id), ADD UNIQUE (new_id);
CREATE TEMP TABLE edlove_subject_rekey ON COMMIT DROP AS
SELECT binding.provider_user_id AS subject_id, map.new_id
FROM public.auth_identities binding JOIN edlove_account_rekey map ON map.old_id=binding.user_id
WHERE binding.provider='supabase';

CREATE TEMP TABLE edlove_account_foreign_keys ON COMMIT DROP AS
SELECT k.oid, k.conrelid, k.conname, k.conkey, k.confrelid,
       pg_catalog.pg_get_constraintdef(k.oid) AS definition
FROM pg_catalog.pg_constraint k
JOIN pg_catalog.pg_namespace n ON n.oid=k.connamespace
WHERE k.contype='f' AND k.conparentid=0
  AND n.nspname IN ('public','private','audit')
  AND k.confrelid IN ('public.users'::regclass, 'auth.users'::regclass);

DO $$
DECLARE item record; col text; replacement text;
BEGIN
  FOR item IN SELECT * FROM edlove_account_foreign_keys LOOP
    IF array_length(item.conkey,1) <> 1 THEN
      RAISE EXCEPTION 'Account cutover requires explicit composite-FK handling: %', item.conname;
    END IF;
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', item.conrelid::regclass, item.conname);
  END LOOP;

  FOR item IN SELECT * FROM edlove_account_foreign_keys LOOP
    SELECT attname INTO STRICT col FROM pg_catalog.pg_attribute
      WHERE attrelid=item.conrelid AND attnum=item.conkey[1];
    IF item.conrelid='public.users'::regclass AND col='id' THEN CONTINUE; END IF;
    IF item.confrelid='auth.users'::regclass THEN
      EXECUTE format('UPDATE %s AS target SET %I=map.new_id
        FROM edlove_subject_rekey AS map WHERE target.%I=map.subject_id::uuid',
        item.conrelid::regclass,col,col);
    ELSE
      EXECUTE format('UPDATE %s AS target SET %I=map.new_id FROM edlove_account_rekey AS map
        WHERE target.%I=map.old_id AND map.old_id<>map.new_id', item.conrelid::regclass,col,col);
    END IF;
  END LOOP;

  -- These authoritative columns have no FK in the existing partitioned schema.
  FOR item IN SELECT * FROM (VALUES
    ('public.calendar_events','created_by'), ('public.classroom_grade_classes','created_by'),
    ('public.growth_events','user_id'), ('public.privacy_ledger_entries','user_id'),
    ('public.security_audit_logs','account_id'), ('public.sentinel_audit_logs','actor_id'),
    ('public.edu_school_pulse_logs','author_profile_id'),
    ('public.student_longitudinal_events','student_id'), ('public.student_longitudinal_events','recorded_by')
  ) AS columns(table_name,column_name) LOOP
    EXECUTE format('UPDATE %s AS target SET %I=map.new_id FROM edlove_account_rekey AS map
      WHERE target.%I=map.old_id AND map.old_id<>map.new_id', item.table_name,item.column_name,item.column_name);
  END LOOP;

  FOR item IN SELECT * FROM (VALUES
    ('public.editorial_distribution_deliveries','account_id'),
    ('public.powersync_idempotency_keys','principal_id')
  ) AS columns(table_name,column_name) LOOP
    EXECUTE format('UPDATE %s AS target SET %I=map.new_id::text FROM edlove_account_rekey AS map
      WHERE target.%I=map.old_id::text AND map.old_id<>map.new_id', item.table_name,item.column_name,item.column_name);
  END LOOP;

  UPDATE public.users AS account SET id=map.new_id FROM edlove_account_rekey AS map
    WHERE account.id=map.old_id AND map.old_id<>map.new_id;

  FOR item IN SELECT * FROM edlove_account_foreign_keys LOOP
    SELECT attname INTO STRICT col FROM pg_catalog.pg_attribute
      WHERE attrelid=item.conrelid AND attnum=item.conkey[1];
    IF item.conrelid='public.users'::regclass AND col='id' THEN CONTINUE; END IF;
    replacement := replace(item.definition, 'REFERENCES auth.users(id)', 'REFERENCES public.users(id)');
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', item.conrelid::regclass,item.conname,replacement);
  END LOOP;
END;
$$;

-- Existing business RLS refers to accounts. Only the credential ledger uses sub.
DO $$
DECLARE item record; statement text;
BEGIN
  FOR item IN SELECT * FROM pg_catalog.pg_policies WHERE schemaname='public'
    AND tablename<>'auth_identities'
    AND (coalesce(qual,'') || coalesce(with_check,'')) LIKE '%auth.uid()%' LOOP
    statement := format('ALTER POLICY %I ON %I.%I',item.policyname,item.schemaname,item.tablename);
    IF item.qual IS NOT NULL THEN
      statement := statement || ' USING (' || replace(item.qual,'auth.uid()','public.get_my_id()') || ')';
    END IF;
    IF item.with_check IS NOT NULL THEN
      statement := statement || ' WITH CHECK (' || replace(item.with_check,'auth.uid()','public.get_my_id()') || ')';
    END IF;
    EXECUTE statement;
  END LOOP;
  FOR item IN SELECT p.oid FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname IN ('public','audit') AND p.prokind='f' AND p.prosrc LIKE '%auth.uid()%'
      AND p.proname NOT IN ('get_my_id','delete_user_account', 'get_account_lifecycle_status',
        'get_account_deletion_request_status','request_account_deletion','cancel_account_deletion_request') LOOP
    EXECUTE replace(pg_catalog.pg_get_functiondef(item.oid),'auth.uid()','public.get_my_id()');
  END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS reject_unconfigured_edlove_account_id_write ON public.users;
DROP FUNCTION public.reject_unconfigured_edlove_account_id_write();
-- Assignment queues belong to the superseded alias architecture.
DO $$
DECLARE item record;
BEGIN
  FOR item IN SELECT p.oid::regprocedure AS signature FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='private' AND p.proname LIKE '%edlove%'
  LOOP
    EXECUTE format('DROP FUNCTION %s',item.signature);
  END LOOP;
END;
$$;
DROP TABLE private.edlove_historical_assignment_operation_items;
DROP TABLE private.edlove_historical_assignment_operations;
DROP TABLE private.edlove_historical_assignment_controls;
DROP TABLE private.edlove_account_assignment_requests;
ALTER TABLE public.users DROP COLUMN edlove_id;
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT public.new_edlove_account_id();
ALTER TABLE public.users ADD CONSTRAINT users_canonical_edlove_account_id
  CHECK (public.is_edlove_account_uuid_v8_profile_v1(id));
GRANT EXECUTE ON FUNCTION public.is_edlove_account_uuid_v8_profile_v1(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_canonical_account_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP='UPDATE' AND NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'CANONICAL_ACCOUNT_ID_IS_IMMUTABLE' USING ERRCODE='23514';
  END IF;
  IF NOT public.is_edlove_account_uuid_v8_profile_v1(NEW.id) THEN
    RAISE EXCEPTION 'CANONICAL_ACCOUNT_ID_MUST_BE_EDLOVE_UUIDV8' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_canonical_account_identity BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_canonical_account_identity();

CREATE OR REPLACE FUNCTION public.sync_canonical_auth_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE account_id uuid; display_label text;
BEGIN
  SELECT identity.user_id INTO account_id FROM public.auth_identities AS identity
    WHERE identity.provider='supabase' AND identity.provider_user_id=NEW.id::text FOR UPDATE;
  display_label := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name',''),
    NULLIF(NEW.raw_user_meta_data->>'full_name',''),'Sanctuary User');
  IF account_id IS NULL THEN
    INSERT INTO public.users (email,phone,full_name,display_name,first_name,last_name,username,
      avatar_url,is_anonymous,identity_state)
    VALUES (NULLIF(NEW.email,''),NULLIF(to_jsonb(NEW)->>'phone',''),display_label,display_label,
      NULLIF(NEW.raw_user_meta_data->>'first_name',''),NULLIF(NEW.raw_user_meta_data->>'last_name',''),
      NULLIF(NEW.raw_user_meta_data->>'username',''),NEW.raw_user_meta_data->>'avatar_url',
      COALESCE((to_jsonb(NEW)->>'is_anonymous')::boolean,false),'anonymous')
    RETURNING id INTO account_id;
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

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE account_id uuid := public.get_my_id();
BEGIN
  IF account_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='28000'; END IF;
  -- Credential removal no longer owns the lifetime of the domain account.
  UPDATE public.users SET deleted_at=now() WHERE id=account_id;
  DELETE FROM auth.users WHERE id IN (
    SELECT provider_user_id::uuid FROM public.auth_identities
    WHERE user_id=account_id AND provider='supabase'
  );
END;
$$;

COMMENT ON COLUMN public.users.id IS 'Canonical immutable EdLove UUIDv8 account key. Auth subjects exist only in auth_identities.';

CREATE OR REPLACE FUNCTION public.canonical_account_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE account_id uuid;
BEGIN
  SELECT account.id INTO STRICT account_id FROM public.auth_identities binding
    JOIN public.users account ON account.id=binding.user_id
    WHERE binding.provider='supabase' AND binding.provider_user_id=event->>'user_id'
      AND account.deleted_at IS NULL;
  RETURN pg_catalog.jsonb_set(event,'{claims}',
    (event->'claims') || pg_catalog.jsonb_build_object('canonical_account_id',account_id::text));
EXCEPTION WHEN no_data_found OR too_many_rows THEN
  RAISE EXCEPTION 'CANONICAL_ACCOUNT_BINDING_REQUIRED' USING ERRCODE='28000';
END;
$$;
REVOKE ALL ON FUNCTION public.canonical_account_access_token_hook(jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.canonical_account_access_token_hook(jsonb) TO supabase_auth_admin;
COMMIT;

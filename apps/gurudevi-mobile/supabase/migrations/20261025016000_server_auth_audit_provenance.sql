BEGIN;

-- The partition rebuild omitted this column still used by log_my_device_audit.
ALTER TABLE public.security_audit_logs
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS event_source text NOT NULL DEFAULT 'client_report'
    CHECK (event_source IN ('client_report','server_observed'));
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polrelid='public.security_audit_logs'::regclass
   AND polname='security_audit_account_read') THEN
  CREATE POLICY security_audit_account_read ON public.security_audit_logs FOR SELECT TO authenticated
   USING (account_id=(SELECT public.get_my_id()));
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polrelid='public.security_audit_logs'::regclass
   AND polname='security_audit_client_report_insert') THEN
  CREATE POLICY security_audit_client_report_insert ON public.security_audit_logs FOR INSERT TO authenticated
   WITH CHECK (account_id=(SELECT public.get_my_id()) AND event_source='client_report');
 END IF;
END $$;
GRANT SELECT ON public.security_audit_logs TO authenticated;

CREATE OR REPLACE FUNCTION private.guard_server_auth_audit()
RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.event_source='server_observed' AND current_user IN ('anon','authenticated') THEN
      RAISE EXCEPTION 'Server audit provenance cannot be supplied by a client' USING ERRCODE='42501';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.event_source='server_observed' OR
    (TG_OP='UPDATE' AND NEW.event_source='server_observed') THEN
    RAISE EXCEPTION 'Server auth audit events are immutable' USING ERRCODE='42501';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_server_auth_audit() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER guard_server_auth_audit
 BEFORE INSERT OR UPDATE OR DELETE ON public.security_audit_logs
 FOR EACH ROW EXECUTE FUNCTION private.guard_server_auth_audit();

REVOKE INSERT ON public.security_audit_logs FROM PUBLIC,anon,authenticated;
GRANT INSERT(id,account_id,device_id,action,metadata,created_at,idempotency_key)
 ON public.security_audit_logs TO authenticated;

CREATE OR REPLACE FUNCTION public.append_auth_session_audit(
 p_account_id uuid, p_operation_id uuid, p_result text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE event_id uuid; event_action text;
BEGIN
  IF p_result NOT IN ('initiated','confirmed','unconfirmed') OR p_result IS NULL OR
    p_operation_id IS NULL OR p_account_id IS NULL THEN
    RAISE EXCEPTION 'Invalid auth session audit request' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id=p_account_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Audit account unavailable' USING ERRCODE='42501';
  END IF;
  event_action := CASE p_result WHEN 'initiated' THEN 'AUTH_SESSION_REVOCATION_STARTED'
    WHEN 'confirmed' THEN 'AUTH_SESSION_REVOCATION_CONFIRMED'
    ELSE 'AUTH_SESSION_REVOCATION_UNCONFIRMED' END;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    p_account_id::text || ':' || p_operation_id::text,0));
  SELECT id INTO event_id FROM public.security_audit_logs
   WHERE account_id=p_account_id AND event_source='server_observed'
     AND action=event_action AND metadata->>'operation_id'=p_operation_id::text LIMIT 1;
  IF event_id IS NOT NULL THEN RETURN event_id; END IF;
  INSERT INTO public.security_audit_logs(account_id,action,event_source,metadata)
   VALUES(p_account_id,event_action,'server_observed',pg_catalog.jsonb_build_object(
     'operation_id',p_operation_id,'request_id',p_operation_id,'provider','supabase','credential_class','session',
     'surface','sanctuary_api','result',p_result,'scope','global',
     'safe_failure_reason',CASE WHEN p_result='unconfirmed' THEN 'provider_acknowledgment_missing' ELSE NULL END)) RETURNING id INTO event_id;
  RETURN event_id;
END;
$$;
REVOKE ALL ON FUNCTION public.append_auth_session_audit(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.append_auth_session_audit(uuid,uuid,text) TO service_role;

CREATE OR REPLACE FUNCTION public.list_my_auth_events(p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid,action text,metadata jsonb,created_at timestamptz,account_id uuid,
 device_id uuid,install_id text,is_trusted boolean,model_name text,os_version text,platform text)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 SELECT sal.id,sal.action,
   coalesce(sal.metadata,'{}'::jsonb)||jsonb_build_object('event_source',sal.event_source),
   sal.created_at,sal.account_id,sal.device_id,dr.install_id,dr.is_trusted,
   dr.model_name,dr.os_version,dr.platform
 FROM public.security_audit_logs sal
 LEFT JOIN public.device_registry dr ON dr.device_id=sal.device_id
 WHERE sal.account_id=public.get_my_id() AND sal.action LIKE 'AUTH_%'
 ORDER BY sal.created_at DESC LIMIT greatest(coalesce(p_limit,50),1);
$$;
REVOKE ALL ON FUNCTION public.list_my_auth_events(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_my_auth_events(integer) TO authenticated;

COMMIT;

BEGIN;
CREATE OR REPLACE FUNCTION public.append_auth_operation_audit(
 p_account_id uuid,p_operation_id uuid,p_action text,p_result text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE event_id uuid; event_action text;
BEGIN
 IF p_action NOT IN ('session_revocation','password_change') OR p_action IS NULL OR
   p_result NOT IN ('initiated','confirmed','unconfirmed') OR p_result IS NULL OR
   p_operation_id IS NULL OR p_account_id IS NULL THEN
  RAISE EXCEPTION 'Invalid auth operation audit request' USING ERRCODE='22023';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_account_id AND deleted_at IS NULL) THEN
  RAISE EXCEPTION 'Audit account unavailable' USING ERRCODE='42501';
 END IF;
 event_action := 'AUTH_'||pg_catalog.upper(p_action)||CASE p_result
   WHEN 'initiated' THEN '_STARTED' WHEN 'confirmed' THEN '_CONFIRMED' ELSE '_UNCONFIRMED' END;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
   p_account_id::text||':'||p_operation_id::text,0));
 SELECT id INTO event_id FROM public.security_audit_logs
  WHERE account_id=p_account_id AND event_source='server_observed'
   AND action=event_action AND metadata->>'operation_id'=p_operation_id::text LIMIT 1;
 IF event_id IS NOT NULL THEN RETURN event_id; END IF;
 INSERT INTO public.security_audit_logs(account_id,action,event_source,metadata)
  VALUES(p_account_id,event_action,'server_observed',pg_catalog.jsonb_build_object(
   'operation_id',p_operation_id,'request_id',p_operation_id,'provider','supabase',
   'credential_class',CASE p_action WHEN 'password_change' THEN 'password' ELSE 'session' END,
   'surface','sanctuary_api','result',p_result,
   'scope',CASE p_action WHEN 'session_revocation' THEN 'global' ELSE 'account' END,
   'safe_failure_reason',CASE WHEN p_result='unconfirmed' THEN 'provider_acknowledgment_missing' ELSE NULL END))
  RETURNING id INTO event_id;
 RETURN event_id;
END $$;
REVOKE ALL ON FUNCTION public.append_auth_operation_audit(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.append_auth_operation_audit(uuid,uuid,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.append_auth_session_audit(
 p_account_id uuid,p_operation_id uuid,p_result text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_result NOT IN ('initiated','confirmed','unconfirmed') OR p_result IS NULL OR
  p_account_id IS NULL OR p_operation_id IS NULL THEN
  RAISE EXCEPTION 'Invalid auth session audit request' USING ERRCODE='22023';
 END IF;
 RETURN public.append_auth_operation_audit(p_account_id,p_operation_id,'session_revocation',p_result);
END;
$$;
COMMIT;

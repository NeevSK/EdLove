-- Account lifecycle functions operate on public.users IDs, while auth.uid()
-- identifies a Supabase-auth subject. Resolve the subject through the existing
-- identity mapping before reading or creating a deletion request.
--
-- This is a corrective migration for the already-applied request boundary. It
-- does not grant any new authority, schedule deletion, or delete an account.

CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS TABLE (
  status TEXT,
  request_id UUID,
  requested_at TIMESTAMPTZ,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auth_user_id UUID := auth.uid();
  v_user_id UUID := public.get_my_id();
  v_is_anonymous BOOLEAN;
  v_deleted_at TIMESTAMPTZ;
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF v_auth_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'authentication_required'::TEXT;
    RETURN;
  END IF;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'account_not_ready'::TEXT;
    RETURN;
  END IF;

  SELECT u.is_anonymous, u.deleted_at
    INTO v_is_anonymous, v_deleted_at
  FROM public.users AS u
  WHERE u.id = v_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'account_not_ready'::TEXT;
    RETURN;
  END IF;

  IF v_is_anonymous THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'anonymous_account'::TEXT;
    RETURN;
  END IF;

  IF v_deleted_at IS NOT NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'account_inactive'::TEXT;
    RETURN;
  END IF;

  -- The partial unique index is the integrity backstop; the advisory lock makes
  -- repeated taps from concurrent devices deterministic before the insert.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::TEXT, 0));

  SELECT r.*
    INTO v_request
  FROM public.account_deletion_requests AS r
  WHERE r.user_id = v_user_id
    AND r.status IN ('pending_verification', 'scheduled')
  ORDER BY r.requested_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY
      SELECT v_request.status, v_request.id, v_request.requested_at, 'already_requested'::TEXT;
    RETURN;
  END IF;

  INSERT INTO public.account_deletion_requests (user_id)
  VALUES (v_user_id)
  RETURNING * INTO v_request;

  RETURN QUERY
    SELECT v_request.status, v_request.id, v_request.requested_at, 'fresh_authentication_required'::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_account_deletion_request_status()
RETURNS TABLE (
  status TEXT,
  request_id UUID,
  requested_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auth_user_id UUID := auth.uid();
  v_user_id UUID := public.get_my_id();
BEGIN
  IF v_auth_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 'authentication_required'::TEXT;
    RETURN;
  END IF;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 'account_not_ready'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY
    SELECT r.status, r.id, r.requested_at, r.scheduled_for, COALESCE(r.blocker_code, '')
    FROM public.account_deletion_requests AS r
    WHERE r.user_id = v_user_id
    ORDER BY r.requested_at DESC
    LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.request_account_deletion() IS
  'Creates only a policy-governed deletion request for the mapped current account; it never deactivates or deletes the account.';
COMMENT ON FUNCTION public.get_account_deletion_request_status() IS
  'Reads the latest deletion request for the mapped current account; it never changes lifecycle state.';

REVOKE EXECUTE ON FUNCTION public.request_account_deletion() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_account_deletion_request_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_account_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_request_status() TO authenticated;

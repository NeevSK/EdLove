-- Cancel account deletion request workflow.
-- Allows an authenticated user to cancel their pending deletion request during the verification window.

CREATE OR REPLACE FUNCTION public.cancel_account_deletion_request()
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

  -- Lock row to serialize concurrent cancellations/modifications
  SELECT r.*
    INTO v_request
  FROM public.account_deletion_requests AS r
  WHERE r.user_id = v_user_id
    AND r.status = 'pending_verification'
  ORDER BY r.requested_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'no_pending_request'::TEXT;
    RETURN;
  END IF;

  UPDATE public.account_deletion_requests
  SET
    status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
  WHERE id = v_request.id
  RETURNING * INTO v_request;

  RETURN QUERY
    SELECT v_request.status, v_request.id, v_request.requested_at, 'cancelled_by_user'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.cancel_account_deletion_request() IS
  'Cancels an active pending_verification deletion request for the mapped authenticated user.';

REVOKE EXECUTE ON FUNCTION public.cancel_account_deletion_request() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_account_deletion_request() TO authenticated;

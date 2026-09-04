-- Read-only account lifecycle status for the current authenticated identity.
-- This does not request, schedule, deactivate, reactivate, or delete anything.

CREATE OR REPLACE FUNCTION public.get_account_lifecycle_status()
RETURNS TABLE (
  status TEXT,
  deactivated_at TIMESTAMPTZ,
  request_id UUID,
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
  v_is_anonymous BOOLEAN;
  v_deleted_at TIMESTAMPTZ;
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF v_auth_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::TIMESTAMPTZ, NULL::UUID, NULL::TIMESTAMPTZ,
      'authentication_required'::TEXT;
    RETURN;
  END IF;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::TIMESTAMPTZ, NULL::UUID, NULL::TIMESTAMPTZ,
      'account_not_ready'::TEXT;
    RETURN;
  END IF;

  SELECT u.is_anonymous, u.deleted_at
    INTO v_is_anonymous, v_deleted_at
  FROM public.users AS u
  WHERE u.id = v_user_id;

  IF NOT FOUND OR v_is_anonymous THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::TIMESTAMPTZ, NULL::UUID, NULL::TIMESTAMPTZ,
      CASE WHEN NOT FOUND THEN 'account_not_ready' ELSE 'anonymous_account' END;
    RETURN;
  END IF;

  SELECT r.*
    INTO v_request
  FROM public.account_deletion_requests AS r
  WHERE r.user_id = v_user_id
  ORDER BY r.requested_at DESC
  LIMIT 1;

  IF v_deleted_at IS NOT NULL THEN
    RETURN QUERY SELECT 'deactivated'::TEXT, v_deleted_at, v_request.id, v_request.scheduled_for,
      COALESCE(v_request.blocker_code, 'account_deletion_requested');
  ELSIF FOUND THEN
    RETURN QUERY SELECT v_request.status, NULL::TIMESTAMPTZ, v_request.id, v_request.scheduled_for,
      COALESCE(v_request.blocker_code, '');
  ELSE
    RETURN QUERY SELECT 'active'::TEXT, NULL::TIMESTAMPTZ, NULL::UUID, NULL::TIMESTAMPTZ, ''::TEXT;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_account_lifecycle_status() IS
  'Read-only current-account lifecycle state. It never changes account or deletion-request state.';

REVOKE EXECUTE ON FUNCTION public.get_account_lifecycle_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_account_lifecycle_status() TO authenticated;

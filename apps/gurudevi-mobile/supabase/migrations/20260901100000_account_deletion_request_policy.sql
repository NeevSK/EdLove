-- Account deletion is a policy workflow, never a client-triggered hard delete.
--
-- This migration removes authenticated access to the legacy destructive RPC and
-- introduces a request/status boundary. A later privileged worker may schedule
-- or execute a deletion only after fresh-authentication, retention, custody,
-- and authority policy have been evaluated outside this user-facing function.

REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC, anon, authenticated;

CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  policy_version TEXT NOT NULL DEFAULT 'prelaunch-draft-2026-09-01',
  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'scheduled', 'cancelled', 'completed', 'blocked')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_completed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  blocker_code TEXT
);

COMMENT ON TABLE public.account_deletion_requests IS
  'Server-authoritative account deletion workflow. Requesting a deletion never changes auth.users or public.users.';
COMMENT ON COLUMN public.account_deletion_requests.status IS
  'pending_verification requires fresh-auth and policy review; scheduled/completed may only be set by privileged policy workers.';
COMMENT ON COLUMN public.account_deletion_requests.policy_version IS
  'Public retention-and-deletion policy version presented when the request was created.';

CREATE UNIQUE INDEX account_deletion_requests_one_open_request_per_user
  ON public.account_deletion_requests (user_id)
  WHERE status IN ('pending_verification', 'scheduled');

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.account_deletion_requests FROM PUBLIC, anon, authenticated;

CREATE TRIGGER update_account_deletion_requests_updated_at
  BEFORE UPDATE ON public.account_deletion_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  v_user_id UUID := auth.uid();
  v_is_anonymous BOOLEAN;
  v_deleted_at TIMESTAMPTZ;
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, 'authentication_required'::TEXT;
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
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 'blocked'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 'authentication_required'::TEXT;
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

CREATE OR REPLACE FUNCTION public.schedule_verified_account_deletion(
  p_request_id UUID,
  p_retain_until TIMESTAMPTZ
)
RETURNS TABLE (
  status TEXT,
  request_id UUID,
  scheduled_for TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF p_retain_until <= now() THEN
    RAISE EXCEPTION 'Account deletion retention deadline must be in the future.';
  END IF;

  SELECT r.*
    INTO v_request
  FROM public.account_deletion_requests AS r
  WHERE r.id = p_request_id
  FOR UPDATE;

  IF NOT FOUND OR v_request.status <> 'pending_verification' THEN
    RAISE EXCEPTION 'Only a pending deletion request may be scheduled.';
  END IF;

  -- This privileged function is intentionally not an MFA or custody decision.
  -- Its caller must complete those checks before it invokes the transition.
  UPDATE public.users
  SET
    deleted_at = now(),
    deleted_by = v_request.user_id,
    deletion_reason = 'account_deletion_requested'
  WHERE id = v_request.user_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account is not active and cannot be soft-deactivated.';
  END IF;

  UPDATE public.account_deletion_requests
  SET
    status = 'scheduled',
    verification_completed_at = now(),
    scheduled_for = p_retain_until,
    blocker_code = NULL
  WHERE id = v_request.id;

  RETURN QUERY SELECT 'scheduled'::TEXT, v_request.id, p_retain_until;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.request_account_deletion() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_account_deletion_request_status() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.schedule_verified_account_deletion(UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_account_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_request_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_verified_account_deletion(UUID, TIMESTAMPTZ) TO service_role;

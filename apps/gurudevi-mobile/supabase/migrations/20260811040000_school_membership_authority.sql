-- Official school membership authority boundary.
-- Registry claims establish identity only. This workflow establishes the
-- human's school bond, membership, and institutional entitlement after an
-- authorized school-lead approval.

ALTER TABLE public.school_memberships
  ADD CONSTRAINT school_memberships_user_school_role_status_key
  UNIQUE (user_id, school_id, role, status);

CREATE OR REPLACE FUNCTION public.ensure_official_school_membership(
  p_user_id UUID,
  p_school_id UUID,
  p_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  membership_id UUID;
BEGIN
  INSERT INTO public.school_memberships AS sm (
    user_id, school_id, role, status, start_date, is_primary,
    created_at, updated_at, joined_at, deleted_at, left_at
  )
  VALUES (
    p_user_id, p_school_id, lower(p_role), 'active', now(), true,
    now(), now(), now(), NULL, NULL
  )
  ON CONFLICT (user_id, school_id, role, status)
  DO UPDATE SET
    start_date = COALESCE(sm.start_date, now()),
    updated_at = now(),
    joined_at = COALESCE(sm.joined_at, now()),
    deleted_at = NULL,
    left_at = NULL,
    deletion_reason = NULL,
    deleted_by = NULL
  RETURNING id INTO membership_id;

  RETURN membership_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_official_school_membership(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_official_school_membership(UUID, UUID, TEXT) TO authenticated;

-- Existing official invite/founder RPCs create authoritative school bonds. Keep
-- membership synchronized for those two explicit sources only; arbitrary bond
-- inserts do not gain membership through this trigger.
CREATE OR REPLACE FUNCTION public.sync_membership_for_official_school_bond()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.entity_type = 'SCHOOL'
     AND NEW.metadata ->> 'source' IN ('official_invite_code', 'official_school_creation')
  THEN
    PERFORM public.ensure_official_school_membership(
      NEW.user_id,
      NEW.entity_id::uuid,
      NEW.capacity
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_membership_for_official_school_bond ON public.bonds;
CREATE TRIGGER trg_sync_membership_for_official_school_bond
AFTER INSERT ON public.bonds
FOR EACH ROW
EXECUTE FUNCTION public.sync_membership_for_official_school_bond();

CREATE OR REPLACE FUNCTION public.approve_school_join_request(
  p_request_id UUID,
  p_reviewer_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller UUID := auth.uid();
  request_row public.school_join_requests%ROWTYPE;
  existing_bond public.bonds%ROWTYPE;
  created_bond public.bonds%ROWTYPE;
  membership_id UUID;
  reviewer_is_admin BOOLEAN;
  reviewer_is_school_lead BOOLEAN;
BEGIN
  IF caller IS NULL OR p_reviewer_id IS NULL OR caller <> p_reviewer_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated reviewer does not match caller');
  END IF;

  SELECT * INTO request_row
  FROM public.school_join_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND OR request_row.user_id IS NULL OR request_row.school_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Join request is incomplete or not found');
  END IF;

  IF request_row.status = 'approved' THEN
    SELECT * INTO existing_bond FROM public.bonds
    WHERE user_id = request_row.user_id
      AND entity_id = request_row.school_id::text
      AND entity_type = 'SCHOOL'
      AND lower(capacity) = lower(request_row.role)
    LIMIT 1;

    SELECT id INTO membership_id FROM public.school_memberships
    WHERE user_id = request_row.user_id
      AND school_id = request_row.school_id
      AND lower(role) = lower(request_row.role)
      AND status = 'active'
    LIMIT 1;

    RETURN jsonb_build_object(
      'success', true, 'already_approved', true,
      'request_id', request_row.id, 'user_id', request_row.user_id,
      'school_id', request_row.school_id, 'role', request_row.role,
      'bond_id', existing_bond.id, 'membership_id', membership_id
    );
  END IF;

  IF request_row.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only pending join requests can be approved');
  END IF;

  reviewer_is_admin := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller AND b.entity_type = 'PLATFORM'
      AND b.entity_id = 'GLOBAL' AND lower(b.capacity) = 'admin'
  );
  reviewer_is_school_lead := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller AND b.entity_type = 'SCHOOL'
      AND b.entity_id = request_row.school_id::text
      AND lower(b.capacity) IN ('principal', 'section_head')
  );

  IF NOT reviewer_is_admin AND NOT reviewer_is_school_lead THEN
    RETURN jsonb_build_object('success', false, 'message', 'School leadership or platform administration required');
  END IF;

  SELECT * INTO existing_bond FROM public.bonds
  WHERE user_id = request_row.user_id
    AND entity_id = request_row.school_id::text
    AND entity_type = 'SCHOOL'
    AND lower(capacity) = lower(request_row.role)
  LIMIT 1;

  IF FOUND THEN
    created_bond := existing_bond;
  ELSE
    INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata)
    VALUES (
      request_row.user_id,
      request_row.school_id::text,
      'SCHOOL',
      lower(request_row.role),
      jsonb_build_object('source', 'school_join_request', 'request_id', request_row.id)
    )
    RETURNING * INTO created_bond;
  END IF;

  membership_id := public.ensure_official_school_membership(
    request_row.user_id, request_row.school_id, request_row.role
  );

  INSERT INTO public.user_entitlement_grants (
    user_id, bond_id, scope_type, tier, modules, source
  )
  VALUES (
    request_row.user_id, created_bond.id, 'BOND', 'INSTITUTIONAL',
    ARRAY['school_workspace']::TEXT[], 'school_join_request'
  );

  UPDATE public.school_join_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_row.id;

  UPDATE public.users
  SET citizenship = 'FIRST_CLASS', school_id = request_row.school_id::text, updated_at = now()
  WHERE id = request_row.user_id;

  RETURN jsonb_build_object(
    'success', true, 'request_id', request_row.id,
    'user_id', request_row.user_id, 'school_id', request_row.school_id,
    'role', request_row.role, 'bond_id', created_bond.id,
    'membership_id', membership_id, 'citizenship', 'FIRST_CLASS'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.approve_school_join_request(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_school_join_request(UUID, UUID) TO authenticated;

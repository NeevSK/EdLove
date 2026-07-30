-- Official school membership is the only path that promotes citizenship to
-- FIRST_CLASS and creates a school bond. Generic school discovery must not do
-- either of those things.

BEGIN;

CREATE OR REPLACE FUNCTION public.claim_invite_code(
  p_invite_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invite_row public.invite_codes%ROWTYPE;
  existing_bond public.bonds%ROWTYPE;
  created_bond public.bonds%ROWTYPE;
  requested_capacity TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated user does not match claim subject');
  END IF;

  SELECT * INTO invite_row
  FROM public.invite_codes
  WHERE code = p_invite_code
    AND is_active = true
    AND (max_uses IS NULL OR uses_count < max_uses)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invite code is invalid or exhausted');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_user_id AND is_anonymous = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Create or verify an account before joining an official school');
  END IF;

  requested_capacity := lower(invite_row.role);

  SELECT * INTO existing_bond
  FROM public.bonds
  WHERE user_id = p_user_id
    AND entity_id = invite_row.school_id::text
    AND entity_type = 'SCHOOL'
    AND lower(capacity) = requested_capacity
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'bond_id', existing_bond.id,
      'school_id', invite_row.school_id,
      'capacity', existing_bond.capacity,
      'already_claimed', true
    );
  END IF;

  UPDATE public.invite_codes
  SET uses_count = uses_count + 1,
      is_active = CASE WHEN max_uses IS NOT NULL AND uses_count + 1 >= max_uses THEN false ELSE is_active END
  WHERE id = invite_row.id;

  INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata)
  VALUES (
    p_user_id,
    invite_row.school_id::text,
    'SCHOOL',
    requested_capacity,
    jsonb_build_object('source', 'official_invite_code', 'invite_code_id', invite_row.id)
  )
  RETURNING * INTO created_bond;

  -- Keep school_id only as a compatibility projection. The bond is the
  -- authority for school scope and active perspective.
  UPDATE public.users
  SET citizenship = 'FIRST_CLASS',
      school_id = invite_row.school_id::text,
      updated_at = now()
  WHERE id = p_user_id;

  -- Official school membership receives institution-scoped base access. This
  -- does not alter the user's individual FREE/PRO plan.
  INSERT INTO public.user_entitlement_grants (
    user_id, bond_id, scope_type, tier, modules, source
  )
  VALUES (
    p_user_id,
    created_bond.id,
    'BOND',
    'INSTITUTIONAL',
    ARRAY['school_workspace']::TEXT[],
    'official_school_invite'
  );

  RETURN jsonb_build_object(
    'success', true,
    'bond_id', created_bond.id,
    'school_id', invite_row.school_id,
    'capacity', created_bond.capacity,
    'citizenship', 'FIRST_CLASS'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_invite_code(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_invite_code(TEXT, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_school_founder_bond(
  p_school_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  school_creator UUID;
  existing_bond public.bonds%ROWTYPE;
  created_bond public.bonds%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated user does not match claim subject');
  END IF;

  SELECT created_by INTO school_creator FROM public.schools WHERE id = p_school_id;
  IF school_creator IS NULL OR school_creator <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only the official school creator may establish its founder bond');
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id AND is_anonymous = true) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Create or verify an account before establishing an official school');
  END IF;

  SELECT * INTO existing_bond FROM public.bonds
  WHERE user_id = p_user_id AND entity_id = p_school_id::text
    AND entity_type = 'SCHOOL' AND lower(capacity) = 'principal'
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'bond_id', existing_bond.id, 'already_exists', true);
  END IF;

  INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata)
  VALUES (p_user_id, p_school_id::text, 'SCHOOL', 'principal', jsonb_build_object('source', 'official_school_creation'))
  RETURNING * INTO created_bond;

  UPDATE public.users
  SET citizenship = 'FIRST_CLASS', school_id = p_school_id::text, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.user_entitlement_grants (user_id, bond_id, scope_type, tier, modules, source)
  VALUES (p_user_id, created_bond.id, 'BOND', 'INSTITUTIONAL', ARRAY['school_workspace']::TEXT[], 'official_school_creation');

  RETURN jsonb_build_object('success', true, 'bond_id', created_bond.id, 'citizenship', 'FIRST_CLASS');
END;
$$;

REVOKE ALL ON FUNCTION public.create_school_founder_bond(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_school_founder_bond(UUID, UUID) TO authenticated;

-- School departure/revocation is also bond-authoritative. The compatibility
-- users.school_id projection is recalculated from the user's remaining school
-- bonds instead of being edited by clients.
CREATE OR REPLACE FUNCTION public.revoke_school_bond(
  p_user_id UUID,
  p_school_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller UUID := auth.uid();
  target_bond UUID;
  remaining_school UUID;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authentication required');
  END IF;

  IF caller <> p_user_id AND NOT EXISTS (
    SELECT 1 FROM public.bonds
    WHERE user_id = caller AND entity_type = 'PLATFORM' AND lower(capacity) = 'admin'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.bonds
    WHERE user_id = caller AND entity_id = p_school_id::text
      AND entity_type = 'SCHOOL' AND lower(capacity) IN ('principal', 'section_head')
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not permitted to revoke this school bond');
  END IF;

  SELECT id INTO target_bond FROM public.bonds
  WHERE user_id = p_user_id AND entity_id = p_school_id::text AND entity_type = 'SCHOOL';

  IF target_bond IS NULL THEN
    RETURN jsonb_build_object('success', true, 'already_revoked', true);
  END IF;

  DELETE FROM public.user_entitlement_grants WHERE bond_id = target_bond;
  DELETE FROM public.bonds WHERE id = target_bond;

  SELECT entity_id::uuid INTO remaining_school FROM public.bonds
  WHERE user_id = p_user_id AND entity_type = 'SCHOOL'
  ORDER BY created_at ASC LIMIT 1;

  UPDATE public.users
  SET school_id = remaining_school::text,
      citizenship = CASE WHEN remaining_school IS NULL THEN 'SECOND_CLASS' ELSE 'FIRST_CLASS' END,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'remaining_school_id', remaining_school);
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_school_bond(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_school_bond(UUID, UUID) TO authenticated;

COMMIT;

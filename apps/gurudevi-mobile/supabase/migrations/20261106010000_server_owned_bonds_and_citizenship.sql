-- Bonds decide authority, so two things change here.
--
-- 1. Only the server writes bonds. The original policy let any signed-in user insert
--    their own bond row with any capacity through the public API, including admin on
--    GLOBAL or principal on any school. App code never used it; first bonds now go
--    through identity.createInitialBond and school bonds through the functions below.
--
-- 2. Citizenship is an explicit property of each bond, set when the bond is created.
--    users.citizenship stays until the invite functions are rebuilt with founder
--    invitations; nothing new reads it. See docs/architecture/arrive-journey.md.

drop policy if exists "Users can insert their own bonds" on public.bonds;
drop policy if exists "Users can create their own bonds" on public.bonds;
revoke insert, update, delete, truncate on table public.bonds from anon, authenticated;

alter table public.bonds add column citizenship text;

update public.bonds set citizenship = case
  when entity_type in ('SCHOOL', 'CLASSROOM') then 'FIRST_CLASS'
  when entity_type in ('PERSONAL', 'PERSONAL_CLASSROOM') then 'SECOND_CLASS'
  else 'THIRD_CLASS'
end;

alter table public.bonds
  alter column citizenship set not null,
  add constraint bonds_citizenship_check
    check (citizenship in ('FIRST_CLASS', 'SECOND_CLASS', 'THIRD_CLASS'));

-- One personal bond per account, on the account itself. PERSONAL_CLASSROOM isn't carried
-- forward: the newest active bond becomes the personal bond and any others are archived.
with ranked as (
  select id, row_number() over (partition by user_id order by created_at desc, id) as position
  from public.bonds
  where entity_type in ('PERSONAL', 'PERSONAL_CLASSROOM') and status = 'active'
)
update public.bonds b set status = 'archived', updated_at = now()
from ranked where ranked.id = b.id and ranked.position > 1;

update public.bonds set entity_type = 'PERSONAL', updated_at = now()
where entity_type = 'PERSONAL_CLASSROOM';

update public.bonds set entity_id = user_id::text, updated_at = now()
where entity_type = 'PERSONAL' and status = 'active';

create unique index bonds_one_active_personal_idx
  on public.bonds (user_id)
  where entity_type = 'PERSONAL' and status = 'active';

-- School bonds created by these functions are first class. Bodies are otherwise unchanged.

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

  INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata, citizenship)
    VALUES (
    p_user_id,
    invite_row.school_id::text,
    'SCHOOL',
    requested_capacity,
    jsonb_build_object('source', 'official_invite_code', 'invite_code_id', invite_row.id),
      'FIRST_CLASS'
    ) RETURNING * INTO created_bond;

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

  INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata, citizenship)
    VALUES (p_user_id, p_school_id::text, 'SCHOOL', 'principal', jsonb_build_object('source', 'official_school_creation'),
      'FIRST_CLASS'
    ) RETURNING * INTO created_bond;

  UPDATE public.users
  SET citizenship = 'FIRST_CLASS', school_id = p_school_id::text, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.user_entitlement_grants (user_id, bond_id, scope_type, tier, modules, source)
  VALUES (p_user_id, created_bond.id, 'BOND', 'INSTITUTIONAL', ARRAY['school_workspace']::TEXT[], 'official_school_creation');

  RETURN jsonb_build_object('success', true, 'bond_id', created_bond.id, 'citizenship', 'FIRST_CLASS');
END;
$$;

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
    INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata, citizenship)
    VALUES (
      request_row.user_id,
      request_row.school_id::text,
      'SCHOOL',
      lower(request_row.role),
      jsonb_build_object('source', 'school_join_request', 'request_id', request_row.id),
      'FIRST_CLASS'
    ) RETURNING * INTO created_bond;
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

-- Atomic approval boundary for canonical school identity claims.
-- This links a tenant School to edu_schools; it does not grant membership,
-- citizenship, capacity, or entitlement. Those remain separate authority flows.

CREATE OR REPLACE FUNCTION public.approve_school_registry_claim(
  p_claim_id UUID,
  p_reviewer_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller UUID := auth.uid();
  claim_row public.school_registry_claims%ROWTYPE;
  linked_school public.schools%ROWTYPE;
  reviewer_is_admin BOOLEAN;
  reviewer_is_school_lead BOOLEAN;
BEGIN
  IF caller IS NULL OR p_reviewer_id IS NULL OR caller <> p_reviewer_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated reviewer does not match caller');
  END IF;

  SELECT * INTO claim_row
  FROM public.school_registry_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Registry claim not found');
  END IF;

  IF claim_row.status = 'approved' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_approved', true,
      'claim_id', claim_row.id,
      'school_id', claim_row.school_id,
      'edu_school_id', claim_row.edu_school_id
    );
  END IF;

  IF claim_row.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only pending claims can be approved');
  END IF;

  reviewer_is_admin := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller
      AND b.entity_type = 'PLATFORM'
      AND lower(b.capacity) = 'admin'
      AND b.entity_id = 'GLOBAL'
  );

  reviewer_is_school_lead := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller
      AND b.entity_type = 'SCHOOL'
      AND b.entity_id = claim_row.school_id::text
      AND lower(b.capacity) IN ('principal', 'section_head')
  );

  IF NOT reviewer_is_admin AND NOT reviewer_is_school_lead THEN
    RETURN jsonb_build_object('success', false, 'message', 'School leadership or platform administration required');
  END IF;

  SELECT * INTO linked_school
  FROM public.schools
  WHERE id = claim_row.school_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Target school tenant not found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.schools s
    WHERE s.census_id = claim_row.edu_school_id
      AND s.id <> claim_row.school_id
      AND s.deleted_at IS NULL
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Canonical school is already linked to another active tenant');
  END IF;

  UPDATE public.schools
  SET census_id = claim_row.edu_school_id,
      last_census_sync = now(),
      sync_status = 'claimed',
      updated_at = now()
  WHERE id = claim_row.school_id;

  UPDATE public.school_registry_claims
  SET status = 'approved',
      reviewed_by = caller,
      reviewed_at = now(),
      claimed_at = now(),
      updated_at = now()
  WHERE id = claim_row.id;

  RETURN jsonb_build_object(
    'success', true,
    'claim_id', claim_row.id,
    'school_id', claim_row.school_id,
    'edu_school_id', claim_row.edu_school_id,
    'reviewed_by', caller
  );
END;
$$;

REVOKE ALL ON FUNCTION public.approve_school_registry_claim(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_school_registry_claim(UUID, UUID) TO authenticated;

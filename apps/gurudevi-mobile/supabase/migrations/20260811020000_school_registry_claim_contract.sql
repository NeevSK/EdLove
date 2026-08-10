-- Provenance ledger for linking an application School tenant to a canonical
-- edu_schools factual registry row. The approved link is materialized on
-- schools.census_id, which already has a foreign key to edu_schools.

CREATE TABLE IF NOT EXISTS public.school_registry_claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  edu_school_id   TEXT NOT NULL REFERENCES public.edu_schools(id),
  requested_by    UUID NOT NULL REFERENCES public.users(id),
  status          TEXT NOT NULL DEFAULT 'pending',
  evidence        JSONB,
  reviewed_by     UUID REFERENCES public.users(id),
  reviewed_at     TIMESTAMPTZ,
  claimed_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key TEXT UNIQUE,
  CONSTRAINT school_registry_claim_pair_key UNIQUE (school_id, edu_school_id),
  CONSTRAINT school_registry_claim_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn'))
);

CREATE INDEX IF NOT EXISTS school_registry_claims_edu_status_idx
  ON public.school_registry_claims (edu_school_id, status);

CREATE INDEX IF NOT EXISTS school_registry_claims_requester_status_idx
  ON public.school_registry_claims (requested_by, status);

ALTER TABLE public.school_registry_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their school registry claims" ON public.school_registry_claims;
CREATE POLICY "Users can read their school registry claims"
  ON public.school_registry_claims FOR SELECT
  USING (
    auth.uid() = requested_by
    OR EXISTS (
      SELECT 1 FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_id = school_id::text
        AND b.capacity IN ('principal', 'section_head')
    )
    OR ((auth.jwt() ->> 'role') = 'service_role')
  );

DROP POLICY IF EXISTS "Users can create their school registry claims" ON public.school_registry_claims;
CREATE POLICY "Users can create their school registry claims"
  ON public.school_registry_claims FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

DROP POLICY IF EXISTS "Owners can update school registry claims" ON public.school_registry_claims;
CREATE POLICY "Owners can update school registry claims"
  ON public.school_registry_claims FOR UPDATE
  USING (
    auth.uid() = requested_by
    OR EXISTS (
      SELECT 1 FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_id = school_id::text
        AND b.capacity IN ('principal', 'section_head')
    )
    OR ((auth.jwt() ->> 'role') = 'service_role')
  )
  WITH CHECK (
    auth.uid() = requested_by
    OR EXISTS (
      SELECT 1 FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_id = school_id::text
        AND b.capacity IN ('principal', 'section_head')
    )
    OR ((auth.jwt() ->> 'role') = 'service_role')
  );

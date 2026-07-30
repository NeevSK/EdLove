-- Scoped entitlement authority.
-- The legacy users.pricing_tier remains an individual-plan projection only.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_entitlement_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bond_id UUID NULL REFERENCES public.bonds(id) ON DELETE CASCADE,
  entity_id TEXT NULL,
  entity_type TEXT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('INDIVIDUAL', 'BOND', 'ENTITY', 'ADD_ON')),
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PRO', 'INSTITUTIONAL')),
  modules TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NULL,
  metadata JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_entitlement_grants_scope_check CHECK (
    (scope_type = 'INDIVIDUAL' AND bond_id IS NULL AND entity_id IS NULL)
    OR (scope_type = 'BOND' AND bond_id IS NOT NULL)
    OR (scope_type = 'ENTITY' AND entity_id IS NOT NULL AND entity_type IS NOT NULL)
    OR (scope_type = 'ADD_ON')
  )
);

CREATE INDEX IF NOT EXISTS user_entitlement_grants_user_scope_idx
  ON public.user_entitlement_grants (user_id, scope_type, status);
CREATE INDEX IF NOT EXISTS user_entitlement_grants_user_bond_idx
  ON public.user_entitlement_grants (user_id, bond_id, status);
CREATE INDEX IF NOT EXISTS user_entitlement_grants_entity_idx
  ON public.user_entitlement_grants (entity_id, entity_type, status);

ALTER TABLE public.user_entitlement_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_entitlement_grants_select ON public.user_entitlement_grants;
CREATE POLICY user_entitlement_grants_select ON public.user_entitlement_grants
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS user_entitlement_grants_service_write ON public.user_entitlement_grants;
CREATE POLICY user_entitlement_grants_service_write ON public.user_entitlement_grants
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;

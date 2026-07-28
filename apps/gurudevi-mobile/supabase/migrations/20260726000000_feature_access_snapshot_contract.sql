-- Feature access snapshot contract
--
-- Permission snapshots are server-generated, Ed25519-signed Cedar decisions.
-- This migration creates the durable source consumed by PowerSync. The
-- Sanctuary API remains the only writer; clients receive rows through the
-- authenticated PowerSync sync stream and never write these tables directly.

BEGIN;

CREATE TABLE IF NOT EXISTS public.policy_version (
  id TEXT PRIMARY KEY,
  hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permission_snapshots (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  active_bond_id UUID NOT NULL REFERENCES public.bonds(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  permissions JSONB NOT NULL,
  temporal_hints JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT NOT NULL,
  CONSTRAINT permission_snapshots_expiry_check CHECK (expires_at > generated_at)
);

CREATE INDEX IF NOT EXISTS permission_snapshots_user_bond_idx
  ON public.permission_snapshots(user_id, active_bond_id);

ALTER TABLE public.policy_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read policy version" ON public.policy_version;
CREATE POLICY "Authenticated users can read policy version"
  ON public.policy_version FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can read their own permission snapshots" ON public.permission_snapshots;
CREATE POLICY "Users can read their own permission snapshots"
  ON public.permission_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.policy_version TO authenticated;
GRANT SELECT ON public.permission_snapshots TO authenticated;
GRANT ALL ON public.policy_version TO service_role;
GRANT ALL ON public.permission_snapshots TO service_role;

COMMIT;

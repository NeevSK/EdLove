-- Entity-scoped permission snapshots
--
-- A bond may point at a personal workspace, school, classroom, community, or
-- group. School context is therefore optional metadata, not the identity key.

BEGIN;

ALTER TABLE public.permission_snapshots
  ADD COLUMN IF NOT EXISTS active_entity_id TEXT,
  ADD COLUMN IF NOT EXISTS active_entity_type TEXT;

UPDATE public.permission_snapshots
SET active_entity_id = COALESCE(active_entity_id, active_bond_id::text),
    active_entity_type = COALESCE(active_entity_type, CASE WHEN school_id IS NULL THEN 'PERSONAL' ELSE 'SCHOOL' END);

ALTER TABLE public.permission_snapshots
  ALTER COLUMN active_entity_id SET NOT NULL,
  ALTER COLUMN active_entity_type SET NOT NULL;

ALTER TABLE public.permission_snapshots
  ALTER COLUMN school_id DROP NOT NULL;

COMMIT;

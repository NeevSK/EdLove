-- ============================================================================
-- Migration: 20260523020000_add_bonds_unique_constraint
-- Purpose:
--   Add a unique constraint on public.bonds (user_id, entity_id, capacity)
--   to fully support PostgreSQL and PostgREST ON CONFLICT upsert specifications.
-- ============================================================================

BEGIN;

-- Add a unique constraint to public.bonds
ALTER TABLE public.bonds
  DROP CONSTRAINT IF EXISTS bonds_user_entity_capacity_unique,
  ADD CONSTRAINT bonds_user_entity_capacity_unique UNIQUE (user_id, entity_id, capacity);

COMMIT;

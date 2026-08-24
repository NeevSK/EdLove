-- ============================================================================
-- Migration: 20260823225500_fix_handle_user_row_defaults_tier_id
-- Purpose:
--   Update handle_user_row_defaults trigger function to remove references to
--   the dropped public.users.tier_id column (dropped in 20260810150000_remove_legacy_pricing_tables).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_row_defaults() 
RETURNS trigger AS $$
BEGIN
    -- tier_id was dropped in 20260810150000_remove_legacy_pricing_tables.
    -- Retain function as safe no-op / placeholder for future table defaults.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

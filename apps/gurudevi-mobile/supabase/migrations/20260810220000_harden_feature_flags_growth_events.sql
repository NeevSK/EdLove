-- Feature-flag and growth-event contract hardening.
-- Evidence: linked Supabase zero-null scan on 2026-08-10.
-- User growth state was hardened in the preceding growth-state migration.

ALTER TABLE public.feature_flags
  ALTER COLUMN tenant_kinds SET NOT NULL,
  ALTER COLUMN citizenships SET NOT NULL,
  ALTER COLUMN pricing_tiers SET NOT NULL,
  ALTER COLUMN capacities SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.growth_events
  ALTER COLUMN created_at SET NOT NULL;

-- Remove the obsolete tier-matrix and subscription tables.
--
-- Runtime authority is now:
--   users.pricing_tier              individual plan projection
--   pricing_manifest                public tier/module catalog
--   user_entitlement_grants         scoped commercial access
--
-- This migration intentionally does not use CASCADE. If an unreviewed view,
-- trigger, foreign key, or external database object still depends on one of
-- these tables/columns, migration application must fail loudly so the
-- dependency can be treated explicitly.

ALTER TABLE public.users
  DROP COLUMN IF EXISTS tier_id;

DROP TABLE IF EXISTS public.pricing_subscriptions;
DROP TABLE IF EXISTS public.tier_features;
DROP TABLE IF EXISTS public.tiers;

-- Canonical authenticated citizenship default
--
-- THIRD_CLASS is the lowest authenticated registration level. WANDERER was
-- the former name and is retained only as an input compatibility alias.

BEGIN;

UPDATE public.users
SET citizenship = 'THIRD_CLASS'
WHERE citizenship = 'WANDERER';

ALTER TABLE public.users
  ALTER COLUMN citizenship SET DEFAULT 'THIRD_CLASS';

COMMIT;

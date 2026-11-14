-- The generated User contract selects these fields. The real identity/ORM
-- integration exposed their absence from the replayed migration schema.
BEGIN;
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS index_number text,
  ADD COLUMN IF NOT EXISTS nic_number text,
  ADD COLUMN IF NOT EXISTS public_profile boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_thuthimal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS thuthimal_gifter text,
  ADD COLUMN IF NOT EXISTS thuthimal_gifted_at timestamptz,
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS subjects_taught text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS qualifications text[] NOT NULL DEFAULT '{}';
COMMIT;

-- Institutional administration contract hardening.
-- Evidence: linked Supabase scans on 2026-08-10. The four `schools` rows are
-- personal workspace tenants. `school_registry` is a compatibility VIEW over
-- `school_registry_legacy`; the canonical 9,962-row registry is `edu_schools`.

ALTER TABLE public.schools
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.grade_levels
  ALTER COLUMN section_id SET NOT NULL,
  ALTER COLUMN school_id SET NOT NULL,
  ALTER COLUMN grade_number SET NOT NULL;

ALTER TABLE public.staff_leaves
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

-- Do not ALTER `public.school_registry`: it is a read-only compatibility VIEW,
-- not a base table. Its legacy source is managed separately from this batch.

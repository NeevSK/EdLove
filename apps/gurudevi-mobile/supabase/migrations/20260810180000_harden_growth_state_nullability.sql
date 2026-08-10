-- Growth state parity: live null scan returned zero null rows for all fields
-- currently required by the ZenStack model. Fail loudly if that changes.

ALTER TABLE public.user_growth_state
  ALTER COLUMN presence_signals SET NOT NULL,
  ALTER COLUMN nourishing_signals SET NOT NULL,
  ALTER COLUMN witnessing_signals SET NOT NULL,
  ALTER COLUMN weaving_signals SET NOT NULL,
  ALTER COLUMN blooming_signals SET NOT NULL,
  ALTER COLUMN peer_mentored_count SET NOT NULL,
  ALTER COLUMN circles_facilitated_count SET NOT NULL,
  ALTER COLUMN lessons_completed_count SET NOT NULL,
  ALTER COLUMN reflections_submitted_count SET NOT NULL,
  ALTER COLUMN crystals_found_count SET NOT NULL,
  ALTER COLUMN fractal_moments_count SET NOT NULL,
  ALTER COLUMN last_seen_at SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

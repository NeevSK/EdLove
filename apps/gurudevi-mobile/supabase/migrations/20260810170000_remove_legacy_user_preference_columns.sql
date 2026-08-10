-- User preferences parity cleanup.
-- The current product stores language and device/display preferences locally;
-- these columns have no active runtime consumers in the mobile or API code.
-- Do not use CASCADE: hidden database dependencies must fail loudly.

ALTER TABLE public.user_preferences
  ALTER COLUMN favorite_features SET NOT NULL,
  ALTER COLUMN hidden_features SET NOT NULL,
  ALTER COLUMN enable_contextual_prompts SET NOT NULL,
  ALTER COLUMN enable_usage_tracking SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.user_preferences
  DROP COLUMN IF EXISTS language,
  DROP COLUMN IF EXISTS theme,
  DROP COLUMN IF EXISTS data_saver_mode,
  DROP COLUMN IF EXISTS orientation_seeds,
  DROP COLUMN IF EXISTS deleted_at;

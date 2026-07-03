-- 1. Hardening users table
UPDATE public.users SET citizenship = 'WANDERER' WHERE citizenship IS NULL;
UPDATE public.users SET pricing_tier = 'FREE' WHERE pricing_tier IS NULL;

ALTER TABLE public.users ALTER COLUMN citizenship SET DEFAULT 'WANDERER';
ALTER TABLE public.users ALTER COLUMN citizenship SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN pricing_tier SET DEFAULT 'FREE';
ALTER TABLE public.users ALTER COLUMN pricing_tier SET NOT NULL;

-- 2. Hardening user_social_links table
UPDATE public.user_social_links SET is_public = true WHERE is_public IS NULL;
UPDATE public.user_social_links SET privacy_level = 'public' WHERE privacy_level IS NULL;
UPDATE public.user_social_links SET order_index = 0 WHERE order_index IS NULL;
UPDATE public.user_social_links SET created_at = now() WHERE created_at IS NULL;
UPDATE public.user_social_links SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.user_social_links ALTER COLUMN is_public SET DEFAULT true;
ALTER TABLE public.user_social_links ALTER COLUMN is_public SET NOT NULL;
ALTER TABLE public.user_social_links ALTER COLUMN privacy_level SET DEFAULT 'public';
ALTER TABLE public.user_social_links ALTER COLUMN privacy_level SET NOT NULL;
ALTER TABLE public.user_social_links ALTER COLUMN order_index SET DEFAULT 0;
ALTER TABLE public.user_social_links ALTER COLUMN order_index SET NOT NULL;
ALTER TABLE public.user_social_links ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.user_social_links ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.user_social_links ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.user_social_links ALTER COLUMN updated_at SET NOT NULL;

-- 3. Hardening classrooms table
UPDATE public.classrooms SET is_archived = false WHERE is_archived IS NULL;
ALTER TABLE public.classrooms ALTER COLUMN is_archived SET DEFAULT false;
ALTER TABLE public.classrooms ALTER COLUMN is_archived SET NOT NULL;

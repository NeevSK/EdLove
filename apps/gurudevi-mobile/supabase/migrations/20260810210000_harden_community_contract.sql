-- Community contract hardening.
-- Evidence: linked Supabase zero-null scan on 2026-08-10.
-- Empty community tables are intentionally not used to justify extra NOT NULLs.

ALTER TABLE public.community_groups
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.community_group_members
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN group_id SET NOT NULL,
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.community_posts
  ALTER COLUMN group_id SET NOT NULL,
  ALTER COLUMN author_id SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.community_reactions
  ALTER COLUMN post_id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;

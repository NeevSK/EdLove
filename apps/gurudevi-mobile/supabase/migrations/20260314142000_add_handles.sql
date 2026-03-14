-- ============================================================
-- Handle/Username Capability
-- Adds unique handles/usernames to users, schools, classrooms, and groups.
-- Enforces format: [a-z0-9_-] only, 3-30 characters.
-- ============================================================

-- 1. Update Users (Username)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_format;
ALTER TABLE public.users ADD CONSTRAINT users_username_format 
  CHECK (username IS NULL OR username ~* '^[a-z0-9_-]{3,30}$');
COMMENT ON COLUMN public.users.username IS 'Case-insensitive unique handle for the user.';

-- 2. Update Schools (Handle)
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS handle text;
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_handle_key;
ALTER TABLE public.schools ADD CONSTRAINT schools_handle_key UNIQUE (handle);
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_handle_format;
ALTER TABLE public.schools ADD CONSTRAINT schools_handle_format 
  CHECK (handle IS NULL OR handle ~* '^[a-z0-9_-]{3,30}$');
COMMENT ON COLUMN public.schools.handle IS 'Unique public handle for the school.';

-- 3. Update Classrooms (Handle)
ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS handle text;
ALTER TABLE public.classrooms DROP CONSTRAINT IF EXISTS classrooms_handle_key;
ALTER TABLE public.classrooms ADD CONSTRAINT classrooms_handle_key UNIQUE (handle);
ALTER TABLE public.classrooms DROP CONSTRAINT IF EXISTS classrooms_handle_format;
ALTER TABLE public.classrooms ADD CONSTRAINT classrooms_handle_format 
  CHECK (handle IS NULL OR handle ~* '^[a-z0-9_-]{3,30}$');
COMMENT ON COLUMN public.classrooms.handle IS 'Unique public handle for the classroom.';

-- 4. Update Community Groups (Handle)
ALTER TABLE public.community_groups ADD COLUMN IF NOT EXISTS handle text;
ALTER TABLE public.community_groups DROP CONSTRAINT IF EXISTS community_groups_handle_key;
ALTER TABLE public.community_groups ADD CONSTRAINT community_groups_handle_key UNIQUE (handle);
ALTER TABLE public.community_groups DROP CONSTRAINT IF EXISTS community_groups_handle_format;
ALTER TABLE public.community_groups ADD CONSTRAINT community_groups_handle_format 
  CHECK (handle IS NULL OR handle ~* '^[a-z0-9_-]{3,30}$');
COMMENT ON COLUMN public.community_groups.handle IS 'Unique public handle for the community group.';

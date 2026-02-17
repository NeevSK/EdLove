-- Migration to support anonymous users correctly in public.users
-- Make email nullable since anonymous users don't have one initially

-- 1. Drop the NOT NULL constraint on email
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- 2. Ensure total_fullName is NOT NULL (if it was, just a safety check)
ALTER TABLE public.users ALTER COLUMN full_name SET DEFAULT 'Sanctuary User';

-- 3. Update comments
COMMENT ON COLUMN public.users.email IS 'User email address. Nullable for anonymous/guest users.';

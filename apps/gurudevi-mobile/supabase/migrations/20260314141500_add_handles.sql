-- Add handles/usernames to core tables
-- Migration: 20260314141500_add_handles.sql

-- 1. Users table (username)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add check constraint for username format
ALTER TABLE public.users
ADD CONSTRAINT username_format_check 
CHECK (username ~* '^[a-z0-9_-]{3,30}$');

-- 2. Schools table (handle)
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

-- Add check constraint for school handle format
ALTER TABLE public.schools
ADD CONSTRAINT school_handle_format_check 
CHECK (handle ~* '^[a-z0-9_-]{3,30}$');

-- 3. Classrooms table (handle)
ALTER TABLE public.classrooms
ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

-- Add check constraint for classroom handle format
ALTER TABLE public.classrooms
ADD CONSTRAINT classroom_handle_format_check 
CHECK (handle ~* '^[a-z0-9_-]{3,30}$');

-- 4. Community Groups table (handle)
ALTER TABLE public.community_groups
ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

-- Add check constraint for group handle format
ALTER TABLE public.community_groups
ADD CONSTRAINT group_handle_format_check 
CHECK (handle ~* '^[a-z0-9_-]{3,30}$');

-- Comment on columns for clarity
COMMENT ON COLUMN public.users.username IS 'Unique identifier for users used in profile links and mentions.';
COMMENT ON COLUMN public.schools.handle IS 'Unique identifier for schools used in platform URLs.';
COMMENT ON COLUMN public.classrooms.handle IS 'Unique identifier for classrooms within the school/platform.';
COMMENT ON COLUMN public.community_groups.handle IS 'Unique identifier for community groups.';

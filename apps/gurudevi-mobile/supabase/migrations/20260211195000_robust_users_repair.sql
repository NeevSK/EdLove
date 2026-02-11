-- ========================================================
-- ROBUST USERS TABLE REPAIR (v4)
-- Adds INSERT policy and ensures table/trigger existence
-- ========================================================

-- 1. Ensure users table exists with correct schema
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID,
  section_id UUID,
  grade_id UUID,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'teacher' NOT NULL,
  language TEXT DEFAULT 'si' NOT NULL,
  theme TEXT DEFAULT 'light' NOT NULL,
  data_saver_mode BOOLEAN DEFAULT false,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  is_pro BOOLEAN DEFAULT false,
  is_thuthimal BOOLEAN DEFAULT false,
  thuthimal_gifter TEXT,
  thuthimal_gifted_at TIMESTAMPTZ,
  invitations_remaining INTEGER DEFAULT 5,
  invitations_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_seen_at TIMESTAMPTZ
);

-- 2. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Helper function for school context (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 4. Re-grant core permissions (sometimes these get weird)
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 5. Drop old policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can view users in their school" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can see school members" ON public.users;
DROP POLICY IF EXISTS "Users can select own and school members" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 6. Create robust policies for SELECT, INSERT, and UPDATE
CREATE POLICY "Users can select own and school members" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() OR 
  school_id = get_auth_user_school_id()
);

CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 7. Ensure preferences trigger exists
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON public.users;
CREATE TRIGGER on_auth_user_created_preferences
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

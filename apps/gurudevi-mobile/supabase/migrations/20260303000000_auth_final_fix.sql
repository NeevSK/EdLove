-- Final Auth & RLS Fix: Robust User Sync and Content Access
-- This migration ensures Google users are correctly synced to public.users and can access school content.

-- 1. Robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    role_val text;
    name_val text;
BEGIN
    -- Prioritize metadata fields for name
    name_val := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        'Sanctuary User'
    );

    -- Prioritize role from metadata, default to 'teacher'
    role_val := COALESCE(
        new.raw_user_meta_data->>'role',
        'teacher'
    );

    -- Insert or Update for existing guest/partial records
    INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at)
    VALUES (
        new.id,
        new.email,
        name_val,
        role_val,
        new.raw_user_meta_data->>'avatar_url',
        new.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Ensure trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Refine RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Allow admins/principals to see users in their school
DROP POLICY IF EXISTS "Admins can view users in their school" ON public.users;
CREATE POLICY "Admins can view users in their school"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users AS requesting_user
            WHERE requesting_user.id = auth.uid()
            AND requesting_user.school_id = public.users.school_id
            AND requesting_user.role IN ('admin', 'principal')
        )
    );

-- 4. Fix content access (Schools/Announcements/Groups)
-- Ensure users can see their school even before they are fully "synced" if they have the ID
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;
CREATE POLICY "Users can view their own school"
    ON public.schools FOR SELECT
    USING (
        id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    );

-- 5. Sync any missing users immediately
INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Sanctuary User'),
    COALESCE(raw_user_meta_data->>'role', 'teacher'),
    raw_user_meta_data->>'avatar_url',
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- IDENTITY ARCHITECTURE REFACTOR
-- ========================================================
-- Decouples Supabase Auth from Application Identity.
-- Version 1.0 - 2026-03-08
-- ========================================================

-- 1. Create Identity Mapping Table
CREATE TABLE IF NOT EXISTS public.auth_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'apple', 'email', 'supabase'
  provider_user_id TEXT NOT NULL, -- The unique ID from the provider
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(provider, provider_user_id)
);

-- Index for fast lookup during login
CREATE INDEX IF NOT EXISTS idx_auth_identities_provider_id ON public.auth_identities (provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id ON public.auth_identities (user_id);

-- 2. Update Users Table (Decouple from auth.users)
-- Since we are in early stage and the user said "nothing to break", 
-- we will eventually drop the foreign key constraint to auth.users.
-- For now, we allow id to be any UUID.
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
-- We don't drop the FK yet to avoid breaking current active sessions until we've migrated them.

-- 3. Helper Function to get internal User ID from Auth UID
CREATE OR REPLACE FUNCTION public.get_my_id()
RETURNS uuid AS $$
  SELECT user_id FROM public.auth_identities 
  WHERE provider_user_id = auth.uid()::text 
  AND provider = 'supabase'
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Improved User Sync Function
-- This function now handles multi-provider mapping
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- 1. Create new application user
    INSERT INTO public.users (full_name, email, role)
    VALUES (
        COALESCE(new.raw_user_meta_data->>'full_name', 'Sanctuary User'),
        new.email,
        'teacher' -- Default role
    )
    RETURNING id INTO new_user_id;

    -- 2. Create identity mapping
    INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
    VALUES (new_user_id, 'supabase', new.id::text);

    RETURN new;
END;
$$;

-- 5. Migrate Existing Users
-- Map current users (who have id = auth.uid()) to the identities table
INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
SELECT id, 'supabase', id::text
FROM public.users
ON CONFLICT (provider, provider_user_id) DO NOTHING;

-- 6. Grant Access
GRANT SELECT ON public.auth_identities TO authenticated;
GRANT SELECT ON public.auth_identities TO service_role;

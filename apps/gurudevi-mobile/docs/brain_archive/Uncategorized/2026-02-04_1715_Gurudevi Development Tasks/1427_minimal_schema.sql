-- ============================================
-- GURUDEVI MINIMAL SCHEMA (v0.1 Foundation)
-- ============================================
-- Purpose: Core tables needed for auth and login
-- Safe to extend: Additional tables can be added later without changing these
-- Created: 2026-02-04
-- ============================================

-- --------------------------------------------
-- STEP 1: Enable UUID Extension
-- --------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------
-- STEP 2: Create Schools Table (Tenant Root)
-- --------------------------------------------
-- This table defines school tenants
-- Will NEVER need to change when adding features
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('government', 'private', 'semi-government', 'international')),
  district TEXT,
  city TEXT,
  province TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_name ON public.schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_district ON public.schools(district);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own school
CREATE POLICY "Users can view their own school"
  ON public.schools FOR SELECT
  USING (
    id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Anyone can insert schools (for signup flow)
-- Note: In production, you might want to restrict this
CREATE POLICY "Anyone can create schools during signup"
  ON public.schools FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.schools IS 'Multi-tenant root table - each school is a separate tenant';

-- --------------------------------------------
-- STEP 3: Create Users Table (Extends auth.users)
-- --------------------------------------------
-- This extends Supabase's auth.users with our app-specific data
-- Will NEVER need to change when adding features
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  
  -- User Info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'principal')) NOT NULL,
  
  -- Preferences
  language TEXT DEFAULT 'si' CHECK (language IN ('si', 'ta', 'en')) NOT NULL,
  data_saver_mode BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')) NOT NULL,
  
  -- Avatar
  avatar_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_seen_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_school_id ON public.users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view users in their school
CREATE POLICY "Users can view users in their school"
  ON public.users FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policy: Anyone can insert during signup
CREATE POLICY "Anyone can insert during signup"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

COMMENT ON TABLE public.users IS 'User profiles extending auth.users - includes role and preferences';

-- --------------------------------------------
-- STEP 4: Create Subscriptions Table
-- --------------------------------------------
-- Tracks which tier each user/school is on
-- Will NEVER need to change when adding features
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  
  -- Subscription details
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')) DEFAULT 'free' NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) DEFAULT 'active' NOT NULL,
  
  -- Billing
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Payment info (PayHere)
  payment_id TEXT,
  payment_method TEXT,
  last_payment_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Constraint: Subscription is either for a user OR a school (not both)
  CONSTRAINT subscription_target CHECK (
    (user_id IS NOT NULL AND school_id IS NULL) OR
    (user_id IS NULL AND school_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_school_id ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE public.subscriptions IS 'Tracks subscription tiers (free/pro/premium) for users or schools';

-- --------------------------------------------
-- STEP 5: Create Updated Timestamp Trigger
-- --------------------------------------------
-- Automatically update updated_at column when row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- STEP 6: Insert Default Free Tier for New Users
-- --------------------------------------------
-- When a user signs up, automatically give them free tier
CREATE OR REPLACE FUNCTION create_free_subscription_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_free_subscription_for_user();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup worked:

-- Check if tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('schools', 'users', 'subscriptions');

-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('schools', 'users', 'subscriptions');

-- ============================================
-- NOTES FOR FUTURE
-- ============================================
-- When you're ready to add more tables (classrooms, lessons, etc.):
-- 1. They will all reference schools(id) and users(id)
-- 2. No need to modify these 3 core tables
-- 3. Just CREATE new tables and add RLS policies
-- 4. Example:
--    CREATE TABLE classrooms (
--      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--      school_id UUID REFERENCES schools(id) NOT NULL,
--      teacher_id UUID REFERENCES users(id),
--      name TEXT NOT NULL,
--      ...
--    );
-- ============================================

-- ✅ SETUP COMPLETE!
-- You can now sign up from the app.

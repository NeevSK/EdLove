-- ========================================================
-- GURUDEVI MASTER BASELINE SCHEMA (v1.0)
-- ========================================================
-- This file consolidates ALL tables, RLS policies, and triggers
-- for the Gurudevi platform into one clean, logically ordered file.
-- Use this to understand the terrain or for a fresh database reset.
-- ========================================================

-- --------------------------------------------------------
-- 0. EXTENSIONS & SETUP
-- --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- 1. FOUNDATION MODULE (Schools & Core Users)
-- --------------------------------------------------------

-- 1.1 Schools (Tenant Root)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('1AB', '1C', 'Type_2', 'Type_3', 'semi_government', 'private', 'international', 'pirivena', 'personal_workspace', 'government')),
  district TEXT,
  city TEXT,
  province TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  census_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexibility for future school-specific info
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- 1.2 Sections (SL School Hierarchy)
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  grade_range TEXT,
  section_head_id UUID, -- References users(id) later
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, name)
);

-- 1.3 Grades (SL School Hierarchy)
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  grade_number INTEGER CHECK (grade_number >= 1 AND grade_number <= 13),
  grade_head_id UUID, -- References users(id) later
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, grade_number)
);

-- 1.4 Users (Extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('founder', 'admin', 'principal', 'section_head', 'grade_head', 'teacher', 'student')) NOT NULL,
  
  -- Preferences & Settings
  language TEXT DEFAULT 'si' CHECK (language IN ('si', 'ta', 'en')) NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')) NOT NULL,
  data_saver_mode BOOLEAN DEFAULT false,
  avatar_url TEXT,
  
  -- Onboarding & Pro Status
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  is_pro BOOLEAN DEFAULT false,
  is_thuthimal BOOLEAN DEFAULT false, -- Gratitude Gifted
  thuthimal_gifter TEXT,
  thuthimal_gifted_at TIMESTAMPTZ,
  
  -- Invitation Stats
  invitations_remaining INTEGER DEFAULT 5,
  invitations_sent INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_seen_at TIMESTAMPTZ,
  -- Required by the later soft-deletion and identity migrations. This is a
  -- nullable lifecycle marker; it does not delete or rewrite a user.
  deleted_at TIMESTAMPTZ
);

-- Retired identity projections required by the April-to-August historical
-- migration segment. Later tracked migrations replace authority with ReBAC
-- and remove tier_id/tier tables; keeping this narrow compatibility substrate
-- here lets a clean replay preserve that sequence.
CREATE TABLE public.tiers (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO public.tiers (id, slug) VALUES
  ('4bbc88cc-bd13-4c09-872f-6f5d0cf1e4f6', 'thuthimal'),
  ('8a45d2cf-0201-45d8-8ea9-e5a67fa24401', 'standard');

ALTER TABLE public.users
  ADD COLUMN authority TEXT,
  ADD COLUMN tier_id UUID REFERENCES public.tiers(id),
  ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN orientation_seeds JSONB,
  ADD COLUMN gender TEXT,
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN school_role TEXT,
  ADD COLUMN work_roles TEXT[];

-- The faceted profile tables predate the retained migration ledger. Their
-- lifecycle columns and policy evolution remain in later migrations; these
-- definitions are the minimum predecessor contracts used by that history.
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  index_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  nic_number TEXT,
  is_section_head BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.principal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  nic_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Institutional membership is the predecessor of the later authority and
-- approval migrations. It is deliberately stateful (rather than a role on
-- users) so its historical tenure can be retained.
CREATE TABLE public.school_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  start_date DATE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE public.school_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Now add foreign key back to users for heads
ALTER TABLE public.sections ADD CONSTRAINT sections_head_fkey FOREIGN KEY (section_head_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.grades ADD CONSTRAINT grades_head_fkey FOREIGN KEY (grade_head_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 1.5 Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')) DEFAULT 'free' NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) DEFAULT 'active' NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT subscription_target CHECK ((user_id IS NOT NULL AND school_id IS NULL) OR (user_id IS NULL AND school_id IS NOT NULL))
);

-- --------------------------------------------------------
-- 2. ACADEMIC MODULE (Classrooms & Content)
-- --------------------------------------------------------

-- 2.1 Classrooms
CREATE TABLE public.classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, -- Made NULLABLE for personal workspaces
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  color_theme TEXT DEFAULT 'blue',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- 2.2 Classroom Students (Enrollment)
CREATE TABLE public.classroom_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for shadow profiles
  full_name TEXT, -- For shadow students
  invite_code TEXT UNIQUE DEFAULT substring(uuid_generate_v4()::text, 1, 8),
  roll_number INTEGER,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  claimed_at TIMESTAMPTZ
);

-- 2.3 Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.4 Lesson Materials
CREATE TABLE public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf', 'link', 'note')) NOT NULL,
  url TEXT,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.5 Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.6 Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grade INTEGER,
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- 2.7 Classroom Photos
CREATE TABLE public.classroom_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  shared_with_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 3. SELF & WELLBEING MODULE
-- --------------------------------------------------------

-- 3.1 Mood Logs
CREATE TABLE public.mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.2 Fire Journal
CREATE TABLE public.fire_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_preview TEXT,
  is_burned BOOLEAN DEFAULT false,
  burned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.3 Progressive Wellbeing Feature Set
CREATE TABLE public.joy_moments (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, student_name TEXT, moment_description TEXT NOT NULL, category TEXT DEFAULT 'breakthrough', created_at TIMESTAMPTZ DEFAULT now() NOT NULL);
CREATE TABLE public.gratitude_entries (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now() NOT NULL);
CREATE TABLE public.wisdom_notes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, insight TEXT NOT NULL, tags TEXT[], created_at TIMESTAMPTZ DEFAULT now() NOT NULL);
CREATE TABLE public.daily_prep_items (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, item_text TEXT NOT NULL, prep_date DATE NOT NULL, is_completed BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now() NOT NULL);
CREATE TABLE public.energy_forecasts (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5) NOT NULL, notes TEXT, forecast_date DATE DEFAULT CURRENT_DATE NOT NULL, created_at TIMESTAMPTZ DEFAULT now() NOT NULL, UNIQUE(user_id, forecast_date));
CREATE TABLE public.contextual_moments (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, moment_type TEXT NOT NULL, acknowledged BOOLEAN DEFAULT false, prompt_text TEXT, created_at TIMESTAMPTZ DEFAULT now() NOT NULL);

-- 3.4 Daily Home Content
CREATE TABLE public.daily_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('motivation', 'did_you_know')),
  content TEXT NOT NULL,
  author TEXT,
  date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4.1 Daily Content Helper
CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type text)
RETURNS SETOF daily_content
LANGUAGE sql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM daily_content
  WHERE type = content_type
    AND active = true
    AND date <= CURRENT_DATE
  ORDER BY date DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_daily_content_for_today(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_content_for_today(text) TO anon;

-- --------------------------------------------------------
-- 4. COMMUNITY & SOCIAL MODULE
-- --------------------------------------------------------

-- 4.1 Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4.2 Community Groups & Posts
CREATE TABLE public.community_groups (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL, name TEXT NOT NULL, description TEXT, created_by UUID REFERENCES public.users(id), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.community_group_members (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE, user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, role TEXT DEFAULT 'member', joined_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.community_posts (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE, author_id UUID REFERENCES public.users(id) ON DELETE CASCADE, content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.community_reactions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE, user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, emoji TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());

-- --------------------------------------------------------
-- 5. LIBRARY & RESOURCES MODULE
-- --------------------------------------------------------

CREATE TABLE public.library_items (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, uploader_id UUID REFERENCES public.users(id), title TEXT NOT NULL, description TEXT, file_url TEXT, thumbnail_url TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.library_collections (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, name TEXT NOT NULL, is_public BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.library_collection_items (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), collection_id UUID REFERENCES public.library_collections(id) ON DELETE CASCADE, item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE, added_at TIMESTAMPTZ DEFAULT now());

-- --------------------------------------------------------
-- 6. SYSTEM MODULE (Invites, Gamification, Prefs)
-- --------------------------------------------------------

-- 6.1 Invite Codes (Enhanced for future QR support)
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL, -- This can be the QR Payload
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  invitation_text TEXT, -- For custom messages
  metadata JSONB DEFAULT '{}'::jsonb, -- Store future QR metadata here
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- 6.2 Profile Completion
CREATE TABLE public.profile_completion (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  completion_percentage INTEGER DEFAULT 30,
  has_phone BOOLEAN DEFAULT false,
  has_avatar BOOLEAN DEFAULT false,
  has_bio BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6.3 User Preferences & Usage Tracking
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  favorite_features TEXT[] DEFAULT ARRAY['mood', 'fire', 'rhythm'],
  hidden_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  morning_check_time TIME DEFAULT '08:00:00',
  afternoon_check_time TIME DEFAULT '14:47:00',
  evening_wind_down_time TIME DEFAULT '17:00:00',
  enable_contextual_prompts BOOLEAN DEFAULT true,
  enable_usage_tracking BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.feature_usage_log (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, feature_name TEXT NOT NULL, interaction_type TEXT DEFAULT 'view', duration_seconds INTEGER, created_at TIMESTAMPTZ DEFAULT now() NOT NULL);

-- 6.4 Gamification & Rewards
CREATE TABLE public.user_rewards (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, points INTEGER DEFAULT 0, badges TEXT[], created_at TIMESTAMPTZ DEFAULT now());
-- This entity was present in the archived master baseline but omitted from the
-- active replay baseline. The first dependent migration is the following
-- month's atomic growth RPC, so keep the original schema here rather than
-- inventing a later-shaped substitute.
CREATE TABLE public.user_growth_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bhumi_stage TEXT DEFAULT 'bijam' NOT NULL,
  presence_signals INTEGER DEFAULT 0,
  nourishing_signals INTEGER DEFAULT 0,
  witnessing_signals INTEGER DEFAULT 0,
  weaving_signals INTEGER DEFAULT 0,
  blooming_signals INTEGER DEFAULT 0,
  banyan_stage TEXT DEFAULT 'sapling',
  river_stage TEXT DEFAULT 'trickle',
  crystal_tier TEXT DEFAULT 'spark',
  peer_mentored_count INTEGER DEFAULT 0,
  circles_facilitated_count INTEGER DEFAULT 0,
  lessons_completed_count INTEGER DEFAULT 0,
  reflections_submitted_count INTEGER DEFAULT 0,
  crystals_found_count INTEGER DEFAULT 0,
  fractal_moments_count INTEGER DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE public.gift_codes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), code TEXT UNIQUE NOT NULL, type TEXT NOT NULL, value INTEGER, is_redeemed BOOLEAN DEFAULT false, redeemed_by UUID REFERENCES public.users(id), created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE public.pricing_subscriptions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, plan_name TEXT NOT NULL, amount DECIMAL, period TEXT, active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());

-- --------------------------------------------------------
-- 7. TRIGGERS & AUTOMATION
-- --------------------------------------------------------

-- Update Timestamps Triggers
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create preferences on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences() RETURNS trigger AS $$ BEGIN INSERT INTO public.user_preferences (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING; RETURN new; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
CREATE TRIGGER on_auth_user_created_preferences AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

-- 7.2 User Sync (Extends auth.users to public.users)
-- SECURITY: Always assigns 'teacher' role, ignoring raw_user_meta_data role claim
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Sanctuary User'),
    'teacher' -- Always default to 'teacher', server-side role assignment required for elevation
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- --------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Baseline Policies (Robust & Recursion-Free)

-- Helper function for school context (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Users policies
CREATE POLICY "Users can select own and school members" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() OR 
  school_id = (SELECT get_auth_user_school_id())
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

CREATE POLICY "Teachers can insert their own classrooms" ON public.classrooms FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers manage their own classrooms" ON public.classrooms FOR ALL TO authenticated USING (teacher_id = auth.uid());
-- 8.2 Wellbeing Policies
CREATE POLICY "Users can manage their own mood logs" ON public.mood_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can manage their own fire journal" ON public.fire_journal FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Invite codes select active" ON public.invite_codes FOR SELECT TO authenticated, anon USING (is_active = true);

-- Additional Policies (Truncated for readability, full implementation requires specific access rules)

-- ========================================================
-- MASTER BASELINE COMPLETE
-- ========================================================

-- Initial User Sync (Ensure all existing auth users are in public types)
-- SECURITY: Role is set to 'teacher' by default, ignoring client-controlled metadata
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Sanctuary User') as full_name, 
    'teacher' as role, -- Always default to 'teacher', ignore client metadata
    created_at, 
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

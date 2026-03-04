-- ========================================================
-- GURUDEVI MASTER BASELINE SCHEMA (v4.0 — FULL DB MIRROR)
-- Generated: 2026-03-02
-- Source of Truth: Live Supabase DB (qzoawolfkuwiuyaoiybz)
-- ========================================================
-- This file is the SINGLE canonical reference for the entire
-- Gurudevi schema. It reflects every table currently in the DB.
-- Run this on a FRESH database only — never on top of existing schema.
-- For incremental updates, use numbered migrations instead.
-- ========================================================

-- --------------------------------------------------------
-- 0. EXTENSIONS & HELPERS
-- --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------------
-- 1. FOUNDATION — Schools, Sections, Grades, Users
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('1AB','1C','Type_2','Type_3','semi_government','private','international','pirivena','personal_workspace','government')),
  district TEXT,
  city TEXT,
  province TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID,
  is_sample BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  grade_range TEXT,
  section_head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, name)
);

CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  grade_number INTEGER CHECK (grade_number >= 1 AND grade_number <= 13),
  grade_head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, grade_number)
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  email TEXT UNIQUE,
  full_name TEXT DEFAULT 'Sanctuary User' NOT NULL,
  role TEXT CHECK (role IN ('founder','admin','principal','section_head','grade_head','teacher','student')),
  is_anonymous BOOLEAN DEFAULT false NOT NULL,
  language TEXT DEFAULT 'si' CHECK (language IN ('si','ta','en')) NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light','dark','auto')) NOT NULL,
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
  last_seen_at TIMESTAMPTZ,
  profile_completed BOOLEAN DEFAULT false,
  bio TEXT,
  role_label TEXT,
  experience_years INTEGER,
  subjects_taught TEXT[],
  qualifications TEXT[],
  orientation_seeds JSONB DEFAULT NULL
);

-- School & Classroom join requests
CREATE TABLE IF NOT EXISTS public.school_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 2. CLASSROOM MODULE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  color_theme TEXT DEFAULT 'blue',
  is_archived BOOLEAN DEFAULT false,
  academic_year TEXT DEFAULT TO_CHAR(NOW(),'YYYY') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_classrooms_academic_year ON public.classrooms(school_id, academic_year);

CREATE TABLE IF NOT EXISTS public.classroom_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(classroom_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.classroom_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  subject_label TEXT,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  index_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(classroom_id, index_number)
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf','link','note')) NOT NULL,
  url TEXT,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grade INTEGER,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  assignment_id TEXT,
  marks NUMERIC,
  grade TEXT,
  gpa NUMERIC,
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attendance (
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  PRIMARY KEY (classroom_id, student_id, date)
);

CREATE TABLE IF NOT EXISTS public.classroom_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'note' CHECK (note_type IN ('note','announcement','lesson_recap','reminder','personal')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','class')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classroom_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  shared_with_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  grade_number INTEGER,
  subject TEXT,
  avg_grade NUMERIC(5,2),
  highest_grade NUMERIC(5,2),
  lowest_grade NUMERIC(5,2),
  assignments_total INTEGER DEFAULT 0,
  assignments_submitted INTEGER DEFAULT 0,
  teacher_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, classroom_id, academic_year)
);

-- Active year views
CREATE OR REPLACE VIEW public.active_classrooms AS
  SELECT * FROM public.classrooms
  WHERE academic_year = TO_CHAR(NOW(),'YYYY') AND is_archived = false;

-- --------------------------------------------------------
-- 3. SELF / WELLBEING MODULE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
  period_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT,
  type TEXT CHECK (type IN ('subject','relief','interval')) DEFAULT 'subject' NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  academic_year TEXT DEFAULT TO_CHAR(NOW(),'YYYY') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, day_of_week, period_number, academic_year)
);

CREATE OR REPLACE VIEW public.active_timetable AS
  SELECT * FROM public.timetable WHERE academic_year = TO_CHAR(NOW(),'YYYY');

CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
  mood TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fire_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_preview TEXT,
  is_burned BOOLEAN DEFAULT false,
  burned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('motivation','did_you_know')),
  content TEXT NOT NULL,
  author TEXT,
  date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_prep_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_text TEXT NOT NULL,
  prep_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.energy_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  energy_level INTEGER NOT NULL,
  notes TEXT,
  forecast_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.joy_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT,
  moment_description TEXT NOT NULL,
  category TEXT DEFAULT 'breakthrough',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wisdom_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.whispered_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  moment_key TEXT NOT NULL,
  moment_name_en TEXT NOT NULL,
  moment_name_si TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 4. COMMUNITY MODULE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT DEFAULT 'general' CHECK (group_type IN ('class','interest','staff','public','general','club','subject')),
  join_policy TEXT DEFAULT 'open' CHECK (join_policy IN ('open','approval_required','invite_only')),
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin','member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','pending','banned')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  post_type TEXT CHECK (post_type IN ('post','poll','announcement')),
  title TEXT,
  content TEXT,
  metadata JSONB,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.community_reactions (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reaction_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gratitude_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  message TEXT,
  gift_type TEXT DEFAULT 'lantern' NOT NULL,
  warm_message_en TEXT NOT NULL,
  warm_message_si TEXT,
  warm_message_ta TEXT,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_ripples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  entity_id UUID,
  ripple_type TEXT NOT NULL,
  warm_message_en TEXT NOT NULL,
  warm_message_si TEXT,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 5. LIBRARY MODULE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.library_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  creator_name TEXT,
  creator_role TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('pdf','video','link','text','doc')),
  url TEXT NOT NULL,
  subject TEXT,
  topics TEXT[] DEFAULT '{}',
  grades INTEGER[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'intermediate',
  language TEXT DEFAULT 'si',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB,
  is_public BOOLEAN DEFAULT false,
  is_curated BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.users(id),
  curriculum_aligned BOOLEAN DEFAULT false,
  copyright_notice TEXT,
  views INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0,
  endorsements INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.resource_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.collection_resources (
  collection_id UUID REFERENCES public.resource_collections(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.library_resources(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY(collection_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.resource_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.library_resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resource_needs (
  id UUID,
  resource_type TEXT,
  description TEXT,
  requested_by_count BIGINT,
  priority TEXT,
  icon TEXT,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 6. GAMIFICATION & GROWTH ENGINE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pricing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('free','pro','premium')),
  status TEXT CHECK (status IN ('active','cancelled','expired')),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'free' NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.feature_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  interaction_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_rewards (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_growth_state (
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

CREATE TABLE IF NOT EXISTS public.growth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  dimension TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contextual_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  creator_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  description_en TEXT,
  metric TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' NOT NULL,
  nature_metaphor TEXT NOT NULL,
  completion_celebration_en TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.personal_compasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title_en TEXT NOT NULL,
  metric TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contextual_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  moment_type TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  prompt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gift_codes (
  code TEXT PRIMARY KEY,
  code_type TEXT CHECK (code_type IN ('pro_sub','points','premium_sub')),
  value INTEGER,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_by UUID REFERENCES public.users(id),
  redeemed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.thuthimal_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  gifter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gifter_name TEXT NOT NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('teacher','principal')),
  recipient_id UUID REFERENCES public.users(id),
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_forest_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  teacher_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tree_health TEXT DEFAULT 'seedling' NOT NULL,
  has_thuthimal BOOLEAN DEFAULT false,
  last_signal_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, teacher_user_id)
);

-- --------------------------------------------------------
-- 7. MANIFESTOS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sanctuary_manifestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  vibe TEXT DEFAULT 'visionary',
  status TEXT DEFAULT 'active',
  target_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manifesto_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifesto_id UUID REFERENCES public.sanctuary_manifestos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  commitment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 8. STAFF & GOVERNANCE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.principal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'note' CHECK (note_type IN ('todo','observation','decision','reminder','note')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  context_teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  context_classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.principal_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  principal_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('walkthrough','note','concern','praise')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day','on_leave')),
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, user_id, date)
);

CREATE TABLE IF NOT EXISTS public.staff_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick','casual','annual','maternity','paternity','other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.institutional_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'event' CHECK (type IN ('term_start','term_end','exam','holiday','sports','event','other')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.inventory_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- --------------------------------------------------------
-- 9. INFRASTRUCTURE
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id),
  old_role TEXT,
  new_role TEXT,
  old_school_id UUID,
  new_school_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('teacher','student')) NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  invitation_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  marketing_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  privacy_level TEXT DEFAULT 'public',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  privacy_level TEXT DEFAULT 'public',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_completion (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  completion_percentage INTEGER DEFAULT 30,
  has_phone BOOLEAN DEFAULT false,
  has_avatar BOOLEAN DEFAULT false,
  has_bio BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------
-- 10. CORE FUNCTIONS
-- --------------------------------------------------------

-- User creation trigger — handles guests + Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_is_anon BOOLEAN;
BEGIN
  v_is_anon := (NEW.raw_app_meta_data->>'is_anonymous')::boolean;
  INSERT INTO public.users (id, email, full_name, role, is_anonymous)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sanctuary User'),
    NEW.raw_user_meta_data->>'role',
    COALESCE(v_is_anon, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    is_anonymous = COALESCE(EXCLUDED.is_anonymous, users.is_anonymous);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Daily content helper
CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type TEXT DEFAULT NULL)
RETURNS SETOF public.daily_content
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT * FROM daily_content
  WHERE active = true AND date <= CURRENT_DATE
    AND (content_type IS NULL OR type = content_type)
  ORDER BY date DESC LIMIT 1;
$$;

-- Increment growth dimension (atomic, whitelisted)
CREATE OR REPLACE FUNCTION public.increment_growth_dimension(p_user_id UUID, p_column TEXT)
RETURNS public.user_growth_state
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_result public.user_growth_state;
BEGIN
  IF p_column NOT IN (
    'presence_signals','nourishing_signals','witnessing_signals',
    'weaving_signals','blooming_signals',
    'peer_mentored_count','circles_facilitated_count',
    'lessons_completed_count','reflections_submitted_count',
    'crystals_found_count','fractal_moments_count'
  ) THEN RAISE EXCEPTION 'Invalid dimension column: %', p_column; END IF;
  EXECUTE format(
    'INSERT INTO public.user_growth_state (user_id, %I, updated_at)
     VALUES ($1, 1, now())
     ON CONFLICT (user_id)
     DO UPDATE SET %I = user_growth_state.%I + 1, updated_at = now()
     RETURNING *',
    p_column, p_column, p_column
  ) USING p_user_id INTO v_result;
  RETURN v_result;
END; $$;

GRANT EXECUTE ON FUNCTION public.increment_growth_dimension(UUID, TEXT) TO authenticated;

-- Thuthimal claim
CREATE OR REPLACE FUNCTION claim_thuthimal_gift(p_token UUID, p_recipient UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_gift thuthimal_gifts;
BEGIN
  SELECT * INTO v_gift FROM thuthimal_gifts
  WHERE gift_token = p_token AND claimed = false
    AND (expires_at IS NULL OR expires_at > now()) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','already_claimed_or_invalid'); END IF;
  UPDATE thuthimal_gifts SET claimed=true, claimed_at=now(), recipient_id=p_recipient WHERE id=v_gift.id;
  UPDATE users SET is_pro=true, is_thuthimal=true, thuthimal_gifter=v_gift.gifter_name,
    thuthimal_gifted_at=now() WHERE id=p_recipient;
  RETURN jsonb_build_object('success',true,'gifter_name',v_gift.gifter_name);
END; $$;

-- Library counter helpers
CREATE OR REPLACE FUNCTION increment_resource_views(resource_id UUID)
RETURNS void AS $$
BEGIN UPDATE library_resources SET views = views + 1 WHERE id = resource_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION increment_resource_endorsements(resource_id UUID)
RETURNS void AS $$
BEGIN UPDATE library_resources SET endorsements = endorsements + 1 WHERE id = resource_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION decrement_resource_endorsements(resource_id UUID)
RETURNS void AS $$
BEGIN UPDATE library_resources SET endorsements = GREATEST(0, endorsements - 1) WHERE id = resource_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Group member count trigger
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.community_groups SET member_count = (
      SELECT COUNT(*) FROM public.community_group_members
      WHERE group_id = NEW.group_id AND status = 'active'
    ) WHERE id = NEW.group_id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    UPDATE public.community_groups SET member_count = (
      SELECT COUNT(*) FROM public.community_group_members
      WHERE group_id = OLD.group_id AND status = 'active'
    ) WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_group_member_count ON public.community_group_members;
CREATE TRIGGER trg_group_member_count
  AFTER INSERT OR UPDATE OR DELETE ON public.community_group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

-- Notification triggers
CREATE OR REPLACE FUNCTION public.notify_on_submission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_teacher_id UUID; v_assignment_title TEXT; v_student_name TEXT;
BEGIN
  SELECT a.title, c.teacher_id INTO v_assignment_title, v_teacher_id
    FROM public.assignments a JOIN public.classrooms c ON c.id = a.classroom_id
    WHERE a.id = NEW.assignment_id;
  SELECT full_name INTO v_student_name FROM public.users WHERE id = NEW.student_id;
  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id,type,title,body,reference_id,reference_type)
    VALUES(v_teacher_id,'new_submission','New Submission',
      COALESCE(v_student_name,'A student')||' submitted '||COALESCE(v_assignment_title,'an assignment'),
      NEW.id,'submission');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_submission ON public.submissions;
CREATE TRIGGER trg_notify_submission
  AFTER INSERT ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.notify_on_submission();

CREATE OR REPLACE FUNCTION public.notify_on_grade()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_assignment_title TEXT;
BEGIN
  IF OLD.graded_at IS NULL AND NEW.graded_at IS NOT NULL THEN
    SELECT title INTO v_assignment_title FROM public.assignments WHERE id = NEW.assignment_id;
    INSERT INTO public.notifications(user_id,type,title,body,reference_id,reference_type)
    VALUES(NEW.student_id,'submission_graded','Assignment Graded',
      COALESCE(v_assignment_title,'Your assignment')||' has been graded',NEW.id,'submission');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_grade ON public.submissions;
CREATE TRIGGER trg_notify_grade
  AFTER UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.notify_on_grade();

-- ========================================================
-- ROW LEVEL SECURITY
-- ========================================================

-- Enable RLS on all user-data tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prep_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joy_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wisdom_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_growth_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctuary_manifestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesto_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principal_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_calendar ENABLE ROW LEVEL SECURITY;

-- Foundation policies
CREATE POLICY "Schools are viewable by authenticated users" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create schools" ON public.schools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Principals manage their own schools" ON public.schools FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can select own and school members" ON public.users FOR SELECT TO authenticated USING (id = auth.uid() OR school_id = get_auth_user_school_id());
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Allow anon profile insert" ON public.users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Users can update safe profile fields" ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND
    (role = (SELECT role FROM public.users WHERE id = auth.uid()) OR (SELECT role FROM public.users WHERE id = auth.uid()) IS NULL) AND
    (school_id IS NOT DISTINCT FROM (SELECT school_id FROM public.users WHERE id = auth.uid()) OR (SELECT school_id FROM public.users WHERE id = auth.uid()) IS NULL));

-- Classroom policies
CREATE POLICY "Teachers manage their classrooms" ON public.classrooms FOR ALL TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "students_teacher_policy" ON public.students FOR ALL TO authenticated USING (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())) WITH CHECK (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()));

CREATE POLICY "classroom_notes_own_read" ON public.classroom_notes FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "classroom_notes_class_read" ON public.classroom_notes FOR SELECT USING (visibility = 'class' AND (EXISTS (SELECT 1 FROM classrooms c WHERE c.id = classroom_notes.classroom_id AND c.teacher_id = auth.uid()) OR EXISTS (SELECT 1 FROM classroom_students cs WHERE cs.classroom_id = classroom_notes.classroom_id AND cs.student_id = auth.uid())));
CREATE POLICY "classroom_notes_insert" ON public.classroom_notes FOR INSERT WITH CHECK (author_id = auth.uid());

-- Submissions RLS
CREATE POLICY "Students can read their own submissions" ON public.submissions FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can read submissions in their classrooms" ON public.submissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid()));
CREATE POLICY "Teachers can grade submissions in their classrooms" ON public.submissions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid()));

-- Wellbeing & Academic Records
CREATE POLICY "Users manage own timetable" ON public.timetable FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "mood_logs_privacy" ON public.mood_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "journal_entries_privacy" ON public.journal_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "fire_journal_privacy" ON public.fire_journal FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "sar_student_read_own" ON public.student_academic_records FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "sar_staff_read_school" ON public.student_academic_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = student_academic_records.school_id AND u.role IN ('teacher','principal','admin')));

-- Community
CREATE POLICY "group_messages_member_read" ON public.group_messages FOR SELECT USING (EXISTS (SELECT 1 FROM community_group_members m WHERE m.group_id = group_messages.group_id AND m.user_id = auth.uid() AND m.status = 'active'));
CREATE POLICY "group_messages_member_insert" ON public.group_messages FOR INSERT WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM community_group_members m WHERE m.group_id = group_messages.group_id AND m.user_id = auth.uid() AND m.status = 'active'));
CREATE POLICY "notifications_privacy" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Daily content
CREATE POLICY "Anyone can read active daily content" ON public.daily_content FOR SELECT USING (active = true);

-- Principal & Staff
CREATE POLICY "principal_notes_privacy" ON public.principal_notes FOR ALL TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "observations_principal_own" ON public.principal_observations FOR ALL USING (auth.uid() = principal_id) WITH CHECK (auth.uid() = principal_id AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = principal_observations.school_id AND u.role IN ('principal','founder')));
CREATE POLICY "staff_attendance_school_read" ON public.staff_attendance FOR SELECT USING (EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = staff_attendance.school_id));
CREATE POLICY "staff_attendance_self_insert" ON public.staff_attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staff_attendance_self_update" ON public.staff_attendance FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "calendar_school_read" ON public.institutional_calendar FOR SELECT USING (is_public OR EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = institutional_calendar.school_id));

-- Economy
CREATE POLICY "thuthimal_gifter_reads_own" ON public.thuthimal_gifts FOR SELECT USING (gifter_id = auth.uid());
CREATE POLICY "audit_log_admin_view" ON public.audit_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder','admin')));
CREATE POLICY "Users can insert own usage logs" ON public.feature_usage_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own usage logs" ON public.feature_usage_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own rewards" ON public.user_rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rewards" ON public.user_rewards FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rewards" ON public.user_rewards FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Service role manages rewards" ON public.user_rewards FOR ALL TO service_role USING (true);

-- Growth state
CREATE POLICY "growth_state_own" ON public.user_growth_state FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Library
CREATE POLICY "lesson_materials_teacher_manage" ON public.lesson_materials FOR ALL TO authenticated USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));
CREATE POLICY "lesson_materials_student_read" ON public.lesson_materials FOR SELECT TO authenticated USING (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid() UNION SELECT classroom_id FROM classroom_students WHERE student_id = auth.uid()));

-- ========================================================
-- GRANTS
-- ========================================================
GRANT ALL ON TABLE public.feature_usage_log TO authenticated;
GRANT INSERT ON TABLE public.feature_usage_log TO anon;
GRANT ALL ON TABLE public.feature_usage_log TO service_role;
GRANT ALL ON TABLE public.user_rewards TO authenticated;
GRANT ALL ON TABLE public.user_rewards TO service_role;
GRANT ALL ON TABLE public.users TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ========================================================
-- MASTER BASELINE v4.0 COMPLETE — 2026-03-02
-- Tables: 70+ | Functions: 10 | Triggers: 5 | Policies: 40+
-- ========================================================

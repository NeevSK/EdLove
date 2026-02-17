-- ========================================================
-- GURUDEVI MASTER BASELINE SCHEMA (v2.0 - COMPLETE)
-- Last Updated: 2026-02-17
-- ========================================================
-- This file consolidates ALL production tables for Gurudevi
-- Use for database resets, migrations, or schema reference
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

-- Helper function for school context (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------------
-- 1. FOUNDATION (Schools, Users, Hierarchy)
-- --------------------------------------------------------  

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('1AB', '1C', 'Type_2', 'Type_3', 'semi_government', 'private', 'international', 'pirivena', 'personal_workspace', 'government')),
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

-- Sections
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  grade_range TEXT,
  section_head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, name)
);

-- Grades
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  grade_number INTEGER CHECK (grade_number >= 1 AND grade_number <= 13),
  grade_head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, grade_number)
);

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  email TEXT UNIQUE,
  full_name TEXT DEFAULT 'Sanctuary User' NOT NULL,
  role TEXT CHECK (role IN ('founder', 'admin', 'principal', 'section_head', 'grade_head', 'teacher', 'student')) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false NOT NULL,
  language TEXT DEFAULT 'si' CHECK (language IN ('si', 'ta', 'en')) NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')) NOT NULL,
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

-- --------------------------------------------------------
-- 2. CLASSROOM MODULE
-- --------------------------------------------------------

-- Classrooms
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  color_theme TEXT DEFAULT 'blue',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Classroom Students (Enrollment)
CREATE TABLE IF NOT EXISTS public.classroom_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(classroom_id, student_id)
);

-- Students (Roster)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  index_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(classroom_id, index_number)
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grade INTEGER,
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- --------------------------------------------------------
-- 3. SELF SECTION (Wellbeing & Growth)
-- --------------------------------------------------------

-- Timetable
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
  period_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT,
  type TEXT CHECK (type IN ('subject', 'relief', 'interval')) DEFAULT 'subject' NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, day_of_week, period_number)
);

-- Mood Logs
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Fire Journal
CREATE TABLE IF NOT EXISTS public.fire_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_preview TEXT,
  is_burned BOOLEAN DEFAULT false,
  burned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------
-- 4. COMMUNITY MODULE
-- --------------------------------------------------------

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Community Groups
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT CHECK (group_type IN ('class', 'interest', 'staff', 'public')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Community Group Members
CREATE TABLE IF NOT EXISTS public.community_group_members (
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

-- Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  post_type TEXT CHECK (post_type IN ('post', 'poll', 'announcement')),
  title TEXT,
  content TEXT,
  metadata JSONB,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Community Reactions
CREATE TABLE IF NOT EXISTS public.community_reactions (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reaction_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- --------------------------------------------------------
-- 5. LIBRARY MODULE
-- --------------------------------------------------------

-- Library Items
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'video', 'link', 'text', 'doc')),
  resource_url TEXT NOT NULL,
  metadata JSONB,
  is_public BOOLEAN DEFAULT false,
  is_curated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Library Collections
CREATE TABLE IF NOT EXISTS public.library_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Library Collection Items
CREATE TABLE IF NOT EXISTS public.library_collection_items (
  collection_id UUID REFERENCES public.library_collections(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (collection_id,item_id)
);

-- --------------------------------------------------------
-- 6. GAMIFICATION & GROWTH
-- --------------------------------------------------------

-- Pricing Subscriptions
CREATE TABLE IF NOT EXISTS public.pricing_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User Rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gift Codes
CREATE TABLE IF NOT EXISTS public.gift_codes (
  code TEXT PRIMARY KEY,
  code_type TEXT CHECK (code_type IN ('pro_sub', 'points', 'premium_sub')),
  value INTEGER,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_by UUID REFERENCES public.users(id),
  redeemed_at TIMESTAMPTZ
);

-- --------------------------------------------------------
-- 7. SANCTUARY MANIFESTOS
-- --------------------------------------------------------

-- Sanctuary Manifestos
CREATE TABLE IF NOT EXISTS public.sanctuary_manifestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  vibe TEXT DEFAULT 'visionary',
  status TEXT DEFAULT 'active',
  target_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Manifesto Endorsements
CREATE TABLE IF NOT EXISTS public.manifesto_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manifesto_id UUID REFERENCES public.sanctuary_manifestos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  commitment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 8. INVITATIONS & ONBOARDING
-- --------------------------------------------------------

-- Invite Codes
-- Audit Log (Security & Compliance)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id),
  old_role TEXT,
  new_role TEXT,
  old_school_id UUID,
  new_school_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  invitation_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ========================================================
-- ROW LEVEL SECURITY & POLICIES
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctuary_manifestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesto_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Core Policies (Production-tested)
CREATE POLICY "Schools are viewable by authenticated users" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create schools" ON public.schools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Principals manage their own schools" ON public.schools FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can select own and school members" ON public.users FOR SELECT TO authenticated USING (id = auth.uid() OR school_id = get_auth_user_school_id());
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
-- SECURITY: Column-restricted UPDATE policy (prevents privilege escalation)
CREATE POLICY "Users can update safe profile fields" ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Ensure privileged fields remain unchanged
  role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
  school_id IS NOT DISTINCT FROM (SELECT school_id FROM public.users WHERE id = auth.uid()) AND
  section_id IS NOT DISTINCT FROM (SELECT section_id FROM public.users WHERE id = auth.uid()) AND
  grade_id IS NOT DISTINCT FROM (SELECT grade_id FROM public.users WHERE id = auth.uid()) AND
  is_pro = (SELECT is_pro FROM public.users WHERE id = auth.uid()) AND
  is_thuthimal = (SELECT is_thuthimal FROM public.users WHERE id = auth.uid()) AND
  invitations_remaining = (SELECT invitations_remaining FROM public.users WHERE id = auth.uid()) AND
  invitations_sent = (SELECT invitations_sent FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Teachers manage their classrooms" ON public.classrooms FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "students_teacher_policy" ON public.students FOR ALL TO authenticated USING (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()));
CREATE POLICY "students_principal_policy" ON public.students FOR SELECT TO authenticated USING (classroom_id IN (SELECT c.id FROM classrooms c INNER JOIN users u ON u.id = auth.uid() WHERE u.role = 'principal' AND c.school_id = u.school_id));

CREATE POLICY "Users manage own timetable" ON public.timetable FOR ALL TO authenticated USING (user_id = auth.uid());
-- Secure RLS policies with explicit WITH CHECK for inserts
CREATE POLICY "mood_logs_privacy" ON public.mood_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "journal_entries_privacy" ON public.journal_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "fire_journal_privacy" ON public.fire_journal FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "audit_log_admin_view" ON public.audit_log FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'admin')
));

-- ========================================================
-- ADMIN FUNCTIONS (SECURITY DEFINER)
-- ========================================================

-- Secure role assignment function (prevents privilege escalation)
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_id UUID,
  new_role TEXT,
  new_school_id UUID DEFAULT NULL,
  new_section_id UUID DEFAULT NULL,
  new_grade_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  old_role_val TEXT;
  old_school_val UUID;
  actor_role TEXT;
BEGIN
  -- Get actor's role
  SELECT role INTO actor_role FROM public.users WHERE id = auth.uid();
  
  -- Only founders and admins can assign roles
  IF actor_role NOT IN ('founder', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only founders and admins can assign roles';
  END IF;

  -- Validate role
  IF new_role NOT IN ('founder', 'admin', 'principal', 'section_head', 'grade_head', 'teacher', 'student') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Get old values for audit
  SELECT role, school_id INTO old_role_val, old_school_val 
  FROM public.users WHERE id = target_user_id;

  -- Update user (bypasses RLS with SECURITY DEFINER)
  UPDATE public.users
  SET 
    role = new_role,
    school_id = COALESCE(new_school_id, school_id),
    section_id = new_section_id,
    grade_id = new_grade_id,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the assignment for audit trail
  INSERT INTO audit_log (
    action, actor_id, target_user_id, 
    old_role, new_role,
    old_school_id, new_school_id,
    created_at
  )
  VALUES (
    'role_assignment', 
    auth.uid(), 
    target_user_id, 
    old_role_val, 
    new_role,
    old_school_val,
    new_school_id,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION assign_user_role TO authenticated;

-- ========================================================
-- MASTER BASELINE COMPLETE (v2.0)
-- All production tables included
-- Updated: 2026-02-17
-- ========================================================

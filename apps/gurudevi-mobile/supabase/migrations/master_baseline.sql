-- ========================================================
-- GURUDEVI MASTER BASELINE SCHEMA (v3.1 - MEGA CONSOLIDATION)
-- Last Updated: 2026-02-28
-- ========================================================
-- This file consolidates ALL production tables for Gurudevi.
-- It merges the original Baseline (v2.0) with the Resonant Extensions (v3.0).
-- All ID generation modernized to gen_random_uuid().
-- ========================================================

-- --------------------------------------------------------
-- 0. EXTENSIONS & SETUP  
-- --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function for school context
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------------
-- 1. FOUNDATION (Schools, Users, Hierarchy)
-- --------------------------------------------------------  

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Grades
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  grade_number INTEGER CHECK (grade_number >= 1 AND grade_number <= 13),
  grade_head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, grade_number)
);

-- Users (Enhanced Profile & Orientation Seeds)
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
  last_seen_at TIMESTAMPTZ,
  profile_completed BOOLEAN DEFAULT false,
  bio TEXT,
  role_label TEXT,
  experience_years INTEGER,
  subjects_taught TEXT[],
  qualifications TEXT[],
  orientation_seeds JSONB DEFAULT NULL
);

-- --------------------------------------------------------
-- 2. CLASSROOM MODULE (Temporal Era)
-- --------------------------------------------------------

-- Classrooms
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
  academic_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Classroom Students (Enrollment)
CREATE TABLE IF NOT EXISTS public.classroom_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(classroom_id, student_id)
);

-- Students (Roster)
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

-- Classroom Notes (Resonant Feature)
CREATE TABLE IF NOT EXISTS public.classroom_notes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id  UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    author_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    note_type     TEXT NOT NULL DEFAULT 'note' CHECK (note_type IN ('note', 'announcement', 'lesson_recap', 'reminder', 'personal')),
    visibility    TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'class')),
    is_pinned     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grade INTEGER,
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- --------------------------------------------------------
-- 3. SELF SECTION (Wellbeing & Temporal)
-- --------------------------------------------------------

-- Timetable
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
  period_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT,
  type TEXT CHECK (type IN ('subject', 'relief', 'interval')) DEFAULT 'subject' NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  academic_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, day_of_week, period_number, academic_year)
);

-- Mood Logs (Evolved)
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
  mood TEXT, 
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Fire Journal
CREATE TABLE IF NOT EXISTS public.fire_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_preview TEXT,
  is_burned BOOLEAN DEFAULT false,
  burned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Student Academic Records (Historical Tracking)
CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    classroom_id    UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE SET NULL,
    teacher_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    school_id       UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year   TEXT NOT NULL,
    grade_number    INTEGER,
    subject         TEXT,
    avg_grade       NUMERIC(5,2),
    highest_grade   NUMERIC(5,2),
    lowest_grade    NUMERIC(5,2),
    assignments_total     INTEGER DEFAULT 0,
    assignments_submitted INTEGER DEFAULT 0,
    teacher_note    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, classroom_id, academic_year)
);

-- --------------------------------------------------------
-- 4. COMMUNITY MODULE
-- --------------------------------------------------------

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Community Groups
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Group Messages (Resonant Feature)
CREATE TABLE IF NOT EXISTS public.group_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id     UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
    author_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 5. LIBRARY MODULE
-- --------------------------------------------------------

-- Library Items
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- 6. GAMIFICATION & ECONOMY
-- --------------------------------------------------------

-- Pricing Subscriptions
CREATE TABLE IF NOT EXISTS public.pricing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Feature Usage Log
CREATE TABLE IF NOT EXISTS public.feature_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  interaction_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_user_feature ON public.feature_usage_log(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_usage_date ON public.feature_usage_log(created_at);

-- User Rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gift Codes (Legacy)
CREATE TABLE IF NOT EXISTS public.gift_codes (
  code TEXT PRIMARY KEY,
  code_type TEXT CHECK (code_type IN ('pro_sub', 'points', 'premium_sub')),
  value INTEGER,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_by UUID REFERENCES public.users(id),
  redeemed_at TIMESTAMPTZ
);

-- Thuthimal Gifts (New Gratitude Economy)
CREATE TABLE IF NOT EXISTS public.thuthimal_gifts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_token     UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  gifter_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gifter_name    TEXT NOT NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('teacher', 'principal')),
  recipient_id   UUID REFERENCES users(id),
  claimed        BOOLEAN NOT NULL DEFAULT false,
  claimed_at     TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------
-- 7. SANCTUARY MANIFESTOS
-- --------------------------------------------------------

-- Sanctuary Manifestos
CREATE TABLE IF NOT EXISTS public.sanctuary_manifestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifesto_id UUID REFERENCES public.sanctuary_manifestos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  commitment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 8. INFRASTRUCTURE (Audit, Invites, Preferences)
-- --------------------------------------------------------

-- Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Invite Codes
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  marketing_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  privacy_level TEXT DEFAULT 'public',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications (Evolved)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  body TEXT, 
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Principal Notes (Governance Log)
CREATE TABLE IF NOT EXISTS public.principal_notes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id           UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    author_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    note_type           TEXT NOT NULL DEFAULT 'note' CHECK (note_type IN ('todo', 'observation', 'decision', 'reminder', 'note')),
    is_pinned           BOOLEAN NOT NULL DEFAULT FALSE,
    is_done             BOOLEAN NOT NULL DEFAULT FALSE,
    context_teacher_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    context_classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 9. CORE LOGIC (Self-Healing Functions)
-- --------------------------------------------------------

-- Helper to get school id
CREATE OR REPLACE FUNCTION get_auth_user_school_id() RETURNS uuid AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp;

-- New User lifecycle
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Sanctuary User'), 'teacher')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END; $$;

-- Thuthimal Claim
CREATE OR REPLACE FUNCTION claim_thuthimal_gift(p_token UUID, p_recipient UUID) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_gift thuthimal_gifts;
BEGIN
  SELECT * INTO v_gift FROM thuthimal_gifts WHERE gift_token = p_token AND claimed = false AND (expires_at IS NULL OR expires_at > now()) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'already_claimed_or_invalid'); END IF;
  UPDATE thuthimal_gifts SET claimed = true, claimed_at = now(), recipient_id = p_recipient WHERE id = v_gift.id;
  UPDATE users SET is_pro = true, is_thuthimal = true, thuthimal_gifter = v_gift.gifter_name, thuthimal_gifted_at = now() WHERE id = p_recipient;
  RETURN jsonb_build_object('success', true, 'gifter_name', v_gift.gifter_name);
END; $$;

-- Daily Content delivery
CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type text) RETURNS SETOF daily_content
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT * FROM daily_content WHERE type = content_type AND active = true AND date <= CURRENT_DATE ORDER BY date DESC LIMIT 1;
$$;

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
ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctuary_manifestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesto_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;

-- 1. Foundation & Users
CREATE POLICY "Schools are viewable by authenticated users" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create schools" ON public.schools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Principals manage their own schools" ON public.schools FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can select own and school members" ON public.users FOR SELECT TO authenticated USING (id = auth.uid() OR school_id = get_auth_user_school_id());
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update safe profile fields" ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  (role = (SELECT role FROM public.users WHERE id = auth.uid()) OR (SELECT role FROM public.users WHERE id = auth.uid()) IS NULL) AND
  (school_id IS NOT DISTINCT FROM (SELECT school_id FROM public.users WHERE id = auth.uid()) OR (SELECT school_id FROM public.users WHERE id = auth.uid()) IS NULL) AND
  is_pro = (SELECT is_pro FROM public.users WHERE id = auth.uid())
);

-- 2. Classroom & Student
CREATE POLICY "Teachers manage their classrooms" ON public.classrooms FOR ALL TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "students_teacher_policy" ON public.students FOR ALL TO authenticated USING (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())) WITH CHECK (classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid()));
CREATE POLICY "students_principal_policy" ON public.students FOR SELECT TO authenticated USING (classroom_id IN (SELECT c.id FROM classrooms c INNER JOIN users u ON u.id = auth.uid() WHERE u.role = 'principal' AND c.school_id = u.school_id));

CREATE POLICY "classroom_notes_own_read" ON public.classroom_notes FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "classroom_notes_class_read" ON public.classroom_notes FOR SELECT USING (visibility = 'class' AND (EXISTS (SELECT 1 FROM classrooms c WHERE c.id = classroom_notes.classroom_id AND c.teacher_id = auth.uid()) OR EXISTS (SELECT 1 FROM classroom_students cs WHERE cs.classroom_id = classroom_notes.classroom_id AND cs.student_id = auth.uid())));
CREATE POLICY "classroom_notes_insert" ON public.classroom_notes FOR INSERT WITH CHECK (author_id = auth.uid());

-- 3. Wellbeing & Temporal
CREATE POLICY "Users manage own timetable" ON public.timetable FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "mood_logs_privacy" ON public.mood_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "journal_entries_privacy" ON public.journal_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "fire_journal_privacy" ON public.fire_journal FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "sar_student_read_own" ON public.student_academic_records FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "sar_staff_read_school" ON public.student_academic_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.school_id = student_academic_records.school_id AND u.role IN ('teacher', 'principal', 'admin')));

-- 4. Community & Messaging
CREATE POLICY "group_messages_member_read" ON public.group_messages FOR SELECT USING (EXISTS (SELECT 1 FROM community_group_members m WHERE m.group_id = group_messages.group_id AND m.user_id = auth.uid() AND m.status = 'active'));
CREATE POLICY "group_messages_member_insert" ON public.group_messages FOR INSERT WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM community_group_members m WHERE m.group_id = group_messages.group_id AND m.user_id = auth.uid() AND m.status = 'active'));
CREATE POLICY "notifications_privacy" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Infrastructure & Economy
CREATE POLICY "thuthimal_gifter_reads_own" ON public.thuthimal_gifts FOR SELECT USING (gifter_id = auth.uid());
CREATE POLICY "principal_notes_privacy" ON public.principal_notes FOR ALL TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "audit_log_admin_view" ON public.audit_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'admin')));

-- ========================================================
-- RECORD & ECONOMY POLICIES
-- ========================================================
CREATE POLICY "Users can insert own usage logs" ON public.feature_usage_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own usage logs" ON public.feature_usage_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own rewards" ON public.user_rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rewards" ON public.user_rewards FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rewards" ON public.user_rewards FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Service role manages rewards" ON public.user_rewards FOR ALL TO service_role USING (true);


-- ========================================================
-- GRANTS & PERMISSIONS (For specific tables where required)
-- ========================================================
GRANT ALL ON TABLE public.feature_usage_log TO authenticated;
GRANT ALL ON TABLE public.feature_usage_log TO anon;
GRANT ALL ON TABLE public.feature_usage_log TO service_role;

GRANT ALL ON TABLE public.user_rewards TO authenticated;
GRANT ALL ON TABLE public.user_rewards TO anon;
GRANT ALL ON TABLE public.user_rewards TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ========================================================
-- MASTER BASELINE v3.1 COMPLETE (v2.0 + RESONANCE + PERMISSIONS FIX)
-- ========================================================

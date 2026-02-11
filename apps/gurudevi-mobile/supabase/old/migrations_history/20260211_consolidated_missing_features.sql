-- ============================================
-- CONSOLIDATED MISSING MIGRATIONS
-- Date: 2026-02-11
-- Purpose: Apply all missing migrations identified from audit
-- ============================================
-- This combines:
-- - 20260206_add_lesson_materials.sql
-- - 20260206_progressive_features.sql
-- - 20260207_shadow_enrollment.sql
-- - 20260208_add_daily_content.sql
-- - 20260208_add_onboarding_fields.sql
-- - 20260208_add_thuthimal_fields.sql
-- - 20260208_create_classroom_photos.sql
-- - 20260208_enhance_invitations.sql (FIXED: invite_codes table)
-- ============================================

-- ============================================
-- PART 1: LESSON MATERIALS
-- ============================================

CREATE TABLE IF NOT EXISTS public.lesson_materials (
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

CREATE INDEX IF NOT EXISTS idx_lesson_materials_class ON public.lesson_materials(classroom_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON public.lesson_materials(lesson_id);

ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage lesson materials"
  ON public.lesson_materials FOR ALL TO authenticated
  USING (
    classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Users view lesson materials"
  ON public.lesson_materials FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()
      UNION
      SELECT classroom_id FROM public.classroom_students WHERE student_id = auth.uid()
    )
  );

-- Add columns to existing tables
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON public.assignments(lesson_id);

COMMENT ON TABLE public.lesson_materials IS 'Academic materials (PDF, Link, Note) grouped under Monthly Lessons';

-- ============================================
-- PART 2: CLASSROOM PHOTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.classroom_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  shared_with_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classroom_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY teacher_photos_crud ON public.classroom_photos
  FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY principal_read_shared_photos ON public.classroom_photos
  FOR SELECT
  USING (
    shared_with_principal = true 
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() 
      AND u.role IN ('principal', 'section_head', 'grade_head')
      AND u.school_id = (
        SELECT school_id FROM public.users WHERE id = classroom_photos.teacher_id
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_photos_teacher ON public.classroom_photos(teacher_id);
CREATE INDEX IF NOT EXISTS idx_photos_classroom ON public.classroom_photos(classroom_id);
CREATE INDEX IF NOT EXISTS idx_photos_shared ON public.classroom_photos(shared_with_principal) WHERE shared_with_principal = true;
CREATE INDEX IF NOT EXISTS idx_photos_created ON public.classroom_photos(created_at DESC);

CREATE OR REPLACE FUNCTION update_classroom_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER classroom_photos_updated_at
  BEFORE UPDATE ON public.classroom_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_classroom_photos_updated_at();

COMMENT ON TABLE public.classroom_photos IS 'Photos uploaded by teachers with optional principal sharing';

-- ============================================
-- PART 3: DAILY CONTENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.daily_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('motivation', 'did_you_know')),
  content TEXT NOT NULL,
  author TEXT,
  date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_content_date_type ON public.daily_content(date, type, active);

ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active daily content"
  ON public.daily_content FOR SELECT
  USING (active = true);

-- Sample motivational content
INSERT INTO daily_content (type, content, author, date) VALUES
  ('motivation', 'Teaching is not about filling a bucket, but lighting a fire.', 'William Butler Yeats', CURRENT_DATE),
  ('motivation', 'The art of teaching is the art of assisting discovery.', 'Mark Van Doren', CURRENT_DATE + 1),
  ('motivation', 'To teach is to touch a life forever.', 'Anonymous', CURRENT_DATE + 2),
  ('motivation', 'Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela', CURRENT_DATE + 3),
  ('motivation', 'One child, one teacher, one book, one pen can change the world.', 'Malala Yousafzai', CURRENT_DATE + 4);

-- Sample educational facts
INSERT INTO daily_content (type, content, date) VALUES
  ('did_you_know', 'The Socratic Method, still used today in teaching critical thinking, was developed over 2,400 years ago by the Greek philosopher Socrates.', CURRENT_DATE),
  ('did_you_know', 'Ancient Sri Lankan education system included Pirivenas (Buddhist monastic schools) dating back over 2,000 years, teaching philosophy, medicine, and astronomy.', CURRENT_DATE + 1),
  ('did_you_know', 'Studies show that students remember only 10% of what they read, but 90% of what they teach to others.', CURRENT_DATE + 2),
  ('did_you_know', 'Research shows that handwriting notes improves memory and learning better than typing.', CURRENT_DATE + 3),
  ('did_you_know', 'The practice of raising hands to ask questions originated in ancient Rome as a gesture of respect.', CURRENT_DATE + 4);

CREATE OR REPLACE FUNCTION get_daily_content_for_today(content_type TEXT DEFAULT NULL)
RETURNS SETOF daily_content
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM daily_content
  WHERE active = true
    AND date <= CURRENT_DATE
    AND (content_type IS NULL OR type = content_type)
  ORDER BY date DESC
  LIMIT 1;
$$;

COMMENT ON TABLE public.daily_content IS 'Daily motivational quotes and educational facts';

-- ============================================
-- PART 4: SHADOW ENROLLMENT
-- ============================================

ALTER TABLE public.classroom_students 
  ALTER COLUMN student_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE DEFAULT substring(uuid_generate_v4()::text, 1, 8),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.classroom_students.full_name IS 'Student name for shadow profiles before account link';
COMMENT ON COLUMN public.classroom_students.invite_code IS 'Unique code for student to claim shadow enrollment';

CREATE POLICY "Users can claim shadow enrollment" ON public.classroom_students
  FOR UPDATE TO authenticated
  USING (student_id IS NULL)
  WITH CHECK (student_id = auth.uid());

ALTER TABLE public.classroom_students DROP CONSTRAINT IF EXISTS classroom_students_classroom_id_student_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_enrollment 
  ON public.classroom_students (classroom_id, student_id) 
  WHERE student_id IS NOT NULL;

-- ============================================
-- PART 5: ONBOARDING FIELDS
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(onboarding_completed);

COMMENT ON COLUMN public.users.onboarding_completed IS 'Flag indicating if user completed onboarding flow';

-- ============================================
-- PART 6: THUTHIMAL (GRATITUDE ECONOMY) FIELDS
-- ============================================

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_thuthimal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS thuthimal_gifter TEXT,
  ADD COLUMN IF NOT EXISTS thuthimal_gifted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_thuthimal ON public.users(is_thuthimal, is_pro) WHERE is_thuthimal = true;

COMMENT ON COLUMN public.users.is_pro IS 'Whether user has Pro subscription (paid or gifted)';
COMMENT ON COLUMN public.users.is_thuthimal IS 'Whether Pro subscription is a Thuthimal (තුතිමල්) gift';
COMMENT ON COLUMN public.users.thuthimal_gifter IS 'Name of person/organization who gifted subscription';

UPDATE public.users SET is_pro = false WHERE is_pro IS NULL;

-- ============================================
-- PART 7: ENHANCED INVITATIONS (FIXED)
-- ============================================

-- FIXED: Changed from "invitations" to "invite_codes" table
ALTER TABLE public.invite_codes
  ADD COLUMN IF NOT EXISTS invitation_text TEXT,
  ADD COLUMN IF NOT EXISTS max_uses_enhanced INTEGER,
  ADD COLUMN IF NOT EXISTS uses_count_enhanced INTEGER DEFAULT 0;

-- Add invitation tracking to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS invitations_remaining INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS invitations_sent INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_invite_codes_uses ON public.invite_codes(uses_count_enhanced, max_uses_enhanced);
CREATE INDEX IF NOT EXISTS idx_users_invitations ON public.users(invitations_remaining);

COMMENT ON COLUMN public.invite_codes.invitation_text IS 'Auto-generated contextual text (e.g., "Join Royal College")';
COMMENT ON COLUMN public.users.invitations_remaining IS 'Number of invitations user can still send';

-- ============================================
-- PART 8: PROGRESSIVE FEATURES (TEACHER WELLBEING)
-- ============================================

-- Joy Moments
CREATE TABLE IF NOT EXISTS public.joy_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT,
  moment_description TEXT NOT NULL,
  category TEXT DEFAULT 'breakthrough',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_joy_moments_user ON public.joy_moments(user_id);
ALTER TABLE public.joy_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY joy_moments_privacy ON public.joy_moments FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Gratitude Glimmers
CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gratitude_user ON public.gratitude_entries(user_id);
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY gratitude_privacy ON public.gratitude_entries FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Wisdom Seeds
CREATE TABLE IF NOT EXISTS public.wisdom_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wisdom_user ON public.wisdom_notes(user_id);
ALTER TABLE public.wisdom_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY wisdom_privacy ON public.wisdom_notes FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Daily Prep Items
CREATE TABLE IF NOT EXISTS public.daily_prep_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_text TEXT NOT NULL,
  prep_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prep_user_date ON public.daily_prep_items(user_id, prep_date);
ALTER TABLE public.daily_prep_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY prep_items_privacy ON public.daily_prep_items FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
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

CREATE INDEX IF NOT EXISTS idx_preferences_user ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY preferences_privacy ON public.user_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Feature Usage Log
CREATE TABLE IF NOT EXISTS public.feature_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  interaction_type TEXT DEFAULT 'view',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_user_feature ON public.feature_usage_log(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_usage_date ON public.feature_usage_log(created_at);
ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_log_privacy ON public.feature_usage_log FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Energy Forecasts
CREATE TABLE IF NOT EXISTS public.energy_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5) NOT NULL,
  notes TEXT,
  forecast_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_energy_user_date ON public.energy_forecasts(user_id, forecast_date);
ALTER TABLE public.energy_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY energy_privacy ON public.energy_forecasts FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Contextual Moments
CREATE TABLE IF NOT EXISTS public.contextual_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  moment_type TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  prompt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contextual_user ON public.contextual_moments(user_id);
ALTER TABLE public.contextual_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY contextual_privacy ON public.contextual_moments FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Auto-create user preferences trigger
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

-- ============================================
-- CONSOLIDATION COMPLETE
-- ============================================
-- This migration adds:
-- - lesson_materials table + columns
-- - classroom_photos table
-- - daily_content table with sample data
-- - Shadow enrollment (classroom_students modifications)
-- - Onboarding fields (users table)
-- - Thuthimal fields (users table)
-- - Enhanced invitations (invite_codes + users columns) - FIXED
-- - 8 progressive feature tables (joy_moments, gratitude_entries, wisdom_notes, etc.)
-- ============================================

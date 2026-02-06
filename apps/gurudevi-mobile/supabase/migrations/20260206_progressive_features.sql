-- ============================================
-- PROGRESSIVE ARCHITECTURE & TEACHER FEATURES
-- Phase 1: Core Teacher Wellbeing Features
-- ============================================

-- 1. Student Joy Jar - Capture breakthrough moments
CREATE TABLE IF NOT EXISTS public.joy_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT, -- Optional, can be anonymous
  moment_description TEXT NOT NULL,
  category TEXT DEFAULT 'breakthrough', -- breakthrough, question, connection, other
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_joy_moments_user ON public.joy_moments(user_id);
ALTER TABLE public.joy_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY joy_moments_privacy
  ON public.joy_moments FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 2. Gratitude Glimmers - Daily micro-moments
CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'student-said', 'colleague-kindness', 'personal-win'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gratitude_user ON public.gratitude_entries(user_id);
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY gratitude_privacy
  ON public.gratitude_entries FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 3. Wisdom Seeds - Personal pedagogy insights
CREATE TABLE IF NOT EXISTS public.wisdom_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  insight TEXT NOT NULL,
  tags TEXT[], -- Optional categorization
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wisdom_user ON public.wisdom_notes(user_id);
ALTER TABLE public.wisdom_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY wisdom_privacy
  ON public.wisdom_notes FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 4. Daily Prep Items - Tomorrow's gentle preparation
CREATE TABLE IF NOT EXISTS public.daily_prep_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_text TEXT NOT NULL,
  prep_date DATE NOT NULL, -- The day this prep is for
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prep_user_date ON public.daily_prep_items(user_id, prep_date);
ALTER TABLE public.daily_prep_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY prep_items_privacy
  ON public.daily_prep_items FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 5. User Preferences - Feature personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Feature visibility preferences
  favorite_features TEXT[] DEFAULT ARRAY['mood', 'fire', 'rhythm'], -- Home row features
  hidden_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timing preferences
  morning_check_time TIME DEFAULT '08:00:00', -- When morning prompts appear
  afternoon_check_time TIME DEFAULT '14:47:00', -- The 2:47pm wall
  evening_wind_down_time TIME DEFAULT '17:00:00', -- Wind-down ritual time
  
  -- Notification preferences
  enable_contextual_prompts BOOLEAN DEFAULT true,
  enable_usage_tracking BOOLEAN DEFAULT false, -- Opt-in analytics
  
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_preferences_user ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY preferences_privacy
  ON public.user_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 6. Feature Usage Tracking (Opt-in, Privacy-first)
CREATE TABLE IF NOT EXISTS public.feature_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  interaction_type TEXT DEFAULT 'view', -- view, interact, complete
  duration_seconds INTEGER, -- Optional: how long they engaged
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_user_feature ON public.feature_usage_log(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_usage_date ON public.feature_usage_log(created_at);
ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_log_privacy
  ON public.feature_usage_log FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 7. Energy Forecast - Morning capacity check
CREATE TABLE IF NOT EXISTS public.energy_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5) NOT NULL, -- 1=depleted, 5=energized
  notes TEXT,
  forecast_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, forecast_date) -- One forecast per day
);

CREATE INDEX IF NOT EXISTS idx_energy_user_date ON public.energy_forecasts(user_id, forecast_date);
ALTER TABLE public.energy_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY energy_privacy
  ON public.energy_forecasts FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 8. Contextual Moments - Track key timing events
CREATE TABLE IF NOT EXISTS public.contextual_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  moment_type TEXT NOT NULL, -- 'afternoon_wall', 'parking_lot_exhale', 'sunday_prep', 'morning_energy'
  acknowledged BOOLEAN DEFAULT false,
  prompt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contextual_user ON public.contextual_moments(user_id);
ALTER TABLE public.contextual_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY contextual_privacy
  ON public.contextual_moments FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Function to auto-create user preferences on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences for new users
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON public.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

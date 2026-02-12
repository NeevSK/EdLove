-- ============================================
-- GURUDEVI EXPANSION SCHEMA (v0.2)
-- Covers: Library, Community Groups, Gamification
-- Dependencies: features_schema.sql
-- ============================================

-- --------------------------------------------
-- 1. LIBRARY
-- --------------------------------------------

-- 1.1 Library Items (Resources)
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, -- Nullable for public/global items
  uploader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'video', 'link', 'text', 'doc')),
  resource_url TEXT NOT NULL,
  metadata JSONB, -- { duration, page_count, thumbnail_url }
  
  is_public BOOLEAN DEFAULT false, -- Visible to ALL schools
  is_curated BOOLEAN DEFAULT false, -- "Official" content
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_library_school ON public.library_items(school_id);
CREATE INDEX IF NOT EXISTS idx_library_public ON public.library_items(is_public);

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- RLS: Read Access
CREATE POLICY library_read_access
  ON public.library_items FOR SELECT TO authenticated
  USING (
    is_public = true 
    OR 
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- RLS: Write Access (Teachers & Principals only)
CREATE POLICY library_write_access
  ON public.library_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('teacher', 'principal')
    )
  );

-- 1.2 Teacher's Personal Desk (Collections)
CREATE TABLE IF NOT EXISTS public.library_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.library_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY collections_privacy
  ON public.library_collections FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 1.3 Collection Items (Join Table)
CREATE TABLE IF NOT EXISTS public.library_collection_items (
  collection_id UUID REFERENCES public.library_collections(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (collection_id, item_id)
);

ALTER TABLE public.library_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY collection_items_access
  ON public.library_collection_items FOR ALL TO authenticated
  USING (
    collection_id IN (SELECT id FROM public.library_collections WHERE user_id = auth.uid())
  );

-- --------------------------------------------
-- 2. COMMUNITY GROUPS
-- --------------------------------------------

-- 2.1 Groups
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT CHECK (group_type IN ('class', 'interest', 'staff', 'public')),
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

-- RLS: Read Groups (School members)
CREATE POLICY groups_view_school
  ON public.community_groups FOR SELECT TO authenticated
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- 2.2 Group Members
CREATE TABLE IF NOT EXISTS public.community_group_members (
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY group_members_view
  ON public.community_group_members FOR SELECT TO authenticated
  USING (
     group_id IN (SELECT id FROM public.community_groups WHERE school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid()))
  );

-- --------------------------------------------
-- 3. COMMUNITY POSTS (GROUPS & FEED)
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE, -- Null for school-wide? Or use Announcements for that.
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  post_type TEXT CHECK (post_type IN ('post', 'poll', 'announcement')),
  title TEXT,
  content TEXT,
  metadata JSONB, -- For Poll options: { options: ["A", "B"] }
  
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- RLS: View Posts (Must be in school AND (if group post, must be member? Optional for "Open" groups))
-- For simplicity v0.1: If you are in the school, you can see posts. Group isolation can be added later if "Secret Groups" are needed.
CREATE POLICY posts_view_school
  ON public.community_posts FOR SELECT TO authenticated
  USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- 3.1 Reactions
CREATE TABLE IF NOT EXISTS public.community_reactions (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reaction_code TEXT NOT NULL, -- e.g. 'heart', 'lotus'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY reactions_all
  ON public.community_reactions FOR ALL TO authenticated
  USING (
    post_id IN (SELECT id FROM public.community_posts WHERE school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid()))
  );

-- --------------------------------------------
-- 4. GAMIFICATION & GROWTH
-- --------------------------------------------

-- 4.1 Subscription Tiers
CREATE TABLE IF NOT EXISTS public.pricing_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.pricing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sub_view_own
  ON public.pricing_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4.2 Rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY rewards_view_own
  ON public.user_rewards FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4.3 Gift Codes
CREATE TABLE IF NOT EXISTS public.gift_codes (
  code TEXT PRIMARY KEY,
  code_type TEXT CHECK (code_type IN ('pro_sub', 'points', 'premium_sub')),
  value INTEGER, -- e.g. 100 points, or 30 days
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_by UUID REFERENCES public.users(id),
  redeemed_at TIMESTAMPTZ
);

ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- RLS: Only redeem if unredeemed (handled via RPC usually, but strict RLS here)
CREATE POLICY gift_code_read
  ON public.gift_codes FOR SELECT TO authenticated
  USING (is_redeemed = false); -- Don't show redeemed codes

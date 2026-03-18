-- =============================================================================
-- Migration: 20260318000002_community_full_stack.sql
--
-- Purpose: Wire up every community feature that was missing RLS policies,
-- add helper RPCs for counter maintenance, and ensure delete + write policies
-- are in place for: comments, comment upvotes, resonance reactions,
-- notifications, and post management.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. community_comments — full CRUD RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure the table has RLS enabled (idempotent)
ALTER TABLE IF EXISTS public.community_comments ENABLE ROW LEVEL SECURITY;

-- Read: school members may read comments on posts within their school
DROP POLICY IF EXISTS "comments_select_school" ON public.community_comments;
CREATE POLICY "comments_select_school" ON public.community_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.users u ON u.id = auth.uid()
            WHERE cp.id = community_comments.post_id
              AND (
                  cp.school_id = u.school_id
                  OR cp.school_id IS NULL          -- global posts
              )
        )
    );

-- Insert: authenticated school members
DROP POLICY IF EXISTS "comments_insert_own" ON public.community_comments;
CREATE POLICY "comments_insert_own" ON public.community_comments
    FOR INSERT WITH CHECK (
        author_id = (SELECT id FROM public.users WHERE id = auth.uid() LIMIT 1)
    );

-- Update: only the author (e.g. to support future edits)
DROP POLICY IF EXISTS "comments_update_own" ON public.community_comments;
CREATE POLICY "comments_update_own" ON public.community_comments
    FOR UPDATE USING (author_id = auth.uid());

-- Delete: author can delete own comment; post author can also delete on their post
DROP POLICY IF EXISTS "comments_delete_own_or_post_author" ON public.community_comments;
CREATE POLICY "comments_delete_own_or_post_author" ON public.community_comments
    FOR DELETE USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.community_posts cp
            WHERE cp.id = community_comments.post_id
              AND cp.author_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. community_comment_upvotes — toggle table
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the upvotes table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.community_comment_upvotes (
    comment_id  uuid NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES public.users(id)             ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE IF EXISTS public.community_comment_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_upvotes_select" ON public.community_comment_upvotes;
CREATE POLICY "comment_upvotes_select" ON public.community_comment_upvotes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "comment_upvotes_insert" ON public.community_comment_upvotes;
CREATE POLICY "comment_upvotes_insert" ON public.community_comment_upvotes
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "comment_upvotes_delete" ON public.community_comment_upvotes;
CREATE POLICY "comment_upvotes_delete" ON public.community_comment_upvotes
    FOR DELETE USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. community_comments — upvote_count column (denormalised counter)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.community_comments
    ADD COLUMN IF NOT EXISTS upvote_count integer NOT NULL DEFAULT 0;

-- RPCs to keep the counter in sync (called fire-and-forget from the API layer)
CREATE OR REPLACE FUNCTION public.increment_comment_upvote(p_comment_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.community_comments
    SET upvote_count = upvote_count + 1
    WHERE id = p_comment_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_comment_upvote(p_comment_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.community_comments
    SET upvote_count = GREATEST(upvote_count - 1, 0)
    WHERE id = p_comment_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. community_posts — comment_count column + RPC
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.community_posts
    ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_comment_count(p_post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE public.community_posts
    SET comment_count = comment_count + 1
    WHERE id = p_post_id;
$$;

-- Keep comment_count in sync automatically via trigger
CREATE OR REPLACE FUNCTION public.trg_comments_update_post_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_comments_update_post_count ON public.community_comments;
CREATE TRIGGER trg_comments_update_post_count
    AFTER INSERT OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.trg_comments_update_post_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. community_reactions — ensure ✨ resonance is supported
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the reactions table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.community_reactions (
    post_id       uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id       uuid NOT NULL REFERENCES public.users(id)           ON DELETE CASCADE,
    reaction_code text NOT NULL DEFAULT '❤️',
    created_at    timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id, reaction_code)
);

ALTER TABLE IF EXISTS public.community_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select" ON public.community_reactions;
CREATE POLICY "reactions_select" ON public.community_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON public.community_reactions;
CREATE POLICY "reactions_insert" ON public.community_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reactions_delete" ON public.community_reactions;
CREATE POLICY "reactions_delete" ON public.community_reactions
    FOR DELETE USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. community_posts — DELETE policy (author can delete own post)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "posts_delete_own" ON public.community_posts;
CREATE POLICY "posts_delete_own" ON public.community_posts
    FOR DELETE USING (author_id = auth.uid());

-- UPDATE policy (author edits own post)
DROP POLICY IF EXISTS "posts_update_own" ON public.community_posts;
CREATE POLICY "posts_update_own" ON public.community_posts
    FOR UPDATE USING (author_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. notifications — SELECT + UPDATE (mark read) for own user
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the notifications table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.notifications (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type        text        NOT NULL,
    title       text,
    body        text,
    data        jsonb,
    is_read     boolean     NOT NULL DEFAULT false,
    read_at     timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Backend (service_role) inserts notifications — no INSERT policy for anon/user needed
-- But we grant SELECT on the realtime subscription:
ALTER publication IF EXISTS supabase_realtime ADD TABLE public.notifications;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Indexes for performance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id  ON public.community_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post_id ON public.community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread   ON public.notifications(user_id, is_read, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMUNITY FULL FEATURE ENABLEMENT
-- Fixes missing RLS policies for comments & notifications, adds resonance
-- reaction tracking, adds DELETE policy for own posts.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. community_comments RLS policies ───────────────────────────────────────
-- Table already exists; RLS is enabled; policies were missing.

-- Anyone in the same school can read comments (posts table carries school_id)
CREATE POLICY "community_comments_select" ON public.community_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.users u ON u.school_id = cp.school_id
            WHERE cp.id = community_comments.post_id
              AND u.id = auth.uid()
        )
    );

-- Authenticated school members may insert their own comments
CREATE POLICY "community_comments_insert" ON public.community_comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.community_posts cp
            JOIN public.users u ON u.school_id = cp.school_id
            WHERE cp.id = community_comments.post_id
              AND u.id = auth.uid()
        )
    );

-- Authors may delete their own comments
CREATE POLICY "community_comments_delete_own" ON public.community_comments
    FOR DELETE USING (author_id = auth.uid());

-- Authors may update (edit) their own comments
CREATE POLICY "community_comments_update_own" ON public.community_comments
    FOR UPDATE USING (author_id = auth.uid());

-- ── 2. community_comments: add is_anonymous + upvote columns ─────────────────

ALTER TABLE public.community_comments
    ADD COLUMN IF NOT EXISTS is_anonymous   BOOLEAN        NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_official_answer BOOLEAN   NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS upvote_count   INTEGER        NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ    DEFAULT now();

-- Upvotes stored in a join table (prevents double-upvote)
CREATE TABLE IF NOT EXISTS public.community_comment_upvotes (
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE NOT NULL,
    user_id    UUID REFERENCES public.users(id)              ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE public.community_comment_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_upvotes_select" ON public.community_comment_upvotes
    FOR SELECT USING (true);

CREATE POLICY "comment_upvotes_insert" ON public.community_comment_upvotes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "comment_upvotes_delete_own" ON public.community_comment_upvotes
    FOR DELETE USING (user_id = auth.uid());

-- ── 3. community_posts: DELETE own + UPDATE own policies ─────────────────────

CREATE POLICY "community_posts_delete_own" ON public.community_posts
    FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "community_posts_update_own" ON public.community_posts
    FOR UPDATE USING (author_id = auth.uid());

-- ── 4. notifications RLS policies ────────────────────────────────────────────

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Service role inserts notifications (no row-level INSERT for users)
-- System functions run as SECURITY DEFINER so they bypass RLS.

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE USING (user_id = auth.uid());

-- ── 5. Resonance reaction: add '✨' to community_post_reactions ───────────────
-- The existing community_post_reactions table tracks emoji → user.
-- No schema change needed; the new '✨' emoji key just needs to be usable.
-- (community_post_reactions already stores reaction_type as text)

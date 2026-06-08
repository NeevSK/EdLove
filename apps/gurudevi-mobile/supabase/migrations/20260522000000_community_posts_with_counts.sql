CREATE OR REPLACE VIEW public.community_posts_with_counts AS
SELECT
    cp.*,
    COALESCE((
        SELECT COUNT(*)::int
        FROM public.community_reactions cr
        WHERE cr.post_id = cp.id
    ), 0) AS reaction_count
FROM public.community_posts cp;

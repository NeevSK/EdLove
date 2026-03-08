-- ============================================================
-- get_ecosystem_stats Enhancement
-- Adds meaningful aggregate fields that were previously null:
--   active_users_7d, total_library_resources, total_community_posts,
--   total_attendance_events, avg_mood_score_7d
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_ecosystem_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result JSONB;
    caller_role TEXT;
BEGIN
    -- Strict role check — Founders and Admins only
    SELECT role INTO caller_role
    FROM public.users
    WHERE id = auth.uid();

    IF caller_role NOT IN ('founder', 'admin', 'developer') THEN
        RAISE EXCEPTION 'Access Denied: Founder privileges required.';
    END IF;

    SELECT jsonb_build_object(
        -- Core headcounts
        'total_schools',         (SELECT count(*)::int FROM public.schools),
        'total_users',           (SELECT count(*)::int FROM public.users),
        'total_students',        (SELECT count(*)::int FROM public.users WHERE role = 'student'),
        'total_teachers',        (SELECT count(*)::int FROM public.users WHERE role = 'teacher'),
        'total_principals',      (SELECT count(*)::int FROM public.users WHERE role = 'principal'),
        'total_classrooms',      (SELECT count(*)::int FROM public.classrooms),

        -- Engagement vitals (last 7 days)
        'active_users_7d',       (
            SELECT count(DISTINCT user_id)::int
            FROM public.mood_logs
            WHERE created_at >= NOW() - INTERVAL '7 days'
        ),
        'mood_checkins_7d',      (
            SELECT count(*)::int
            FROM public.mood_logs
            WHERE created_at >= NOW() - INTERVAL '7 days'
        ),
        'avg_mood_score_7d',     (
            SELECT ROUND(AVG(mood_score)::numeric, 2)
            FROM public.mood_logs
            WHERE created_at >= NOW() - INTERVAL '7 days'
        ),

        -- Knowledge ecosystem
        'total_library_resources', (SELECT count(*)::int FROM public.library_resources),
        'verified_resources',      (SELECT count(*)::int FROM public.library_resources WHERE verified = true),
        'total_bookmarks',         (SELECT count(*)::int FROM public.library_bookmarks),

        -- Community pulse
        'total_community_posts',   (SELECT count(*)::int FROM public.community_posts),
        'posts_7d',                (
            SELECT count(*)::int
            FROM public.community_posts
            WHERE created_at >= NOW() - INTERVAL '7 days'
        ),
        'active_communities',      (SELECT count(*)::int FROM public.communities),

        -- Attendance
        'attendance_records',      (SELECT count(*)::int FROM public.attendance),
        'attendance_records_7d',   (
            SELECT count(*)::int
            FROM public.attendance
            WHERE date >= (CURRENT_DATE - INTERVAL '7 days')::date
        ),

        -- Growth signals
        'growth_signals_7d',       (
            SELECT count(*)::int
            FROM public.growth_signals
            WHERE created_at >= NOW() - INTERVAL '7 days'
        ),

        -- Platform health score (composite, 0-100)
        'ecosystem_health',        LEAST(100, (
            COALESCE((SELECT count(*)::numeric FROM public.mood_logs WHERE created_at >= NOW() - INTERVAL '7 days'), 0) * 2
            + COALESCE((SELECT count(*)::numeric FROM public.community_posts WHERE created_at >= NOW() - INTERVAL '7 days'), 0) * 3
            + COALESCE((SELECT count(*)::numeric FROM public.attendance WHERE date >= (CURRENT_DATE - INTERVAL '7 days')::date), 0)
        ) / GREATEST(1, (SELECT count(*)::numeric FROM public.users) / 10.0)),

        -- Metadata
        'generated_at',           NOW()
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant execute to authenticated users (RLS inside function enforces role check)
GRANT EXECUTE ON FUNCTION public.get_ecosystem_stats() TO authenticated;

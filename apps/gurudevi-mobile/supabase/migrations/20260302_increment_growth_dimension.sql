-- Migration: add increment_growth_dimension RPC
-- Purpose:   userGrowthState.incrementDimension() needs a server-side atomic increment
--            to avoid the read-then-write race condition under concurrent growth signals.
--            The previous approach embedded supabase.rpc() inside .update() which is
--            invalid (the builder object was passed as the column value, always erroring
--            silently and falling back to the non-atomic path).
--
--            This function does a single atomic UPDATE ... SET col = COALESCE(col,0)+1
--            using a whitelisted column name to avoid SQL injection from the dynamic
--            `dimension` parameter.

CREATE OR REPLACE FUNCTION public.increment_growth_dimension(
  p_user_id  UUID,
  p_column   TEXT
)
RETURNS public.user_growth_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result public.user_growth_state;
BEGIN
  -- Whitelist allowed column names to prevent SQL injection from the p_column parameter.
  IF p_column NOT IN (
    'teaching_moments', 'connection_sparks', 'wisdom_drops',
    'care_ripples', 'growth_reflections', 'community_contributions'
  ) THEN
    RAISE EXCEPTION 'Invalid growth dimension column: %', p_column;
  END IF;

  -- Atomic increment via CASE expression (avoids EXECUTE for safety)
  UPDATE public.user_growth_state
  SET
    teaching_moments       = CASE WHEN p_column = 'teaching_moments'       THEN COALESCE(teaching_moments, 0) + 1       ELSE teaching_moments END,
    connection_sparks      = CASE WHEN p_column = 'connection_sparks'      THEN COALESCE(connection_sparks, 0) + 1      ELSE connection_sparks END,
    wisdom_drops           = CASE WHEN p_column = 'wisdom_drops'           THEN COALESCE(wisdom_drops, 0) + 1           ELSE wisdom_drops END,
    care_ripples           = CASE WHEN p_column = 'care_ripples'           THEN COALESCE(care_ripples, 0) + 1           ELSE care_ripples END,
    growth_reflections     = CASE WHEN p_column = 'growth_reflections'     THEN COALESCE(growth_reflections, 0) + 1     ELSE growth_reflections END,
    community_contributions= CASE WHEN p_column = 'community_contributions'THEN COALESCE(community_contributions, 0) + 1 ELSE community_contributions END,
    last_seen_at           = now(),
    updated_at             = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_growth_dimension(UUID, TEXT) TO authenticated;

-- Migration: update increment_growth_dimension RPC
-- Purpose:   Align the RPC with the modern user_growth_state schema (v2.0).
--            The previous RPC used outdated column names (teaching_moments, etc.).
--            This version uses the canonical presence_signals, nourishing_signals, etc.

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
  -- Whitelist allowed column names to prevent SQL injection.
  IF p_column NOT IN (
    'presence_signals', 'nourishing_signals', 'witnessing_signals',
    'weaving_signals', 'blooming_signals', 'aliveness_intensity'
  ) THEN
    RAISE EXCEPTION 'Invalid growth dimension column: %', p_column;
  END IF;

  -- Atomic increment
  UPDATE public.user_growth_state
  SET
    presence_signals   = CASE WHEN p_column = 'presence_signals'   THEN COALESCE(presence_signals, 0) + 1   ELSE presence_signals END,
    nourishing_signals = CASE WHEN p_column = 'nourishing_signals' THEN COALESCE(nourishing_signals, 0) + 1 ELSE nourishing_signals END,
    witnessing_signals = CASE WHEN p_column = 'witnessing_signals' THEN COALESCE(witnessing_signals, 0) + 1 ELSE witnessing_signals END,
    weaving_signals    = CASE WHEN p_column = 'weaving_signals'    THEN COALESCE(weaving_signals, 0) + 1    ELSE weaving_signals END,
    blooming_signals   = CASE WHEN p_column = 'blooming_signals'   THEN COALESCE(blooming_signals, 0) + 1   ELSE blooming_signals END,
    last_seen_at       = now(),
    updated_at         = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_growth_dimension(UUID, TEXT) TO authenticated;

import { useCallback, useEffect, useState } from 'react';
import { type CrystalTier, naturePathsAPI, type RiverStage } from '../api/naturePaths';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';

/**
 * useNaturePaths
 *
 * A hook to fetch and manage a student's nature path state (River & Crystal).
 */
export const useNaturePaths = () => {
  const { context } = usePermissions();
  const userId = context.userId;
  const [paths, setPaths] = useState<{
    river_stage: RiverStage;
    crystal_tier: CrystalTier;
    crystals_found_count: number;
    fractal_moments_count: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPaths = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const state = await naturePathsAPI.getStudentPathState(userId);
      setPaths(state);
    } catch (error) {
      console.error('[useNaturePaths] Error fetching paths:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshPaths();
  }, [refreshPaths]);

  return {
    paths,
    isLoading,
    refreshPaths,
  };
};


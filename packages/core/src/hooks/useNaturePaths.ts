import { useCallback, useEffect, useMemo, useState } from 'react';
import { type CrystalTier, type RiverStage } from '../types/Growth';
import { growth } from '../logic';

import { usePermissions } from '../logic/permissions/hooks/usePermissions';

/**
 * useNaturePaths
 *
 * A hook to fetch and manage a student's nature path state (River & Crystal).
 */
export const useNaturePaths = () => {
  const { context } = usePermissions();
  const userId = context.user_id;
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
      const state = await growth.getGrowthState(userId);
      if (state) {
        setPaths({
          river_stage: state.river_stage,
          crystal_tier: state.crystal_tier,
          crystals_found_count: state.crystals_found_count,
          fractal_moments_count: state.fractal_moments_count,
        });
      }
    } catch (error) {
      console.error('[useNaturePaths] Error fetching paths:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    refreshPaths().catch((e) => {
      console.error('NaturePaths: Failed to load on mount', e);
    });
  }, [refreshPaths]);

  return useMemo(
    () => ({
      paths,
      isLoading,
      refreshPaths,
    }),
    [paths, isLoading, refreshPaths],
  );
};

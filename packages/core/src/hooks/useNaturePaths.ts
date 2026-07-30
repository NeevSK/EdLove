import { useCallback, useEffect, useMemo, useState } from 'react';
import { growth } from '@repo/core/logic';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import type { CrystalTier, RiverStage } from '@repo/core/types/Growth';

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

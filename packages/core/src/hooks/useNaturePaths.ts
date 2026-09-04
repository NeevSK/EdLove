import { growth } from '@repo/core/logic';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { useGrowthStore } from '@repo/core/store/useGrowthStore';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * useNaturePaths
 *
 * A hook to fetch and manage a student's nature path state (River & Crystal).
 */
export const useNaturePaths = () => {
  const { context } = usePermissions();
  const userId = context.userId;

  const riverStage = useGrowthStore((state) => state.river_stage);
  const crystalTier = useGrowthStore((state) => state.crystal_tier);
  const crystalsFoundCount = useGrowthStore((state) => state.crystals_found_count);
  const fractalMomentsCount = useGrowthStore((state) => state.fractal_moments_count);

  const [isLoading, setIsLoading] = useState(true);

  const refreshPaths = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const state = await growth.getGrowthState(userId);
      if (state) {
        useGrowthStore.getState().setGrowthState({
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

  const paths = useMemo(() => {
    return {
      river_stage: riverStage,
      crystal_tier: crystalTier,
      crystals_found_count: crystalsFoundCount,
      fractal_moments_count: fractalMomentsCount,
    };
  }, [riverStage, crystalTier, crystalsFoundCount, fractalMomentsCount]);

  return useMemo(
    () => ({
      paths,
      isLoading,
      refreshPaths,
    }),
    [paths, isLoading, refreshPaths],
  );
};

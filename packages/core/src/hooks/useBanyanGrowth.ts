import { useCallback, useEffect, useMemo, useState } from 'react';
import { growth } from '@repo/core/logic';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { useGrowthStore } from '@repo/core/store/useGrowthStore';

/**
 * useBanyanGrowth
 *
 * A hook to fetch and manage a teacher's or principal's Banyan growth state.
 */
export function useBanyanGrowth() {
  const { context } = usePermissions();
  const userId = context.userId || null;
  
  const banyanStage = useGrowthStore((state) => state.banyan_stage);
  const peerMentoredCount = useGrowthStore((state) => state.peer_mentored_count);
  const circlesFacilitatedCount = useGrowthStore((state) => state.circles_facilitated_count);
  
  const [isLoading, setIsLoading] = useState(true);

  const refreshBanyan = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const state = await growth.getGrowthState(userId);
      if (state) {
        useGrowthStore.getState().setGrowthState({
          banyan_stage: state.banyan_stage,
          peer_mentored_count: state.peer_mentored_count,
          circles_facilitated_count: state.circles_facilitated_count,
        });
      }
    } catch (error) {
      console.error('[useBanyanGrowth] Error fetching Banyan state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshBanyan().catch((e) => {
      console.error('Banyan: Failed to refresh on mount', e);
    });
  }, [refreshBanyan]);

  const banyan = useMemo(() => {
    return {
      banyan_stage: banyanStage,
      peer_mentored_count: peerMentoredCount,
      circles_facilitated_count: circlesFacilitatedCount,
    };
  }, [banyanStage, peerMentoredCount, circlesFacilitatedCount]);

  return useMemo(
    () => ({
      banyan,
      isLoading,
      refreshBanyan,
    }),
    [banyan, isLoading, refreshBanyan],
  );
}

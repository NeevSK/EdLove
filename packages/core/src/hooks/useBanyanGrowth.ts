import { useCallback, useEffect, useMemo, useState } from 'react';
import { growth } from '../logic';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import type { BanyanStage } from '../types/Growth';

/**
 * useBanyanGrowth
 *
 * A hook to fetch and manage a teacher's or principal's Banyan growth state.
 */
export function useBanyanGrowth() {
  const { context } = usePermissions();
  const userId = context.userId || null;
  const [banyan, setBanyan] = useState<{
    banyan_stage: BanyanStage;
    peer_mentored_count: number;
    circles_facilitated_count: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBanyan = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const state = await growth.getGrowthState(userId);
      if (state) {
        setBanyan({
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

  return useMemo(
    () => ({
      banyan,
      isLoading,
      refreshBanyan,
    }),
    [banyan, isLoading, refreshBanyan],
  );
}

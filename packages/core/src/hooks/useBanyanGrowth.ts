import { useCallback, useEffect, useState } from 'react';
import { type BanyanStage, naturePathsAPI } from '../api/naturePaths';
import { usePermissions } from '../permissions/hooks/usePermissions';

/**
 * useBanyanGrowth
 *
 * A hook to fetch and manage a teacher's or principal's Banyan growth state.
 */
export function useBanyanGrowth() {
  const { context } = usePermissions();
  const userId = context.userId;
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
      const state = await naturePathsAPI.getBanyanState(userId);
      setBanyan(state);
    } catch (error) {
      console.error('[useBanyanGrowth] Error fetching Banyan state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshBanyan();
  }, [refreshBanyan]);

  return {
    banyan,
    isLoading,
    refreshBanyan,
  };
}

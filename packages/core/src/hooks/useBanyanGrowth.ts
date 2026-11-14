import { useGrowthQuery } from '@repo/core/hooks/useGrowthQuery';

export function useBanyanGrowth() {
  const query = useGrowthQuery();
  return {
    banyan: {
      banyan_stage: query.data?.banyan_stage ?? null,
      peer_mentored_count: query.data?.peer_mentored_count ?? 0,
      circles_facilitated_count: query.data?.circles_facilitated_count ?? 0,
    },
    isLoading: query.isLoading,
    error: query.error,
    refreshBanyan: query.refresh,
  };
}

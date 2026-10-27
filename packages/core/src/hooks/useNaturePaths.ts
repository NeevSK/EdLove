import { useGrowthQuery } from '@repo/core/hooks/useGrowthQuery';

export function useNaturePaths() {
  const query = useGrowthQuery();
  return {
    paths: {
      river_stage: query.data?.river_stage ?? null,
      crystal_tier: query.data?.crystal_tier ?? null,
      crystals_found_count: query.data?.crystals_found_count ?? 0,
      fractal_moments_count: query.data?.fractal_moments_count ?? 0,
    },
    isLoading: query.isLoading,
    error: query.error,
    refreshPaths: query.refresh,
  };
}

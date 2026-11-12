import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
import { temporalHeatmapQuery } from '@repo/core/store/queries/experienceQueries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * useTemporalHeatmap
 *
 * Aggregates temporal activity into a grid format for yearly visualization.
 */
export function useTemporalHeatmap(year: number) {
  const { context } = useSanctuaryFeature();
  const userId = context.userId;

  const { data: rawData = [], isLoading } = useQuery(temporalHeatmapQuery(userId, year));

  const heatmap = useMemo(() => rawData, [rawData]);

  return {
    heatmap,
    isLoading,
  };
}

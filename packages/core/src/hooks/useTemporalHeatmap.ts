import { uiExperience } from '@repo/core/logic/managers/factory';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { getTemporalRange } from '@repo/core/logic/utils/temporalUtils';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface HeatmapData {
  date: string;
  intensity: number;
  count: number;
}

/**
 * useTemporalHeatmap
 *
 * Aggregates temporal activity into a grid format for yearly visualization.
 */
export function useTemporalHeatmap(year: number) {
  const { context } = usePermissions();
  const userId = context.userId;

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ['temporal_heatmap', userId, year],
    queryFn: async () => {
      if (!userId) return [];
      const range = getTemporalRange(`${year}-01-01`, 'year');
      return uiExperience.getTemporalHeatmap(userId, range);
    },
    enabled: !!userId,
  });

  const heatmap = useMemo(() => rawData, [rawData]);

  return {
    heatmap,
    isLoading,
  };
}

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { getTemporalRange } from '@repo/core/logic/utils/temporalUtils';

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

      const [moodRes, journalRes] = await Promise.all([
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('mood_logs')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', range.start)
          .lte('created_at', range.end),
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('journal_entries')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', range.start)
          .lte('created_at', range.end),
      ]);

      const countsByDate: Record<string, number> = {};

      const process = (items: Array<{ created_at: string }>) => {
        items.forEach((item) => {
          const day = item.created_at.split('T')[0] || item.created_at;
          countsByDate[day] = (countsByDate[day] || 0) + 1;
        });
      };

      process((moodRes.data || []) as Array<{ created_at: string }>);
      process((journalRes.data || []) as Array<{ created_at: string }>);

      return Object.entries(countsByDate).map(([date, count]) => ({
        date,
        count,
        intensity: Math.min(Math.ceil(count / 2), 4),
      }));
    },
    enabled: !!userId,
  });

  const heatmap = useMemo(() => rawData, [rawData]);

  return {
    heatmap,
    isLoading,
  };
}

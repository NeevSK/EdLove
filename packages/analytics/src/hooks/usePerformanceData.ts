import { useQuery } from '@tanstack/react-query';
import { ClassAnalytics } from '../types/AnalyticsTypes';
import { PerformanceAnalyzer } from '../engine/PerformanceAnalyzer';
import { supabase } from '@repo/core';

const performanceAnalyzer = new PerformanceAnalyzer(supabase);

export function usePerformanceData(classId?: string) {
  return useQuery({
    queryKey: ['performance-data', classId],
    queryFn: () => {
      if (!classId) throw new Error('Class ID is required');
      return performanceAnalyzer.analyzeClassPerformance(classId);
    },
    enabled: !!classId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

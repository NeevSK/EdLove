import { supabase } from '@repo/core/api';;

import { useQuery } from '@tanstack/react-query';
import { PerformanceAnalyzer } from '../engine/PerformanceAnalyzer';
import { InsightGenerator } from '../ml/InsightGenerator';
import { Predictor } from '../ml/Predictor';
import type { PredictionRequest } from '../types/AnalyticsTypes';

const performanceAnalyzer = new PerformanceAnalyzer(supabase);
export const predictor = new Predictor(supabase);
const insightGenerator = new InsightGenerator();

export function useStudentPerformance(
  studentId: string,
  classId: string,
  timeRange?: { startDate: string; endDate: string },
) {
  return useQuery({
    queryKey: ['student-performance', studentId, classId, timeRange],
    queryFn: () => performanceAnalyzer.analyzeStudentPerformance(studentId, classId, timeRange),
    enabled: !!studentId && !!classId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassPerformance(classId: string) {
  return useQuery({
    queryKey: ['class-performance', classId],
    queryFn: () => performanceAnalyzer.analyzeClassPerformance(classId),
    enabled: !!classId,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePredictions(request: PredictionRequest) {
  return useQuery({
    queryKey: ['predictions', request.studentId, request.predictionType, request.timeHorizon],
    queryFn: () => predictor.predict(request),
    enabled: !!request.studentId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useStudentPerformanceData(studentId: string, classId: string) {
  const performance = useStudentPerformance(studentId, classId);
  const predictions = usePredictions({
    studentId,
    predictionType: 'gpa',
    timeHorizon: 'semester',
  });

  const insights = performance.data
    ? insightGenerator.generateStudentInsights(performance.data)
    : [];

  const recommendations = performance.data
    ? insightGenerator.generateRecommendations(performance.data)
    : [];

  return {
    performance,
    predictions,
    insights,
    recommendations,
    isLoading: performance.isLoading || predictions.isLoading,
    error: performance.error || predictions.error,
  };
}

export function useClassPerformanceData(classId?: string) {
  return useQuery({
    queryKey: ['performance-data', classId],
    queryFn: () => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      return performanceAnalyzer.analyzeClassPerformance(classId);
    },
    enabled: !!classId,
    staleTime: 10 * 60 * 1000,
  });
}

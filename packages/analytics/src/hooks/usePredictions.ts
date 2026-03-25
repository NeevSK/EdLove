import { useQuery } from '@tanstack/react-query';
import { PredictionRequest, PredictionResult } from '../types/AnalyticsTypes';
import { Predictor } from '../ml/Predictor';

const predictor = new Predictor();

export function usePredictions(request: PredictionRequest) {
  return useQuery({
    queryKey: ['predictions', request.studentId, request.predictionType, request.timeHorizon],
    queryFn: () => predictor.predict(request),
    enabled: !!request.studentId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

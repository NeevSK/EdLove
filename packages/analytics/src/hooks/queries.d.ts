import { Predictor } from '../ml/Predictor';
import type { PredictionRequest } from '../types/AnalyticsTypes';
export declare const predictor: Predictor;
export declare function useStudentPerformance(studentId: string, classId: string, timeRange?: {
    startDate: string;
    endDate: string;
}): import("@tanstack/react-query").UseQueryResult<import("..").StudentPerformanceMetrics, Error>;
export declare function useClassPerformance(classId: string): import("@tanstack/react-query").UseQueryResult<import("..").ClassAnalytics, Error>;
export declare function usePredictions(request: PredictionRequest): import("@tanstack/react-query").UseQueryResult<import("..").PredictionResult, Error>;
export declare function useStudentPerformanceData(studentId: string, classId: string): {
    performance: import("@tanstack/react-query").UseQueryResult<import("..").StudentPerformanceMetrics, Error>;
    predictions: import("@tanstack/react-query").UseQueryResult<import("..").PredictionResult, Error>;
    insights: string[];
    recommendations: string[];
    isLoading: boolean;
    error: Error | null;
};
export declare function useClassPerformanceData(classId?: string): import("@tanstack/react-query").UseQueryResult<import("..").ClassAnalytics, Error>;
//# sourceMappingURL=queries.d.ts.map
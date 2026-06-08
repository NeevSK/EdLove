export * from './engine/GPACalculator';
export type { DatabaseClient } from './engine/PerformanceAnalyzer';
export * from './engine/PerformanceAnalyzer';
export * from './engine/PostHogAnalytics';
export type { DatabaseClient as PredictorDatabaseClient } from './ml/Predictor';
import { type DatabaseClient, PerformanceAnalyzer } from './engine/PerformanceAnalyzer';
import { posthogAnalytics } from './engine/PostHogAnalytics';
import { Predictor as ML_Predictor } from './ml/Predictor';
export declare const createPerformanceAnalyzer: (db: DatabaseClient) => PerformanceAnalyzer;
export declare const createPredictor: (db: DatabaseClient) => ML_Predictor;
export type { ClassroomGradingSettings, StudentGrade } from '@repo/core/logic';
export * from './ml/InsightGenerator';
export * from './ml/Predictor';
export type {
  CustomReportConfig,
  GPACalculationOptions,
  GradingScale,
  LiveMetrics,
  StudentPerformanceMetrics,
  TenantMetrics,
} from './types/AnalyticsTypes';
export * from './types/AnalyticsTypes';
export * from './types/GradingTypes';
export * from './utils/analyticsHelpers';
export * from './utils/benchmarking';
export { posthogAnalytics };
export declare const initPostHog: (
  apiKey: string,
  hostOrOptions?:
    | string
    | {
        host?: string;
      },
) => Promise<void>;
export declare const trackEvent: (event: string, properties?: any) => void;
export declare const identifyUser: (userId: string, properties?: any) => void;
export declare const resetUser: () => void;
export declare const marksToGPA: (marks: number) => {
  grade: string;
  gpa: number;
};
export declare const calculateRanks: (grades: any[]) => {
  [key: string]: any;
  id: string;
  marks: number;
  rank: number;
}[];
export declare const multiTenantAnalyticsAPI: {
  aggregateTenantMetrics: (ids: string[], range: any) => Promise<never[]>;
  getLiveMetrics: (id: string) => Promise<{
    active_users: number;
    api_requests_per_minute: number;
    error_rate: number;
    system_health: 'healthy' | 'warning' | 'critical';
    timestamp: string;
    resource_usage: {
      cpu: number;
      memory: number;
      storage: number;
    };
  }>;
};
//# sourceMappingURL=index.d.ts.map

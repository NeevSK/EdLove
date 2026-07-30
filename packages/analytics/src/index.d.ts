export * from '@repo/analytics/engine/GPACalculator';
export type { DatabaseClient } from '@repo/analytics/engine/PerformanceAnalyzer';
export * from '@repo/analytics/engine/PerformanceAnalyzer';
export * from '@repo/analytics/engine/PostHogAnalytics';
export type { DatabaseClient as PredictorDatabaseClient } from '@repo/analytics/ml/Predictor';
import { type DatabaseClient, PerformanceAnalyzer } from '@repo/analytics/engine/PerformanceAnalyzer';
import { posthogAnalytics } from '@repo/analytics/engine/PostHogAnalytics';
import { Predictor as ML_Predictor } from '@repo/analytics/ml/Predictor';
export declare const createPerformanceAnalyzer: (db: DatabaseClient) => PerformanceAnalyzer;
export declare const createPredictor: (db: DatabaseClient) => ML_Predictor;
export type { ClassroomGradingSettings, StudentGrade } from '@repo/core/types';
export * from '@repo/analytics/ml/InsightGenerator';
export * from '@repo/analytics/ml/Predictor';
export * from '@repo/analytics/types';
export * from '@repo/analytics/utils/analyticsHelpers';
export * from '@repo/analytics/utils/benchmarking';
export { posthogAnalytics };
export declare const initPostHog: (apiKey: string, hostOrOptions?: string | {
    host?: string;
}) => Promise<void>;
export declare const trackEvent: (event: string, properties?: any) => void;
export declare const identifyUser: (userId: string, properties?: any) => void;
export declare const resetUser: () => void;
export declare const marksToGPA: (marks: number) => any;
export declare const calculateRanks: (grades: any[]) => any;
export declare const multiTenantAnalyticsAPI: {
    aggregateTenantMetrics: (_ids: string[], _range: any) => Promise<never[]>;
    getLiveMetrics: (_id: string) => Promise<{
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
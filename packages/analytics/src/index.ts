// Core analytics exports - No UI dependencies to prevent circular dependencies
export * from '@repo/analytics/engine/GPACalculator';
// Export database client interface for dependency injection
export * from '@repo/analytics/engine/PerformanceAnalyzer';
export * from '@repo/analytics/engine/PostHogAnalytics';
export type { DatabaseClient as PredictorDatabaseClient } from '@repo/analytics/ml/Predictor';

// Factory functions to create instances with database client
import {
  type DatabaseClient,
  PerformanceAnalyzer,
} from '@repo/analytics/engine/PerformanceAnalyzer';
import { posthogAnalytics } from '@repo/analytics/engine/PostHogAnalytics';
import { Predictor as ML_Predictor } from '@repo/analytics/ml/Predictor';
export const createPerformanceAnalyzer = (db: DatabaseClient) => new PerformanceAnalyzer(db);
export const createPredictor = (db: DatabaseClient) => new ML_Predictor(db);
export * from '@repo/analytics/ml/InsightGenerator';
// ML and prediction exports
// (DatabaseClient excluded here: PerformanceAnalyzer's identical interface is
// the canonical export; Predictor's copy stays module-local.)
export { Predictor } from '@repo/analytics/ml/Predictor';
// Types and interfaces
export * from '@repo/analytics/types';
// Utility functions
export * from '@repo/analytics/utils/analyticsHelpers';
export * from '@repo/analytics/utils/benchmarking';
export type { ClassroomGradingSettings, StudentGrade } from '@repo/core/types';
export const initPostHog = async (
  apiKey: string,
  hostOrOptions?:
    | string
    | {
        host?: string;
      },
) => {
  const host = typeof hostOrOptions === 'string' ? hostOrOptions : hostOrOptions?.host;
  await posthogAnalytics.initialize(apiKey, { host });
};
export const trackEvent = (event: string, properties?: any) => {
  posthogAnalytics.track(event, properties);
};
export const identifyUser = (userId: string, properties?: any) => {
  posthogAnalytics.identify(userId, properties);
};
export const resetUser = () => {
  posthogAnalytics.reset();
};

import { GPACalculator as CoreGPACalculator } from '@repo/core/logic';

const gpaCalculator = new CoreGPACalculator();
export const marksToGPA = (marks: number) => gpaCalculator.marksToGPA(marks);
export const calculateRanks = (grades: any[]) => gpaCalculator.calculateRanks(grades);
// Mock implementation for multiTenantAnalyticsAPI until full implementation is moved
export const multiTenantAnalyticsAPI = {
  aggregateTenantMetrics: async (_ids: string[], _range: any) => [],
  getLiveMetrics: async (_id: string) => ({
    active_users: 0,
    api_requests_per_minute: 0,
    error_rate: 0,
    system_health: 'healthy' as 'healthy' | 'warning' | 'critical',
    timestamp: new Date().toISOString(),
    resource_usage: { cpu: 0, memory: 0, storage: 0 },
  }),
};

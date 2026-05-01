// Core analytics exports - No UI dependencies to prevent circular dependencies
export * from './engine/GPACalculator';
// Export database client interface for dependency injection
export type { DatabaseClient } from './engine/PerformanceAnalyzer';
export * from './engine/PerformanceAnalyzer';
export * from './engine/PostHogAnalytics';
export type { DatabaseClient as PredictorDatabaseClient } from './ml/Predictor';
// Factory functions to create instances with database client
import { type DatabaseClient, PerformanceAnalyzer } from './engine/PerformanceAnalyzer';
import { posthogAnalytics } from './engine/PostHogAnalytics';
import { Predictor as ML_Predictor } from './ml/Predictor';
export const createPerformanceAnalyzer = (db: DatabaseClient) => new PerformanceAnalyzer(db);
export const createPredictor = (db: DatabaseClient) => new ML_Predictor(db);
export type { ClassroomGradingSettings, StudentGrade } from "@repo/core/logic";
export * from './ml/InsightGenerator';
// ML and prediction exports
export * from './ml/Predictor';
// Types and interfaces
export * from './types';
// Utility functions
export * from './utils/analyticsHelpers';
export * from './utils/benchmarking';
// PostHog Universal Helpers
export { posthogAnalytics };
export const initPostHog = async (apiKey: string, hostOrOptions?: string | {
    host?: string;
}) => {
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
import { GPACalculator as CoreGPACalculator } from "@repo/core/logic";
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

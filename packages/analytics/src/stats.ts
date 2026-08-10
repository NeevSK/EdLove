// Pure math, calculators, data analyzer and ML predictor without telemetry SDK dependencies.
import { type DatabaseClient, PerformanceAnalyzer } from './engine/PerformanceAnalyzer';
import { Predictor as ML_Predictor } from './ml/Predictor';

export * from './engine/GPACalculator';
export { PerformanceAnalyzer, ML_Predictor };
export type { DatabaseClient };
export type { DatabaseClient as PredictorDatabaseClient } from './ml/Predictor';
export const createPerformanceAnalyzer = (db: DatabaseClient) => new PerformanceAnalyzer(db);
export const createPredictor = (db: DatabaseClient) => new ML_Predictor(db);
export type { ClassroomGradingSettings, StudentGrade } from '@repo/core/types';
export * from './ml/InsightGenerator';
export * from './ml/Predictor';
export * from './types';
export * from './utils/analyticsHelpers';
export * from './utils/benchmarking';

import { GPACalculator as CoreGPACalculator } from '@repo/core/logic';
const gpaCalculator = new CoreGPACalculator();
export const marksToGPA = (marks: number) => gpaCalculator.marksToGPA(marks);
export const calculateRanks = (grades: any[]) => gpaCalculator.calculateRanks(grades);
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

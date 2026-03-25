// Core analytics exports - No UI dependencies to prevent circular dependencies
export * from './engine/GPACalculator';
export * from './engine/PerformanceAnalyzer';
export * from './engine/PostHogAnalytics';

// Export database client interface for dependency injection
export type { DatabaseClient } from './engine/PerformanceAnalyzer';
export type { DatabaseClient as PredictorDatabaseClient } from './ml/Predictor';

// Factory functions to create instances with database client
import { PerformanceAnalyzer, DatabaseClient } from './engine/PerformanceAnalyzer';
import { Predictor as ML_Predictor } from './ml/Predictor';

export const createPerformanceAnalyzer = (db: DatabaseClient) => new PerformanceAnalyzer(db);
export const createPredictor = (db: DatabaseClient) => new ML_Predictor(db);

// Simple grade calculation functions (for backward compatibility)
import { GPACalculator } from './engine/GPACalculator';
export type { GradingScale, GPACalculationOptions } from './types/AnalyticsTypes';

// Export legacy types for backward compatibility
export interface GradeWithMarks {
  id: string;
  marks: number;
  [key: string]: any;
}

export interface GradeWithRank extends GradeWithMarks {
  rank: number;
}

// Export StudentGrade from core types for compatibility
export interface StudentGrade {
  id: string;
  student_id: string;
  assignment_id?: string;
  marks: number;
  grade: string;
  gpa: number;
  feedback?: string;
  rank?: number;
  graded_at: string;
}

export interface ClassroomGradingSettings {
  classroom_id: string;
  grading_mode: 'marks' | 'gpa' | 'both';
  show_ranks: boolean;
}

// ML and prediction exports
export * from './ml/Predictor';
export * from './ml/InsightGenerator';

// Types and interfaces
export * from './types/AnalyticsTypes';
export * from './types/GradingTypes';
export type { StudentPerformanceMetrics, TenantMetrics, LiveMetrics, CustomReportConfig } from './types/AnalyticsTypes';

// Utility functions
export * from './utils/analyticsHelpers';
export * from './utils/benchmarking';

// Components - MOVED to prevent circular dependencies
// UI components should be imported from @repo/analytics/components or moved to @repo/ui
// This prevents: ui -> core -> analytics -> ui circular dependency

// Hooks
export * from './hooks/useAnalytics';

// Provider - Moved to core package to prevent circular dependencies
// Use: import { ResonanceProvider } from '@repo/core';

// Legacy exports for backward compatibility
import { posthogAnalytics } from './engine/PostHogAnalytics';
import { Platform } from 'react-native';
import { posthogAnalytics as posthogWeb } from './engine/PostHogAnalytics.web';

// Re-export PostHogAnalytics class for direct imports
export { PostHogAnalytics } from './engine/PostHogAnalytics';

export const initPostHog = async () => {
  if (Platform.OS === 'web') {
    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
    if (apiKey) {
      await posthogWeb.initialize(apiKey, { host });
    }
  } else {
    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
    if (apiKey) {
      await posthogAnalytics.initialize(apiKey, { host });
    }
  }
};

export const trackEvent = (event: string, properties?: any) => {
  if (Platform.OS === 'web') {
    posthogWeb.track(event, properties);
  } else {
    posthogAnalytics.track(event, properties);
  }
};

export const identifyUser = (userId: string, properties?: any) => {
  if (Platform.OS === 'web') {
    posthogWeb.identify(userId, properties);
  } else {
    posthogAnalytics.identify(userId, properties);
  }
};

export const resetUser = () => {
  if (Platform.OS === 'web') {
    posthogWeb.reset();
  } else {
    posthogAnalytics.reset();
  }
};

// Convenience exports for backward compatibility
const gpaCalculator = new GPACalculator();
export const marksToGPA = (marks: number) => gpaCalculator.marksToGPA(marks);
export const calculateRanks = (grades: GradeWithMarks[]) => gpaCalculator.calculateRanks(grades);

// Mock implementation for multiTenantAnalyticsAPI until full implementation is moved
export const multiTenantAnalyticsAPI = {
  aggregateTenantMetrics: async (ids: string[], range: any) => [],
  getLiveMetrics: async (id: string) => ({
    active_users: 0,
    api_requests_per_minute: 0,
    error_rate: 0,
    system_health: 'healthy' as 'healthy' | 'warning' | 'critical',
    timestamp: new Date().toISOString(),
    resource_usage: { cpu: 0, memory: 0, storage: 0 }
  })
};

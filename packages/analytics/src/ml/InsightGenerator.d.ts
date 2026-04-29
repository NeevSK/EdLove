import type { ClassAnalytics, StudentPerformanceMetrics } from '../types/AnalyticsTypes';
export declare class InsightGenerator {
    /**
     * Generate automated insights from analytics data
     */
    generateStudentInsights(metrics: StudentPerformanceMetrics): string[];
    generateClassInsights(analytics: ClassAnalytics): string[];
    generateRecommendations(metrics: StudentPerformanceMetrics): string[];
}
//# sourceMappingURL=InsightGenerator.d.ts.map
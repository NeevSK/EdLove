import type { StudentPerformanceMetrics } from '@repo/analytics/types/AnalyticsTypes';
interface PerformanceDashboardProps {
    metrics: StudentPerformanceMetrics;
    insights?: string[];
    recommendations?: string[];
}
export declare function PerformanceDashboard({ metrics, insights, recommendations, }: PerformanceDashboardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PerformanceDashboard.d.ts.map
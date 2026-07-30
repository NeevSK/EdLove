export * from '@repo/analytics/engine/GPACalculator';
export * from '@repo/analytics/engine/PerformanceAnalyzer';
export * from '@repo/analytics/engine/PostHogAnalytics';
export * from '@repo/analytics/types/AnalyticsTypes';
export * from '@repo/analytics/types/GradingTypes';
/**
 * Native Init Helper
 */
export declare const initPostHog: (apiKey: string, hostOrOptions?: string | {
    host?: string;
}) => Promise<void>;
export declare const trackEvent: (event: string, properties?: any) => void;
export declare const identifyUser: (userId: string, properties?: any) => void;
export declare const resetUser: () => void;
//# sourceMappingURL=index.native.d.ts.map
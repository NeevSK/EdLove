export * from '@/engine/GPACalculator';
export * from '@/engine/PerformanceAnalyzer';
export * from '@/engine/PostHogAnalytics';
export * from '@/types/AnalyticsTypes';
export * from '@/types/GradingTypes';
/**
 * Native Init Helper
 */
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
//# sourceMappingURL=index.native.d.ts.map

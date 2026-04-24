export * from './engine/GPACalculator';
export * from './engine/PerformanceAnalyzer';
export * from './engine/PostHogAnalytics'; // Correctly picks up .native.ts if in Metro, or I should name it explicitly

// Re-export shared types
export * from './types/AnalyticsTypes';
export * from './types/GradingTypes';

import { posthogAnalytics } from './engine/PostHogAnalytics';

/**
 * Native Init Helper
 */
export const initPostHog = async (apiKey: string, hostOrOptions?: string | { host?: string }) => {
  const host = typeof hostOrOptions === 'string' ? hostOrOptions : hostOrOptions?.host;
  await posthogAnalytics.initialize(apiKey, { host });
};

export const trackEvent = (event: string, properties?: any) => posthogAnalytics.track(event, properties);
export const identifyUser = (userId: string, properties?: any) => posthogAnalytics.identify(userId, properties);
export const resetUser = () => posthogAnalytics.reset();

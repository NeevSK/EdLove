// Telemetry and third-party tracking exports (PostHog, Sentry, etc.)
export * from './engine/PostHogAnalytics';

import { posthogAnalytics } from './engine/PostHogAnalytics';

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

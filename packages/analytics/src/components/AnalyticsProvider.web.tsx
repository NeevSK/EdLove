import { posthogAnalytics } from '@repo/analytics/engine/PostHogAnalytics.web';
import { type ReactNode, useEffect } from 'react';

interface Props {
  children: ReactNode;
  apiKey?: string;
  enabled?: boolean;
  options?: {
    host?: string;
    debug?: boolean;
  };
}

import { ActivityPulseProvider } from '@repo/analytics/context/ActivityPulseContext';

export function AnalyticsProvider({ children, apiKey, enabled = true, options }: Props) {
  useEffect(() => {
    const isPostHogEnabled = enabled && process.env.EXPO_PUBLIC_POSTHOG_ENABLED !== 'false';
    if (apiKey && isPostHogEnabled) {
      // Effect context cannot await; initialize owns its error handling.
      void posthogAnalytics.initialize(apiKey, options);
    }
  }, [apiKey, enabled, options]);

  return <ActivityPulseProvider>{children}</ActivityPulseProvider>;
}

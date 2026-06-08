import { type ReactNode, useEffect } from 'react';
import { posthogAnalytics } from '../engine/PostHogAnalytics.web';

interface Props {
  children: ReactNode;
  apiKey?: string;
  enabled?: boolean;
  options?: {
    host?: string;
    debug?: boolean;
  };
}

import { ActivityPulseProvider } from '../context/ActivityPulseContext';

export function AnalyticsProvider({ children, apiKey, enabled = true, options }: Props) {
  useEffect(() => {
    const isPostHogEnabled = enabled && process.env.EXPO_PUBLIC_POSTHOG_ENABLED !== 'false';
    if (apiKey && isPostHogEnabled) {
      posthogAnalytics.initialize(apiKey, options);
    }
  }, [apiKey, enabled, options]);

  return <ActivityPulseProvider>{children}</ActivityPulseProvider>;
}

import { type ReactNode, useEffect } from 'react';
import { posthogAnalytics } from '../engine/PostHogAnalytics.web';

interface Props {
  children: ReactNode;
  apiKey?: string;
  options?: {
    host?: string;
    debug?: boolean;
  };
}

import { ActivityPulseProvider } from '../context/ActivityPulseContext';

export function AnalyticsProvider({ children, apiKey, options }: Props) {
  useEffect(() => {
    if (apiKey) {
      posthogAnalytics.initialize(apiKey, options);
    }
  }, [apiKey, options]);

  return <ActivityPulseProvider>{children}</ActivityPulseProvider>;
}

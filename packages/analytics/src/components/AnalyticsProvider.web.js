import { useEffect } from 'react';
import { jsx as _jsx } from 'react/jsx-runtime';
import { ActivityPulseProvider } from '@/context/ActivityPulseContext';
import { posthogAnalytics } from '@/engine/PostHogAnalytics.web';
export function AnalyticsProvider({ children, apiKey, options }) {
  useEffect(() => {
    if (apiKey) {
      posthogAnalytics.initialize(apiKey, options);
    }
  }, [apiKey, options]);
  return _jsx(ActivityPulseProvider, { children: children });
}

import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { posthogAnalytics } from '@/engine/PostHogAnalytics.web';
import { ActivityPulseProvider } from '@/context/ActivityPulseContext';
export function AnalyticsProvider({ children, apiKey, enabled = true, options }) {
    useEffect(() => {
        const isPostHogEnabled = enabled && process.env.EXPO_PUBLIC_POSTHOG_ENABLED !== 'false';
        if (apiKey && isPostHogEnabled) {
            posthogAnalytics.initialize(apiKey, options);
        }
    }, [apiKey, enabled, options]);
    return _jsx(ActivityPulseProvider, { children: children });
}

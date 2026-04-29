import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { posthogAnalytics } from '../engine/PostHogAnalytics.web';
import { ActivityPulseProvider } from '../context/ActivityPulseContext';
export function AnalyticsProvider({ children, apiKey, options }) {
    useEffect(() => {
        if (apiKey) {
            posthogAnalytics.initialize(apiKey, options);
        }
    }, [apiKey, options]);
    return _jsx(ActivityPulseProvider, { children: children });
}

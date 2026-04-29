import { jsx as _jsx } from "react/jsx-runtime";
import { PostHogProvider as NativePostHogProvider } from 'posthog-react-native';
import { createContext, useContext } from 'react';
const AnalyticsContext = createContext(undefined);
export function useAnalyticsContext() {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
    }
    return context;
}
import { ActivityPulseProvider } from '../context/ActivityPulseContext';
export function AnalyticsProvider({ children, apiKey, enabled = true, options }) {
    if (!apiKey || !enabled) {
        return _jsx(ActivityPulseProvider, { children: children });
    }
    return (_jsx(NativePostHogProvider, { apiKey: apiKey, options: {
            host: options?.host,
        }, autocapture: false, children: _jsx(ActivityPulseProvider, { children: children }) }));
}

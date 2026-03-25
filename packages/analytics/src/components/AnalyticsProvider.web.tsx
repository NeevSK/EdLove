import React, { useEffect, ReactNode } from 'react';
import { posthogAnalytics } from '../engine/PostHogAnalytics.web';

interface Props {
    children: ReactNode;
    apiKey?: string;
    options?: {
        host?: string;
        debug?: boolean;
    };
}

import { ResonanceProvider } from '../context/ResonanceContext';

export function AnalyticsProvider({ children, apiKey, options }: Props) {
    useEffect(() => {
        if (apiKey) {
            posthogAnalytics.initialize(apiKey, options);
        }
    }, [apiKey, options]);

    return (
        <ResonanceProvider>
            {children}
        </ResonanceProvider>
    );
}

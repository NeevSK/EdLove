import React, { createContext, useContext, ReactNode } from 'react';
import { PostHogProvider as NativePostHogProvider } from 'posthog-react-native';

interface AnalyticsContextProps {
    track: (event: string, properties?: any) => void;
    identify: (userId: string, properties?: any) => void;
    screen: (name: string, properties?: any) => void;
    reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export function useAnalyticsContext() {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
    }
    return context;
}

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
    if (!apiKey || !enabled) {
        return (
            <ActivityPulseProvider>
                {children}
            </ActivityPulseProvider>
        );
    }

    return (
        <NativePostHogProvider
            apiKey={apiKey}
            options={{
                host: options?.host,
            }}
            autocapture={false}
        >
            <ActivityPulseProvider>
                {children}
            </ActivityPulseProvider>
        </NativePostHogProvider>
    );
}

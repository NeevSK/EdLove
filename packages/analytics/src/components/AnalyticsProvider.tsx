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
    options?: {
        host?: string;
        debug?: boolean;
    };
}

import { ResonanceProvider } from '../context/ResonanceContext';

export function AnalyticsProvider({ children, apiKey, options }: Props) {
    if (!apiKey) {
        return (
            <ResonanceProvider>
                {children}
            </ResonanceProvider>
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
            <ResonanceProvider>
                {children}
            </ResonanceProvider>
        </NativePostHogProvider>
    );
}

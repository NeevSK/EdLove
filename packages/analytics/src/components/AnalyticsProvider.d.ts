import { type ReactNode } from 'react';
interface AnalyticsContextProps {
    track: (event: string, properties?: any) => void;
    identify: (userId: string, properties?: any) => void;
    screen: (name: string, properties?: any) => void;
    reset: () => void;
}
export declare function useAnalyticsContext(): AnalyticsContextProps;
interface Props {
    children: ReactNode;
    apiKey?: string;
    enabled?: boolean;
    options?: {
        host?: string;
        debug?: boolean;
    };
}
export declare function AnalyticsProvider({ children, apiKey, enabled, options }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=AnalyticsProvider.d.ts.map
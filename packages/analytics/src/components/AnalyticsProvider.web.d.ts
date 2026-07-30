import { type ReactNode } from 'react';
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
//# sourceMappingURL=AnalyticsProvider.web.d.ts.map
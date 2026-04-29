import { type ReactNode } from 'react';
interface Props {
    children: ReactNode;
    apiKey?: string;
    options?: {
        host?: string;
        debug?: boolean;
    };
}
export declare function AnalyticsProvider({ children, apiKey, options }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AnalyticsProvider.web.d.ts.map
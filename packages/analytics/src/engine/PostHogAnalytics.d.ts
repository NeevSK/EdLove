import type { IAnalyticsPort } from '@repo/core';
/**
 * Universal PostHog Analytics Engine
 * Supports: Browser (posthog-js) and Server (posthog-node)
 */
export declare class PostHogAnalytics implements IAnalyticsPort {
    private instance;
    private isInitialized;
    private isBrowser;
    private isDisabled;
    initialize(apiKey: string, options?: {
        host?: string;
        debug?: boolean;
    }): Promise<void>;
    track(event: string, properties?: Record<string, any>): void;
    identify(userId: string, properties?: Record<string, any>): void;
    screen(name: string, properties?: Record<string, any>): void;
    reset(): void;
    capture(event: string, properties?: Record<string, any>): void;
    flush(): Promise<void>;
}
export declare const posthogAnalytics: PostHogAnalytics;
//# sourceMappingURL=PostHogAnalytics.d.ts.map
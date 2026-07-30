export declare class PostHogAnalytics {
    private isInitialized;
    private isDisabled;
    initialize(apiKey: string, options?: {
        host?: string;
        debug?: boolean;
    }): Promise<void>;
    track(event: string, properties?: Record<string, any>): void;
    capture(event: string, properties?: Record<string, any>): void;
    identify(userId: string, properties?: Record<string, any>): void;
    screen(screenName: string, properties?: Record<string, any>): void;
    reset(): void;
}
export declare const posthogAnalytics: PostHogAnalytics;
//# sourceMappingURL=PostHogAnalytics.web.d.ts.map
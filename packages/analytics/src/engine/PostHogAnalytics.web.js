import posthog from 'posthog-js';
export class PostHogAnalytics {
    isInitialized = false;
    isDisabled = process.env.EXPO_PUBLIC_POSTHOG_ENABLED === 'false';
    async initialize(apiKey, options) {
        if (this.isDisabled)
            return;
        if (this.isInitialized)
            return;
        if (!apiKey) {
            console.warn('[PostHog Web] Missing API key. Initialization skipped.');
            return;
        }
        try {
            posthog.init(apiKey, {
                api_host: options?.host || 'https://app.posthog.com',
                loaded: (ph) => {
                    this.isInitialized = true;
                    if (options?.debug) {
                        ph.debug();
                    }
                },
                autocapture: false,
                disable_session_recording: true, // Enable if needed later
            });
        }
        catch (error) {
            console.error('[PostHog Web] Initialization failed:', error);
        }
    }
    track(event, properties) {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            posthog.capture(event, properties);
        }
        catch (error) {
            console.error('[PostHog Web] track failed:', error);
        }
    }
    capture(event, properties) {
        this.track(event, properties);
    }
    identify(userId, properties) {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            posthog.identify(userId, properties);
        }
        catch (error) {
            console.error('[PostHog Web] identify failed:', error);
        }
    }
    screen(screenName, properties) {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            // In web, we treat screen as a pageview or custom event
            posthog.capture('$pageview', {
                screen_name: screenName,
                ...properties,
            });
        }
        catch (error) {
            console.error('[PostHog Web] screen failed:', error);
        }
    }
    reset() {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            posthog.reset();
        }
        catch (error) {
            console.error('[PostHog Web] reset failed:', error);
        }
    }
}
export const posthogAnalytics = new PostHogAnalytics();

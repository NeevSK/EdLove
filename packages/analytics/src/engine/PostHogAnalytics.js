import { sanitizeTelemetryData } from '@repo/core/monitoring';
import posthogWeb from 'posthog-js';
import { PostHog as PostHogNode } from 'posthog-node';
/**
 * Universal PostHog Analytics Engine
 * Supports: Browser (posthog-js) and Server (posthog-node)
 */
export class PostHogAnalytics {
    instance = null;
    isInitialized = false;
    isBrowser = typeof window !== 'undefined';
    isDisabled = process.env.EXPO_PUBLIC_POSTHOG_ENABLED === 'false';
    async initialize(apiKey, options) {
        if (this.isDisabled)
            return;
        if (this.isInitialized)
            return;
        const host = options?.host || 'https://eu.i.posthog.com';
        try {
            if (this.isBrowser) {
                posthogWeb.init(apiKey, {
                    api_host: host,
                    ui_host: 'https://eu.posthog.com',
                    autocapture: false,
                    disable_session_recording: false, // Default to true if not needed, but here we want replay
                    loaded: (ph) => {
                        if (options?.debug)
                            ph.debug();
                    },
                });
                this.instance = posthogWeb;
            }
            else {
                this.instance = new PostHogNode(apiKey, { host });
            }
            this.isInitialized = true;
        }
        catch (error) {
            console.error('[PostHog Universal] Initialization failed:', error);
        }
    }
    track(event, properties) {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            if (this.isBrowser) {
                this.instance.capture(event, sanitizeTelemetryData(properties));
            }
            else {
                this.instance.capture({
                    distinctId: properties?.distinctId || 'server_system',
                    event,
                    properties: sanitizeTelemetryData(properties),
                });
            }
        }
        catch (error) {
            console.error('[PostHog Universal] track failed:', error);
        }
    }
    identify(userId, properties) {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            if (this.isBrowser) {
                this.instance.identify(userId, sanitizeTelemetryData(properties));
            }
            else {
                this.instance.identify({
                    distinctId: userId,
                    properties: sanitizeTelemetryData(properties),
                });
            }
        }
        catch (error) {
            console.error('[PostHog Universal] identify failed:', error);
        }
    }
    screen(name, properties) {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            if (this.isBrowser) {
                // In posthog-js, screen is commonly implemented via capture with specific event name
                this.instance.capture('$screen', {
                    $screen_name: name,
                    ...sanitizeTelemetryData(properties),
                });
            }
            else {
                this.instance.capture({
                    distinctId: properties?.distinctId || 'server_system',
                    event: '$screen',
                    properties: {
                        $screen_name: name,
                        ...sanitizeTelemetryData(properties),
                    },
                });
            }
        }
        catch (error) {
            console.error('[PostHog Universal] screen failed:', error);
        }
    }
    reset() {
        if (this.isDisabled || !this.isInitialized)
            return;
        try {
            if (this.isBrowser) {
                this.instance.reset();
            }
        }
        catch (error) {
            console.error('[PostHog Universal] reset failed:', error);
        }
    }
    capture(event, properties) {
        this.track(event, properties);
    }
    // Compatibility with IPostHog
    async flush() {
        if (this.isDisabled)
            return;
        if (!this.isBrowser && this.instance?.shutdown) {
            await this.instance.shutdown();
        }
    }
}
export const posthogAnalytics = new PostHogAnalytics();

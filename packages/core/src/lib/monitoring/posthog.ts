import { PostHog } from 'posthog-react-native';

let posthogInstance: PostHog | null = null;

/**
 * Initializes PostHog for product analytics.
 */
export const initPostHog = async () => {
    if (posthogInstance) return posthogInstance;

    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    if (!apiKey) {
        console.warn('[PostHog] API Key missing');
        return null;
    }

    try {
        const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
        if (__DEV__) {
            console.log(`[PostHog] Initializing with key: ${apiKey.substring(0, 8)}... on host: ${host}`);
        }
        posthogInstance = new PostHog(apiKey, { host });
        return posthogInstance;
    } catch (error) {
        console.error('[PostHog] Initialization failed:', error);
        return null;
    }
};

/**
 * Tracks a custom event.
 */
export const trackEvent = (eventName: string, properties?: any) => {
    if (__DEV__) {
        console.log(`[PostHog Track] ${eventName}`, properties);
    }

    if (posthogInstance) {
        posthogInstance.capture(eventName, properties);
    }
};

/**
 * Identifies the current user.
 */
export const identifyUser = (userId: string, properties?: any) => {
    if (__DEV__) {
        console.log(`[PostHog Identify] ${userId}`, properties);
    }

    if (posthogInstance) {
        posthogInstance.identify(userId, properties);
    }
};

/**
 * Resets the current user session.
 */
export const resetUser = () => {
    if (posthogInstance) {
        posthogInstance.reset();
    }
};

import * as NativeSentry from '@sentry/react-native';
import { Platform } from 'react-native';

type BrowserSentryModule = typeof import('@sentry/browser');

let browserSentryPromise: Promise<BrowserSentryModule | null> | null = null;
let sentryInitialized = false;

function getSentryEnvironment() {
    return process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production';
}

function getSentryRelease() {
    return process.env.EXPO_PUBLIC_SENTRY_RELEASE || process.env.npm_package_version || undefined;
}

async function getBrowserSentry(): Promise<BrowserSentryModule | null> {
    if (Platform.OS !== 'web') return null;
    if (!browserSentryPromise) {
        browserSentryPromise = import('@sentry/browser').catch((error) => {
            console.error('[Sentry] Failed to load browser SDK:', error);
            return null;
        });
    }
    return browserSentryPromise;
}

/**
 * Initializes Sentry for the mobile application.
 */
export const initSentry = () => {
    if (sentryInitialized) return;
    if (__DEV__) {
        console.log('[Sentry Mock] Initialization skipped in development');
        return;
    }

    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (!dsn) {
        console.warn('[Sentry] DSN missing');
        return;
    }

    if (Platform.OS === 'web') {
        void getBrowserSentry().then((BrowserSentry) => {
            if (!BrowserSentry || sentryInitialized) return;
            BrowserSentry.init({
                dsn,
                environment: getSentryEnvironment(),
                release: getSentryRelease(),
                debug: false,
                sendDefaultPii: false,
                initialScope: {
                    tags: {
                        app_platform: 'web',
                        app_name: 'gurudevi-mobile',
                    },
                },
            });
            sentryInitialized = true;
        });
        return;
    }

    NativeSentry.init({
        dsn,
        enableAutoSessionTracking: true,
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
        debug: false,
    });
    sentryInitialized = true;
};

/**
 * Captures an exception and logs it to Sentry.
 */
export const captureException = (error: any, context?: any) => {
    console.error(error);
    if (__DEV__) {
        return;
    }

    if (Platform.OS === 'web') {
        void getBrowserSentry().then((BrowserSentry) => {
            BrowserSentry?.captureException(error, { extra: context });
        });
        return;
    }

    NativeSentry.captureException(error, { extra: context });
};

/**
 * Adds a breadcrumb to the current Sentry session.
 */
export const logBreadcrumb = (message: string, category?: string, data?: any) => {
    if (__DEV__) {
        console.log(`[Sentry Breadcrumb] ${category}: ${message}`, data);
        return;
    }

    if (Platform.OS === 'web') {
        void getBrowserSentry().then((BrowserSentry) => {
            BrowserSentry?.addBreadcrumb({
                message,
                category,
                data,
                level: 'info',
            });
        });
        return;
    }

    NativeSentry.addBreadcrumb({
        message,
        category,
        data,
    });
};

export const setSentryUser = (user: {
    id: string;
    email?: string | null;
    username?: string | null;
}) => {
    if (__DEV__) {
        return;
    }

    const sentryUser = {
        id: user.id,
        email: user.email ?? undefined,
        username: user.username ?? undefined,
    };

    if (Platform.OS === 'web') {
        void getBrowserSentry().then((BrowserSentry) => {
            BrowserSentry?.setUser(sentryUser);
        });
        return;
    }

    NativeSentry.setUser(sentryUser);
};

export const clearSentryUser = () => {
    if (__DEV__) {
        return;
    }

    if (Platform.OS === 'web') {
        void getBrowserSentry().then((BrowserSentry) => {
            BrowserSentry?.setUser(null);
        });
        return;
    }

    NativeSentry.setUser(null);
};

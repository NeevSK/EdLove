import * as Sentry from '@sentry/react-native';

/**
 * Initializes Sentry for the mobile application.
 */
export const initSentry = () => {
    if (__DEV__) {
        console.log('[Sentry Mock] Initialization skipped in development');
        return;
    }

    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (!dsn) {
        console.warn('[Sentry] DSN missing');
        return;
    }

    Sentry.init({
        dsn,
        enableAutoSessionTracking: true,
        debug: false,
    });
};

/**
 * Captures an exception and logs it to Sentry.
 */
export const captureException = (error: any, context?: any) => {
    console.error(error);
    if (!__DEV__) {
        Sentry.captureException(error, { extra: context });
    }
};

/**
 * Adds a breadcrumb to the current Sentry session.
 */
export const logBreadcrumb = (message: string, category?: string, data?: any) => {
    if (__DEV__) {
        console.log(`[Sentry Breadcrumb] ${category}: ${message}`, data);
    } else {
        Sentry.addBreadcrumb({
            message,
            category,
            data,
        });
    }
};

/**
 * Global error handlers — unhandled Promise rejections.
 *
 * Import this module once at app root (_layout.tsx) to capture errors
 * that escape React's ErrorBoundary (async failures, network errors).
 */
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';

/**
 * Install global error handlers. Call once at app root.
 */
export function installGlobalErrorHandlers() {
  if (Platform.OS !== 'web') return;

  // Unhandled Promise rejections (the #1 source of silent production crashes)
  globalThis.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;

    console.error('[Global] Unhandled Promise rejection:', message);

    leaveBreadcrumb('promise', `Unhandled rejection: ${message}`, 'error', {
      stack,
    });

    Sentry.captureException(reason instanceof Error ? reason : new Error(message), {
      mechanism: { type: 'unhandled Promise rejection', handled: false },
    });
  });

  // Global JS errors (catches things like TypeError, ReferenceError outside React)
  globalThis.addEventListener('error', (event) => {
    const message = event.message || 'Unknown error';
    console.error('[Global] Uncaught error:', message);

    leaveBreadcrumb('global', `Uncaught: ${message}`, 'error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    Sentry.captureException(new Error(message), {
      mechanism: { type: 'global error', handled: false },
    });
  });
}

/**
 * Global error handlers — unhandled Promise rejections.
 *
 * Import this module once at app root (_layout.tsx) to capture errors
 * that escape React's ErrorBoundary (async failures, network errors).
 */

import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

import { recordDevError } from './devErrorPipeline';

/**
 * Install global error handlers. Call once at app root.
 */
export function installGlobalErrorHandlers() {
  if (Platform.OS === 'web') {
    // Unhandled Promise rejections (the #1 source of silent production crashes)
    globalThis.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;

      console.error('[Global] Unhandled Promise rejection:', message);

      recordDevError({
        message: `Unhandled rejection: ${message}`,
        stack,
        source: 'promise',
      });

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

      recordDevError({
        message,
        source: 'errorUtils',
      });

      leaveBreadcrumb('global', `Uncaught: ${message}`, 'error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });

      Sentry.captureException(new Error(message), {
        mechanism: { type: 'global error', handled: false },
      });
    });
    return;
  }

  // Native (Android / iOS) global error handler via React Native's ErrorUtils
  const globalAny = globalThis as unknown as {
    ErrorUtils?: {
      getGlobalHandler: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
      setGlobalHandler: (handler: (error: unknown, isFatal?: boolean) => void) => void;
    };
  };

  if (globalAny.ErrorUtils) {
    const defaultHandler = globalAny.ErrorUtils.getGlobalHandler();
    globalAny.ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      recordDevError({
        message,
        stack,
        source: 'errorUtils',
        isFatal,
      });

      console.warn('[Global Native Error]', { message, isFatal, stack });

      leaveBreadcrumb('native', `Global error: ${message}`, 'error', {
        isFatal,
        stack,
      });

      Sentry.captureException(error instanceof Error ? error : new Error(message), {
        mechanism: { type: 'ErrorUtils.setGlobalHandler', handled: !isFatal },
      });

      defaultHandler?.(error, isFatal);
    });
  }
}

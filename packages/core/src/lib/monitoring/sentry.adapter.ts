/**
 * Telemetry Gateway
 *
 * Provides a platform-agnostic interface for exception reporting and breadcrumbs.
 * Delegates to TelemetrySink via the Adapter pattern.
 */

import { telemetrySink } from '@repo/core/platform/drivers/telemetrySink';
import { sanitizeTelemetryData } from './safeData';

export const initSentry = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  telemetrySink.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || 'production',
    release: process.env.EXPO_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: 0.5,
    profilesSampleRate: 0.5,
    enableTracing: true,
  });
};

export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  telemetrySink.captureException(error, sanitizeTelemetryData(context));
};

export const logBreadcrumb = (
  message: string,
  category?: string,
  data?: Record<string, unknown>,
) => {
  telemetrySink.addBreadcrumb({ message, category, data: sanitizeTelemetryData(data) });
};

export const setSentryUser = (user: {
  id: string;
  email?: string | null;
  username?: string | null;
}) => {
  telemetrySink.setUser({
    id: user.id,
  });
};

export const clearSentryUser = () => {
  telemetrySink.setUser(null);
};

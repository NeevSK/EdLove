/**
 * Telemetry Gateway
 *
 * Provides a platform-agnostic interface for exception reporting and breadcrumbs.
 * Delegates to TelemetryManager via the Adapter pattern.
 */

import { sanitizeTelemetryData } from '@repo/core/lib/monitoring/safeData';
import { telemetry } from '@repo/core/logic/managers/TelemetryManager';

export const initSentry = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  telemetry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || 'production',
    release: process.env.EXPO_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    enableTracing: true,
  });
};

export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  telemetry.captureException(error, sanitizeTelemetryData(context));
};

export const logBreadcrumb = (
  message: string,
  category?: string,
  data?: Record<string, unknown>,
) => {
  telemetry.addBreadcrumb({ message, category, data: sanitizeTelemetryData(data) });
};

export const setSentryUser = (user: {
  id: string;
  email?: string | null;
  username?: string | null;
}) => {
  telemetry.setUser({
    id: user.id,
  });
};

export const clearSentryUser = () => {
  telemetry.setUser(null);
};

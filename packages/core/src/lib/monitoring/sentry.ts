/**
 * Telemetry Gateway
 *
 * Provides a platform-agnostic interface for exception reporting and breadcrumbs.
 * Delegates to TelemetryManager via the Adapter pattern.
 */
import { telemetry } from '@/logic/managers/TelemetryManager';

export const initSentry = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  telemetry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || 'production',
    release: process.env.EXPO_PUBLIC_SENTRY_RELEASE,
  });
};

export const captureException = (error: any, context?: any) => {
  telemetry.captureException(error, context);
};

export const logBreadcrumb = (message: string, category?: string, data?: any) => {
  telemetry.addBreadcrumb({ message, category, data });
};

export const setSentryUser = (user: {
  id: string;
  email?: string | null;
  username?: string | null;
}) => {
  telemetry.setUser({
    id: user.id,
    email: user.email ?? undefined,
    username: user.username ?? undefined,
  });
};

export const clearSentryUser = () => {
  telemetry.setUser(null);
};

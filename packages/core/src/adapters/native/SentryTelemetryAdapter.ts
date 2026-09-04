import type { ITelemetry } from '@repo/core/logic/interfaces/telemetry.port';
import { sanitizeTelemetryData } from '@repo/core/monitoring';
import * as NativeSentry from '@sentry/react-native';

export class SentryTelemetryAdapter implements ITelemetry {
  init(options: {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
  }) {
    NativeSentry.init({
      dsn: options.dsn,
      environment: options.environment,
      release: options.release,
      enableAutoSessionTracking: true,
      sendDefaultPii: false,
      tracesSampleRate: options.tracesSampleRate ?? 0.1,
      profilesSampleRate: options.profilesSampleRate ?? 0.1,
    });
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    NativeSentry.captureException(error, { extra: sanitizeTelemetryData(context) });
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    data?: Record<string, unknown>;
  }) {
    NativeSentry.addBreadcrumb({
      ...breadcrumb,
      data: sanitizeTelemetryData(breadcrumb.data),
    });
  }

  setUser(user: { id: string; email?: string; username?: string } | null) {
    NativeSentry.setUser(user ? { id: user.id } : null);
  }
}

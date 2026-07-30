import * as NativeSentry from '@sentry/react-native';
import type { ITelemetry } from '@repo/core/logic/interfaces/telemetry.port';
import { sanitizeTelemetryData } from '@repo/core/lib/monitoring/safeData';

export class SentryTelemetryAdapter implements ITelemetry {
  init(options: { dsn: string; environment: string; release?: string }) {
    NativeSentry.init({
      dsn: options.dsn,
      environment: options.environment,
      release: options.release,
      enableAutoSessionTracking: true,
      sendDefaultPii: false,
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

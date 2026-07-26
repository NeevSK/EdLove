import * as NativeSentry from '@sentry/react-native';
import type { ITelemetry } from '@/logic/interfaces/telemetry.port';

export class SentryTelemetryAdapter implements ITelemetry {
  init(options: { dsn: string; environment: string; release?: string }) {
    NativeSentry.init({
      dsn: options.dsn,
      environment: options.environment,
      release: options.release,
      enableAutoSessionTracking: true,
    });
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    NativeSentry.captureException(error, { extra: context });
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    data?: Record<string, unknown>;
  }) {
    NativeSentry.addBreadcrumb(breadcrumb);
  }

  setUser(user: { id: string; email?: string; username?: string } | null) {
    NativeSentry.setUser(user);
  }
}

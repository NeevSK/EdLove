import { sanitizeTelemetryData } from '@repo/core/lib/monitoring/safeData';
import type { ITelemetry } from '@repo/core/logic/interfaces/telemetry.port';
import * as BrowserSentry from '@sentry/browser';

type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export class BrowserSentryTelemetryAdapter implements ITelemetry {
  init(options: {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
  }) {
    BrowserSentry.init({
      dsn: options.dsn,
      environment: options.environment,
      release: options.release,
      sendDefaultPii: false,
      tracesSampleRate: options.tracesSampleRate ?? 0.1,
      profilesSampleRate: options.profilesSampleRate ?? 0.1,
    });
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    BrowserSentry.captureException(error, { extra: sanitizeTelemetryData(context) });
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    data?: Record<string, unknown>;
    level?: string;
  }) {
    BrowserSentry.addBreadcrumb({
      ...breadcrumb,
      level: breadcrumb.level as SentryLevel | undefined,
      data: sanitizeTelemetryData(breadcrumb.data),
    });
  }

  setUser(user: { id: string; email?: string; username?: string } | null) {
    BrowserSentry.setUser(user ? { id: user.id } : null);
  }
}

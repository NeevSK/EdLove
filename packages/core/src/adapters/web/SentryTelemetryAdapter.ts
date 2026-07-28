import * as BrowserSentry from '@sentry/browser';
import type { ITelemetry } from '@/logic/interfaces/telemetry.port';
import { sanitizeTelemetryData } from '@/lib/monitoring/safeData';

type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export class BrowserSentryTelemetryAdapter implements ITelemetry {
  init(options: { dsn: string; environment: string; release?: string }) {
    BrowserSentry.init({
      dsn: options.dsn,
      environment: options.environment,
      release: options.release,
      sendDefaultPii: false,
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

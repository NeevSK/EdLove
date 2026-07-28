import type { ITelemetry } from '@/logic/interfaces/telemetry.port';

class TelemetryManager implements ITelemetry {
  private adapter: ITelemetry | null = null;

  registerAdapter(adapter: ITelemetry) {
    this.adapter = adapter;
  }

  private getAdapter(): ITelemetry {
    if (!this.adapter) {
      // Fallback to a mock in dev/test
      return {
        init: () => {},
        captureException: (e) => console.error('[Telemetry Mock]', e),
        addBreadcrumb: (b) => console.log('[Telemetry Breadcrumb]', b),
        setUser: () => {},
      };
    }
    return this.adapter;
  }

  init(options: { dsn: string; environment: string; release?: string }) {
    this.getAdapter().init(options);
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    this.getAdapter().captureException(error, context);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    data?: Record<string, unknown>;
    level?: string;
  }) {
    this.getAdapter().addBreadcrumb(breadcrumb);
  }

  setUser(user: { id: string; email?: string; username?: string } | null) {
    this.getAdapter().setUser(user);
  }
}

export const telemetry = new TelemetryManager();

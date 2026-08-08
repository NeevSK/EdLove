/**
 * ITelemetry Port
 * Defines the contract for error reporting and usage analytics.
 */
export interface ITelemetry {
  init: (options: {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
    enableTracing?: boolean;
  }) => void;
  captureException: (error: unknown, context?: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    data?: Record<string, unknown>;
    level?: string;
  }) => void;
  setUser: (user: { id: string; email?: string; username?: string } | null) => void;
}

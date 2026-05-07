/**
 * ITelemetry Port
 * Defines the contract for error reporting and usage analytics.
 */
export interface ITelemetry {
  init: (options: { dsn: string; environment: string; release?: string }) => void;
  captureException: (error: any, context?: any) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    data?: any;
    level?: string;
  }) => void;
  setUser: (user: { id: string; email?: string; username?: string } | null) => void;
}

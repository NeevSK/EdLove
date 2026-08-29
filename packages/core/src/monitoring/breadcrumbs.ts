/**
 * State-change breadcrumbs for error context.
 *
 * Lightweight ring buffer that captures key state transitions.
 * When an error occurs, the last N breadcrumbs provide context
 * for what happened before the crash.
 *
 * Usage:
 *   import { leaveBreadcrumb, getBreadcrumbs } from '@repo/core/monitoring/breadcrumbs';
 *
 *   leaveBreadcrumb('auth', 'user logged in', 'info', { userId: '123' });
 *   // In error handler:
 *   Sentry.setExtra('breadcrumbs', getBreadcrumbs());
 */

export type Breadcrumb = {
  timestamp: number;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
};

const MAX_BREADCRUMBS = 50;
const breadcrumbs: Breadcrumb[] = [];

/**
 * Log a state-change breadcrumb. Captures context for the next error.
 */
export function leaveBreadcrumb(
  category: string,
  message: string,
  level: Breadcrumb['level'] = 'info',
  data?: Record<string, unknown>,
) {
  const entry: Breadcrumb = {
    timestamp: Date.now(),
    category,
    message,
    level,
    data,
  };
  breadcrumbs.push(entry);
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

/**
 * Get the last N breadcrumbs (for error reporting).
 */
export function getBreadcrumbs(count = 20): Breadcrumb[] {
  return breadcrumbs.slice(-count);
}

/**
 * Clear breadcrumbs (e.g., on logout).
 */
export function clearBreadcrumbs() {
  breadcrumbs.length = 0;
}

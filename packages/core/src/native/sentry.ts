/**
 * Compatibility re-export for older native imports.
 * Production callers must use the platform-neutral monitoring gateway.
 */
export {
  captureException,
  clearSentryUser,
  initSentry,
  logBreadcrumb,
  setSentryUser,
} from '@repo/core/monitoring';

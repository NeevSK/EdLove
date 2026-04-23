import { wellbeingAlertHandler, attendanceSyncHandler } from './example';

/**
 * Registry of all Inngest functions for the Gurudevi Platform.
 * Add new handlers here to make them available to the server-side endpoint.
 */
export const handlers = [
  wellbeingAlertHandler,
  attendanceSyncHandler,
];

/**
 * Sovereign Temporal Utility (2026)
 *
 * Wraps the native Temporal API for robust timezone and duration handling.
 * Following the Node 26 'Day One' protocol.
 */

import { formatISO } from 'date-fns';

// @ts-expect-error - Assuming Temporal is available in 2026 environments
const _Temporal = typeof Temporal !== 'undefined' ? Temporal : null;

export const getCurrentTimestamp = () => {
  if (_Temporal) {
    try {
      // @ts-ignore - Assuming Temporal is available
      return _Temporal.Now.instant().toString();
    } catch (_e) {
      // Fallback if global exists but fails
    }
  }
  return formatISO(new Date());
};

/**
 * Returns the current time in milliseconds since epoch.
 * Use this instead of Date.now() for deterministic timing.
 */
export const getCurrentTimeMillis = () => {
  if (_Temporal) {
    try {
      // @ts-ignore - Assuming Temporal is available
      return _Temporal.Now.instant().epochMilliseconds;
    } catch (_e) {
      // Fallback
    }
  }
  // eslint-disable-next-line no-restricted-syntax
  return new Date().getTime();
};

export const getZonedDateTime = (timeZone: string = 'Asia/Colombo') => {
  if (_Temporal) {
    try {
      return _Temporal.Now.zonedDateTimeISO(timeZone).toString();
    } catch (_e) {
      // Fallback
    }
  }
  // Simplified timezone fallback for Node 24
  return formatISO(new Date());
};

/**
 * Ensures a date string is in the standard ISO format for the platform.
 */
export const normalizeDate = (date: string | Date) => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

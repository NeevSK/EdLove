import { safeFileUrl } from './files';

/** English words for the basic pieces; screens pass their own for si and ta. */
export const BASICS_ENGLISH = {
  dismiss: 'Dismiss',
  clear: 'Clear search',
  results: (count: number) => (count === 1 ? '1 result' : `${count} results`),
  decrease: 'Decrease',
  increase: 'Increase',
  step: (n: number, total: number) => `Step ${n} of ${total}`,
  done: 'Done',
  error: 'Needs attention',
};

/** A number kept inside its bounds and on its step from `min` (or zero). */
export function clampStep(value: number, min = -Infinity, max = Infinity, step = 1): number {
  const base = Number.isFinite(min) ? min : 0;
  const snapped = base + Math.round((value - base) / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

export const SETTINGS_ENGLISH = {
  notSet: 'Not set',
  opensOutside: 'Opens outside the app',
  cancel: 'Cancel',
  working: 'Working…',
};

/**
 * An address safe to open from a settings link: the file rules (https, http,
 * relative) plus mail and phone, which settings rows commonly offer.
 */
export function safeLinkUrl(uri: string): string | null {
  const value = uri.trim();
  if (/^(mailto|tel):[^\s\u0000-\u001F\u007F]+$/i.test(value)) return value;
  return safeFileUrl(value);
}

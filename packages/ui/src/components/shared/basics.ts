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

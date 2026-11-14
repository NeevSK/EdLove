/** Value maths both sliders share, so they snap and clamp the same way. */

export interface Range {
  min: number;
  max: number;
  step: number;
}

/** Clamp to the range and snap to the nearest step from `min`. */
export function snap(value: number, { min, max, step }: Range): number {
  'worklet';
  const clamped = Math.min(max, Math.max(min, value));
  if (step <= 0) return clamped;
  const snapped = min + Math.round((clamped - min) / step) * step;
  // Undo floating drift (0.1 + 0.2) to the step's own precision.
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Math.min(max, Number(snapped.toFixed(decimals)));
}

/** Where a value sits along the track, 0 to 1. */
export function fraction(value: number, { min, max }: Range): number {
  'worklet';
  return max === min ? 0 : (Math.min(max, Math.max(min, value)) - min) / (max - min);
}

/** The value at a point `x` along a track `width` long. */
export function valueAt(x: number, width: number, range: Range): number {
  'worklet';
  const f = width > 0 ? Math.min(1, Math.max(0, x / width)) : 0;
  return snap(range.min + f * (range.max - range.min), range);
}

/**
 * Shapes for the kit's small charts, worked out once for native and web. A
 * small chart is read at a glance, so it has no axes or labels of its own; the
 * words beside it (its `summary`) carry the numbers.
 */

export interface MiniChartShape {
  /** SVG path for a line chart, in a box of `width` by `height`. */
  line: string;
  /** Bars as rectangles, bottom-aligned. */
  bars: { x: number; y: number; w: number; h: number }[];
  /** The marked point, centre of its dot (line) or bar top. */
  mark: { x: number; y: number } | null;
}

const PAD = 2;

export function miniChartShape(
  values: readonly number[],
  width: number,
  height: number,
  options: { mark?: number; range?: [number, number] } = {},
): MiniChartShape {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0 || width <= 0 || height <= 0) return { line: '', bars: [], mark: null };
  const lo = options.range?.[0] ?? Math.min(...finite);
  const hi = options.range?.[1] ?? Math.max(...finite);
  const span = hi - lo || 1;
  const innerH = height - PAD * 2;
  const yOf = (v: number) => PAD + innerH - ((Math.min(hi, Math.max(lo, v)) - lo) / span) * innerH;
  const n = values.length;
  const markAt = options.mark ?? n - 1;

  const step = n > 1 ? (width - PAD * 2) / (n - 1) : 0;
  const xOf = (i: number) => (n > 1 ? PAD + i * step : width / 2);
  const round = (x: number) => Math.round(x * 10) / 10;
  const line = values
    .map((v, i) =>
      Number.isFinite(v) ? `${i === 0 ? 'M' : 'L'}${round(xOf(i))} ${round(yOf(v))}` : '',
    )
    .filter(Boolean)
    .join(' ')
    .replace(/^L/, 'M');

  const slot = width / n;
  const barW = Math.max(2, slot * 0.64);
  const base = height - PAD;
  const bars = values.map((v, i) => {
    const top = Number.isFinite(v) ? yOf(v) : base;
    // A zero still shows a sliver, so "nothing" reads as a value, not a gap.
    const h = Math.max(1, base - top);
    return {
      x: round(i * slot + (slot - barW) / 2),
      y: round(base - h),
      w: round(barW),
      h: round(h),
    };
  });

  const mv = values[markAt];
  const mark =
    mv !== undefined && Number.isFinite(mv) ? { x: round(xOf(markAt)), y: round(yOf(mv)) } : null;
  return { line, bars, mark };
}

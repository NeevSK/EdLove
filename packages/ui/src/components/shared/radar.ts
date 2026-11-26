import type { RadarAxis, RadarSeries } from '../../theme/contracts';

/**
 * Geometry and words for the radar, shared by both platforms so they draw and describe the same
 * thing. Fewer than three axes don't make a shape, so the caller shows the description as a list
 * instead (the chart's smallest gear).
 */

export interface RadarVertex {
  readonly axisId: string;
  readonly x: number;
  readonly y: number;
}

export interface RadarGeometry {
  readonly size: number;
  readonly center: number;
  readonly radius: number;
  readonly rings: readonly string[];
  readonly spokes: readonly { readonly axisId: string; readonly x: number; readonly y: number }[];
  readonly labels: readonly {
    readonly axisId: string;
    readonly text: string;
    readonly x: number;
    readonly y: number;
    readonly anchor: 'start' | 'middle' | 'end';
  }[];
  readonly shapes: readonly {
    readonly seriesId: string;
    readonly emphasis: 'now' | 'then';
    readonly points: string;
    readonly vertices: readonly RadarVertex[];
  }[];
}

export const MIN_RADAR_AXES = 3;
const RING_STEPS = [0.25, 0.5, 0.75, 1];

const clamp01 = (v: number | undefined) =>
  v === undefined || Number.isNaN(v) ? 0 : Math.min(1, Math.max(0, v));
const round = (v: number) => Math.round(v * 10) / 10;

export function radarGeometry(
  axes: readonly RadarAxis[],
  series: readonly RadarSeries[],
  size: number,
): RadarGeometry | null {
  if (axes.length < MIN_RADAR_AXES) return null;
  const center = size / 2;
  // Room around the shape for labels.
  const radius = size * 0.34;
  const angleOf = (i: number) => (i / axes.length) * Math.PI * 2 - Math.PI / 2;
  const at = (i: number, r: number) => ({
    x: round(center + Math.cos(angleOf(i)) * r),
    y: round(center + Math.sin(angleOf(i)) * r),
  });
  const polygon = (r: (i: number) => number) =>
    axes
      .map((_, i) => at(i, r(i)))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');

  // `then` first, so `now` is drawn on top.
  const ordered = [...series].sort(
    (a, b) => (a.emphasis === 'then' ? -1 : 0) - (b.emphasis === 'then' ? -1 : 0),
  );
  return {
    size,
    center,
    radius,
    rings: RING_STEPS.map((step) => polygon(() => radius * step)),
    spokes: axes.map((axis, i) => ({ axisId: axis.id, ...at(i, radius) })),
    labels: axes.map((axis, i) => {
      const p = at(i, radius + size * 0.08);
      const dx = p.x - center;
      const anchor = Math.abs(dx) < size * 0.02 ? 'middle' : dx > 0 ? 'start' : 'end';
      return { axisId: axis.id, text: axis.label, x: p.x, y: p.y, anchor };
    }),
    shapes: ordered.map((s) => {
      const vertices = axes.map((axis, i) => ({
        axisId: axis.id,
        ...at(i, radius * clamp01(s.values[axis.id])),
      }));
      return {
        seriesId: s.id,
        emphasis: s.emphasis ?? 'now',
        points: vertices.map((v) => `${v.x},${v.y}`).join(' '),
        vertices,
      };
    }),
  };
}

/**
 * What the chart says, axis by axis, for screen readers and for the list shown when there are
 * too few axes: "Maths: Now 60%, Start of term 40%".
 */
export function describeRadar(
  axes: readonly RadarAxis[],
  series: readonly RadarSeries[],
  missingLabel: string,
): readonly string[] {
  return axes.map((axis) => {
    const parts = series.map((s) => {
      const v = s.values[axis.id];
      return `${s.label} ${v === undefined ? missingLabel : `${Math.round(clamp01(v) * 100)}%`}`;
    });
    return `${axis.label}: ${parts.join(', ')}`;
  });
}

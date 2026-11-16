import type { RadarAxis, RadarObservation } from '../../theme/contracts';

export interface RadarPoint { x: number; y: number }
export interface ProjectedRadarAxis extends RadarAxis {
  index: number;
  normalized: number | null;
  point: RadarPoint | null;
  end: RadarPoint;
  labelPoint: RadarPoint;
}
export type RadarProjection =
  | { kind: 'invalid'; reason: 'invalid-metadata' | 'duplicate-axis' | 'invalid-range' | 'invalid-value' }
  | {
      kind: 'ready';
      observation: RadarObservation;
      axes: ProjectedRadarAxis[];
      center: RadarPoint;
      radius: number;
      viewBox: string;
      edges: { from: RadarPoint; to: RadarPoint }[];
      complete: boolean;
      polygonPoints: string | null;
      plot: boolean;
    };

const present = (value: string) => typeof value === 'string' && value.trim().length > 0;

/** Geometry only. The legacy graphics layout substitutes samples for absent data. */
export function projectRadar(observation: RadarObservation): RadarProjection {
  if (!present(observation.subject.id) || !present(observation.subject.label) ||
      !present(observation.measure.id) || !present(observation.measure.label) ||
      !present(observation.measure.version) || !present(observation.perspective.id) ||
      !present(observation.perspective.label) || !present(observation.sourceLabel) ||
      !['self', 'observer'].includes(observation.perspective.kind) ||
      typeof observation.synthetic !== 'boolean' || typeof observation.stale !== 'boolean' ||
      (observation.observedAt !== undefined && !present(observation.observedAt)))
    return { kind: 'invalid', reason: 'invalid-metadata' };
  if (new Set(observation.axes.map((axis) => axis.id)).size !== observation.axes.length)
    return { kind: 'invalid', reason: 'duplicate-axis' };
  for (const axis of observation.axes) {
    if (!present(axis.id) || !present(axis.label) || (axis.unit !== undefined && !present(axis.unit)))
      return { kind: 'invalid', reason: 'invalid-metadata' };
    if (!Number.isFinite(axis.min) || !Number.isFinite(axis.max) || axis.min >= axis.max || !Number.isFinite(axis.max - axis.min))
      return { kind: 'invalid', reason: 'invalid-range' };
    if (axis.value !== null && (!Number.isFinite(axis.value) || axis.value < axis.min || axis.value > axis.max))
      return { kind: 'invalid', reason: 'invalid-value' };
  }
  const center = { x: 50, y: 50 };
  const radius = 32;
  const axes = observation.axes.map((axis, index): ProjectedRadarAxis => {
    const angle = (index * 2 * Math.PI) / observation.axes.length - Math.PI / 2;
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const at = (distance: number): RadarPoint => ({ x: center.x + direction.x * distance, y: center.y + direction.y * distance });
    const normalized = axis.value === null ? null : (axis.value - axis.min) / (axis.max - axis.min);
    return { ...axis, index, normalized, point: normalized === null ? null : at(radius * normalized), end: at(radius), labelPoint: at(43) };
  });
  const plot = axes.length >= 3 && observation.plotPolicy === 'declared-comparable';
  const complete = plot && axes.every((axis) => axis.point !== null);
  const edges: { from: RadarPoint; to: RadarPoint }[] = [];
  if (plot) axes.forEach((axis, index) => {
    const following = axes[(index + 1) % axes.length];
    if (axis.point && following?.point) edges.push({ from: axis.point, to: following.point });
  });
  const polygonPoints = complete ? axes.map((axis) => axis.point ? `${axis.point.x},${axis.point.y}` : '').join(' ') : null;
  return { kind: 'ready', observation, axes, center, radius, viewBox: '0 0 100 100', edges, complete, polygonPoints, plot };
}


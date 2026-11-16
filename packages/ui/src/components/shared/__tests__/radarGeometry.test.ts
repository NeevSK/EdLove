import { describe, expect, it } from 'vitest';
import type { RadarObservation } from '../../../theme/contracts';
import { projectRadar } from '../radarGeometry';
import { contrastRatio } from '../../../theme/color';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';

const sample: RadarObservation = {
  subject: { id: 'person-a', label: 'Person A' },
  measure: { id: 'measure-a', label: 'Measure A', version: 'v1' },
  perspective: { id: 'self-a', label: 'Self', kind: 'self' },
  sourceLabel: 'Example', synthetic: true, stale: false, plotPolicy: 'declared-comparable',
  axes: [
    { id: 'minimum', label: 'Minimum', min: -10, max: 10, value: -10, unit: 'units' },
    { id: 'middle', label: 'Middle', min: -10, max: 10, value: 0 },
    { id: 'maximum', label: 'Maximum', min: -10, max: 10, value: 10 },
    { id: 'missing', label: 'Missing', min: 0, max: 5, value: null },
  ],
};

describe('radar geometry', () => {
  it('keeps radar marks visible on raised surfaces in every world and mode', () => {
    for (const world of WORLD_IDS) for (const mode of ['light', 'dark'] as const) for (const phase of ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'] as const) {
      const resolved = resolveWorld(world, phase, mode);
      const background = resolved.recipes.surface.raised.fill ?? resolved.tokens.ground;
      for (const color of [resolved.recipes.radar.grid, resolved.recipes.radar.stroke, resolved.recipes.radar.point])
        expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(3);
    }
  });
  it('normalizes each scale and keeps unknown separate from numeric zero', () => {
    const result = projectRadar(sample);
    expect(result.kind).toBe('ready');
    if (result.kind !== 'ready') return;
    expect(result.axes.map((axis) => axis.normalized)).toEqual([0, 0.5, 1, null]);
    expect(result.axes[0]?.point).toEqual(result.center);
    expect(result.axes[3]?.point).toBeNull();
    expect(result.axes[0]?.unit).toBe('units');
    expect(result.observation.subject).toEqual({ id: 'person-a', label: 'Person A' });
    expect(result.observation.measure).toEqual({ id: 'measure-a', label: 'Measure A', version: 'v1' });
    expect(result.complete).toBe(false);
    expect(result.polygonPoints).toBeNull();
    expect(result.edges).toHaveLength(2);
  });
  it('closes only a complete polygon and never invents a third axis', () => {
    const full = projectRadar({ ...sample, axes: sample.axes.slice(0, 3) });
    expect(full.kind).toBe('ready');
    if (full.kind !== 'ready') return;
    expect(full.complete).toBe(true);
    expect(full.edges).toHaveLength(3);
    expect(full.polygonPoints?.split(' ')).toHaveLength(3);
    const two = projectRadar({ ...sample, axes: sample.axes.slice(0, 2) });
    expect(two).toMatchObject({ kind: 'ready', plot: false, complete: false, edges: [], polygonPoints: null });
    if (two.kind === 'ready') expect(two.axes).toHaveLength(2);
  });
  it('requires an explicit comparability assertion and does not draw empty axes', () => {
    const { plotPolicy: _policy, ...unasserted } = sample;
    expect(projectRadar(unasserted)).toMatchObject({ kind: 'ready', plot: false, edges: [], polygonPoints: null });
    expect(projectRadar({ ...sample, plotPolicy: 'values-only' })).toMatchObject({ kind: 'ready', plot: false, edges: [], polygonPoints: null });
    expect(projectRadar({ ...sample, axes: [] })).toMatchObject({ kind: 'ready', plot: false, axes: [], edges: [], polygonPoints: null });
  });
  it('does not draw an all-unknown polygon', () => {
    const result = projectRadar({ ...sample, axes: sample.axes.map((axis) => ({ ...axis, value: null })) });
    expect(result).toMatchObject({ kind: 'ready', edges: [], polygonPoints: null, complete: false });
  });
  it('rejects malformed ranges, nonfinite or out-of-range values and duplicate IDs', () => {
    const axis = sample.axes[0];
    if (!axis) throw new Error('fixture');
    expect(projectRadar({ ...sample, axes: [{ ...axis, min: 1, max: 1 }] })).toMatchObject({ kind: 'invalid', reason: 'invalid-range' });
    expect(projectRadar({ ...sample, axes: [{ ...axis, max: Infinity }] })).toMatchObject({ kind: 'invalid', reason: 'invalid-range' });
    expect(projectRadar({ ...sample, axes: [{ ...axis, value: NaN }] })).toMatchObject({ kind: 'invalid', reason: 'invalid-value' });
    expect(projectRadar({ ...sample, axes: [{ ...axis, value: 11 }] })).toMatchObject({ kind: 'invalid', reason: 'invalid-value' });
    expect(projectRadar({ ...sample, axes: [axis, axis] })).toMatchObject({ kind: 'invalid', reason: 'duplicate-axis' });
    expect(projectRadar({ ...sample, subject: { id: '', label: 'Person' } })).toMatchObject({ kind: 'invalid', reason: 'invalid-metadata' });
  });
});


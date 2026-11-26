import { describe, expect, it } from 'vitest';
import type { RadarSeries } from '../../../theme/contracts';
import { describeRadar, radarGeometry } from '../radar';

const axes = [
  { id: 'maths', label: 'ගණිතය' },
  { id: 'music', label: 'இசை' },
  { id: 'making', label: 'Making things' },
  { id: 'caring', label: 'Caring for others' },
];
const series: RadarSeries[] = [
  { id: 'now', label: 'Now', values: { maths: 0.6, music: 1, making: 0.3 }, emphasis: 'now' },
  {
    id: 'then',
    label: 'Start of term',
    values: { maths: 0.4, music: 0.8, making: 0.3, caring: 0.5 },
    emphasis: 'then',
  },
];

describe('radar geometry', () => {
  it('needs at least three axes to make a shape', () => {
    expect(radarGeometry(axes.slice(0, 2), series, 300)).toBeNull();
  });

  it('starts at the top, draws `then` under `now`, and puts a missing value at the centre', () => {
    const g = radarGeometry(axes, series, 300);
    expect(g).not.toBeNull();
    if (g === null) return;
    expect(g.spokes[0]).toEqual({ axisId: 'maths', x: 150, y: 48 });
    expect(g.shapes.map((s) => s.seriesId)).toEqual(['then', 'now']);
    const caringNow = g.shapes[1]?.vertices.find((v) => v.axisId === 'caring');
    expect(caringNow).toEqual({ axisId: 'caring', x: 150, y: 150 });
    expect(g.rings).toHaveLength(4);
  });

  it('keeps values inside the chart', () => {
    const g = radarGeometry(axes, [{ id: 'x', label: 'x', values: { maths: 7, music: -2 } }], 300);
    expect(g?.shapes[0]?.vertices[0]).toEqual({ axisId: 'maths', x: 150, y: 48 });
    expect(g?.shapes[0]?.vertices[1]).toEqual({ axisId: 'music', x: 150, y: 150 });
  });
});

describe('radar description', () => {
  it('says each axis with every series, and "not yet" for a missing value', () => {
    expect(describeRadar(axes, series, 'not yet')).toEqual([
      'ගණිතය: Now 60%, Start of term 40%',
      'இசை: Now 100%, Start of term 80%',
      'Making things: Now 30%, Start of term 30%',
      'Caring for others: Now not yet, Start of term 50%',
    ]);
  });
});

/**
 * Spark: hard light and neon lines. A banded sun sits on a horizon of angular peaks drawn in
 * light, a grid floor runs to the horizon in perspective, and diagonal beams cut across the sky.
 * Sparks rise off the grid. The world's own acid colour and its orange do all the lighting:
 * loud, fast, a little rebellious.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  circle,
  contextOf,
  mix,
  n,
  rect,
  shape,
  skyLayers,
  solid,
  vertical,
} from '../kit';
import type { ArtLayer, ArtShape, SceneArt } from '../types';

/** The banded sun: a disc cut by horizontal gaps, widening toward its foot. */
function bandedSun(c: ArtContext, hy: number, acid: string, hot: string): ArtLayer {
  const { W } = c;
  const cx = W * 0.5;
  const r = W * 0.26;
  const cy = hy - r * 0.95;
  const shapes: ArtShape[] = [
    shape(circle(cx, cy, r * 1.8), {
      kind: 'radial',
      centre: [cx, cy],
      radius: r * 1.8,
      stops: [
        [a(hot, 0.35), 0],
        [a(hot, 0), 1],
      ],
    }),
    shape(
      circle(cx, cy, r),
      vertical(cy - r, cy + r, [
        [acid, 0],
        [hot, 1],
      ]),
    ),
  ];
  // The cuts: bars in the sky's own colour across the lower half.
  const cuts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const y = cy + r * (0.05 + i * 0.15);
    cuts.push(rect(cx - r * 1.1, y, r * 2.2, 1.5 + i * 1.4));
  }
  shapes.push(shape(cuts.join(''), solid(c.sky.horizon)));
  return { id: 'sun-bands', shapes, motion: { kind: 'glow', amount: 0.15, periodMs: 4000 } };
}

/** Angular peaks drawn as outlines of light. */
function wirePeaks(c: ArtContext, hy: number, colour: string): ArtLayer {
  const { W, H } = c;
  const pts: [number, number][] = [
    [0, 0.08],
    [0.08, 0.16],
    [0.16, 0.06],
    [0.27, 0.2],
    [0.36, 0.09],
    [0.44, 0.03],
    [0.56, 0.04],
    [0.64, 0.14],
    [0.73, 0.05],
    [0.82, 0.18],
    [0.92, 0.07],
    [1, 0.12],
  ];
  let d = `M0 ${n(hy)}`;
  for (const [x, h] of pts) d += `L${n(W * x)} ${n(hy - H * h)}`;
  d += `L${n(W)} ${n(hy)}Z`;
  // Inner ridges: lines from each peak down to the valley beside it.
  const inner: string[] = [];
  for (let i = 1; i < pts.length - 1; i += 2) {
    const [x, h] = pts[i]!;
    inner.push(`M${n(W * x)} ${n(hy - H * h)}L${n(W * (x + 0.03))} ${n(hy)}`);
  }
  return {
    id: 'peaks',
    shapes: [
      shape(d, solid(c.lit(mix(c.t.ink, c.sky.top, 0.2)))),
      shape(d, undefined, { stroke: { colour, width: 1.8, cap: 'round' } }),
      shape(inner.join(''), undefined, {
        stroke: { colour: a(colour, 0.5), width: 1.1, cap: 'round' },
      }),
    ],
  };
}

/** The grid floor running to the horizon. */
function grid(c: ArtContext, hy: number, colour: string): ArtLayer[] {
  const { W, H, t } = c;
  const floor = c.lit(mix(t.ink, c.sky.top, 0.1));
  const across: string[] = [];
  for (let i = 1; i < 14; i++) {
    const s = (i / 14) ** 2.2;
    const y = hy + (H - hy) * s;
    across.push(`M0 ${n(y)}L${n(W)} ${n(y)}`);
  }
  const deep: string[] = [];
  for (let i = -10; i <= 10; i++)
    deep.push(`M${n(W / 2 + i * W * 0.012)} ${n(hy)}L${n(W / 2 + i * W * 0.16)} ${n(H)}`);
  return [
    {
      id: 'floor',
      shapes: [
        shape(
          rect(0, hy, W, H - hy),
          vertical(hy, H, [
            [mix(floor, colour, 0.08), 0],
            [floor, 1],
          ]),
        ),
      ],
    },
    {
      id: 'grid',
      shapes: [
        shape(deep.join(''), undefined, {
          stroke: { colour: a(colour, 0.55), width: 1, cap: 'butt' },
        }),
        shape(across.join(''), undefined, {
          stroke: { colour: a(colour, 0.7), width: 1.2, cap: 'butt' },
        }),
      ],
      // The grid rushes toward the viewer: the rows slide down and wrap.
      motion: { kind: 'rise', amount: -H * 0.012, periodMs: 1800 },
    },
    {
      id: 'horizon-line',
      shapes: [
        shape(rect(0, hy - 1, W, 2.5), solid(colour)),
        shape(rect(0, hy - 6, W, 12), solid(a(colour, 0.2)), { blur: 6 }),
      ],
    },
  ];
}

export function sparkArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.6);
  const { W, H, hy, t } = c;
  const acid = t.glow;
  const hot = t.ornament;
  // Spark keeps its own sky after dark, deep and saturated, but follows the clock by day.
  // The banded sun is Spark's only sun: the shared disc and moon step aside.
  const layers: ArtLayer[] = skyLayers(c, hot).filter((l) => l.id !== 'sun' && l.id !== 'moon');
  // Hard diagonal beams.
  const beams: ArtShape[] = [0.18, 0.46, 0.8].map((u, i) =>
    shape(
      `M${n(W * u)} 0L${n(W * u + W * 0.05)} 0L${n(W * u - W * 0.3)} ${n(hy)}L${n(W * u - W * 0.36)} ${n(hy)}Z`,
      vertical(0, hy, [
        [a(i % 2 ? hot : acid, 0.18), 0],
        [a(i % 2 ? hot : acid, 0), 1],
      ]),
    ),
  );
  layers.push({
    id: 'beams',
    shapes: beams,
    from: 'middle',
    motion: { kind: 'glow', amount: 0.6, periodMs: 2600 },
  });
  layers.push(bandedSun(c, hy, acid, hot));
  layers.push(wirePeaks(c, hy, c.night ? acid : mix(acid, t.ink, 0.25)));
  layers.push(...grid(c, hy, c.night ? hot : mix(hot, t.ink, 0.2)));

  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'spark',
        count: 30,
        colour: acid,
        size: [0.8, 1.8],
        area: { x: 0, y: hy, width: W, height: H - hy },
        drift: [0, -40],
        wander: 4,
        twinkle: true,
        halo: 4,
        seed: 7,
      },
      {
        kind: 'spark',
        count: 14,
        colour: hot,
        size: [0.8, 1.4],
        area: { x: 0, y: H * 0.1, width: W, height: hy },
        drift: [30, 10],
        wander: 2,
        twinkle: true,
        seed: 13,
      },
      ...rainOf(c),
    ],
    overlays: [
      {
        id: 'horizon',
        kind: 'band',
        x: -W * 0.1,
        y: hy - H * 0.04,
        width: W * 1.2,
        height: H * 0.08,
        colour: hot,
        opacity: 0.35,
        motion: { kind: 'glow', amount: 0.6, periodMs: 1600 },
      },
      {
        id: 'sun',
        kind: 'glow',
        x: W * 0.15,
        y: hy - W * 0.55,
        width: W * 0.7,
        height: W * 0.7,
        colour: acid,
        opacity: 0.3,
        motion: { kind: 'breathe', amount: 0.05, periodMs: 3000 },
      },
    ],
    shaders: [
      {
        kind: 'heat',
        x: 0,
        y: hy - H * 0.12,
        width: W,
        height: H * 0.12,
        colour: hot,
        strength: 0.25,
      },
    ],
  };
}

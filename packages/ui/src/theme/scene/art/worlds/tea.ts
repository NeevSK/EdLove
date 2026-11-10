/**
 * Tea country: rolling hills combed with rows of tea, one behind another into the mist. Tall
 * silver oaks stand thin among the rows for shade, a path winds up the near slope, and the mist
 * moves through the valleys. Fresh, open, unhurried.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { hills, rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  blob,
  contextOf,
  mistBand,
  mix,
  n,
  ridge,
  ridgeShape,
  rng,
  shape,
  skyLayers,
  solid,
} from '../kit';
import type { ArtLayer, ArtShape, SceneArt } from '../types';

/** One hill of tea: its body, then rows of rounded bushes following its contour. */
function teaHill(
  c: ArtContext,
  id: string,
  base: number,
  amp: number,
  seed: number,
  colour: string,
  rowColour: string,
  rows: number,
): ArtLayer {
  const { W, H } = c;
  const shapes: ArtShape[] = [shape(ridgeShape(W, base, amp, 2.1, seed, H), solid(colour))];
  const lines: string[] = [];
  const bushes: string[] = [];
  const rand = rng(seed * 7);
  for (let r = 1; r <= rows; r++) {
    const off = (r / rows) ** 1.6 * (H - base) * 0.9 + amp * 0.2;
    const step = W / 70;
    let d = '';
    for (let x = 0; x <= W + step; x += step) {
      const y = base - ridge(x / W, seed, amp, 2.1) + off;
      d += `${d ? 'L' : 'M'}${n(x)} ${n(y)}`;
      // Bushes along the nearer rows: little rounded clumps.
      if (r > rows * 0.55 && rand() < 0.45) {
        const s = 2 + (r / rows) * W * 0.012;
        bushes.push(blob(x, y - s * 0.4, s, 6, Math.round(x + r * 31), 0.6));
      }
    }
    lines.push(d);
  }
  shapes.push(
    shape(lines.join(''), undefined, {
      stroke: { colour: rowColour, width: Math.max(1.2, W * 0.004), cap: 'round' },
    }),
  );
  if (bushes.length) shapes.push(shape(bushes.join(''), solid(rowColour)));
  return { id, shapes };
}

/** Silver oaks: tall straight trunks standing in the rows, with thin tiers of foliage. */
function silverOaks(c: ArtContext, base: number, amp: number, seed: number, colour: string): ArtLayer {
  const { W, H } = c;
  const rand = rng(52);
  const trunks: string[] = [];
  const crowns: string[] = [];
  for (let i = 0; i < 6; i++) {
    const x = W * (0.08 + i * 0.17 + (rand() - 0.5) * 0.06);
    // Rooted on the hill's own contour, a little below its crest.
    const y = base - ridge(x / W, seed, amp, 2.1) + H * 0.035;
    const h = H * (0.13 + rand() * 0.06);
    const w = Math.max(1, W * 0.0028);
    trunks.push(`M${n(x - w)} ${n(y)}L${n(x - w * 0.4)} ${n(y - h)}L${n(x + w * 0.4)} ${n(y - h)}L${n(x + w)} ${n(y)}Z`);
    // Four thin tiers, wider below, each a flat ragged cloud off short branches.
    for (let k = 0; k < 4; k++) {
      const ty = y - h * (0.42 + k * 0.17);
      const tw = W * (0.032 - k * 0.006);
      crowns.push(blob(x + (rand() - 0.5) * tw * 0.5, ty, tw, 9, 90 + i * 7 + k, 0.32));
    }
  }
  return {
    id: 'silver-oaks',
    shapes: [shape(trunks.join(''), solid(colour)), shape(crowns.join(''), solid(a(colour, 0.82)))],
    motion: { kind: 'sway', amount: 0.5, periodMs: 9000, origin: [W / 2, H] },
  };
}

export function teaArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.42);
  const { W, H, hy, t, sky } = c;
  const green = t.lamp;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];
  layers.push(...hills(c, mix(t.ornament, t.ink, 0.2), hy - H * 0.03, 2, 2.2, 3.2));
  layers.push(mistBand(c, hy - H * 0.02, H * 0.08, 0.7, 'mist-far'));
  const hillsAt: [number, number, number][] = [
    [hy + H * 0.05, H * 0.05, 11],
    [hy + H * 0.15, H * 0.07, 23],
    [hy + H * 0.29, H * 0.09, 37],
  ];
  for (const [i, [base, amp, seed]] of hillsAt.entries()) {
    const depth = 1 - (i + 1) / hillsAt.length;
    const body = c.lit(mix(mix(green, t.glow, 0.35), sky.horizon, depth * 0.55));
    const rows = c.lit(mix(mix(green, t.ink, 0.25), sky.horizon, depth * 0.5));
    layers.push(teaHill(c, `tea-${i}`, base, amp, seed, body, rows, 7 + i * 3));
    if (i === 1) layers.push(silverOaks(c, base, amp, seed, c.lit(mix(t.ink, sky.horizon, 0.35))));
    if (i < 2) layers.push(mistBand(c, base + H * 0.04, H * 0.06, 0.3 + (c.wx.mist ? 0.25 : 0), `mist-${i}`));
  }
  // A path winding up the near slope.
  const path = `M${n(W * 0.62)} ${n(H)}C${n(W * 0.5)} ${n(H * 0.9)} ${n(W * 0.74)} ${n(H * 0.84)} ${n(W * 0.6)} ${n(H * 0.76)}`;
  layers.push({
    id: 'path',
    shapes: [shape(path, undefined, { stroke: { colour: a(c.lit(mix(t.ground, t.ornament, 0.35)), 0.45), width: W * 0.014, cap: 'round' } })],
  });

  return {
    width: W,
    height: H,
    layers,
    particles: [
      c.light > 0.4
        ? {
            kind: 'pollen',
            count: 16,
            colour: a(mix(t.glow, L.white, 0.4), 0.8),
            size: [0.8, 1.4],
            area: { x: 0, y: hy, width: W, height: H - hy },
            drift: [7, -2],
            wander: 10,
            twinkle: true,
            seed: 4,
          }
        : {
            kind: 'firefly',
            count: 12,
            colour: mix(t.glow, L.firefly, 0.6),
            size: [1, 1.9],
            area: { x: 0, y: hy + H * 0.1, width: W, height: H * 0.4 },
            drift: [3, -1],
            wander: 12,
            twinkle: true,
            halo: 5,
            seed: 6,
          },
      ...rainOf(c),
    ],
    overlays: [0, 1].map((i) => ({
      id: `mist-${i}`,
      kind: 'band' as const,
      x: -W * 0.2,
      y: hy + H * (0.02 + i * 0.12),
      width: W * 1.4,
      height: H * 0.08,
      colour: mix(L.mist, sky.horizon, 0.25),
      opacity: 0.5,
      motion: { kind: 'drift' as const, amount: W * (0.06 + i * 0.03), periodMs: 20_000 + i * 7000 },
    })),
    shaders: [{ kind: 'mist', x: 0, y: hy - H * 0.04, width: W, height: H * 0.35, colour: mix(L.mist, sky.horizon, 0.3), strength: 0.35 }],
  };
}

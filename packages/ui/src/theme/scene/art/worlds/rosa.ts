/**
 * Rose and pichcha: a garden in bloom. Soft rounded hedges roll away under a blush sky; a
 * jasmine creeper hangs its white pichcha flowers along the top, full roses open in the near
 * corners, and petals drift down. Gentle, warm, blooming.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { bush, hills, rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  bow,
  circle,
  contextOf,
  leaf,
  mistBand,
  mix,
  petal,
  rect,
  rng,
  shape,
  skyLayers,
  solid,
  vertical,
} from '../kit';
import type { ArtLayer, ArtShape, SceneArt } from '../types';

/** A full rose seen from above: rings of petals turning inward. */
function rose(
  cx: number,
  cy: number,
  r: number,
  seed: number,
): { outer: string; inner: string; heart: string } {
  const rand = rng(seed);
  const outer: string[] = [];
  const inner: string[] = [];
  for (let ring = 0; ring < 3; ring++) {
    const count = 5 + ring;
    const rr = r * (1 - ring * 0.28);
    for (let k = 0; k < count; k++) {
      const ang = (k / count) * Math.PI * 2 + ring * 0.6 + rand() * 0.2;
      const p = petal(cx, cy, rr, rr * 0.62, ang);
      (ring === 0 ? outer : inner).push(p);
    }
  }
  return { outer: outer.join(''), inner: inner.join(''), heart: circle(cx, cy, r * 0.16) };
}

/** Roses and their leaves in a near corner, nodding in the breeze. */
function roseBush(c: ArtContext, side: 'left' | 'right', seed: number): ArtLayer {
  const { W, H, t } = c;
  const rand = rng(seed);
  const leafColour = c.lit(mix(t.ornament, t.ink, 0.55));
  const outerColour = c.lit(t.lamp);
  const innerColour = c.lit(mix(t.lamp, t.lampDeep, 0.5));
  const leaves: string[] = [];
  const outers: string[] = [];
  const inners: string[] = [];
  const hearts: string[] = [];
  const x0 = side === 'left' ? 0 : W;
  const dir = side === 'left' ? 1 : -1;
  for (let i = 0; i < 26; i++) {
    const x = x0 + dir * rand() * W * 0.36;
    const y = H * (0.78 + rand() * 0.24);
    const len = W * (0.06 + rand() * 0.04);
    leaves.push(leaf(x, y, len, len * 0.42, -Math.PI / 2 + (rand() - 0.5) * 2.6));
  }
  for (let i = 0; i < 4; i++) {
    const x = x0 + dir * W * (0.06 + i * 0.075 + rand() * 0.03);
    const y = H * (0.8 + rand() * 0.1);
    const r = W * (0.075 - i * 0.009);
    const f = rose(x, y, r, seed + i);
    outers.push(f.outer);
    inners.push(f.inner);
    hearts.push(f.heart);
  }
  return {
    id: `roses-${side}`,
    shapes: [
      shape(leaves.join(''), solid(leafColour)),
      shape(outers.join(''), solid(a(outerColour, 0.95))),
      shape(inners.join(''), solid(innerColour)),
      shape(hearts.join(''), solid(c.lit(t.lampDeep))),
    ],
    motion: { kind: 'sway', amount: 0.9, periodMs: 7800, offset: (seed % 4) / 4, origin: [x0, H] },
  };
}

/** The jasmine creeper along the top edge: a looping vine with small white five-petal flowers. */
function pichcha(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const rand = rng(71);
  const vine: string[] = [];
  const leaves: string[] = [];
  const flowers: string[] = [];
  const hearts: string[] = [];
  const loops = 5;
  for (let i = 0; i < loops; i++) {
    const xa = (i / loops) * W - W * 0.05;
    const xb = ((i + 1) / loops) * W + W * 0.05;
    const dip = H * (0.06 + rand() * 0.05);
    vine.push(bow(xa, H * 0.015, xb, H * 0.015, dip));
    for (let k = 0; k < 7; k++) {
      const s = k / 6;
      const x = xa + (xb - xa) * s;
      const y = H * 0.015 + Math.sin(s * Math.PI) * dip * 0.5;
      leaves.push(leaf(x, y, W * 0.026, W * 0.009, Math.PI / 2 + (rand() - 0.5) * 2));
      if (rand() < 0.55) {
        const fx = x + (rand() - 0.5) * W * 0.02;
        const fy = y + H * (0.008 + rand() * 0.018);
        const r = W * (0.011 + rand() * 0.006);
        for (let p = 0; p < 5; p++)
          flowers.push(petal(fx, fy, r, r * 0.5, (p / 5) * Math.PI * 2 + rand()));
        hearts.push(circle(fx, fy, r * 0.18));
      }
    }
  }
  return {
    id: 'pichcha',
    shapes: [
      shape(vine.join(''), undefined, {
        stroke: { colour: c.lit(mix(t.ornament, t.ink, 0.4)), width: 1.6, cap: 'round' },
      }),
      shape(leaves.join(''), solid(c.lit(t.ornament))),
      shape(flowers.join(''), solid(c.lit(mix(L.white, t.glow, 0.12)))),
      shape(hearts.join(''), solid(c.lit(mix(t.glow, L.sunLow, 0.4)))),
    ],
    motion: { kind: 'sway', amount: 0.6, periodMs: 9400, origin: [W / 2, 0] },
  };
}

export function rosaArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.58);
  const { W, H, hy, t, sky } = c;
  const blush = t.glow;
  const layers: ArtLayer[] = [...skyLayers(c, blush)];
  // A blush wash low in the sky.
  layers.push({
    id: 'blush',
    shapes: [
      shape(
        rect(0, hy * 0.4, W, hy * 0.6),
        vertical(hy * 0.4, hy, [
          [a(blush, 0), 0],
          [a(blush, 0.35 * c.light + 0.05), 1],
        ]),
      ),
    ],
  });
  layers.push(...hills(c, mix(t.ornament, blush, 0.25), hy - H * 0.03, 2, 5.5, 2.4));
  layers.push(mistBand(c, hy - H * 0.02, H * 0.06, 0.4, 'mist'));
  // Rows of rounded hedges, receding.
  const hedge: ArtShape[] = [];
  for (let row = 0; row < 3; row++) {
    const y = hy + H * (0.04 + row * 0.08);
    const r = W * (0.05 + row * 0.03);
    const parts: string[] = [];
    for (let x = -r; x < W + r; x += r * 1.3)
      parts.push(bush(x, y, r, 300 + row * 50 + Math.round(x)));
    const colour = c.lit(mix(mix(t.ornament, t.ink, row * 0.18), sky.horizon, (2 - row) * 0.3));
    // Each hedge darkens toward its foot, so the rows read as rounded forms, not flat bands.
    hedge.push(
      shape(
        rect(0, y, W, H - y),
        vertical(y, H, [
          [colour, 0],
          [c.lit(mix(colour, t.ink, 0.35)), 1],
        ]),
      ),
      shape(parts.join(''), solid(colour)),
    );
    if (row < 2) {
      // Blooms dotted on the far hedges.
      const rand = rng(row + 5);
      const dots: string[] = [];
      for (let i = 0; i < 26; i++) dots.push(circle(rand() * W, y - rand() * r * 0.6, 1.4 + row));
      hedge.push(
        shape(dots.join(''), solid(a(c.lit(row ? t.lamp : mix(L.white, blush, 0.3)), 0.85))),
      );
    }
  }
  layers.push({ id: 'hedges', shapes: hedge });
  layers.push(roseBush(c, 'left', 12), roseBush(c, 'right', 27));
  layers.push(pichcha(c));

  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'petal',
        count: 12,
        colour: a(c.lit(mix(t.lamp, blush, 0.5)), 0.9),
        size: [3, 5],
        area: { x: 0, y: 0, width: W, height: H },
        drift: [-8, 20],
        wander: 24,
        twinkle: false,
        seed: 14,
      },
      {
        kind: 'petal',
        count: 6,
        colour: a(c.lit(L.white), 0.9),
        size: [2.4, 3.6],
        area: { x: 0, y: 0, width: W, height: H * 0.6 },
        drift: [5, 14],
        wander: 18,
        twinkle: false,
        seed: 29,
      },
      ...(c.light < 0.45
        ? [
            {
              kind: 'firefly' as const,
              count: 12,
              colour: mix(blush, L.firefly, 0.5),
              size: [1, 1.8] as const,
              area: { x: 0, y: hy, width: W, height: H - hy },
              drift: [3, -2] as const,
              wander: 14,
              twinkle: true,
              halo: 6,
              seed: 2,
            },
          ]
        : []),
      ...rainOf(c),
    ],
    overlays: [
      {
        id: 'blush',
        kind: 'glow',
        x: c.sun[0] - W * 0.35,
        y: c.sun[1] - W * 0.35,
        width: W * 0.7,
        height: W * 0.7,
        colour: blush,
        opacity: 0.4,
        motion: { kind: 'glow', amount: 0.4, periodMs: 8000 },
      },
      {
        id: 'mist',
        kind: 'band',
        x: -W * 0.2,
        y: hy - H * 0.03,
        width: W * 1.4,
        height: H * 0.07,
        colour: mix(L.mist, blush, 0.25),
        opacity: 0.4,
        motion: { kind: 'drift', amount: W * 0.06, periodMs: 24_000 },
      },
    ],
    shaders:
      c.light > 0.35
        ? [
            {
              kind: 'rays',
              x: 0,
              y: 0,
              width: W,
              height: hy,
              colour: blush,
              strength: 0.25 * c.veil,
            },
          ]
        : [],
  };
}

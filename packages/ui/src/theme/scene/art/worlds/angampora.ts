/**
 * Angampora, the training ground: a square of packed earth swept smooth, ringed in brass, under
 * coconut palms. A thatched madu stands at the back; tall brass lamp stands burn at the front
 * corners and their embers rise. Square, grounded, exact.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { fireLayers, hills, palm, rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  contextOf,
  mix,
  n,
  rect,
  shape,
  skyLayers,
  solid,
  vertical,
} from '../kit';
import type { ArtLayer, Point, SceneArt } from '../types';

/** The ground in perspective: a trapezoid of packed earth with brass inlay lines. */
function ground(c: ArtContext, top: number): ArtLayer {
  const { W, H, t } = c;
  const earth = c.lit(mix(t.ornament, t.ink, 0.35));
  const near = c.lit(mix(t.ornament, t.ink, 0.6));
  const brass = c.lit(t.glow);
  // The square seen from its front edge: far edge narrow, near edge past the screen.
  const fx0 = W * 0.22;
  const fx1 = W * 0.78;
  const nx0 = -W * 0.25;
  const nx1 = W * 1.25;
  const square = `M${n(fx0)} ${n(top)}L${n(fx1)} ${n(top)}L${n(nx1)} ${n(H)}L${n(nx0)} ${n(H)}Z`;
  // Inlay: an inner square, and lines across at even depths (closer together far away).
  const lines: string[] = [];
  for (let i = 1; i < 6; i++) {
    const s = (i / 6) ** 1.8;
    const y = top + (H - top) * s;
    const x0 = fx0 + (nx0 - fx0) * s;
    const x1 = fx1 + (nx1 - fx1) * s;
    lines.push(`M${n(x0)} ${n(y)}L${n(x1)} ${n(y)}`);
  }
  for (const u of [0.25, 0.5, 0.75]) {
    lines.push(`M${n(fx0 + (fx1 - fx0) * u)} ${n(top)}L${n(nx0 + (nx1 - nx0) * u)} ${n(H)}`);
  }
  return {
    id: 'ground',
    shapes: [
      shape(
        rect(0, top, W, H - top),
        vertical(top, H, [
          [c.lit(mix(earth, t.ground, 0.25)), 0],
          [near, 1],
        ]),
      ),
      shape(
        square,
        vertical(top, H, [
          [earth, 0],
          [near, 1],
        ]),
      ),
      shape(lines.join(''), undefined, {
        stroke: { colour: a(brass, 0.35), width: 1.2, cap: 'butt' },
      }),
      shape(square, undefined, { stroke: { colour: a(brass, 0.85), width: 2.4, cap: 'butt' } }),
    ],
  };
}

/** The madu: a thatched open shed on posts at the back of the ground. */
function madu(c: ArtContext, base: number): ArtLayer {
  const { W, H, t } = c;
  const x0 = W * 0.3;
  const x1 = W * 0.7;
  const roofTop = base - H * 0.12;
  const eave = base - H * 0.065;
  const thatch = c.lit(mix(t.glow, t.ornament, 0.4));
  const wood = c.lit(mix(t.ink, t.ornament, 0.25));
  const posts = [0.33, 0.43, 0.57, 0.67].map((u) => rect(W * u - 2, eave, 4, base - eave)).join('');
  return {
    id: 'madu',
    shapes: [
      shape(
        rect(x0, eave, x1 - x0, base - eave),
        solid(a(c.lit(mix(t.ink, t.ornament, 0.5)), 0.8)),
      ),
      shape(posts, solid(wood)),
      shape(
        `M${n(x0 - W * 0.06)} ${n(eave)}L${n(W * 0.5)} ${n(roofTop)}L${n(x1 + W * 0.06)} ${n(eave)}Z`,
        solid(thatch),
      ),
      shape(`M${n(x0 - W * 0.06)} ${n(eave)}L${n(x1 + W * 0.06)} ${n(eave)}`, undefined, {
        stroke: { colour: wood, width: 2, cap: 'butt' },
      }),
    ],
  };
}

/** A tall brass lamp stand (pahan kanuwa): base, stem, tiers, and a dish on top. */
function lampStand(x: number, foot: number, h: number): string {
  const w = h * 0.08;
  return [
    `M${n(x - w * 2)} ${n(foot)}L${n(x + w * 2)} ${n(foot)}L${n(x + w)} ${n(foot - h * 0.06)}L${n(x - w)} ${n(foot - h * 0.06)}Z`,
    rect(x - w * 0.35, foot - h, w * 0.7, h),
    // Two swellings on the stem, as the stands are turned.
    `M${n(x - w * 0.35)} ${n(foot - h * 0.5)}Q${n(x - w * 1.1)} ${n(foot - h * 0.56)} ${n(x - w * 0.35)} ${n(foot - h * 0.62)}L${n(x + w * 0.35)} ${n(foot - h * 0.62)}Q${n(x + w * 1.1)} ${n(foot - h * 0.56)} ${n(x + w * 0.35)} ${n(foot - h * 0.5)}Z`,
    `M${n(x - w * 0.35)} ${n(foot - h * 0.8)}Q${n(x - w * 0.9)} ${n(foot - h * 0.85)} ${n(x - w * 0.35)} ${n(foot - h * 0.9)}L${n(x + w * 0.35)} ${n(foot - h * 0.9)}Q${n(x + w * 0.9)} ${n(foot - h * 0.85)} ${n(x + w * 0.35)} ${n(foot - h * 0.8)}Z`,
    `M${n(x - w * 1.8)} ${n(foot - h)}Q${n(x)} ${n(foot - h + w * 1.4)} ${n(x + w * 1.8)} ${n(foot - h)}Z`,
  ].join('');
}

export function angamporaArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.52);
  const { W, H, hy, t, sky } = c;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];
  layers.push(...hills(c, mix(t.ornament, t.ink, 0.5), hy - H * 0.02, 2, 4.4, 2.2));
  const palmDark = c.lit(mix(t.ink, t.ornament, 0.2));
  const palms = [
    palm(W * 0.04, hy + H * 0.06, H * 0.3, 0.08, 3),
    palm(W * 0.18, hy + H * 0.05, H * 0.22, -0.05, 6),
    palm(W * 0.86, hy + H * 0.05, H * 0.25, -0.06, 9),
    palm(W * 0.98, hy + H * 0.07, H * 0.32, -0.1, 12),
  ];
  layers.push({
    id: 'palm-trunks',
    shapes: [shape(palms.map((p) => p.trunk).join(''), solid(palmDark))],
  });
  layers.push({
    id: 'palm-fronds',
    shapes: [shape(palms.map((p) => p.fronds).join(''), solid(palmDark))],
    motion: { kind: 'sway', amount: 1.2, periodMs: 6800, origin: [W / 2, H] },
  });
  const groundTop = hy + H * 0.06;
  layers.push(madu(c, groundTop + 1));
  layers.push(ground(c, groundTop));
  const brass = c.lit(mix(t.glow, t.lamp, 0.3));
  const h = H * 0.2;
  const feet: Point[] = [
    [W * 0.12, H * 0.94],
    [W * 0.88, H * 0.94],
  ];
  layers.push({
    id: 'lamp-stands',
    shapes: [
      shape(feet.map(([x, y]) => lampStand(x, y, h)).join(''), solid(brass)),
      shape(
        feet.map(([x, y]) => rect(x - h * 0.012, y - h, h * 0.01, h)).join(''),
        solid(a(mix(brass, L.white, 0.5), 0.6)),
      ),
    ],
  });
  const flames: Point[] = feet.map(([x, y]) => [x, y - h - 1]);
  layers.push(...fireLayers(c, 'stands', flames, H * 0.055));

  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'ember',
        count: 18,
        colour: a(L.flame, 0.95),
        size: [0.7, 1.4],
        area: { x: W * 0.04, y: H * 0.3, width: W * 0.92, height: H * 0.34 },
        drift: [2, -16],
        wander: 10,
        twinkle: true,
        halo: 3,
        seed: 19,
      },
      {
        kind: 'mote',
        count: 12,
        colour: a(mix(t.glow, sky.horizon, 0.3), 0.6),
        size: [0.7, 1.3],
        area: { x: 0, y: groundTop - H * 0.05, width: W, height: H * 0.2 },
        drift: [5, -1],
        wander: 6,
        twinkle: false,
        seed: 2,
      },
      ...rainOf(c),
    ],
    overlays: flames.map(([x, y], i) => ({
      id: `fire-${i}`,
      kind: 'glow' as const,
      x: x - W * 0.25,
      y: y - W * 0.25,
      width: W * 0.5,
      height: W * 0.5,
      colour: L.flame,
      opacity: 0.3,
      motion: { kind: 'glow' as const, amount: 0.45, periodMs: 1400 + i * 300 },
    })),
    shaders: flames.map(([x, y]) => ({
      kind: 'heat' as const,
      x: x - W * 0.08,
      y: y - H * 0.14,
      width: W * 0.16,
      height: H * 0.12,
      colour: L.flame,
      strength: 0.3,
    })),
  };
}

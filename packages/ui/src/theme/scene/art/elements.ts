/**
 * Scene elements several worlds share, built on the drawing kit: still water that mirrors the
 * sky, palms, flames, strings of flags, reeds, distant hills and lit windows. Each returns layers
 * or path strings in the world's own colours, so Wewa's water and Colombo's harbour are the same
 * craft in different inks.
 */

import { SCENE_LIGHT as L } from '../sky';
import {
  a,
  type ArtContext,
  blob,
  bow,
  circle,
  ellipse,
  leaf,
  mix,
  n,
  rect,
  ridgeShape,
  rng,
  shape,
  solid,
  vertical,
} from './kit';
import type { ArtLayer, ArtShape, ArtShader, Point } from './types';

/** Water from `top` to `bottom`: the sky mirrored and deepened, and the sun or moon's path on it. */
export function waterLayers(
  c: ArtContext,
  top: number,
  bottom: number,
  tint: string,
  id = 'water',
  /** Keep the light's path inside an ellipse (a pool), as centre and radii. */
  within?: { cx: number; cy: number; rx: number; ry: number },
): { layers: ArtLayer[]; shader: ArtShader } {
  const { W, sky } = c;
  const deep = c.lit(mix(mix(L.deepWater, tint, 0.45), sky.top, 0.25));
  const near = c.lit(mix(tint, sky.horizon, 0.25));
  const layers: ArtLayer[] = [
    {
      id,
      shapes: [
        shape(
          rect(0, top, W, bottom - top),
          vertical(top, bottom, [
            [mix(sky.horizon, near, 0.35), 0],
            [mix(near, deep, 0.5), 0.45],
            [deep, 1],
          ]),
        ),
      ],
    },
  ];
  // The light's path: short bright strokes under the sun or moon, thinning toward the viewer.
  const [sx] = c.sun;
  const rand = rng(23);
  const dashes: string[] = [];
  const span = bottom - top;
  for (let i = 0; i < 46; i++) {
    const s = rand();
    const y = top + s ** 1.4 * span * 0.95 + 2;
    const spread = W * (0.015 + s * 0.12);
    const x = sx + (rand() - 0.5) * spread * 2;
    const len = W * (0.012 + s * 0.05) * (0.5 + rand());
    if (within && ((x - within.cx) / (within.rx - len)) ** 2 + ((y - within.cy) / within.ry) ** 2 > 0.85) continue;
    dashes.push(ellipse(x, y, len, 0.6 + s * 1.4));
  }
  const glint = c.scene.celestial.body === 'sun' ? mix(L.sunDisc, sky.halo, 0.3) : L.moonDisc;
  layers.push({
    id: `${id}-path`,
    shapes: [shape(dashes.join(''), solid(a(glint, (0.25 + c.veil * 0.55) * (c.night ? 0.8 : 1))))],
    motion: { kind: 'glow', amount: 0.45, periodMs: 3600 },
    from: 'floor',
  });
  // A thin bright line where the water meets the far shore.
  layers.push({
    id: `${id}-edge`,
    shapes: [shape(rect(0, top, W, 1.2), solid(a(mix(sky.horizon, L.white, 0.4), 0.55)))],
  });
  return {
    layers,
    shader: { kind: 'water', x: 0, y: top, width: W, height: bottom - top, colour: sky.halo, strength: 0.4 },
  };
}

/** A palm: a curved trunk with rings and a crown of drooping fronds. Returns two paths. */
export function palm(
  x: number,
  baseY: number,
  height: number,
  lean: number,
  seed: number,
): { trunk: string; fronds: string } {
  const rand = rng(seed);
  const topX = x + lean * height;
  const topY = baseY - height;
  const w0 = height * 0.035;
  const w1 = height * 0.018;
  const midX = x + lean * height * 0.35;
  const midY = baseY - height * 0.5;
  const trunk = `M${n(x - w0)} ${n(baseY)}Q${n(midX - w1)} ${n(midY)} ${n(topX - w1)} ${n(topY)}L${n(topX + w1)} ${n(topY)}Q${n(midX + w1)} ${n(midY)} ${n(x + w0)} ${n(baseY)}Z`;
  const fronds: string[] = [];
  const count = 9;
  for (let i = 0; i < count; i++) {
    const ang = -Math.PI / 2 + ((i / (count - 1)) - 0.5) * Math.PI * 1.7 + (rand() - 0.5) * 0.2;
    const len = height * (0.32 + rand() * 0.12);
    // Each frond: a drooping spine with leaflets on both sides.
    const steps = 9;
    for (let k = 1; k <= steps; k++) {
      const s = k / steps;
      const px = topX + Math.cos(ang) * len * s;
      const py = topY + Math.sin(ang) * len * s + len * 0.55 * s * s;
      const ll = len * 0.2 * (1 - s * 0.6);
      const dir = Math.atan2(Math.sin(ang) + s * 1.1, Math.cos(ang));
      fronds.push(leaf(px, py, ll, ll * 0.18, dir + 1.3));
      fronds.push(leaf(px, py, ll, ll * 0.18, dir - 1.3));
    }
  }
  return { trunk, fronds: fronds.join('') };
}

/** A teardrop flame standing at (x, y), `h` tall. */
export function flame(x: number, y: number, h: number, lean = 0): string {
  const w = h * 0.36;
  const tx = x + lean * h;
  return `M${n(x)} ${n(y)}C${n(x - w)} ${n(y - h * 0.15)} ${n(x - w * 0.6)} ${n(y - h * 0.62)} ${n(tx)} ${n(y - h)}C${n(x + w * 0.6)} ${n(y - h * 0.62)} ${n(x + w)} ${n(y - h * 0.15)} ${n(x)} ${n(y)}Z`;
}

/** A flame with its glow, flickering: the glow breathes, the flame sways from its base. */
export function fireLayers(
  c: ArtContext,
  id: string,
  spots: readonly Point[],
  h: number,
  from?: ArtLayer['from'],
): ArtLayer[] {
  const glow: ArtShape[] = spots.map(([x, y]) =>
    shape(circle(x, y - h * 0.5, h * 2.6), {
      kind: 'radial',
      centre: [x, y - h * 0.5],
      radius: h * 2.6,
      stops: [
        [a(L.flame, 0.42), 0],
        [a(L.flame, 0.12), 0.4],
        [a(L.flame, 0), 1],
      ],
    }),
  );
  const flames = spots.map(([x, y], i) => flame(x, y, h, (i % 2 ? 1 : -1) * 0.05)).join('');
  const cores = spots.map(([x, y]) => flame(x, y - h * 0.05, h * 0.5)).join('');
  return [
    { id: `${id}-glow`, shapes: glow, motion: { kind: 'glow', amount: 0.35, periodMs: 1300 }, from },
    {
      id: `${id}-flame`,
      shapes: [shape(flames, solid(a(L.flame, 0.95))), shape(cores, solid(L.flameCore))],
      motion: { kind: 'breathe', amount: 0.03, periodMs: 900, origin: spots[0] },
      from,
    },
  ];
}

/** A string of triangular flags hanging between two points, in turn colours. */
export function pennants(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  sag: number,
  colours: readonly string[],
  size: number,
  seed: number,
): ArtShape[] {
  const rand = rng(seed);
  const count = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / (size * 1.25)));
  const byColour = colours.map(() => [] as string[]);
  for (let i = 0; i < count; i++) {
    const s = (i + 0.5) / count;
    const x = x0 + (x1 - x0) * s;
    const y = y0 + (y1 - y0) * s + Math.sin(s * Math.PI) * sag;
    const h = size * (0.9 + rand() * 0.25);
    byColour[i % colours.length]!.push(
      `M${n(x - size * 0.45)} ${n(y)}L${n(x + size * 0.45)} ${n(y)}L${n(x + (rand() - 0.5) * size * 0.2)} ${n(y + h)}Z`,
    );
  }
  const cord = bow(x0, y0, x1, y1, -sag * 0.95);
  return [
    shape(cord, undefined, { stroke: { colour: a(colours[0]!, 0.6), width: 1, cap: 'round' } }),
    ...byColour.map((paths, i) => shape(paths.join(''), solid(colours[i]!))),
  ];
}

/** Reeds rising from the bottom edge on one side. */
export function reeds(c: ArtContext, side: 'left' | 'right', colour: string, seed: number): ArtLayer {
  const { W, H } = c;
  const rand = rng(seed);
  const blades: string[] = [];
  const heads: string[] = [];
  for (let i = 0; i < 16; i++) {
    const x = side === 'left' ? W * (rand() * 0.22) : W * (0.78 + rand() * 0.22);
    const h = H * (0.12 + rand() * 0.16);
    const lean = (rand() - 0.5) * W * 0.06;
    blades.push(leaf(x, H + 4, h, W * 0.007, -Math.PI / 2 + lean / h));
    if (rand() < 0.35) heads.push(ellipse(x + lean * 0.9, H - h * 0.92, W * 0.006, H * 0.016));
  }
  return {
    id: `reeds-${side}`,
    shapes: [shape(blades.join(''), solid(colour)), shape(heads.join(''), solid(mix(colour, L.white, 0.08)))],
    motion: { kind: 'sway', amount: 1.4, periodMs: 6800, offset: seed % 3 / 3, origin: [side === 'left' ? 0 : W, H] },
  };
}

/** Far hills fading into haze, `count` of them from far to near. */
export function hills(
  c: ArtContext,
  colour: string,
  base: number,
  count: number,
  seed: number,
  rollEvery = 2.6,
): ArtLayer[] {
  const { W, H } = c;
  const layers: ArtLayer[] = [];
  for (let i = 0; i < count; i++) {
    const depth = 1 - i / Math.max(1, count);
    layers.push({
      id: `hills-${seed}-${i}`,
      shapes: [
        shape(
          ridgeShape(W, base + i * H * 0.035, H * (0.03 + i * 0.012), rollEvery + i * 0.4, seed + i * 1.3, H),
          solid(c.lit(mix(colour, c.sky.horizon, depth * 0.7), depth * 0.3)),
        ),
      ],
    });
  }
  return layers;
}

/** Lit windows scattered in a box: small rectangles that glow by night. */
export function windows(
  x: number,
  y: number,
  w: number,
  h: number,
  cell: number,
  share: number,
  seed: number,
): string {
  const rand = rng(seed);
  const out: string[] = [];
  for (let yy = y + cell; yy < y + h - cell * 0.5; yy += cell * 1.6) {
    for (let xx = x + cell * 0.6; xx < x + w - cell * 0.6; xx += cell * 1.4) {
      if (rand() < share) out.push(rect(xx, yy, cell * 0.7, cell * 0.9));
    }
  }
  return out.join('');
}

/** A bush of rounded foliage at (x, y). */
export function bush(x: number, y: number, r: number, seed: number): string {
  const rand = rng(seed);
  const parts: string[] = [];
  for (let i = 0; i < 5; i++) {
    parts.push(blob(x + (rand() - 0.5) * r * 1.6, y - rand() * r * 0.6, r * (0.5 + rand() * 0.35), 7, seed + i, 0.8));
  }
  return parts.join('');
}

/** Rain, when the weather brings it: fine drops slanting down the whole scene. */
export function rainOf(c: ArtContext): import('./types').ArtParticles[] {
  if (c.wx.rain <= 0) return [];
  return [
    {
      kind: 'drop',
      count: Math.min(90, Math.round(c.wx.rain)),
      colour: a(mix(L.rainVeil, c.sky.horizon, 0.3), 0.7),
      size: [0.6, 1.1],
      area: { x: 0, y: 0, width: c.W, height: c.H },
      drift: [-30, 420],
      wander: 2,
      twinkle: false,
      seed: 61,
    },
  ];
}

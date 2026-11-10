/**
 * The drawing kit every world's scene art is built with: seeded randomness, organic paths
 * (multi-harmonic ridges, leaves, petals, blobs), colour helpers, and the shared sky (gradient,
 * sun or moon, stars, clouds) that the one clock lights the same way in every world.
 */

import type { WorldTokens } from '../../types';
import type { Scene } from '../resolveScene';
import { daylightAt, mixHex, SCENE_LIGHT as L, WEATHER, type WeatherSpec } from '../sky';
import type { ArtFill, ArtLayer, ArtShape, Point, Stop } from './types';

/* ---------- numbers and randomness ---------- */

export const n = (v: number) => Math.round(v * 10) / 10;

/** A small seeded generator, so a scene draws the same every time. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Four non-integer harmonics: hills, canopies and shores that never look drawn by a ruler. */
export function ridge(x: number, seed: number, amp: number, freq: number): number {
  return (
    Math.sin(x * freq + seed) * amp * 0.55 +
    Math.sin(x * freq * 2.3 + seed * 1.7) * amp * 0.28 +
    Math.sin(x * freq * 5.1 + seed * 0.6) * amp * 0.12 +
    Math.sin(x * freq * 11.7 + seed * 2.9) * amp * 0.05
  );
}

/* ---------- colour ---------- */

/** A colour with alpha, as #RRGGBBAA. */
export function a(hex: string, alpha: number): string {
  const base = hex.length >= 7 ? hex.slice(0, 7) : hex;
  const v = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${base}${v}`.toUpperCase();
}

export const mix = mixHex;

export const solid = (colour: string): ArtFill => ({ kind: 'solid', colour });

export const vertical = (top: number, bottom: number, stops: readonly Stop[]): ArtFill => ({
  kind: 'linear',
  from: [0, top],
  to: [0, bottom],
  stops,
});

export const radial = (centre: Point, radius: number, stops: readonly Stop[]): ArtFill => ({
  kind: 'radial',
  centre,
  radius,
  stops,
});

/* ---------- shapes ---------- */

export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0Z`;
}

export const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r);

export function rect(x: number, y: number, w: number, h: number): string {
  return `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
}

/**
 * A ridge filled down to `bottom`: hills, canopies, shores, rooftops.
 * `base` is the ridge's mean height, `amp` how much it rolls.
 */
export function ridgeShape(
  width: number,
  base: number,
  amp: number,
  freq: number,
  seed: number,
  bottom: number,
): string {
  const step = Math.max(3, width / 120);
  let d = `M0 ${n(bottom)}`;
  for (let x = 0; x <= width + step; x += step) {
    const xx = Math.min(x, width);
    d += `L${n(xx)} ${n(base - ridge(xx / width, seed, amp, freq))}`;
  }
  return `${d}L${n(width)} ${n(bottom)}Z`;
}

/** An open ridge line (a shore, a terrace edge) for stroking. */
export function ridgeLine(width: number, base: number, amp: number, freq: number, seed: number): string {
  const step = Math.max(3, width / 120);
  let d = '';
  for (let x = 0; x <= width + step; x += step) {
    const xx = Math.min(x, width);
    d += `${d ? 'L' : 'M'}${n(xx)} ${n(base - ridge(xx / width, seed, amp, freq))}`;
  }
  return d;
}

/** A pointed leaf from its base, along `angle` (radians), `len` long and `width` wide. */
export function leaf(x: number, y: number, len: number, width: number, angle: number): string {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const px = -sin;
  const py = cos;
  const tx = x + cos * len;
  const ty = y + sin * len;
  const m1x = x + cos * len * 0.45 + px * width;
  const m1y = y + sin * len * 0.45 + py * width;
  const m2x = x + cos * len * 0.45 - px * width;
  const m2y = y + sin * len * 0.45 - py * width;
  return `M${n(x)} ${n(y)}Q${n(m1x)} ${n(m1y)} ${n(tx)} ${n(ty)}Q${n(m2x)} ${n(m2y)} ${n(x)} ${n(y)}Z`;
}

/** A leaf's midrib, for a fine vein stroke. */
export function midrib(x: number, y: number, len: number, angle: number): string {
  return `M${n(x)} ${n(y)}L${n(x + Math.cos(angle) * len * 0.9)} ${n(y + Math.sin(angle) * len * 0.9)}`;
}

/** A rounded petal from the flower's centre outwards. */
export function petal(cx: number, cy: number, len: number, width: number, angle: number): string {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const px = -sin;
  const py = cos;
  const tx = cx + cos * len;
  const ty = cy + sin * len;
  return `M${n(cx)} ${n(cy)}C${n(cx + cos * len * 0.3 + px * width)} ${n(cy + sin * len * 0.3 + py * width)} ${n(tx + px * width * 0.7)} ${n(ty + py * width * 0.7)} ${n(tx)} ${n(ty)}C${n(tx - px * width * 0.7)} ${n(ty - py * width * 0.7)} ${n(cx + cos * len * 0.3 - px * width)} ${n(cy + sin * len * 0.3 - py * width)} ${n(cx)} ${n(cy)}Z`;
}

/** A soft irregular blob (a cloud of foliage, a bush), `lobes` bumps around (cx, cy). */
export function blob(cx: number, cy: number, r: number, lobes: number, seed: number, squash = 1): string {
  const rand = rng(seed);
  const pts: Point[] = [];
  for (let i = 0; i < lobes; i++) {
    const t = (i / lobes) * Math.PI * 2;
    const rr = r * (0.78 + rand() * 0.3);
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * squash]);
  }
  let d = `M${n(pts[0]![0])} ${n(pts[0]![1])}`;
  for (let i = 0; i < lobes; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % lobes]!;
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    const out = 1.18;
    d += `Q${n(cx + (mx - cx) * out + (q[0] - p[0]) * 0.1)} ${n(cy + (my - cy) * out)} ${n(q[0])} ${n(q[1])}`;
  }
  return `${d}Z`;
}

/** A gentle curve from (x0, y0) to (x1, y1) bowed sideways by `bow` (vines, stems, creepers). */
export function bow(x0: number, y0: number, x1: number, y1: number, bowBy: number): string {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  return `M${n(x0)} ${n(y0)}Q${n(mx - (dy / len) * bowBy)} ${n(my + (dx / len) * bowBy)} ${n(x1)} ${n(y1)}`;
}

export const shape = (d: string, fill?: ArtFill, extra: Partial<ArtShape> = {}): ArtShape => ({
  d,
  fill,
  ...extra,
});

/* ---------- context ---------- */

export interface ArtInput {
  readonly width: number;
  readonly height: number;
  readonly scene: Scene;
  /** The world's inks: its light palette for this hour (the scene darkens itself at night). */
  readonly tokens: WorldTokens;
}

/** What every builder needs, worked out once. */
export interface ArtContext {
  readonly W: number;
  readonly H: number;
  /** The horizon's height in px. */
  readonly hy: number;
  /** Daylight, 0 (night) to 1 (full day). */
  readonly light: number;
  readonly night: boolean;
  readonly scene: Scene;
  readonly t: WorldTokens;
  readonly wx: WeatherSpec;
  /** How much the weather hides the sky's light: 1 clear, lower when cloudy. */
  readonly veil: number;
  /** The sky's colours (the scene always has a palette when art is drawn). */
  readonly sky: NonNullable<Scene['palette']>;
  /** Sun or moon centre in px. */
  readonly sun: Point;
  /** Shade a world colour by the hour: full at day, toward the sky's dark at night. */
  readonly lit: (colour: string, depth?: number) => string;
}

export function contextOf(input: ArtInput, horizon = 0.62): ArtContext {
  const { width: W, height: H, scene, tokens: t } = input;
  const sky = scene.palette!;
  const light = daylightAt(scene.minute);
  const wx = WEATHER[scene.weather];
  const hy = H * horizon;
  const cel = scene.celestial;
  const night = light < 0.25;
  // Night pulls colours toward the sky's darkest blue; depth makes far things fade into haze.
  const lit = (colour: string, depth = 0) => {
    const dayish = mix(colour, sky.horizon, depth * 0.55);
    return light >= 1 ? dayish : mix(mix(dayish, sky.top, 0.62), dayish, light);
  };
  return {
    W,
    H,
    hy,
    light,
    night,
    scene,
    t,
    wx,
    veil: 1 - wx.cloud * 0.8,
    sky,
    sun: [W * cel.x, hy - cel.lift * hy * 0.92 + 10],
    lit,
  };
}

/* ---------- the shared sky ---------- */

/** Sky gradient, sun or moon with its halo, stars at night, and clouds. Lit by the one clock. */
export function skyLayers(c: ArtContext, glow: string): ArtLayer[] {
  const { W, H, hy, sky, veil, scene } = c;
  const [cx, cy] = c.sun;
  const layers: ArtLayer[] = [];
  layers.push({
    id: 'sky',
    shapes: [
      shape(
        rect(0, 0, W, hy + 4),
        vertical(0, hy, [
          [sky.top, 0],
          [mix(sky.top, sky.horizon, 0.7), 0.7],
          [sky.horizon, 1],
        ]),
      ),
    ],
  });

  if (scene.particles.stars > 0) {
    const rand = rng(41);
    const stars = Array.from({ length: scene.particles.stars * 3 }, () => {
      const x = rand() * W;
      const y = rand() ** 1.5 * hy * 0.85;
      const r = 0.5 + rand() * 1.1;
      return circle(x, y, r);
    });
    layers.push({
      id: 'stars',
      shapes: [shape(stars.join(''), solid(a(L.star, 0.75 * (1 - c.wx.cloud))))],
      motion: { kind: 'glow', amount: 0.35, periodMs: 5200 },
      from: 'floor',
    });
  }

  if (scene.celestial.body === 'sun') {
    const low = Math.max(0, 1 - scene.celestial.lift * 2.8);
    layers.push({
      id: 'sun',
      shapes: [
        shape(
          rect(0, 0, W, hy),
          radial([cx, cy], Math.max(W, H) * 0.45, [
            [a(sky.halo, 0.7 * veil + 0.1), 0],
            [a(sky.halo, 0.28 * veil + 0.04), 0.14],
            [a(sky.halo, 0), 1],
          ]),
        ),
        ...(veil > 0.25
          ? [shape(circle(cx, cy, Math.max(13, W * 0.034)), solid(a(L.sunDisc, Math.min(1, veil + 0.1))))]
          : []),
        ...(low > 0
          ? [
              shape(
                rect(0, hy - H * 0.24, W, H * 0.24),
                vertical(hy - H * 0.24, hy, [
                  [a(glow, 0), 0],
                  [a(mix(L.sunLow, glow, 0.3), 0.38 * low * veil + 0.05), 1],
                ]),
              ),
            ]
          : []),
      ],
    });
  } else {
    const r = Math.max(11, W * 0.028);
    const shift =
      scene.moonPhase < 0.5 ? -r * 2 * (scene.moonPhase / 0.5) : r * 2 * ((1 - scene.moonPhase) / 0.5);
    // How much of the moon is lit: 0 at the new moon, 1 at the poya full moon.
    const lit = 1 - Math.abs(0.5 - scene.moonPhase) * 2;
    layers.push({
      id: 'moon',
      shapes: [
        shape(
          circle(cx, cy, r * 9),
          radial([cx, cy], r * 9, [
            [a(L.moonGlow, (0.28 * veil + 0.04) * (0.35 + lit * 0.65)), 0],
            [a(L.moonGlow, 0), 1],
          ]),
        ),
        // Near the new moon there is no disc to see, only a faint glow.
        ...(veil > 0.3 && lit > 0.1
          ? [
              shape(circle(cx, cy, r), solid(a(L.moonDisc, veil))),
              shape(circle(cx + shift, cy, r * 1.04), solid(a(sky.top, 0.9))),
            ]
          : []),
      ],
      motion: { kind: 'glow', amount: 0.12, periodMs: 9000 },
    });
  }

  // Clouds: soft puffs, more of them as the weather thickens.
  const rand = rng(17);
  const count = 3 + Math.round(c.wx.cloud * 9);
  const cloud = mix(sky.horizon, c.light > 0.3 ? L.white : L.cloudNight, 0.38);
  const alpha = 0.16 + c.wx.cloud * 0.36;
  const puffs: ArtShape[] = [];
  for (let i = 0; i < count; i++) {
    const px = rand() * W;
    const py = hy * (0.12 + rand() * 0.5);
    const rx = W * (0.18 + rand() * 0.22);
    const ry = rx * (0.18 + rand() * 0.1);
    puffs.push(shape(ellipse(px, py, rx, ry), radial([px, py], rx, [[a(cloud, alpha), 0], [a(cloud, 0), 1]])));
  }
  layers.push({
    id: 'clouds',
    shapes: puffs,
    motion: { kind: 'drift', amount: W * 0.04, periodMs: 90_000 },
  });
  return layers;
}

/** A mist band across the scene at `y`, `h` tall: a still shape plus a floor-tier overlay. */
export function mistBand(c: ArtContext, y: number, h: number, strength: number, id = 'mist'): ArtLayer {
  const colour = mix(L.mist, c.sky.horizon, 0.35);
  return {
    id,
    shapes: [
      shape(
        rect(-c.W * 0.1, y, c.W * 1.2, h),
        vertical(y, y + h, [
          [a(colour, 0), 0],
          [a(colour, strength), 0.5],
          [a(colour, 0), 1],
        ]),
      ),
    ],
    motion: { kind: 'drift', amount: c.W * 0.06, periodMs: 26_000 },
  };
}

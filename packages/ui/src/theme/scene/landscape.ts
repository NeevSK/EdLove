/**
 * The still landscape behind a room, as plain geometry: SVG path strings and points that any
 * painter can fill (Skia on mobile, canvas `Path2D` on the web). Seeded, so the same room at
 * the same size always draws the same hills, and it is computed once per size, never per frame.
 *
 * Only the school view (the classroom: wewa, paddy terraces, coconut palms) is drawn so far.
 * The other rooms' views fall back to it until they are painted.
 */

import type { SceneView } from './resolveScene';
import { mixHex, type SkyPalette } from './sky';

export interface Ellipse {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

export interface Palm {
  readonly trunk: string;
  readonly trunkWidth: number;
  readonly fronds: string;
  readonly frondWidth: number;
  readonly leaflets: string;
  readonly crown: { readonly cx: number; readonly cy: number; readonly r: number };
}

export interface Landscape {
  readonly view: SceneView;
  readonly width: number;
  readonly height: number;
  readonly horizonY: number;
  readonly waterTop: number;
  readonly waterBottom: number;
  /** Far to near; each is a closed shape from the horizon up. */
  readonly hills: readonly { readonly d: string; readonly top: number }[];
  /** The far shore's band of tree crowns, and its reflection in the water. */
  readonly shore: string;
  readonly shoreReflection: string;
  readonly glints: readonly {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly a: number;
  }[];
  readonly lotusPads: string;
  readonly lotusFlowers: readonly Ellipse[];
  /** Paddy terraces, back to front, and the bunds between them. */
  readonly terraces: readonly string[];
  readonly bunds: readonly { readonly d: string; readonly width: number }[];
  /** Rice stalks on the near terraces (drawn only at the rich tier). */
  readonly stalks: string;
  readonly palms: readonly Palm[];
  readonly kumbuk: { readonly trunk: string; readonly crowns: readonly Ellipse[] } | null;
  /** Stars in the sky, used only at night. */
  readonly stars: readonly { readonly x: number; readonly y: number; readonly r: number }[];
  /** Soft cloud puffs (painted still, as radial gradients). */
  readonly clouds: readonly Ellipse[];
}

const HORIZON = 0.6;
const WATER_BOTTOM = 0.76;
const TERRACE_ROWS = 8;

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function ridge(x: number, seed: number, amp: number, freq: number): number {
  return (
    Math.sin(x * freq + seed) * amp * 0.55 +
    Math.sin(x * freq * 2.3 + seed * 1.7) * amp * 0.28 +
    Math.sin(x * freq * 5.1 + seed * 0.6) * amp * 0.12 +
    Math.sin(x * freq * 11.7 + seed * 2.9) * amp * 0.05
  );
}

const n = (v: number) => Math.round(v * 10) / 10;

function ellipsePath(e: Ellipse): string {
  return `M${n(e.cx - e.rx)} ${n(e.cy)}a${n(e.rx)} ${n(e.ry)} 0 1 0 ${n(e.rx * 2)} 0a${n(e.rx)} ${n(e.ry)} 0 1 0 ${n(-e.rx * 2)} 0Z`;
}

function palmOf(x: number, y: number, h: number, lean: number): Palm {
  const tx = x + lean * h * 1.6;
  const ty = y - h;
  const trunk = `M${n(x)} ${n(y)}Q${n(x + lean * h * 0.2)} ${n(y - h * 0.55)} ${n(tx)} ${n(ty)}`;
  let fronds = '';
  let leaflets = '';
  const count = 11;
  for (let i = 0; i < count; i++) {
    // Fronds fan across the top and droop under their own weight.
    const a = -Math.PI + (i / (count - 1)) * Math.PI + lean * 0.6;
    const len = h * (0.34 + ((i * 7) % 3) * 0.05);
    const up = Math.sin(a);
    const ex = tx + Math.cos(a) * len;
    const ey = ty + len * (0.42 + up * 0.08);
    const mx = tx + Math.cos(a) * len * 0.55;
    const my = ty + up * len * 0.42 - len * 0.05;
    fronds += `M${n(tx)} ${n(ty)}Q${n(mx)} ${n(my)} ${n(ex)} ${n(ey)}`;
    const dx = Math.cos(a) >= 0 ? 1 : -1;
    for (let k = 2; k < 16; k += 1) {
      const t = k / 16;
      const px = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex;
      const py = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * my + t * t * ey;
      const ll = len * 0.15 * (1 - t * 0.55);
      leaflets += `M${n(px)} ${n(py)}l${n(dx * ll * 0.35)} ${n(ll)}M${n(px)} ${n(py)}l${n(-dx * ll * 0.15)} ${n(ll * 0.95)}`;
    }
  }
  return {
    trunk,
    trunkWidth: Math.max(3, h * 0.035),
    fronds,
    frondWidth: Math.max(1.4, h * 0.011),
    leaflets,
    crown: { cx: tx, cy: ty + 2, r: h * 0.025 },
  };
}

export function landscapeOf(
  view: SceneView,
  width: number,
  height: number,
  rich = true,
): Landscape {
  const W = Math.max(1, width);
  const H = Math.max(1, height);
  const hy = H * HORIZON;
  const w0 = hy + 6;
  const w1 = H * WATER_BOTTOM;

  const ranges = [
    { base: 0.085, amp: 0.1, f: 6.2, s: 1.3 },
    { base: 0.045, amp: 0.08, f: 4.4, s: 4.1 },
    { base: 0.012, amp: 0.05, f: 3.1, s: 8.7 },
  ];
  const step = Math.max(3, W / 160);
  const hills = ranges.map((r) => {
    let d = `M0 ${n(hy + 1)}`;
    for (let x = 0; x <= W + step; x += step) {
      const xx = Math.min(x, W);
      d += `L${n(xx)} ${n(hy - H * r.base - Math.max(-H * 0.01, ridge(xx / W, r.s, H * r.amp, r.f)))}`;
    }
    return { d: `${d}L${n(W)} ${n(hy + 1)}Z`, top: hy - H * (r.base + r.amp) };
  });

  const rt = rng(23);
  const crowns: { x: number; h: number; w: number }[] = [];
  for (let x = -10; x < W + 20; x += 6 + rt() * 10) {
    crowns.push({ x, h: 6 + rt() * 16 + (rt() < 0.08 ? 18 : 0), w: 7 + rt() * 9 });
  }
  const band = (yBase: number, dir: 1 | -1) =>
    crowns
      .map((c) => ellipsePath({ cx: c.x, cy: yBase - dir * c.h * 0.55, rx: c.w, ry: c.h * 0.6 }))
      .join('') + `M0 ${n(Math.min(yBase, yBase - dir * 3))}h${n(W)}v3h${n(-W)}Z`;

  const rg = rng(7);
  const glints = Array.from({ length: 50 }, () => ({
    x: rg() * W,
    y: w0 + rg() ** 1.6 * (w1 - w0),
    w: 10 + rg() * 60,
    a: 0.03 + rg() * 0.05,
  }));

  const rl = rng(5);
  let lotusPads = '';
  const lotusFlowers: Ellipse[] = [];
  for (let i = 0; i < 22; i++) {
    const px = W * (0.22 + rl() * 0.4);
    const py = w1 - 4 - rl() * (w1 - w0) * 0.28;
    const pw = 6 + rl() * 9;
    lotusPads += ellipsePath({ cx: px, cy: py, rx: pw, ry: pw * 0.32 });
    if (i % 6 === 0) lotusFlowers.push({ cx: px + 2, cy: py - 4, rx: 3, ry: 4.5 });
  }

  const edges: number[] = [];
  for (let i = 0; i <= TERRACE_ROWS; i++)
    edges.push(w1 + 3 + (H - w1) * (i / TERRACE_ROWS) ** 1.45);
  const edgeY = (k: number, x: number) =>
    (edges[k] ?? H) +
    (k === 0 || k === TERRACE_ROWS ? 0 : Math.sin((x / W) * 4.6 + k * 1.7) * (2 + k * 0.8));
  const tstep = Math.max(6, W / 80);
  const terraces: string[] = [];
  const bunds: { d: string; width: number }[] = [];
  let stalks = '';
  for (let i = 0; i < TERRACE_ROWS; i++) {
    let d = `M0 ${n(edgeY(i, 0))}`;
    for (let x = 0; x <= W; x += tstep) d += `L${n(x)} ${n(edgeY(i, x))}`;
    d += `L${n(W)} ${n(edgeY(i, W))}`;
    for (let x = W; x >= 0; x -= tstep) d += `L${n(x)} ${n(edgeY(i + 1, x))}`;
    terraces.push(`${d}L0 ${n(edgeY(i + 1, 0))}Z`);
    let b = `M0 ${n(edgeY(i, 0))}`;
    for (let x = tstep; x <= W; x += tstep) b += `L${n(x)} ${n(edgeY(i, x))}`;
    bunds.push({ d: b, width: 1 + i * 0.25 });
    if (rich && i >= 4) {
      const rs = rng(300 + i);
      const count = Math.round(W / (14 - i));
      for (let k = 0; k < count; k++) {
        const sx = rs() * W;
        const sy = edgeY(i, sx) + rs() * (edgeY(i + 1, sx) - edgeY(i, sx));
        stalks += `M${n(sx)} ${n(sy)}l${n((rs() - 0.5) * 3)} ${n(-(3 + i * 1.2))}`;
      }
    }
  }

  const ph = Math.min(H, W * 1.1);
  const palms = [
    palmOf(W * 0.08, w1 + 2, ph * 0.36, -0.12),
    palmOf(W * 0.15, w1 + 4, ph * 0.27, 0.08),
    palmOf(W * 0.86, w1 + 1, ph * 0.33, 0.1),
  ];
  let kumbuk: Landscape['kumbuk'] = null;
  if (W > 600) {
    const x = W * 0.7;
    const y = w1 + 1;
    const h = ph * 0.16;
    const rr = rng(99);
    kumbuk = {
      trunk: `M${n(x - h * 0.03)} ${n(y - h * 0.5)}h${n(h * 0.06)}v${n(h * 0.5)}h${n(-h * 0.06)}Z`,
      crowns: Array.from({ length: 14 }, () => ({
        cx: x + (rr() - 0.5) * h * 0.9,
        cy: y - h * 0.6 - rr() * h * 0.4,
        rx: h * (0.16 + rr() * 0.12),
        ry: h * (0.1 + rr() * 0.08),
      })),
    };
  }

  const rs = rng(42);
  const stars = Array.from({ length: W < 600 ? 80 : 160 }, () => ({
    x: rs() * W,
    y: rs() ** 1.4 * hy * 0.9,
    r: rs() * 1.2 + 0.2,
  }));

  const rc = rng(11);
  // Long, flat puffs in loose rows, so they read as cloud banks rather than bubbles.
  const clouds: Ellipse[] = [];
  for (let i = 0; i < (W < 600 ? 6 : 10); i++) {
    const cx = rc() * W;
    const cy = hy * (0.1 + rc() * 0.45);
    const rx = W * (0.16 + rc() * 0.18);
    for (let k = 0; k < 3; k++) {
      clouds.push({
        cx: cx + (k - 1) * rx * 0.55,
        cy: cy + (k === 1 ? -rx * 0.05 : 0),
        rx: rx * (k === 1 ? 0.7 : 0.55),
        ry: rx * 0.16,
      });
    }
  }

  return {
    view,
    width: W,
    height: H,
    horizonY: hy,
    waterTop: w0,
    waterBottom: w1,
    hills,
    shore: band(hy + 3, 1),
    shoreReflection: band(w0, -1),
    glints,
    lotusPads,
    lotusFlowers,
    terraces,
    bunds,
    stalks,
    palms,
    kumbuk,
    stars,
    clouds,
  };
}

export interface LandscapeColours {
  readonly hills: readonly [string, string][];
  readonly shore: string;
  readonly waterStops: readonly [string, string, string];
  readonly lotus: string;
  readonly lotusFlower: string;
  readonly paddyBase: string;
  readonly terraces: readonly string[];
  readonly bund: string;
  readonly stalk: string;
  readonly silhouette: string;
  readonly glint: string;
}

/** The landscape's colours from the sky, its daylight and the world's glow. */
export function landscapeColours(
  palette: SkyPalette,
  daylight: number,
  worldGlow: string,
): LandscapeColours {
  const L = daylight;
  const far = [
    mixHex(palette.hillFar, palette.horizon, 0.55),
    mixHex(palette.hillFar, palette.horizon, 0.25),
    palette.hillNear,
  ];
  const night = '#06100A';
  return {
    hills: far.map(
      (c, i) =>
        [mixHex(c, palette.horizon, 0.12), mixHex(c, palette.horizon, 0.35 - i * 0.1)] as [
          string,
          string,
        ],
    ),
    shore: mixHex(palette.hillNear, palette.land, 0.55),
    waterStops: [
      mixHex(palette.horizon, '#1A2A33', 0.22),
      mixHex(mixHex(palette.top, palette.horizon, 0.5), '#0E1C26', 0.3),
      mixHex(palette.top, '#08121A', 0.42),
    ],
    lotus: mixHex(mixHex('#3F6A30', palette.land, 0.5), night, (1 - L) * 0.5),
    lotusFlower: mixHex('#E8A6B8', worldGlow, 0.15),
    paddyBase: mixHex(palette.paddy, night, (1 - L) * 0.4),
    terraces: Array.from({ length: TERRACE_ROWS }, (_, i) =>
      mixHex(
        mixHex(palette.paddy, mixHex(palette.paddy, '#E9E2A0', 0.22), (i % 2) * 0.6 * L),
        night,
        (1 - L) * 0.35 + i * 0.012,
      ),
    ),
    bund: mixHex(palette.land, '#000000', 0.45),
    stalk: mixHex(palette.paddy, '#F2EBB0', 0.35 * L),
    silhouette: mixHex(palette.land, '#050A07', 0.55 + (1 - L) * 0.3),
    glint: L > 0.3 ? '#FFE9BE' : '#E6EBF5',
  };
}

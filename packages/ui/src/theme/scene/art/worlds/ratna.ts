/**
 * Ratna, the gem country: ivory light over the hills of Sabaragamuwa, the holy peak standing far
 * off in the haze, and a river running sapphire through the valley where gems are washed. Along
 * the top hangs a border of beeralu lace, its scallops and holes swinging a little. One sapphire
 * of light sits in the scene: the river's glint.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { bush, hills, palm, rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  circle,
  contextOf,
  ellipse,
  mistBand,
  mix,
  n,
  rect,
  ridgeShape,
  rng,
  shape,
  skyLayers,
  solid,
  vertical,
} from '../kit';
import type { ArtLayer, SceneArt } from '../types';

/** Beeralu lace along the top edge: scallops, a row of holes, and little picot dots. */
function lace(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const ivory = c.lit(mix(t.ground, L.white, 0.5));
  const depth = H * 0.05;
  const r = W * 0.045;
  let edge = `M0 0L${n(W)} 0L${n(W)} ${n(depth)}`;
  for (let x = W; x > -r * 2; x -= r * 2) edge += `A${n(r)} ${n(r * 0.8)} 0 0 1 ${n(x - r * 2)} ${n(depth)}`;
  edge += `L0 ${n(depth)}Z`;
  const holes: string[] = [];
  const picots: string[] = [];
  for (let x = r; x < W + r; x += r * 2) {
    holes.push(circle(x, depth * 0.55, r * 0.22));
    holes.push(circle(x - r, depth * 0.3, r * 0.1));
    picots.push(circle(x, depth + r * 0.8 + 2, 1.6));
  }
  return {
    id: 'lace',
    shapes: [
      shape(edge, solid(a(ivory, 0.94)), { blur: 0.3 }),
      shape(holes.join(''), solid(a(c.sky.top, 0.85))),
      shape(picots.join(''), solid(a(ivory, 0.9))),
      shape(rect(0, depth * 0.08, W, 1), solid(a(c.lit(t.lamp), 0.5))),
    ],
    motion: { kind: 'sway', amount: 0.4, periodMs: 9000, origin: [W / 2, 0] },
  };
}

/** The holy peak: a steep cone far off, with a lighter sunlit face. */
function peak(c: ArtContext, base: number): ArtLayer {
  const { W, H, t, sky } = c;
  const x = W * 0.66;
  const top = base - H * 0.13;
  const colour = c.lit(mix(mix(t.ink, t.lamp, 0.25), sky.horizon, 0.62));
  const face = c.lit(mix(mix(t.ground, t.lamp, 0.15), sky.horizon, 0.5));
  return {
    id: 'peak',
    shapes: [
      shape(`M${n(x - W * 0.42)} ${n(base)}C${n(x - W * 0.2)} ${n(base - H * 0.03)} ${n(x - W * 0.06)} ${n(top + H * 0.03)} ${n(x - W * 0.015)} ${n(top + H * 0.004)}Q${n(x)} ${n(top - H * 0.004)} ${n(x + W * 0.015)} ${n(top + H * 0.004)}C${n(x + W * 0.07)} ${n(top + H * 0.035)} ${n(x + W * 0.22)} ${n(base - H * 0.035)} ${n(x + W * 0.45)} ${n(base)}Z`, solid(colour)),
      shape(`M${n(x - W * 0.012)} ${n(top + H * 0.006)}C${n(x - W * 0.05)} ${n(top + H * 0.04)} ${n(x - W * 0.16)} ${n(base - H * 0.03)} ${n(x - W * 0.3)} ${n(base)}L${n(x - W * 0.1)} ${n(base)}C${n(x - W * 0.05)} ${n(base - H * 0.05)} ${n(x - W * 0.02)} ${n(top + H * 0.05)} ${n(x - W * 0.012)} ${n(top + H * 0.006)}Z`, solid(a(face, 0.45))),
    ],
  };
}

/** The river: a sapphire ribbon winding from the far hills to the bottom of the screen. */
function river(c: ArtContext, top: number): ArtLayer[] {
  const { W, H, t } = c;
  const sapphire = c.lit(t.lamp);
  const shallow = c.lit(mix(t.glow, L.white, 0.2));
  // A ribbon that widens toward the viewer: its centre line, offset to each side.
  const centre = (s: number): [number, number] => {
    const y = top + (H - top) * s;
    return [W * (0.5 + Math.sin(s * 5.2 + 0.4) * 0.12 * s - s * 0.06), y];
  };
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const s = i / 40;
    const [cx, cy] = centre(s);
    const half = W * (0.004 + s * s * 0.07);
    left.push(`${i ? 'L' : 'M'}${n(cx - half)} ${n(cy)}`);
    right.unshift(`L${n(cx + half)} ${n(cy)}`);
  }
  const d = `${left.join('')}${right.join('')}Z`;
  const glints: string[] = [];
  const rand = rng(44);
  for (let i = 0; i < 14; i++) {
    const s = rand();
    const [gx, gy] = centre(s);
    glints.push(ellipse(gx + (rand() - 0.5) * W * 0.08 * s, gy, W * (0.006 + s * 0.02), 0.8 + s));
  }
  return [
    {
      id: 'river',
      shapes: [
        shape(d, undefined, { stroke: { colour: a(shallow, 0.6), width: 2.2, cap: 'round' } }),
        shape(d, vertical(top, H, [[mix(sapphire, c.sky.horizon, 0.4), 0], [sapphire, 0.5], [c.lit(t.lampDeep), 1]])),
      ],
    },
    {
      id: 'river-glints',
      shapes: [shape(glints.join(''), solid(a(mix(t.glow, L.white, 0.6), 0.75)))],
      motion: { kind: 'glow', amount: 0.6, periodMs: 2800 },
      from: 'floor',
    },
  ];
}

export function ratnaArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.5);
  const { W, H, hy, t, sky } = c;
  // Ratna's hills are ivory and taupe, so the one sapphire (the river) is the only blue.
  const green = mix(t.ground, t.ink, 0.35);
  const leafy = mix(mix(t.ground, t.ink, 0.5), L.sunLow, 0.12);
  const layers: ArtLayer[] = [...skyLayers(c, mix(t.ground, t.glow, 0.4))];
  layers.push(peak(c, hy + H * 0.01));
  layers.push(mistBand(c, hy - H * 0.04, H * 0.07, 0.55, 'mist-peak'));
  layers.push(...hills(c, mix(leafy, green, 0.2), hy, 2, 8.2, 2.8));
  layers.push(...hills(c, leafy, hy + H * 0.1, 3, 13.4, 2.2));
  layers.push(...river(c, hy + H * 0.06));
  // Areca palms and bushes on the near banks, framing the river.
  const dark = c.lit(mix(leafy, t.ink, 0.45));
  const palms = [palm(W * 0.1, H * 1.02, H * 0.42, 0.06, 5), palm(W * 0.9, H * 1.02, H * 0.36, -0.08, 9), palm(W * 0.78, H * 0.96, H * 0.26, -0.02, 13)];
  layers.push({
    id: 'banks',
    shapes: [
      shape(bush(W * 0.06, H * 0.96, W * 0.12, 3) + bush(W * 0.94, H * 0.95, W * 0.13, 7) + bush(W * 0.68, H * 0.9, W * 0.07, 11), solid(dark)),
      shape(palms.map((p) => p.trunk).join(''), solid(dark)),
    ],
  });
  layers.push({
    id: 'palm-fronds',
    shapes: [shape(palms.map((p) => p.fronds).join(''), solid(dark))],
    motion: { kind: 'sway', amount: 1, periodMs: 7600, origin: [W / 2, H] },
  });
  layers.push(lace(c));

  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'glint',
        count: 16,
        colour: a(mix(t.glow, L.white, 0.6), 0.95),
        size: [0.8, 1.8],
        area: { x: W * 0.25, y: hy + H * 0.06, width: W * 0.4, height: H - hy },
        drift: [0, 6],
        wander: 8,
        twinkle: true,
        halo: 3,
        seed: 17,
      },
      ...(c.light < 0.45
        ? [
            {
              kind: 'firefly' as const,
              count: 12,
              colour: mix(t.glow, L.firefly, 0.4),
              size: [1, 1.8] as const,
              area: { x: 0, y: hy, width: W, height: H - hy },
              drift: [3, -2] as const,
              wander: 12,
              twinkle: true,
              halo: 5,
              seed: 3,
            },
          ]
        : []),
      ...rainOf(c),
    ],
    overlays: [
      {
        id: 'mist',
        kind: 'band',
        x: -W * 0.2,
        y: hy - H * 0.05,
        width: W * 1.4,
        height: H * 0.09,
        colour: mix(L.mist, sky.horizon, 0.3),
        opacity: 0.5,
        motion: { kind: 'drift', amount: W * 0.06, periodMs: 25_000 },
      },
      {
        id: 'sapphire',
        kind: 'glow',
        x: W * 0.2,
        y: hy + H * 0.15,
        width: W * 0.5,
        height: W * 0.5,
        colour: t.glow,
        opacity: 0.25,
        motion: { kind: 'glow', amount: 0.5, periodMs: 6000 },
      },
    ],
    shaders: [
      { kind: 'water', x: W * 0.2, y: hy + H * 0.06, width: W * 0.5, height: H - hy - H * 0.06, colour: t.glow, strength: 0.3 },
    ],
  };
}

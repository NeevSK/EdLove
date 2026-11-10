/**
 * Perahera, the festival night: the temple's tiered roofs dark against the sky, strings of
 * coloured flags swinging overhead, a line of caparisoned elephants pacing slowly with lamps on
 * their cloths, and torches burning along the road. By day the flags and roofs stay; the torches
 * wait for dusk. Ceremonial and bright.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { fireLayers, pennants, rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  circle,
  contextOf,
  ellipse,
  mix,
  n,
  rect,
  rng,
  shape,
  skyLayers,
  solid,
  vertical,
} from '../kit';
import type { ArtLayer, ArtShape, Point, SceneArt } from '../types';

/** Tiered Kandyan roofs: each tier a wide low hip with upturned ends. */
function roofs(c: ArtContext, base: number): ArtLayer {
  const { W, H, t } = c;
  const dark = c.lit(mix(t.ink, t.ornament, 0.3), 0.15);
  const walls = c.lit(mix(t.ground, t.ink, 0.25), 0.1);
  const shapes: ArtShape[] = [];
  const tier = (cx: number, y: number, w: number, h: number) =>
    `M${n(cx - w / 2 - w * 0.06)} ${n(y - h * 0.18)}Q${n(cx - w / 2)} ${n(y)} ${n(cx - w * 0.36)} ${n(y)}L${n(cx + w * 0.36)} ${n(y)}Q${n(cx + w / 2)} ${n(y)} ${n(cx + w / 2 + w * 0.06)} ${n(y - h * 0.18)}L${n(cx + w * 0.22)} ${n(y - h)}L${n(cx - w * 0.22)} ${n(y - h)}Z`;
  const buildings: [number, number, number][] = [
    [0.5, 0.5, 3],
    [0.13, 0.3, 2],
    [0.87, 0.3, 2],
  ];
  for (const [ux, uw, tiers] of buildings) {
    const cx = W * ux;
    const w = W * uw;
    let y = base;
    const wallH = H * 0.05;
    shapes.push(shape(rect(cx - w * 0.36, y - wallH, w * 0.72, wallH), solid(walls)));
    y -= wallH;
    for (let k = 0; k < tiers; k++) {
      const tw = w * (1 - k * 0.3);
      const th = H * 0.035;
      shapes.push(shape(tier(cx, y, tw, th), solid(dark)));
      y -= th;
      if (k < tiers - 1) {
        shapes.push(shape(rect(cx - tw * 0.24, y - H * 0.015, tw * 0.48, H * 0.015), solid(walls)));
        y -= H * 0.015;
      }
    }
    shapes.push(shape(`M${n(cx - 2)} ${n(y)}L${n(cx)} ${n(y - H * 0.025)}L${n(cx + 2)} ${n(y)}Z`, solid(c.lit(t.glow))));
  }
  // Lit windows along the walls after dusk.
  if (c.light < 0.5) {
    const rand = rng(8);
    const lit: string[] = [];
    for (let i = 0; i < 24; i++) lit.push(rect(W * (0.12 + rand() * 0.76), base - H * (0.015 + rand() * 0.025), 3, 4));
    shapes.push(shape(lit.join(''), solid(a(L.window, 0.85))));
  }
  return { id: 'roofs', shapes };
}

/** An elephant in its caparison, facing right, at (x, foot), `h` tall at the shoulder. */
function elephant(x: number, foot: number, h: number): { body: string; cloth: string; lamps: Point[] } {
  const w = h * 1.35;
  const legW = h * 0.17;
  const top = foot - h;
  const body = [
    `M${n(x - w / 2)} ${n(foot - h * 0.45)}C${n(x - w / 2)} ${n(top - h * 0.05)} ${n(x + w * 0.3)} ${n(top - h * 0.12)} ${n(x + w * 0.42)} ${n(top + h * 0.12)}C${n(x + w * 0.58)} ${n(top + h * 0.2)} ${n(x + w * 0.6)} ${n(top + h * 0.55)} ${n(x + w * 0.56)} ${n(foot - h * 0.1)}L${n(x + w * 0.5)} ${n(foot - h * 0.1)}C${n(x + w * 0.52)} ${n(top + h * 0.6)} ${n(x + w * 0.46)} ${n(top + h * 0.45)} ${n(x + w * 0.38)} ${n(foot - h * 0.42)}L${n(x - w / 2)} ${n(foot - h * 0.42)}Z`,
    ...[-0.4, -0.2, 0.12, 0.3].map((u) => rect(x + w * u, foot - h * 0.5, legW, h * 0.5)),
  ].join('');
  const cloth = `M${n(x - w * 0.44)} ${n(top + h * 0.05)}L${n(x + w * 0.36)} ${n(top + h * 0.02)}L${n(x + w * 0.34)} ${n(foot - h * 0.32)}L${n(x - w * 0.42)} ${n(foot - h * 0.32)}Z`;
  const lamps: Point[] = [];
  for (let i = 0; i < 6; i++) {
    lamps.push([x - w * 0.38 + i * w * 0.14, foot - h * 0.36]);
    lamps.push([x - w * 0.36 + i * w * 0.14, top + h * 0.14]);
  }
  return { body, cloth, lamps };
}

export function peraheraArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.55);
  const { W, H, hy, t, sky } = c;
  const night = c.light < 0.5;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];
  layers.push(roofs(c, hy + H * 0.02));
  // The road, lit warm from the torches at night.
  const roadTop = hy;
  layers.push({
    id: 'road',
    shapes: [
      shape(
        rect(0, roadTop, W, H - roadTop),
        vertical(roadTop, H, [
          [c.lit(mix(t.ground, t.ornament, 0.3)), 0],
          [night ? mix(c.lit(mix(t.ground, t.ink, 0.3)), L.flame, 0.18) : c.lit(mix(t.ground, t.ink, 0.25)), 0.5],
          [c.lit(mix(t.ground, t.ink, 0.55)), 1],
        ]),
      ),
    ],
  });
  // The procession: elephants pacing, small to large toward the viewer.
  const herd = [
    elephant(W * 0.2, hy + H * 0.13, H * 0.06),
    elephant(W * 0.52, hy + H * 0.16, H * 0.075),
    elephant(W * 0.84, hy + H * 0.19, H * 0.09),
  ];
  const hide = c.lit(mix(t.ink, sky.top, 0.2));
  const lampDots = herd.flatMap((e) => e.lamps);
  layers.push({
    id: 'elephants',
    shapes: [
      shape(herd.map((e) => e.body).join(''), solid(hide)),
      shape(herd.map((e) => e.cloth).join(''), solid(c.lit(t.ornament))),
      shape(lampDots.map(([x, y]) => circle(x, y, 1.6)).join(''), solid(night ? L.window : c.lit(t.glow))),
    ],
    motion: { kind: 'drift', amount: W * 0.015, periodMs: 12_000 },
  });
  // Flags overhead, in the festival's colours.
  const colours = [c.lit(t.lamp), c.lit(t.glow), c.lit(t.ornament), c.lit(mix(t.success, t.glow, 0.3)), c.lit(L.white)];
  layers.push({
    id: 'flags',
    shapes: [
      ...pennants(-W * 0.05, H * 0.03, W * 1.05, H * 0.05, H * 0.06, colours, W * 0.045, 3),
      ...pennants(-W * 0.05, H * 0.13, W * 1.05, H * 0.1, H * 0.05, colours.slice(1), W * 0.038, 7),
    ],
    motion: { kind: 'sway', amount: 0.7, periodMs: 4200, origin: [W / 2, 0] },
  });
  // Torches along both sides of the road.
  const poles: Point[] = [
    [W * 0.05, H * 0.9],
    [W * 0.95, H * 0.9],
    [W * 0.24, hy + H * 0.2],
    [W * 0.76, hy + H * 0.22],
  ];
  const poleTops: Point[] = poles.map(([x, y], i) => [x, y - H * (i < 2 ? 0.26 : 0.12)]);
  layers.push({
    id: 'torch-poles',
    shapes: [shape(poles.map(([x, y], i) => rect(x - 1.6, poleTops[i]![1], 3.2, y - poleTops[i]![1])).join(''), solid(c.lit(mix(t.ink, t.ornament, 0.4))))],
  });
  if (night) layers.push(...fireLayers(c, 'torches', poleTops, H * 0.035));
  else layers.push({ id: 'torch-heads', shapes: [shape(poleTops.map(([x, y]) => ellipse(x, y - 4, 5, 6)).join(''), solid(c.lit(t.ornament)))] });

  return {
    width: W,
    height: H,
    layers,
    particles: [
      ...(night
        ? [
            {
              kind: 'ember' as const,
              count: 26,
              colour: a(L.flame, 0.95),
              size: [0.7, 1.5] as const,
              area: { x: 0, y: H * 0.35, width: W, height: H * 0.5 },
              drift: [3, -22] as const,
              wander: 12,
              twinkle: true,
              halo: 4,
              seed: 12,
            },
          ]
        : []),
      {
        kind: 'petal',
        count: 8,
        colour: c.lit(t.glow),
        size: [2.4, 3.6],
        area: { x: 0, y: 0, width: W, height: H },
        drift: [6, 22],
        wander: 18,
        twinkle: false,
        seed: 5,
      },
      ...rainOf(c),
    ],
    overlays: night
      ? poleTops.slice(0, 2).map(([x, y], i) => ({
          id: `torch-${i}`,
          kind: 'glow' as const,
          x: x - W * 0.25,
          y: y - W * 0.25,
          width: W * 0.5,
          height: W * 0.5,
          colour: L.flame,
          opacity: 0.32,
          motion: { kind: 'glow' as const, amount: 0.5, periodMs: 1200 + i * 250 },
        }))
      : [
          {
            id: 'sun',
            kind: 'glow',
            x: c.sun[0] - W * 0.3,
            y: c.sun[1] - W * 0.3,
            width: W * 0.6,
            height: W * 0.6,
            colour: t.glow,
            opacity: 0.3,
            motion: { kind: 'glow', amount: 0.4, periodMs: 8000 },
          },
        ],
    shaders: night
      ? poleTops.slice(0, 2).map(([x, y]) => ({ kind: 'heat' as const, x: x - W * 0.07, y: y - H * 0.12, width: W * 0.14, height: H * 0.1, colour: L.flame, strength: 0.3 }))
      : [],
  };
}

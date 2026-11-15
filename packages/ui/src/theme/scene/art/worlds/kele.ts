/**
 * Kele, the forest canopy: standing on the floor of a wet-zone rainforest (Sinharaja) looking out
 * and up. Backlit leaves and dark branches frame the top of the screen; beyond them, ridge after
 * ridge of tree crowns fade into blue-green mist, with a few emergent giants rising above. By day
 * light falls through in shafts with motes and a slow leaf; at dusk the fireflies come out.
 */

import {
  a,
  type ArtContext,
  blob,
  bow,
  contextOf,
  ellipse,
  leaf,
  midrib,
  mistBand,
  mix,
  rect,
  ridge,
  ridgeShape,
  rng,
  shape,
  skyLayers,
  solid,
  vertical,
  type ArtInput,
} from '../kit';
import { SCENE_LIGHT as L } from '../../sky';
import type { ArtLayer, ArtShape, SceneArt } from '../types';

/** A ridge of rounded tree crowns: a filled band plus a row of crowns along its top. */
function crownRidge(
  c: ArtContext,
  id: string,
  base: number,
  crownR: number,
  colour: string,
  seed: number,
  from?: ArtLayer['from'],
): ArtLayer {
  const { W, H } = c;
  const rand = rng(seed);
  const crowns: string[] = [];
  for (let x = -crownR; x < W + crownR; x += crownR * (0.9 + rand() * 0.6)) {
    const lift = ridge(x / W, seed, crownR * 1.4, 3.1);
    const r = crownR * (0.8 + rand() * 0.55);
    crowns.push(blob(x, base - lift, r, 7, seed + Math.round(x), 0.82));
  }
  return {
    id,
    from,
    shapes: [
      shape(rect(0, base, W, H - base), solid(colour)),
      shape(crowns.join(''), solid(colour)),
    ],
  };
}

/** A branch reaching in from a top corner, with dark leaves behind and backlit ones in front. */
function branch(c: ArtContext, side: 'left' | 'right', seed: number): ArtLayer[] {
  const { W, H, t } = c;
  const rand = rng(seed);
  const dir = side === 'left' ? 1 : -1;
  const x0 = side === 'left' ? -W * 0.05 : W * 1.05;
  const y0 = H * (0.02 + rand() * 0.04);
  const x1 = x0 + dir * W * (0.5 + rand() * 0.12);
  const y1 = H * (0.12 + rand() * 0.06);
  const wood = c.lit(mix(t.ink, t.ornament, 0.35));
  const shadowLeaf = c.lit(mix(t.ornament, t.ink, 0.35));
  // Backlit: the lamp lit from behind by the sky, glowing more by day.
  const litLeaf = mix(t.lamp, t.glow, 0.35);
  const backlit = c.lit(litLeaf);

  const dark: string[] = [];
  const bright: ArtShape[] = [];
  const veins: string[] = [];
  const twigs: string[] = [];
  const count = 26;
  for (let i = 0; i < count; i++) {
    const s = i / count;
    const bx = x0 + (x1 - x0) * s;
    const by = y0 + (y1 - y0) * s + Math.sin(s * Math.PI) * H * 0.03;
    const tx = bx + dir * (rand() * W * 0.03);
    const ty = by + (rand() - 0.2) * H * 0.04;
    twigs.push(`M${bx.toFixed(1)} ${by.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`);
    const leaves = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < leaves; k++) {
      const ang = Math.PI / 2 + (rand() - 0.5) * 2.2 + (dir > 0 ? -0.2 : 0.2);
      const len = W * (0.05 + rand() * 0.045);
      const wid = len * (0.26 + rand() * 0.1);
      const d = leaf(tx, ty, len, wid, ang);
      if (rand() < 0.45) dark.push(d);
      else {
        bright.push(shape(d, solid(a(backlit, 0.72 + rand() * 0.25))));
        veins.push(midrib(tx, ty, len, ang));
      }
    }
  }
  const limb = bow(x0, y0, x1, y1, -H * 0.03);
  const origin: [number, number] = [x0, y0];
  return [
    {
      id: `branch-${side}-shade`,
      shapes: [shape(dark.join(''), solid(a(shadowLeaf, 0.92)))],
      motion: { kind: 'sway', amount: 1.1, periodMs: 7400, offset: (seed % 7) / 7, origin },
    },
    {
      id: `branch-${side}`,
      shapes: [
        shape(limb, undefined, {
          stroke: { colour: wood, width: Math.max(5, W * 0.016), cap: 'round' },
        }),
        shape(twigs.join(''), undefined, {
          stroke: { colour: a(wood, 0.75), width: Math.max(0.9, W * 0.0024), cap: 'round' },
        }),
        ...bright,
        shape(veins.join(''), undefined, {
          stroke: { colour: a(mix(backlit, t.ink, 0.5), 0.55), width: 0.8, cap: 'round' },
        }),
      ],
      motion: { kind: 'sway', amount: 1.4, periodMs: 6200, offset: (seed % 5) / 5, origin },
    },
  ];
}

/** Hanging lianas from the canopy frame. */
function lianas(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const rand = rng(77);
  const lines: string[] = [];
  const tips: string[] = [];
  for (let i = 0; i < 7; i++) {
    const left = i < 4;
    const x = left ? W * (0.04 + i * 0.07) : W * (0.98 - (i - 4) * 0.08);
    const y0 = H * (0.08 + rand() * 0.06);
    const len = H * (0.1 + rand() * 0.16);
    lines.push(bow(x, y0, x + (rand() - 0.5) * W * 0.04, y0 + len, W * 0.02));
    tips.push(leaf(x, y0 + len, W * 0.03, W * 0.01, Math.PI / 2 + (rand() - 0.5)));
  }
  const vine = c.lit(mix(t.ornament, t.ink, 0.2));
  return {
    id: 'lianas',
    from: 'middle',
    shapes: [
      shape(lines.join(''), undefined, {
        stroke: { colour: a(vine, 0.8), width: 1.3, cap: 'round' },
      }),
      shape(tips.join(''), solid(a(c.lit(t.lamp), 0.8))),
    ],
    motion: { kind: 'sway', amount: 1.6, periodMs: 8800, origin: [W / 2, 0] },
  };
}

/** Ferns at the bottom corners: arching fronds of paired leaflets. */
function ferns(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const fronds: string[] = [];
  const rand = rng(91);
  const roots: [number, number, number][] = [
    [-W * 0.02, H * 1.01, -0.95],
    [W * 0.1, H * 1.02, -1.25],
    [W * 1.02, H * 1.01, -2.2],
    [W * 0.9, H * 1.02, -1.9],
  ];
  for (const [rx, ry, angle] of roots) {
    const len = H * (0.22 + rand() * 0.07);
    const steps = 14;
    for (let k = 1; k < steps; k++) {
      const s = k / steps;
      const bend = angle + s * (angle > -1.57 ? 0.7 : -0.7);
      const px = rx + Math.cos(angle) * len * s + Math.cos(bend) * len * 0.12 * s * s;
      const py = ry + Math.sin(angle) * len * s + len * 0.35 * s * s;
      const ll = len * 0.16 * (1 - s * 0.7);
      fronds.push(leaf(px, py, ll, ll * 0.3, bend - 1.15));
      fronds.push(leaf(px, py, ll, ll * 0.3, bend + 1.15));
    }
  }
  return {
    id: 'ferns',
    shapes: [shape(fronds.join(''), solid(c.lit(mix(t.ornament, t.lamp, 0.4))))],
    motion: { kind: 'sway', amount: 0.8, periodMs: 9600, origin: [W / 2, H] },
  };
}

/** Emergent giants rising above the canopy: a tapered, slightly leaning trunk and a layered crown. */
function emergents(c: ArtContext, base: number, colour: string, crownLight: string): ArtLayer {
  const { W, H } = c;
  const shapes: ArtShape[] = [];
  const spots: [number, number, number][] = [
    [0.2, 0.12, -0.04],
    [0.74, 0.16, 0.03],
  ];
  for (const [i, [rx, lift, lean]] of spots.entries()) {
    const x = W * rx;
    const top = base - H * lift;
    const tx = x + lean * W;
    const w0 = W * 0.012;
    const w1 = W * 0.004;
    shapes.push(
      shape(
        `M${(x - w0).toFixed(1)} ${base.toFixed(1)}Q${(x + lean * W * 0.4 - w1).toFixed(1)} ${((base + top) / 2).toFixed(1)} ${(tx - w1).toFixed(1)} ${top.toFixed(1)}L${(tx + w1).toFixed(1)} ${top.toFixed(1)}Q${(x + lean * W * 0.4 + w1).toFixed(1)} ${((base + top) / 2).toFixed(1)} ${(x + w0).toFixed(1)} ${base.toFixed(1)}Z`,
        solid(colour),
      ),
    );
    const cr = W * (0.11 + i * 0.02);
    const crown: string[] = [];
    for (let k = 0; k < 5; k++) {
      const ox = (k - 2) * cr * 0.42;
      const oy = -Math.abs(k - 2) * -cr * 0.06 - cr * 0.05;
      crown.push(
        blob(tx + ox, top + oy, cr * (0.55 - Math.abs(k - 2) * 0.08), 8, 300 + i * 10 + k, 0.55),
      );
    }
    shapes.push(shape(crown.join(''), solid(colour)));
    shapes.push(
      shape(blob(tx - cr * 0.3, top - cr * 0.16, cr * 0.42, 7, 400 + i, 0.45), solid(crownLight)),
    );
  }
  return { id: 'emergents', shapes };
}

/** Two great trunks at the screen's edges: we stand among them, looking out. */
function trunks(c: ArtContext, colour: string, lightEdge: string): ArtLayer {
  const { W, H } = c;
  const shapes: ArtShape[] = [];
  for (const side of [-1, 1] as const) {
    const edge = side < 0 ? 0 : W;
    const inner = edge - side * W * 0.045;
    const foot = edge - side * W * 0.09;
    const d = `M${edge - side * W * 0.02} -10L${inner.toFixed(1)} -10Q${(inner + side * W * 0.01).toFixed(1)} ${(H * 0.6).toFixed(1)} ${foot.toFixed(1)} ${(H + 10).toFixed(1)}L${(edge + side * 10).toFixed(1)} ${(H + 10).toFixed(1)}Z`;
    shapes.push(shape(d, solid(colour)));
    shapes.push(
      shape(
        `M${inner.toFixed(1)} -10Q${(inner + side * W * 0.01).toFixed(1)} ${(H * 0.6).toFixed(1)} ${foot.toFixed(1)} ${(H + 10).toFixed(1)}`,
        undefined,
        {
          stroke: { colour: lightEdge, width: 1.6, cap: 'round' },
        },
      ),
    );
  }
  return { id: 'trunks', shapes };
}

export function keleArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.58);
  const { W, H, hy, t, sky } = c;
  const haze = (colour: string, depth: number) => c.lit(mix(colour, sky.horizon, depth));
  const green = t.ornament;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];

  // Light shafts through the canopy (painted still, softly; the shader adds the shimmer).
  if (c.light > 0.3 && c.veil > 0.4) {
    const [sx] = c.sun;
    const shafts: ArtShape[] = [];
    for (let i = 0; i < 4; i++) {
      const x = sx + (i - 1.5) * W * 0.14;
      shafts.push(
        shape(
          `M${(x - W * 0.02).toFixed(1)} 0L${(x + W * 0.02).toFixed(1)} 0L${(x + W * 0.16).toFixed(1)} ${H.toFixed(1)}L${(x - W * 0.04).toFixed(1)} ${H.toFixed(1)}Z`,
          vertical(0, H, [
            [a(t.glow, 0.16 * c.veil * c.light), 0],
            [a(t.glow, 0.0), 1],
          ]),
          { blur: 8 },
        ),
      );
    }
    layers.push({
      id: 'shafts',
      shapes: shafts,
      from: 'middle',
      motion: { kind: 'glow', amount: 0.4, periodMs: 7000 },
    });
  }

  layers.push({
    id: 'ridge-far',
    shapes: [shape(ridgeShape(W, hy - H * 0.06, H * 0.04, 3.4, 2.2, H), solid(haze(green, 0.82)))],
  });
  layers.push(crownRidge(c, 'canopy-far', hy - H * 0.035, W * 0.045, haze(green, 0.7), 12));
  layers.push(mistBand(c, hy - H * 0.06, H * 0.08, 0.55 * (c.wx.mist ? 1 : 0.6), 'mist-high'));
  layers.push(emergents(c, hy + H * 0.005, haze(green, 0.5), haze(mix(green, t.lamp, 0.35), 0.45)));
  layers.push(crownRidge(c, 'canopy-mid', hy + H * 0.02, W * 0.06, haze(green, 0.45), 31));
  layers.push(mistBand(c, hy + H * 0.02, H * 0.07, 0.45, 'mist-low'));
  layers.push(
    crownRidge(c, 'canopy-near', hy + H * 0.09, W * 0.085, haze(mix(green, t.ink, 0.2), 0.22), 57),
  );
  layers.push(
    crownRidge(c, 'canopy-close', hy + H * 0.19, W * 0.11, haze(mix(green, t.ink, 0.42), 0.08), 73),
  );
  const under = c.lit(mix(green, t.ink, 0.62));
  layers.push(crownRidge(c, 'undergrowth', hy + H * 0.3, W * 0.13, under, 97));
  // Dappled light on the undergrowth by day.
  if (c.light > 0.4) {
    layers.push({
      id: 'dapples',
      from: 'middle',
      shapes: [0.24, 0.52, 0.76].map((x, i) =>
        shape(
          ellipse(W * x, hy + H * (0.33 + i * 0.045), W * 0.1, H * 0.012),
          solid(a(t.glow, 0.18 * c.light * c.veil)),
          { blur: 5 },
        ),
      ),
      motion: { kind: 'glow', amount: 0.6, periodMs: 6400 },
    });
  }
  layers.push(trunks(c, c.lit(mix(t.ink, t.ornament, 0.2)), a(c.lit(t.lamp), 0.35)));
  layers.push(ferns(c));
  layers.push(lianas(c));
  layers.push(...branch(c, 'left', 3));
  layers.push(...branch(c, 'right', 8));

  const evening = c.light < 0.55;
  const particles: SceneArt['particles'] = evening
    ? [
        {
          kind: 'firefly',
          count: 28,
          colour: mix(t.glow, L.firefly, 0.4),
          size: [1.3, 2.4],
          area: { x: 0, y: hy, width: W, height: H - hy },
          drift: [6, -3],
          wander: 18,
          twinkle: true,
          halo: 7,
          seed: 5,
        },
      ]
    : [
        {
          kind: 'mote',
          count: 26,
          colour: a(t.glow, 0.85),
          size: [0.8, 1.6],
          area: { x: c.sun[0] - W * 0.3, y: H * 0.1, width: W * 0.6, height: H * 0.7 },
          drift: [3, 6],
          wander: 10,
          twinkle: true,
          seed: 9,
        },
        {
          kind: 'leaf',
          count: 5,
          colour: c.lit(mix(t.lamp, t.ornament, 0.3)),
          size: [4, 6],
          area: { x: 0, y: -H * 0.05, width: W, height: H },
          drift: [8, 24],
          wander: 26,
          twinkle: false,
          seed: 13,
        },
      ];

  return {
    width: W,
    height: H,
    layers,
    particles,
    overlays: [
      {
        id: 'mist',
        kind: 'band',
        x: -W * 0.2,
        y: hy - H * 0.05,
        width: W * 1.4,
        height: H * 0.11,
        colour: mix(L.mist, sky.horizon, 0.35),
        opacity: 0.5,
        motion: { kind: 'drift', amount: W * 0.08, periodMs: 22_000 },
      },
      {
        id: 'light',
        kind: 'glow',
        x: c.sun[0] - W * 0.35,
        y: c.sun[1] - W * 0.35,
        width: W * 0.7,
        height: W * 0.7,
        colour: evening ? mix(t.glow, L.firefly, 0.4) : t.glow,
        opacity: 0.35,
        motion: { kind: 'glow', amount: 0.5, periodMs: 8000 },
      },
    ],
    shaders:
      c.light > 0.3
        ? [
            {
              kind: 'rays',
              x: 0,
              y: 0,
              width: W,
              height: hy,
              colour: t.glow,
              strength: 0.35 * c.veil,
            },
          ]
        : [
            {
              kind: 'mist',
              x: 0,
              y: hy - H * 0.08,
              width: W,
              height: H * 0.2,
              colour: sky.horizon,
              strength: 0.3,
            },
          ],
  };
}

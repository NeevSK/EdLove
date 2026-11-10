/**
 * Sanctuary, the quiet default: washi light over an open, warm plain. Far ridges whisper in the
 * mist, a still pool holds the sky, and a single flowering branch leans in from the corner. No
 * walls, nothing heavy: space and lamp light, breathing slowly.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { hills, rainOf, waterLayers } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  bow,
  contextOf,
  ellipse,
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

/** A flowering branch from the top-right corner: dark wood, soft leaves, lamp-coloured blossoms. */
function blossomBranch(c: ArtContext): ArtLayer[] {
  const { W, H, t } = c;
  const rand = rng(14);
  const x0 = W * 1.04;
  const y0 = H * 0.04;
  const wood = c.lit(mix(t.ink, t.ornament, 0.4));
  const leafColour = c.lit(mix(t.ornament, t.glow, 0.25));
  const flower = c.lit(mix(t.glow, L.white, 0.35));
  const twigs: string[] = [];
  const leaves: string[] = [];
  const petals: string[] = [];
  const hearts: string[] = [];
  const limbs: [number, number, number, number][] = [
    [x0, y0, W * 0.48, H * 0.14],
    [W * 0.78, H * 0.085, W * 0.6, H * 0.03],
    [W * 0.66, H * 0.115, W * 0.56, H * 0.2],
  ];
  for (const [ax, ay, bx, by] of limbs) {
    twigs.push(bow(ax, ay, bx, by, H * 0.02));
    for (let i = 0; i < 9; i++) {
      const s = 0.15 + (i / 9) * 0.85;
      const px = ax + (bx - ax) * s;
      const py = ay + (by - ay) * s;
      const ang = Math.PI / 2 + (rand() - 0.5) * 2.4;
      const len = W * (0.03 + rand() * 0.025);
      leaves.push(leaf(px, py, len, len * 0.3, ang));
      if (rand() < 0.5) {
        const fx = px + (rand() - 0.5) * W * 0.03;
        const fy = py + (rand() - 0.3) * H * 0.02;
        const r = W * (0.011 + rand() * 0.008);
        for (let k = 0; k < 5; k++)
          petals.push(petal(fx, fy, r, r * 0.55, (k / 5) * Math.PI * 2 + rand()));
        hearts.push(ellipse(fx, fy, r * 0.22, r * 0.22));
      }
    }
  }
  const origin: [number, number] = [x0, y0];
  return [
    {
      id: 'branch',
      shapes: [
        shape(twigs.join(''), undefined, {
          stroke: { colour: wood, width: Math.max(2.4, W * 0.007), cap: 'round' },
        }),
        shape(leaves.join(''), solid(a(leafColour, 0.88))),
        shape(petals.join(''), solid(a(flower, 0.95))),
        shape(hearts.join(''), solid(c.lit(t.lamp))),
      ],
      motion: { kind: 'sway', amount: 1.2, periodMs: 8200, origin },
    },
  ];
}

export function sanctuaryArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.56);
  const { W, H, hy, t, sky } = c;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];

  // Long soft beams from the upper sky by day (painted; the rays shader adds the shimmer).
  if (c.light > 0.35 && c.veil > 0.4) {
    const beams: ArtShape[] = [];
    for (let i = 0; i < 5; i++) {
      const x = W * (0.1 + i * 0.2);
      beams.push(
        shape(
          `M${x} 0L${x + W * 0.05} 0L${x + W * 0.2} ${hy}L${x + W * 0.04} ${hy}Z`,
          vertical(0, hy, [
            [a(t.glow, 0.13 * c.light * c.veil), 0],
            [a(t.glow, 0), 1],
          ]),
          { blur: 10 },
        ),
      );
    }
    layers.push({
      id: 'beams',
      shapes: beams,
      from: 'middle',
      motion: { kind: 'glow', amount: 0.45, periodMs: 9000 },
    });
  }

  layers.push(...hills(c, mix(t.ornament, t.glow, 0.5), hy - H * 0.05, 3, 4.1));
  layers.push(mistBand(c, hy - H * 0.05, H * 0.08, 0.6, 'mist-far'));

  // The warm plain: golden ground from the horizon to the bottom.
  const plainTop = hy + H * 0.01;
  layers.push({
    id: 'plain',
    shapes: [
      shape(
        rect(0, plainTop, W, H - plainTop),
        vertical(plainTop, H, [
          [c.lit(mix(t.glow, sky.horizon, 0.6)), 0],
          [c.lit(mix(t.glow, t.ground, 0.4)), 0.5],
          [c.lit(mix(t.lamp, t.ground, 0.55)), 1],
        ]),
      ),
    ],
  });

  // The still pool: an ellipse of the sky, with its light path.
  const poolTop = hy + H * 0.12;
  const pool = waterLayers(c, poolTop, poolTop + H * 0.12, t.glow, 'pool', {
    cx: W * 0.5,
    cy: poolTop + H * 0.06,
    rx: W * 0.46,
    ry: H * 0.06,
  });
  const [poolLayer, ...poolRest] = pool.layers;
  layers.push({
    ...poolLayer!,
    shapes: [
      shape(
        ellipse(W * 0.5, poolTop + H * 0.06, W * 0.46, H * 0.06),
        vertical(poolTop, poolTop + H * 0.12, [
          [mix(sky.horizon, L.white, 0.15), 0],
          [c.lit(mix(sky.top, t.glow, 0.3)), 1],
        ]),
      ),
    ],
  });
  layers.push(...poolRest.filter((l) => l.id === 'pool-path'));
  // Grass tufts in front of the pool, swaying.
  const rand = rng(8);
  const tufts: string[] = [];
  for (let i = 0; i < 40; i++) {
    const x = rand() * W;
    const y = H * (0.86 + rand() * 0.14);
    const h = H * (0.025 + rand() * 0.03);
    tufts.push(leaf(x, y, h, W * 0.004, -Math.PI / 2 + (rand() - 0.5) * 0.6));
  }
  layers.push({
    id: 'grass',
    shapes: [shape(tufts.join(''), solid(c.lit(mix(t.ornament, t.lamp, 0.3))))],
    motion: { kind: 'sway', amount: 0.9, periodMs: 7000, origin: [W / 2, H] },
  });
  layers.push(...blossomBranch(c));

  const evening = c.light < 0.5;
  return {
    width: W,
    height: H,
    layers,
    particles: [
      evening
        ? {
            kind: 'firefly',
            count: 18,
            colour: mix(t.glow, L.firefly, 0.5),
            size: [1.2, 2.2],
            area: { x: 0, y: hy, width: W, height: H - hy },
            drift: [5, -2],
            wander: 16,
            twinkle: true,
            halo: 6,
            seed: 3,
          }
        : {
            kind: 'mote',
            count: 22,
            colour: a(t.glow, 0.85),
            size: [0.8, 1.5],
            area: { x: 0, y: H * 0.05, width: W, height: H * 0.8 },
            drift: [4, 3],
            wander: 12,
            twinkle: true,
            seed: 7,
          },
      {
        kind: 'petal',
        count: 4,
        colour: c.lit(mix(t.glow, L.white, 0.35)),
        size: [3, 4.5],
        area: { x: W * 0.4, y: 0, width: W * 0.6, height: H },
        drift: [-6, 18],
        wander: 20,
        twinkle: false,
        seed: 11,
      },
      ...rainOf(c),
    ],
    overlays: [
      {
        id: 'mist',
        kind: 'band',
        x: -W * 0.2,
        y: hy - H * 0.06,
        width: W * 1.4,
        height: H * 0.1,
        colour: mix(L.mist, sky.horizon, 0.3),
        opacity: 0.5,
        motion: { kind: 'drift', amount: W * 0.07, periodMs: 24_000 },
      },
      {
        id: 'light',
        kind: 'glow',
        x: c.sun[0] - W * 0.3,
        y: c.sun[1] - W * 0.3,
        width: W * 0.6,
        height: W * 0.6,
        colour: t.glow,
        opacity: 0.32,
        motion: { kind: 'glow', amount: 0.5, periodMs: 9000 },
      },
    ],
    shaders: [
      // The pool is an ellipse: the shimmer stays inside its widest band.
      {
        ...pool.shader,
        x: W * 0.12,
        width: W * 0.76,
        y: poolTop + H * 0.02,
        height: H * 0.08,
        strength: 0.3,
      },
      ...(c.light > 0.35
        ? [
            {
              kind: 'rays' as const,
              x: 0,
              y: 0,
              width: W,
              height: hy,
              colour: t.glow,
              strength: 0.3 * c.veil,
            },
          ]
        : []),
    ],
  };
}

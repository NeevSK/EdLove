/**
 * Wewa, the ancient tank: wide still water under a low far shore. Dead trees stand in the
 * shallows where the tank rose over the old forest; blue water lilies open near the bank, reeds
 * lean in from the sides, and the moon (or the sun) lays a trembling path across the water.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { hills, rainOf, reeds, waterLayers } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  bow,
  contextOf,
  ellipse,
  mistBand,
  mix,
  petal,
  rng,
  shape,
  skyLayers,
  solid,
} from '../kit';
import type { ArtLayer, SceneArt } from '../types';

/** Bare silver trees standing in the water, with their reflections. */
function deadTrees(c: ArtContext, base: number): ArtLayer {
  const { W, H, t } = c;
  const rand = rng(19);
  const wood = c.lit(mix(t.ink, c.sky.horizon, 0.35), 0.2);
  const limbs: string[] = [];
  const mirrors: string[] = [];
  const spots = [0.12, 0.3, 0.63, 0.86];
  for (const [i, rx] of spots.entries()) {
    const x = W * rx;
    const h = H * (0.1 + rand() * 0.07) * (i % 2 ? 0.8 : 1);
    const lean = (rand() - 0.5) * W * 0.03;
    limbs.push(bow(x, base, x + lean, base - h, W * 0.01));
    mirrors.push(bow(x, base, x + lean, base + h * 0.6, -W * 0.01));
    // Two or three bare limbs reaching up and out.
    for (let k = 0; k < 3; k++) {
      const s = 0.45 + k * 0.17;
      const bx = x + lean * s;
      const by = base - h * s;
      const dir = k % 2 ? 1 : -1;
      const ex = bx + dir * W * (0.03 + rand() * 0.03);
      const ey = by - h * (0.18 + rand() * 0.15);
      limbs.push(bow(bx, by, ex, ey, dir * W * 0.006));
      mirrors.push(
        bow(bx, base + (base - by) * 0.6, ex, base + (base - ey) * 0.6, -dir * W * 0.006),
      );
    }
  }
  return {
    id: 'dead-trees',
    shapes: [
      shape(limbs.join(''), undefined, {
        stroke: { colour: wood, width: Math.max(1.6, W * 0.005), cap: 'round' },
      }),
      shape(mirrors.join(''), undefined, {
        stroke: { colour: a(wood, 0.28), width: Math.max(1.4, W * 0.004), cap: 'round' },
        blur: 1.5,
      }),
    ],
  };
}

/** Lily pads near the bank and a few blue water lilies (nil manel). */
function lilies(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const rand = rng(33);
  const pads: string[] = [];
  const petals: string[] = [];
  const hearts: string[] = [];
  for (let i = 0; i < 11; i++) {
    const x = W * (0.08 + rand() * 0.84);
    const y = H * (0.84 + rand() * 0.13);
    const r = W * (0.035 + rand() * 0.03);
    // A pad: an ellipse with a notch.
    pads.push(`${ellipse(x, y, r, r * 0.32)}`);
    if (rand() < 0.4) {
      const fy = y - r * 0.2;
      for (let k = 0; k < 8; k++) {
        const ang = -Math.PI / 2 + (k - 3.5) * 0.28;
        petals.push(petal(x, fy, r * 0.55, r * 0.14, ang));
      }
      hearts.push(ellipse(x, fy - r * 0.05, r * 0.12, r * 0.06));
    }
  }
  const flower = c.lit(mix(t.lamp, L.moonGlow, 0.45));
  return {
    id: 'lilies',
    shapes: [
      shape(pads.join(''), solid(c.lit(mix(t.ornament, t.ink, 0.35)))),
      shape(petals.join(''), solid(a(flower, 0.95))),
      shape(hearts.join(''), solid(c.lit(t.glow))),
    ],
    motion: { kind: 'drift', amount: W * 0.006, periodMs: 11_000 },
  };
}

export function wewaArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.5);
  const { W, H, hy, t, sky } = c;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];
  layers.push(...hills(c, mix(t.ornament, t.ink, 0.35), hy - H * 0.02, 2, 6.3, 1.8));
  // The far shore: a low band of trees right on the water.
  layers.push(...hills(c, mix(t.ornament, t.ink, 0.55), hy - H * 0.004, 1, 9.1, 7.5));
  const water = waterLayers(c, hy + H * 0.012, H, t.lamp);
  layers.push(...water.layers);
  layers.push(mistBand(c, hy - H * 0.01, H * 0.06, c.night ? 0.5 : 0.35, 'mist-water'));
  layers.push(deadTrees(c, hy + H * 0.09));
  layers.push(lilies(c));
  const reed = c.lit(mix(t.ornament, t.ink, 0.5));
  layers.push(reeds(c, 'left', reed, 4), reeds(c, 'right', reed, 9));

  const evening = c.light < 0.5;
  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'glint',
        count: 24,
        colour: a(c.scene.celestial.body === 'sun' ? L.sunDisc : L.moonDisc, 0.9),
        size: [0.7, 1.6],
        area: { x: c.sun[0] - W * 0.2, y: hy + H * 0.02, width: W * 0.4, height: H - hy },
        drift: [0, 0],
        wander: 6,
        twinkle: true,
        seed: 21,
      },
      ...(evening
        ? [
            {
              kind: 'firefly' as const,
              count: 14,
              colour: mix(t.glow, L.firefly, 0.5),
              size: [1.1, 2] as const,
              area: { x: 0, y: hy - H * 0.05, width: W, height: H * 0.25 },
              drift: [4, -1] as const,
              wander: 14,
              twinkle: true,
              halo: 6,
              seed: 8,
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
        y: hy - H * 0.03,
        width: W * 1.4,
        height: H * 0.09,
        colour: mix(L.mist, sky.horizon, 0.4),
        opacity: 0.45,
        motion: { kind: 'drift', amount: W * 0.06, periodMs: 28_000 },
      },
      {
        id: 'path',
        kind: 'glow',
        x: c.sun[0] - W * 0.18,
        y: hy,
        width: W * 0.36,
        height: H - hy,
        colour: c.scene.celestial.body === 'sun' ? sky.halo : L.moonGlow,
        opacity: 0.22,
        motion: { kind: 'glow', amount: 0.5, periodMs: 5000 },
      },
    ],
    shaders: [water.shader],
  };
}

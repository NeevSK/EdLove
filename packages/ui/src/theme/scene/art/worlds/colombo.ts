/**
 * Colombo night: the city across the harbour. Towers of glass stand in a ragged line, one slender
 * tower crowned with a bud rising above them all, port cranes lean over the water, and a ship sits
 * at anchor. By day the glass takes the sky; after dusk the windows light and the water carries
 * every light in long trembling lines. Clean, precise, a little futuristic.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { rainOf, waterLayers, windows } from '../elements';
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
import type { ArtLayer, ArtShape, SceneArt } from '../types';

interface Tower {
  x: number;
  w: number;
  h: number;
}

function skyline(c: ArtContext, base: number): { layer: ArtLayer; lit: ArtLayer; towers: Tower[] } {
  const { W, H, t, sky } = c;
  const rand = rng(27);
  const towers: Tower[] = [];
  for (let x = -W * 0.02; x < W * 1.02; ) {
    const w = W * (0.05 + rand() * 0.07);
    const h = H * (0.06 + rand() * 0.16) * (Math.abs(x / W - 0.45) < 0.25 ? 1.25 : 0.85);
    towers.push({ x, w, h });
    x += w * (0.85 + rand() * 0.3);
  }
  const glass = c.lit(mix(mix(t.ink, t.lamp, 0.25), sky.horizon, 0.35), 0.1);
  const face = c.lit(mix(mix(t.ground, t.lamp, 0.2), sky.horizon, 0.3), 0.1);
  const bodies: string[] = [];
  const faces: string[] = [];
  const lights: string[] = [];
  for (const [i, tw] of towers.entries()) {
    const top = base - tw.h;
    // Some towers taper or slant at the top.
    const cut = i % 3 === 0 ? tw.w * 0.3 : 0;
    bodies.push(
      `M${n(tw.x)} ${n(base)}L${n(tw.x)} ${n(top + cut)}L${n(tw.x + tw.w - cut)} ${n(top)}L${n(tw.x + tw.w)} ${n(top + cut * 0.4)}L${n(tw.x + tw.w)} ${n(base)}Z`,
    );
    // The sunlit face: a narrow band down one side.
    faces.push(rect(tw.x + tw.w * 0.68, top + cut + 2, tw.w * 0.32, tw.h - cut - 2));
    lights.push(
      windows(tw.x, top + cut, tw.w, tw.h - cut, Math.max(2.5, W * 0.007), 0.32, 100 + i),
    );
  }
  const night = c.light < 0.45;
  return {
    towers,
    layer: {
      id: 'skyline',
      shapes: [
        shape(bodies.join(''), solid(glass)),
        shape(faces.join(''), solid(a(face, night ? 0.25 : 0.55))),
      ],
    },
    lit: {
      id: 'windows',
      shapes: [
        shape(
          lights.join(''),
          solid(a(night ? L.window : mix(sky.horizon, L.white, 0.4), night ? 0.9 : 0.35)),
        ),
      ],
      motion: night ? { kind: 'glow', amount: 0.18, periodMs: 7000 } : undefined,
      from: night ? undefined : 'middle',
    },
  };
}

/** The slender tower with its bud: a tall stem, a lotus-bud crown, and a light on top. */
function lotusTower(c: ArtContext, base: number): ArtLayer {
  const { W, H, t, sky } = c;
  const x = W * 0.62;
  const top = base - H * 0.34;
  const stem = c.lit(mix(t.ink, sky.horizon, 0.3), 0.1);
  const bud = c.lit(mix(t.ornament, t.lamp, 0.4));
  const budY = top + H * 0.05;
  const r = W * 0.04;
  const shapes: ArtShape[] = [
    shape(
      `M${n(x - W * 0.012)} ${n(base)}L${n(x - W * 0.005)} ${n(budY)}L${n(x + W * 0.005)} ${n(budY)}L${n(x + W * 0.012)} ${n(base)}Z`,
      solid(stem),
    ),
    shape(
      `M${n(x - r)} ${n(budY)}C${n(x - r)} ${n(budY - r * 1.2)} ${n(x - r * 0.2)} ${n(budY - r * 1.5)} ${n(x)} ${n(budY - r * 2)}C${n(x + r * 0.2)} ${n(budY - r * 1.5)} ${n(x + r)} ${n(budY - r * 1.2)} ${n(x + r)} ${n(budY)}Z`,
      solid(bud),
    ),
    shape(rect(x - 1, top - H * 0.04, 2, H * 0.04), solid(stem)),
  ];
  return { id: 'tower', shapes };
}

/** Port cranes leaning over the water, and a ship at anchor. */
function port(c: ArtContext, base: number): ArtLayer {
  const { W, H, t, sky } = c;
  const steel = c.lit(mix(t.ink, sky.horizon, 0.45), 0.1);
  const cranes: string[] = [];
  for (const [i, x] of [W * 0.06, W * 0.2, W * 0.88].entries()) {
    const h = H * (0.1 + (i % 2) * 0.02);
    const legs = W * 0.02;
    cranes.push(
      `M${n(x)} ${n(base)}L${n(x + legs * 0.3)} ${n(base - h)}L${n(x + legs * 0.5)} ${n(base - h)}L${n(x + legs)} ${n(base)}L${n(x + legs * 0.8)} ${n(base)}L${n(x + legs * 0.45)} ${n(base - h * 0.7)}L${n(x + legs * 0.2)} ${n(base)}Z`,
      rect(x - W * 0.05, base - h - 2, W * 0.13, 2.5),
      rect(x + legs * 0.3, base - h - H * 0.02, 2, H * 0.02),
    );
  }
  const shipX = W * 0.32;
  const shipY = base + H * 0.035;
  const hull = `M${n(shipX)} ${n(shipY)}L${n(shipX + W * 0.22)} ${n(shipY)}L${n(shipX + W * 0.2)} ${n(shipY + H * 0.012)}L${n(shipX + W * 0.015)} ${n(shipY + H * 0.012)}Z`;
  const stack =
    rect(shipX + W * 0.02, shipY - H * 0.022, W * 0.05, H * 0.022) +
    rect(shipX + W * 0.07, shipY - H * 0.012, W * 0.13, H * 0.012);
  return {
    id: 'port',
    shapes: [
      shape(cranes.join(''), solid(steel)),
      shape(hull + stack, solid(steel)),
      shape(circle(shipX + W * 0.05, shipY - H * 0.03, 1.6), solid(c.lit(t.danger))),
    ],
  };
}

export function colomboArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.56);
  const { W, H, hy, t, sky } = c;
  const night = c.light < 0.45;
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];
  // The city's glow on the low sky after dark.
  if (night) {
    layers.push({
      id: 'city-glow',
      shapes: [
        shape(
          rect(0, hy - H * 0.2, W, H * 0.2),
          vertical(hy - H * 0.2, hy, [
            [a(L.window, 0), 0],
            [a(mix(L.window, t.glow, 0.4), 0.22), 1],
          ]),
        ),
      ],
    });
  }
  const base = hy;
  layers.push(lotusTower(c, base));
  const city = skyline(c, base);
  layers.push(city.layer, city.lit);
  layers.push(port(c, base));
  const water = waterLayers(c, base, H, t.lamp);
  layers.push(...water.layers);
  // Reflections: each lit tower lays a broken column of light on the water.
  const rand = rng(64);
  const streaks: string[] = [];
  for (const tw of city.towers) {
    const cx = tw.x + tw.w / 2;
    for (let i = 0; i < 6; i++) {
      const y = base + H * 0.01 + rand() * (H - base) * 0.6;
      streaks.push(
        ellipse(cx + (rand() - 0.5) * tw.w * 0.6, y, tw.w * (0.15 + rand() * 0.25), 0.9),
      );
    }
  }
  layers.push({
    id: 'reflections',
    shapes: [
      shape(
        streaks.join(''),
        solid(a(night ? L.window : mix(sky.horizon, L.white, 0.5), night ? 0.55 : 0.25)),
      ),
    ],
    motion: { kind: 'glow', amount: 0.5, periodMs: 3000 },
    from: 'floor',
  });
  // The promenade rail along the bottom.
  layers.push({
    id: 'rail',
    shapes: [
      shape(rect(0, H * 0.93, W, H * 0.07), solid(c.lit(mix(t.ink, sky.top, 0.2)))),
      shape(rect(0, H * 0.915, W, 2.5), solid(c.lit(mix(t.ink, t.lamp, 0.3)))),
      ...(night
        ? [
            shape(
              Array.from({ length: 6 }, (_, i) => circle(W * (0.08 + i * 0.17), H * 0.9, 2.2)).join(
                '',
              ),
              solid(L.window),
            ),
          ]
        : []),
    ],
  });

  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'glint',
        count: 26,
        colour: a(night ? L.window : L.white, 0.9),
        size: [0.6, 1.4],
        area: { x: 0, y: base + H * 0.01, width: W, height: H * 0.3 },
        drift: [4, 0],
        wander: 6,
        twinkle: true,
        seed: 41,
      },
      ...rainOf(c),
    ],
    overlays: [
      {
        id: 'harbour',
        kind: 'band',
        x: -W * 0.2,
        y: base - H * 0.02,
        width: W * 1.4,
        height: H * 0.06,
        colour: night ? mix(L.window, t.glow, 0.5) : mix(L.mist, sky.horizon, 0.4),
        opacity: night ? 0.25 : 0.35,
        motion: { kind: 'drift', amount: W * 0.04, periodMs: 20_000 },
      },
      {
        id: 'beacon',
        kind: 'glow',
        x: W * 0.62 - W * 0.1,
        y: base - H * 0.38 - W * 0.1,
        width: W * 0.2,
        height: W * 0.2,
        colour: t.glow,
        opacity: night ? 0.5 : 0.15,
        motion: { kind: 'glow', amount: 0.7, periodMs: 2400 },
      },
    ],
    shaders: [water.shader],
  };
}

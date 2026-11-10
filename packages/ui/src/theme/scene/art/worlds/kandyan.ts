/**
 * Temple walls: inside an image house, looking out. Lime-plastered walls in mural earth frame an
 * arched doorway; above it runs a band of walakulu cloud scallops, and a liyawela vine scrolls
 * along the wall's foot. Through the arch the hours pass over a white dagoba on its hill, and on
 * the sill the oil lamps flicker.
 */

import { SCENE_LIGHT as L } from '../../sky';
import { fireLayers, hills, rainOf } from '../elements';
import {
  a,
  type ArtContext,
  type ArtInput,
  blob,
  contextOf,
  ellipse,
  leaf,
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

/** The doorway: its left and right edges, where it springs into its arch, and the sill. */
function doorway(c: ArtContext) {
  const { W, H } = c;
  const left = W * 0.2;
  const right = W * 0.8;
  const r = (right - left) / 2;
  const spring = H * 0.3;
  return { left, right, r, spring, top: spring - r, sill: H * 0.72 };
}

/** A white dagoba on a green rise, seen through the arch. */
function dagoba(c: ArtContext, base: number): ArtLayer {
  const { W, H, t } = c;
  const x = W * 0.5;
  const white = c.lit(mix(L.white, t.ground, 0.3));
  const shade = c.lit(mix(t.ground, t.ink, 0.15));
  const domeR = W * 0.11;
  const shapes: ArtShape[] = [
    shape(rect(x - domeR * 1.35, base - H * 0.018, domeR * 2.7, H * 0.018), solid(shade)),
    shape(`M${n(x - domeR)} ${n(base - H * 0.018)}A${n(domeR)} ${n(domeR * 0.9)} 0 0 1 ${n(x + domeR)} ${n(base - H * 0.018)}Z`, solid(white)),
    shape(rect(x - domeR * 0.28, base - H * 0.018 - domeR * 0.9 - H * 0.016, domeR * 0.56, H * 0.016), solid(shade)),
    shape(
      `M${n(x - domeR * 0.14)} ${n(base - H * 0.034 - domeR * 0.9)}L${n(x)} ${n(base - H * 0.034 - domeR * 0.9 - H * 0.06)}L${n(x + domeR * 0.14)} ${n(base - H * 0.034 - domeR * 0.9)}Z`,
      solid(c.lit(t.glow)),
    ),
  ];
  return { id: 'dagoba', shapes };
}

/** The wall, with the arched doorway cut out of it, washed in lime and mural earth. */
function wall(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const d = doorway(c);
  const lime = c.lit(t.ground);
  const earth = c.lit(mix(t.ornament, t.ground, 0.45));
  const fill = vertical(0, H, [
    [mix(lime, earth, 0.25), 0],
    [lime, 0.45],
    [mix(lime, earth, 0.4), 1],
  ]);
  // Above the arch: a slab whose lower edge follows the arch.
  const above = `M0 0L${n(W)} 0L${n(W)} ${n(d.spring)}L${n(d.right)} ${n(d.spring)}A${n(d.r)} ${n(d.r)} 0 0 0 ${n(d.left)} ${n(d.spring)}L0 ${n(d.spring)}Z`;
  const sides = rect(0, d.spring - 1, d.left, d.sill - d.spring + 2) + rect(d.right, d.spring - 1, W - d.right, d.sill - d.spring + 2);
  const below = rect(0, d.sill, W, H - d.sill);
  // Weathered lime: soft blotches.
  const rand = rng(12);
  const blotches: string[] = [];
  for (let i = 0; i < 18; i++) {
    const x = rand() * W;
    const y = rand() * H;
    if (x > d.left && x < d.right && y > d.top && y < d.sill) continue;
    blotches.push(blob(x, y, W * (0.04 + rand() * 0.06), 7, i, 0.7));
  }
  // The arch's moulding: a band of earth red following the opening.
  const moulding = `M${n(d.left)} ${n(d.sill)}L${n(d.left)} ${n(d.spring)}A${n(d.r)} ${n(d.r)} 0 0 1 ${n(d.right)} ${n(d.spring)}L${n(d.right)} ${n(d.sill)}`;
  return {
    id: 'wall',
    shapes: [
      shape(above + sides + below, fill),
      shape(blotches.join(''), solid(a(earth, 0.18)), { blur: 6 }),
      shape(moulding, undefined, { stroke: { colour: c.lit(t.lamp), width: W * 0.022, cap: 'butt' } }),
      shape(moulding, undefined, { stroke: { colour: c.lit(t.glow), width: W * 0.005, cap: 'butt' } }),
      // The sill: a deep ledge.
      shape(rect(d.left - W * 0.04, d.sill - H * 0.006, d.right - d.left + W * 0.08, H * 0.022), solid(c.lit(mix(t.ink, t.ornament, 0.3)))),
    ],
  };
}

/** Walakulu: a band of cloud scallops in mural colours along the top of the wall. */
function walakulu(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const y = H * 0.035;
  const unit = W * 0.09;
  const rows: string[] = [];
  const inner: string[] = [];
  for (let x = -unit / 2; x < W + unit; x += unit) {
    rows.push(`M${n(x)} ${n(y + unit * 0.5)}A${n(unit / 2)} ${n(unit / 2)} 0 0 1 ${n(x + unit)} ${n(y + unit * 0.5)}Z`);
    inner.push(`M${n(x + unit * 0.2)} ${n(y + unit * 0.5)}A${n(unit * 0.3)} ${n(unit * 0.3)} 0 0 1 ${n(x + unit * 0.8)} ${n(y + unit * 0.5)}Z`);
  }
  return {
    id: 'walakulu',
    shapes: [
      shape(rect(0, 0, W, y + unit * 0.5), solid(c.lit(t.lamp))),
      shape(rows.join(''), solid(c.lit(t.lamp))),
      shape(inner.join(''), solid(c.lit(t.glow))),
      shape(rect(0, y + unit * 0.62, W, 2), solid(c.lit(t.ink))),
    ],
  };
}

/** Liyawela: a scrolling vine along the foot of the wall. */
function liyawela(c: ArtContext): ArtLayer {
  const { W, H, t } = c;
  const y = H * 0.88;
  const amp = H * 0.025;
  const step = W * 0.14;
  let stem = `M${n(-step)} ${n(y)}`;
  const leaves: string[] = [];
  const curls: string[] = [];
  for (let x = -step, i = 0; x < W + step; x += step, i++) {
    const up = i % 2 ? -1 : 1;
    stem += `Q${n(x + step / 2)} ${n(y + up * amp * 2)} ${n(x + step)} ${n(y)}`;
    const cx = x + step / 2;
    const cy = y + up * amp;
    curls.push(ellipse(cx, cy + up * amp * 0.9, step * 0.12, step * 0.12));
    leaves.push(leaf(cx, cy, step * 0.34, step * 0.1, up > 0 ? Math.PI * 0.25 : -Math.PI * 0.25));
    leaves.push(leaf(cx, cy, step * 0.3, step * 0.09, up > 0 ? Math.PI * 0.8 : -Math.PI * 0.8));
  }
  return {
    id: 'liyawela',
    shapes: [
      shape(rect(0, y - amp * 3.2, W, 2) + rect(0, y + amp * 3.2, W, 2), solid(c.lit(t.ink))),
      shape(stem, undefined, { stroke: { colour: c.lit(mix(t.ornament, t.ink, 0.3)), width: 2.2, cap: 'round' } }),
      shape(curls.join(''), undefined, { stroke: { colour: c.lit(t.lamp), width: 1.6, cap: 'round' } }),
      shape(leaves.join(''), solid(c.lit(t.lamp))),
    ],
  };
}

export function kandyanArt(input: ArtInput): SceneArt {
  const c = contextOf(input, 0.62);
  const { W, H, hy, t } = c;
  const d = doorway(c);
  // What is seen through the doorway: sky, hills, and the dagoba.
  const layers: ArtLayer[] = [...skyLayers(c, t.glow)];
  layers.push(...hills(c, mix(t.ornament, L.sunLow, 0.1), hy - H * 0.04, 2, 3.7, 2.6));
  layers.push(dagoba(c, hy + H * 0.03));
  layers.push({
    id: 'yard',
    shapes: [shape(rect(0, hy + H * 0.03, W, H), vertical(hy, H, [[c.lit(mix(t.ground, t.ornament, 0.3)), 0], [c.lit(mix(t.ground, t.ink, 0.25)), 1]]))],
  });
  layers.push(wall(c), walakulu(c), liyawela(c));
  const lamps: [number, number][] = [
    [d.left + W * 0.05, d.sill - H * 0.006],
    [W * 0.5, d.sill - H * 0.006],
    [d.right - W * 0.05, d.sill - H * 0.006],
  ];
  // The clay lamps under the flames.
  layers.push({
    id: 'pahana',
    shapes: [shape(lamps.map(([x, y]) => `M${n(x - W * 0.03)} ${n(y)}Q${n(x)} ${n(y + H * 0.02)} ${n(x + W * 0.03)} ${n(y)}Z`).join(''), solid(c.lit(mix(t.ornament, t.ink, 0.35))))],
  });
  layers.push(...fireLayers(c, 'lamps', lamps, H * 0.022));

  return {
    width: W,
    height: H,
    layers,
    particles: [
      {
        kind: 'ember',
        count: 10,
        colour: a(L.flame, 0.9),
        size: [0.6, 1.2],
        area: { x: d.left, y: d.sill - H * 0.16, width: d.right - d.left, height: H * 0.15 },
        drift: [0, -14],
        wander: 6,
        twinkle: true,
        halo: 3,
        seed: 31,
      },
      {
        kind: 'mote',
        count: 14,
        colour: a(t.glow, 0.7),
        size: [0.7, 1.3],
        area: { x: d.left, y: d.top, width: d.right - d.left, height: d.sill - d.top },
        drift: [2, 3],
        wander: 8,
        twinkle: true,
        seed: 5,
      },
      ...rainOf(c).map((p) => ({ ...p, area: { x: d.left, y: d.top, width: d.right - d.left, height: d.sill - d.top } })),
    ],
    overlays: [
      {
        id: 'lamplight',
        kind: 'glow',
        x: W * 0.15,
        y: d.sill - W * 0.35,
        width: W * 0.7,
        height: W * 0.7,
        colour: L.flame,
        opacity: 0.22,
        motion: { kind: 'glow', amount: 0.4, periodMs: 1600 },
      },
    ],
    shaders: [{ kind: 'heat', x: d.left, y: d.sill - H * 0.12, width: d.right - d.left, height: H * 0.12, colour: L.flame, strength: 0.25 }],
  };
}

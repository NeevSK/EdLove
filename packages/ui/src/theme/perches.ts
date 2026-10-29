/**
 * Where Tutii rests in each world. Tutii stays the same character everywhere;
 * the perch and the light change (docs/Core/design/2026-10-26-world-model.md).
 *
 * Platform-neutral shapes in a 220 × 164 box (Tutii's feedback scene), along
 * its lower edge. Colours name world tokens; each platform resolves them
 * (react-native-svg on native, DOM SVG with `var(--w-*)` on the web).
 */

import type { WorldId, WorldTokens } from './types';

/** A world token, or no paint. */
export type PerchInk = keyof Pick<WorldTokens, 'ornament' | 'lamp' | 'line' | 'glow' | 'ink'> | 'none';

export type PerchElement = 'path' | 'circle' | 'ellipse' | 'rect' | 'line';

export interface PerchShape {
  el: PerchElement;
  /** Geometry and presentation attributes, in SVG's camelCase React names. */
  attrs: Readonly<Record<string, number | string>>;
  fill?: PerchInk;
  stroke?: PerchInk;
}

export interface PerchGroup {
  fill?: PerchInk;
  stroke?: PerchInk;
  strokeWidth?: number;
  shapes: readonly PerchShape[];
}

export const PERCH_VIEWBOX = '0 0 220 164';

const W = 1.6;
const round = { strokeLinecap: 'round' } as const;

export const PERCHES: Readonly<Record<WorldId, PerchGroup>> = {
  // The clay lamp.
  sanctuary: {
    shapes: [
      { el: 'path', attrs: { d: 'M76 136 Q110 162 144 136 Z', opacity: 0.85 }, fill: 'ornament' },
      { el: 'path', attrs: { d: 'M144 136 L156 131', strokeWidth: W, ...round }, stroke: 'ornament' },
      { el: 'ellipse', attrs: { cx: 158, cy: 127, rx: 3, ry: 5 }, fill: 'lamp' },
    ],
  },
  // A lotus pad on still water.
  wewa: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M110 148 L133 138.5 A46 11 0 1 0 149.8 142.5 Z', fillOpacity: 0.4, strokeWidth: W },
        fill: 'ornament',
        stroke: 'ornament',
      },
      {
        el: 'path',
        attrs: { d: 'M40 156 Q60 152 80 156 M140 156 Q160 152 180 156', strokeWidth: W },
        stroke: 'line',
        fill: 'none',
      },
    ],
  },
  // A lace window: an arch with a lattice of dots.
  ratna: {
    stroke: 'ornament',
    strokeWidth: W,
    fill: 'none',
    shapes: [
      { el: 'path', attrs: { d: 'M70 162 V126 A40 26 0 0 1 150 126 V162' } },
      ...[86, 98, 110, 122, 134].map(
        (x): PerchShape => ({ el: 'circle', attrs: { cx: x, cy: 152, r: 1.6 }, fill: 'ornament' }),
      ),
    ],
  },
  // A branch with two leaves.
  kele: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M30 150 Q110 132 190 146', strokeWidth: 3, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      { el: 'path', attrs: { d: 'M58 146 q-6 -14 8 -18 q2 12 -8 18 Z' }, fill: 'lamp' },
      { el: 'path', attrs: { d: 'M164 144 q10 -10 20 -4 q-8 10 -20 4 Z', opacity: 0.8 }, fill: 'lamp' },
    ],
  },
  // A silver oak, tall and narrow, standing over the tea rows.
  tea: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M178 162 V104 M178 128 L166 116 M178 118 L190 106', strokeWidth: W, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      { el: 'ellipse', attrs: { cx: 178, cy: 100, rx: 11, ry: 22, opacity: 0.4 }, fill: 'ornament' },
      {
        el: 'path',
        attrs: {
          d: 'M30 156 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0',
          strokeWidth: W,
          ...round,
        },
        stroke: 'lamp',
        fill: 'none',
      },
      {
        el: 'path',
        attrs: {
          d: 'M44 162 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0',
          strokeWidth: W,
          opacity: 0.6,
          ...round,
        },
        stroke: 'lamp',
        fill: 'none',
      },
    ],
  },
  // A niche in the temple wall: a doubled arch frame.
  kandyan: {
    stroke: 'ornament',
    fill: 'none',
    shapes: [
      { el: 'path', attrs: { d: 'M66 162 V128 Q110 96 154 128 V162', strokeWidth: W * 1.5 } },
      { el: 'path', attrs: { d: 'M74 162 V131 Q110 106 146 131 V162', strokeWidth: W * 0.8 } },
      { el: 'rect', attrs: { x: 60, y: 158, width: 100, height: 4 }, fill: 'ornament' },
    ],
  },
  // A brass lamp stand.
  angampora: {
    fill: 'ornament',
    shapes: [
      { el: 'rect', attrs: { x: 84, y: 146, width: 52, height: 5 } },
      { el: 'rect', attrs: { x: 106, y: 151, width: 8, height: 9 } },
      { el: 'rect', attrs: { x: 92, y: 160, width: 36, height: 4 } },
      { el: 'circle', attrs: { cx: 88, cy: 141, r: 3.5 }, fill: 'lamp' },
      { el: 'circle', attrs: { cx: 132, cy: 141, r: 3.5 }, fill: 'lamp' },
    ],
  },
  // A torch pole with its flame.
  perahera: {
    shapes: [
      {
        el: 'line',
        attrs: { x1: 168, y1: 164, x2: 168, y2: 104, strokeWidth: 3, ...round },
        stroke: 'ornament',
      },
      { el: 'path', attrs: { d: 'M168 102 q-8 -10 0 -22 q8 12 0 22 Z' }, fill: 'lamp' },
      { el: 'path', attrs: { d: 'M70 154 H150', strokeWidth: W }, stroke: 'ornament' },
    ],
  },
  // A rose stem with a leaf and thorns.
  rosa: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M40 156 Q110 136 184 150', strokeWidth: 2.4, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      { el: 'path', attrs: { d: 'M150 146 q8 -14 22 -12 q-6 14 -22 12 Z', opacity: 0.7 }, fill: 'ornament' },
      { el: 'path', attrs: { d: 'M80 148 l-3 -6 M118 142 l2 -6', strokeWidth: W, ...round }, stroke: 'ornament' },
      { el: 'circle', attrs: { cx: 184, cy: 148, r: 5 }, fill: 'lamp' },
    ],
  },
  // The spire over the city line.
  colombo: {
    stroke: 'ornament',
    strokeWidth: W,
    fill: 'none',
    shapes: [
      { el: 'path', attrs: { d: 'M20 162 V148 H44 V140 H62 V154 H158 V138 H176 V150 H200 V162' } },
      { el: 'path', attrs: { d: 'M182 150 L188 90 L194 150' } },
      { el: 'circle', attrs: { cx: 188, cy: 86, r: 2.4 }, fill: 'lamp', stroke: 'none' },
    ],
  },
  // A floodlight on its mast.
  spark: {
    shapes: [
      { el: 'path', attrs: { d: 'M176 92 L120 160 L150 160 Z', opacity: 0.18 }, fill: 'glow' },
      { el: 'line', attrs: { x1: 186, y1: 164, x2: 186, y2: 96, strokeWidth: 3 }, stroke: 'ink' },
      {
        el: 'rect',
        attrs: { x: 170, y: 86, width: 22, height: 10, transform: 'rotate(-24 181 91)' },
        fill: 'lamp',
      },
      { el: 'path', attrs: { d: 'M60 160 H150', strokeWidth: W }, stroke: 'ink' },
    ],
  },
};

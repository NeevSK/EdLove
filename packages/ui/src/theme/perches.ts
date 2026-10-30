/**
 * Where Tutii rests in each world. Tutii stays the same character everywhere;
 * the perch and the light change (docs/Core/design/2026-10-26-world-model.md).
 *
 * Platform-neutral shapes in a 220 × 164 box (Tutii's feedback scene), along
 * its lower edge. Colours name world tokens; each platform resolves them
 * (react-native-svg on native, DOM SVG with `var(--w-*)` on the web).
 */

import type { WorldId, WorldTokens } from './types';
import { byWorld } from './worlds';

/** A world token, or no paint. */
export type PerchInk =
  | keyof Pick<WorldTokens, 'ornament' | 'lamp' | 'line' | 'glow' | 'ink'>
  | 'none';

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

/** Each world's perch, from its folder (`worlds/<id>`). */
export const PERCHES: Readonly<Record<WorldId, PerchGroup>> = byWorld((w) => w.perch);

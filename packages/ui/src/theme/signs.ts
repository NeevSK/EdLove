/**
 * Each world's sign for "wait a moment", drawn from its own ornament
 * (docs/Core/design/2026-10-26-world-model.md, "Nothing is outside the world").
 *
 * Platform-neutral: which sign a world uses, how long one loop lasts and the
 * pose a sign rests in when it cannot move. `components/native/WaitingSign`
 * and `components/web/WaitingSign` both draw from this.
 */

import type { WorldId } from './types';

export type SignKind =
  | 'flame'
  | 'ripple'
  | 'glint'
  | 'leaf'
  | 'rows'
  | 'band'
  | 'lamp'
  | 'beat'
  | 'petal'
  | 'signal'
  | 'charge';

export const SIGNS: Readonly<Record<WorldId, SignKind>> = {
  sanctuary: 'flame',
  wewa: 'ripple',
  ratna: 'glint',
  kele: 'leaf',
  tea: 'rows',
  kandyan: 'band',
  angampora: 'lamp',
  perahera: 'beat',
  rosa: 'petal',
  colombo: 'signal',
  spark: 'charge',
};

/** One loop of each sign at tempo 1, in ms. A world's motion tempo scales it. */
export const SIGN_CYCLE_MS: Readonly<Record<SignKind, number>> = {
  flame: 2400,
  ripple: 2400,
  glint: 2000,
  leaf: 2800,
  rows: 1800,
  band: 2200,
  lamp: 2000,
  beat: 1200,
  petal: 2600,
  signal: 1400,
  charge: 1600,
};

/** Where each sign rests when it cannot move (0–1 of a loop): a pose that still says "waiting". */
export const SIGN_REST: Readonly<Record<SignKind, number>> = {
  flame: 0.25,
  ripple: 0.35,
  glint: 0.5,
  leaf: 0,
  rows: 0.55,
  band: 0.4,
  lamp: 0.45,
  beat: 0.1,
  petal: 0.3,
  signal: 0.2,
  charge: 0.5,
};

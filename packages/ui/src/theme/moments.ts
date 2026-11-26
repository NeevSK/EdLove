/**
 * How each world celebrates: a short moment when something is done (a lesson finished, a first
 * step taken). Pure data, drawn by the kit's `WorldMomentHost`. Rosa lets petals fall, Wewa
 * ripples, Perahera lifts lamp sparks, Angampora strikes lines, Classic keeps a calm check.
 * How many pieces fly is verger's call (`celebration` level) and the stage's tier, never the world's.
 */

import type { WorldId, WorldTokens } from './types';

export type MomentShape = 'dot' | 'petal' | 'leaf' | 'spark' | 'diamond' | 'ring' | 'line';

export interface WorldMomentStyle {
  shape: MomentShape;
  /** How far pieces travel from the centre, in dp. */
  spread: number;
  /** Pull over the moment, in dp: positive falls, negative rises. */
  fall: number;
  spin: boolean;
  /** Token names the pieces take, in turn. */
  colours: readonly (keyof WorldTokens)[];
}

const MOMENTS: Readonly<Record<WorldId, WorldMomentStyle>> = {
  classic: { shape: 'dot', spread: 70, fall: 20, spin: false, colours: ['lamp', 'success'] },
  sanctuary: { shape: 'ring', spread: 40, fall: -60, spin: false, colours: ['glow', 'lamp'] },
  wewa: { shape: 'ring', spread: 18, fall: 0, spin: false, colours: ['lamp', 'glow', 'ornament'] },
  ratna: {
    shape: 'diamond',
    spread: 110,
    fall: 30,
    spin: true,
    colours: ['lamp', 'glow', 'ornament'],
  },
  kele: {
    shape: 'leaf',
    spread: 120,
    fall: 140,
    spin: true,
    colours: ['success', 'lamp', 'ornament'],
  },
  tea: { shape: 'leaf', spread: 90, fall: 110, spin: true, colours: ['success', 'ornament'] },
  kandyan: { shape: 'diamond', spread: 100, fall: 40, spin: false, colours: ['ornament', 'lamp'] },
  angampora: { shape: 'line', spread: 130, fall: 0, spin: false, colours: ['lamp', 'ink'] },
  perahera: {
    shape: 'spark',
    spread: 90,
    fall: -120,
    spin: false,
    colours: ['lamp', 'glow', 'ornament'],
  },
  rosa: {
    shape: 'petal',
    spread: 120,
    fall: 160,
    spin: true,
    colours: ['lamp', 'glow', 'ornament'],
  },
  colombo: {
    shape: 'line',
    spread: 120,
    fall: 120,
    spin: true,
    colours: ['lamp', 'ink', 'ornament'],
  },
  spark: {
    shape: 'spark',
    spread: 150,
    fall: 60,
    spin: true,
    colours: ['lamp', 'glow', 'ornament'],
  },
};

export function momentOf(id: WorldId): WorldMomentStyle {
  return MOMENTS[id] ?? MOMENTS.classic;
}

export type CelebrationLevel = 'off' | 'essential' | 'refined' | 'rich';

/** How many pieces fly: verger's celebration level, then the stage's tier, keep it small. */
export function momentPieces(
  level: CelebrationLevel,
  tier: 'rich' | 'middle' | 'floor' | 'bare',
): number {
  if (tier === 'bare' || level === 'off') return 0;
  const byLevel = level === 'essential' ? 6 : level === 'refined' ? 14 : 24;
  return tier === 'floor'
    ? Math.min(byLevel, 8)
    : tier === 'middle'
      ? Math.min(byLevel, 16)
      : byLevel;
}

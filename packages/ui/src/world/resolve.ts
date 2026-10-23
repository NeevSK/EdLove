/**
 * Resolves a world against the hour and the light mode.
 *
 * The day changes the light, never the ink: only the ground layers drift
 * (cool before dawn, warm at dusk). Text colours stay put, so contrast holds
 * at every hour. The contrast test in `__tests__/world.contrast.test.ts`
 * checks every world, phase and mode.
 */

import { buildRecipes } from './build';
import { mix } from './color';
import type {
  ResolvedWorld,
  WorldDefinition,
  WorldId,
  WorldMode,
  WorldPhase,
  WorldTokens,
} from './types';
import { DEFAULT_WORLD, isWorldId, WORLDS } from './worlds';

/** The colour of each hour's light, and how much of it reaches the ground. */
const PHASE_LIGHT: Record<WorldMode, Record<WorldPhase, { hue: string; amount: number }>> = {
  light: {
    predawn: { hue: '#C9D2E6', amount: 0.06 },
    dawn: { hue: '#F3C6B0', amount: 0.06 },
    morning: { hue: '#FFFFFF', amount: 0 },
    afternoon: { hue: '#F2D79A', amount: 0.04 },
    dusk: { hue: '#E9A46A', amount: 0.07 },
    night: { hue: '#C8BBA0', amount: 0.05 },
  },
  dark: {
    predawn: { hue: '#24304A', amount: 0.12 },
    dawn: { hue: '#3A2C30', amount: 0.08 },
    morning: { hue: '#000000', amount: 0 },
    afternoon: { hue: '#000000', amount: 0 },
    dusk: { hue: '#3A2A3A', amount: 0.1 },
    night: { hue: '#000000', amount: 0 },
  },
};

export function phaseTokens(base: WorldTokens, mode: WorldMode, phase: WorldPhase): WorldTokens {
  const { hue, amount } = PHASE_LIGHT[mode][phase];
  if (amount === 0) return base;
  return {
    ...base,
    ground: mix(base.ground, hue, amount),
    raised: mix(base.raised, hue, amount * 0.6),
    sunken: mix(base.sunken, hue, amount),
  };
}

const cache = new Map<string, ResolvedWorld>();

export function resolveWorld(
  world: WorldId | WorldDefinition,
  phase: WorldPhase = 'morning',
  mode: WorldMode = 'light',
): ResolvedWorld {
  const definition =
    typeof world === 'string' ? WORLDS[isWorldId(world) ? world : DEFAULT_WORLD] : world;
  const key = `${definition.id}:${phase}:${mode}`;
  const cached = typeof world === 'string' ? cache.get(key) : undefined;
  if (cached) return cached;

  const tokens = phaseTokens(definition.palette[mode], mode, phase);
  const built = buildRecipes(tokens, definition.style, mode);
  const recipes = definition.refine ? definition.refine(built, tokens, mode) : built;
  const resolved: ResolvedWorld = { id: definition.id, phase, mode, definition, tokens, recipes };

  if (typeof world === 'string') cache.set(key, resolved);
  return resolved;
}

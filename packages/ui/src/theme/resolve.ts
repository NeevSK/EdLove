/**
 * Resolves a world against the hour and the light mode.
 *
 * The day changes the light, never the ink: only the ground layers drift
 * (cool before dawn, warm at dusk). Text colours stay put, so contrast holds
 * at every hour. The contrast test in `__tests__/world.contrast.test.ts`
 * checks every world, phase and mode.
 */

import { buildRecipes } from './build';
import { alpha, legible, mix } from './color';
import type {
  ComfortSize,
  Phase,
  ResolvedWorld,
  WorldAccess,
  WorldDefinition,
  WorldId,
  WorldMode,
  WorldRecipes,
  WorldTokens,
} from './types';
import { DEFAULT_WORLD, isWorldId, WORLDS } from './worlds';

/** The colour of each hour's light, and how much of it reaches the ground. */
const PHASE_LIGHT: Record<WorldMode, Record<Phase, { hue: string; amount: number }>> = {
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

export function phaseTokens(base: WorldTokens, mode: WorldMode, phase: Phase): WorldTokens {
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

export const STANDARD_ACCESS: WorldAccess = { contrast: 'standard', transparency: 'standard' };

/** Tokens with secondary ink, faint ink and hairlines raised to stronger contrast. */
function moreContrast(t: WorldTokens): WorldTokens {
  return {
    ...t,
    inkSoft: legible(t.inkSoft, t.ink, t.ground, 7),
    inkFaint: legible(t.inkFaint, t.ink, t.ground, 4.5),
    line: legible(t.line, t.ink, t.ground, 3),
  };
}

/** How much bigger or smaller the things you touch, and the air between them, become. */
export const COMFORT_SCALE: Readonly<Record<ComfortSize, number>> = {
  compact: 0.88,
  standard: 1,
  large: 1.22,
};

/** Keys whose numbers are sizes of touchable things or spacing (never type, radii or lines). */
const COMFORT_KEYS = new Set([
  'height',
  'minHeight',
  'padding',
  'paddingX',
  'paddingY',
  'gap',
  'indent',
]);
/** Numbers under these are left alone wherever they sit. */
const COMFORT_SKIP = new Set(['text', 'radius', 'fontSize', 'lineHeight', 'shadow', 'glow']);

function scaleTree(value: unknown, f: number, sizing: boolean): unknown {
  if (typeof value === 'number') return sizing ? Math.round(value * f * 2) / 2 : value;
  if (Array.isArray(value) || value === null || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = COMFORT_SKIP.has(k) ? v : scaleTree(v, f, sizing || COMFORT_KEYS.has(k));
  }
  return out;
}

/**
 * Scales every control height, padding and gap in the recipes by `f`; type is left to the
 * reading settings. Pure: the recipes passed in are not changed.
 */
export function scaleRecipes(recipes: WorldRecipes, f: number): WorldRecipes {
  return scaleTree(recipes, f, false) as WorldRecipes;
}

export function resolveWorld(
  world: WorldId | WorldDefinition,
  phase: Phase = 'morning',
  mode: WorldMode = 'light',
  access: WorldAccess = STANDARD_ACCESS,
): ResolvedWorld {
  const definition =
    typeof world === 'string' ? WORLDS[isWorldId(world) ? world : DEFAULT_WORLD] : world;
  const size = access.size ?? 'standard';
  const simple = access.simple === true;
  const key = `${definition.id}:${phase}:${mode}:${access.contrast}:${access.transparency}:${size}:${simple}`;
  const cached = typeof world === 'string' ? cache.get(key) : undefined;
  if (cached) return cached;

  const phased = phaseTokens(definition.palette[mode], mode, phase);
  const more = access.contrast === 'more';
  const solid = access.transparency === 'reduced';
  const tokens = more ? moreContrast(phased) : phased;
  const style = {
    ...definition.style,
    ...(more || simple ? { lineWeight: Math.max(1, definition.style.lineWeight) } : null),
    ...(solid || simple
      ? {
          material: {
            ...definition.style.material,
            light: 'none' as const,
            ...(simple ? { grain: 0 } : null),
          },
        }
      : null),
    // Simpler: the world keeps its colours, faces and corners, and drops its ornaments.
    ...(simple
      ? {
          ornament: 'hairline' as const,
          boundary: { dense: 'margin' as const, calm: 'margin' as const },
        }
      : null),
  };
  const built = buildRecipes(tokens, style, mode);
  const shaped = definition.refine ? definition.refine(built, tokens, mode) : built;
  const refined = size === 'standard' ? shaped : scaleRecipes(shaped, COMFORT_SCALE[size]);
  // Reduced transparency: the veils that let a screen or photo show through go solid.
  const recipes = solid
    ? {
        ...refined,
        overlay: {
          ...refined.overlay,
          scrim: alpha(mode === 'dark' ? tokens.ground : tokens.ink, 0.92),
        },
        card: { ...refined.card, veil: alpha(tokens.ink, 0.92), veilOpacity: 0.92 },
      }
    : refined;
  const resolved: ResolvedWorld = {
    id: definition.id,
    phase,
    mode,
    definition,
    tokens,
    recipes,
    access,
  };

  if (typeof world === 'string') cache.set(key, resolved);
  return resolved;
}

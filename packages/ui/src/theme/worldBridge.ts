/**
 * Bridge from the world layer to the legacy phase token shape.
 *
 * About 70 files read colours through `useTheme()` and hundreds of classNames
 * read `--phase-*` variables. This bridge lets all of them follow the chosen
 * world today, while screens migrate to the generic components at their own
 * pace.
 *
 * Sanctuary keeps the existing hand-tuned `phaseMatrix` exactly, so choosing
 * the default world changes nothing for current screens.
 */

import type { TemporalPhase } from '../context/types';
import { alpha } from '../world/color';
import { resolveWorld } from '../world/resolve';
import type { WorldId, WorldTokens } from '../world/types';
import { DEFAULT_WORLD, isWorldId } from '../world/worlds';
import {
  enrichPhaseTokens,
  type PhaseTokens,
  phaseMatrix,
  type ResolvedThemeTokens,
} from './Theme';

export function worldToPhaseTokens(t: WorldTokens): PhaseTokens {
  return {
    gradientNodes: [t.ground, t.raised, t.sunken],
    glass: {
      surface: { bg: t.raised, opacity: 1, blurAmount: 0, border: t.line },
      modal: { bg: t.raised, opacity: 1, blurAmount: 0, border: t.line },
      interact: { bg: alpha(t.ink, 0.06), opacity: 0.06, blurAmount: 0, border: t.line },
    },
    glow: {
      soft: { color: t.inkFaint, radius: 10, opacity: 0.1 },
      primary: { color: t.glow, radius: 18, opacity: 0.3 },
      action: { color: t.lamp, radius: 14, opacity: 0.35 },
      reward: { color: t.ornament, radius: 20, opacity: 0.45 },
    },
    accent: {
      action: t.lamp,
      reward: t.ornament,
      danger: t.danger,
      muted: t.inkFaint,
      templeGold: t.ornament,
      sageGreen: t.success,
    },
    text: {
      primary: t.ink,
      secondary: t.inkSoft,
      inverse: t.onLamp,
      muted: t.inkFaint,
    },
  };
}

/** Legacy phase tokens for a world. Sanctuary returns the original matrix. */
export function worldPhaseTokens(
  worldId: WorldId | undefined,
  phase: TemporalPhase,
  isDark: boolean,
): PhaseTokens {
  const id = isWorldId(worldId) ? worldId : DEFAULT_WORLD;
  if (id === 'sanctuary') return phaseMatrix[phase][isDark ? 'dark' : 'light'];
  return worldToPhaseTokens(resolveWorld(id, phase, isDark ? 'dark' : 'light').tokens);
}

const resolvedCache = new Map<string, ResolvedThemeTokens>();

export function resolveWorldThemeTokens(
  worldId: WorldId | undefined,
  phase: TemporalPhase,
  isDark: boolean,
): ResolvedThemeTokens {
  const key = `${worldId ?? DEFAULT_WORLD}:${phase}:${isDark ? 1 : 0}`;
  const hit = resolvedCache.get(key);
  if (hit) return hit;
  const resolved = enrichPhaseTokens(worldPhaseTokens(worldId, phase, isDark));
  resolvedCache.set(key, resolved);
  return resolved;
}

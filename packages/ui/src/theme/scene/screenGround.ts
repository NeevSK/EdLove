import {
  DEFAULT_GROUND_LIVELINESS,
  DEFAULT_GROUND_POLICY,
  GROUND_PRESENCE_VEILS,
  type GroundLiveliness,
  type GroundPolicy,
  type GroundStage,
  type GroundVeil,
  groundPresenceOf,
  veilStrength,
} from '@repo/core/logic/workspace/groundPlan';
import type { ScenePresence } from './resolveScene';

export { DEFAULT_GROUND_LIVELINESS, type GroundLiveliness, type GroundPolicy, type GroundStage };

/**
 * The phone's reading of the shared ground policy: core `groundPresenceOf`, the same rule web
 * uses. A screen names its stage (room, screen, focus); the policy (the person's
 * Lively/Balanced/Calm, calmed further by verger) gives full, band or quiet. Comfort (sunlight,
 * simpler look) and the stage tier still only calm it.
 */
export function screenPresence(
  stage: GroundStage,
  policy: GroundPolicy = DEFAULT_GROUND_POLICY,
): ScenePresence {
  return groundPresenceOf(stage, policy);
}

/** The quiet veil's paper, from the shared table (a readability floor no choice thins). */
export function quietVeilOf(): number {
  return veilStrength(GROUND_PRESENCE_VEILS.quiet);
}

/** A shared veil as a CSS gradient in the world's ground colour. */
export function veilGradientOf(veil: GroundVeil, paint: (alpha: number) => string): string {
  const stops = veil.map(([at, a]) => `${paint(a)} ${Math.round(at * 100)}%`).join(', ');
  return `linear-gradient(to bottom, ${stops})`;
}

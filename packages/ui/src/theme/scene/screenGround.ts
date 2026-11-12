import {
  DEFAULT_GROUND_LIVELINESS,
  DEFAULT_GROUND_POLICY,
  type GroundLiveliness,
  type GroundPolicy,
  type GroundStage,
} from '@repo/core/logic/workspace/groundPlan';
import type { ScenePresence } from './resolveScene';

export { DEFAULT_GROUND_LIVELINESS, type GroundLiveliness, type GroundPolicy, type GroundStage };

/**
 * The phone's reading of the shared ground policy (core `groundPolicyOf`, the same one web asks).
 * A screen names its stage (room, screen, focus); the policy (the person's Lively/Balanced/Calm,
 * calmed further by verger) says how strong the ground is there; the phone floor turns that into
 * how present it is. Comfort (sunlight, simpler look) and the stage tier still only calm it.
 * - a room at full strength shows the floor in full;
 * - any other screen at full strength shows it behind the header (band);
 * - calm stills the floor under a veil that never hides it completely.
 */
export function screenPresence(
  stage: GroundStage,
  policy: GroundPolicy = DEFAULT_GROUND_POLICY,
): ScenePresence {
  if (policy.strength[stage] === 'calm') return 'quiet';
  return stage === 'room' ? 'full' : 'band';
}

/** The phone's quiet veil: at least web's focus paper, stronger because phone words sit straight on it. */
const PHONE_QUIET_VEIL = 0.72;

export function quietVeilOf(policy: GroundPolicy = DEFAULT_GROUND_POLICY): number {
  return Math.max(PHONE_QUIET_VEIL, policy.veil.focus);
}

import {
  DEFAULT_GROUND_LIVELINESS,
  type GroundLiveliness,
  groundDialOf,
  groundVeilOf,
} from '@repo/core/logic/workspace/groundLiveliness';
import type { GroundStage } from '@repo/core/logic/workspace/groundPlan';
import type { ScenePresence } from './resolveScene';

export { DEFAULT_GROUND_LIVELINESS, type GroundLiveliness, type GroundStage };

/**
 * The phone's reading of the shared ground policy (core groundPlan +
 * groundLiveliness, the same dials web uses). A screen names its stage
 * (room, screen, focus); the person's Lively/Balanced/Calm picks the dial; the
 * phone floor turns that into how present it is. Verger's stage tier and comfort
 * (sunlight, simpler look) still only calm it further.
 * - a room at full strength shows the floor in full;
 * - any other screen at full strength shows it behind the header (band);
 * - calm stills the floor under a veil that never hides it completely.
 */
export function screenPresence(
  stage: GroundStage,
  liveliness: GroundLiveliness = DEFAULT_GROUND_LIVELINESS,
): ScenePresence {
  if (groundDialOf(liveliness)[stage] === 'calm') return 'quiet';
  return stage === 'room' ? 'full' : 'band';
}

/** The phone's quiet veil: stronger than web's paper because phone words sit straight on it. */
const PHONE_QUIET_BASE = 0.72;

export function quietVeilOf(liveliness: GroundLiveliness = DEFAULT_GROUND_LIVELINESS): number {
  return groundVeilOf('focus', liveliness, PHONE_QUIET_BASE);
}

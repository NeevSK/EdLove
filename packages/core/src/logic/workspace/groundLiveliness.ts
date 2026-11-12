import {
  GROUND_STAGE_DEFAULTS,
  GROUND_VEIL_DEFAULTS,
  type GroundStage,
  type GroundStrength,
} from './groundPlan';

/**
 * The person's own say in how lively the world's ground is behind screens
 * (Visual settings: Lively, Balanced, Calm). It picks one of the ground dials
 * the planner already takes (`planGround(…, stage, dial)`), so web and phone
 * follow the same policy; verger's allowance and comfort (sunlight, simpler
 * look) can still only calm it further. Balanced is the planner's default.
 */
export type GroundLiveliness = 'lively' | 'balanced' | 'calm';

export const DEFAULT_GROUND_LIVELINESS: GroundLiveliness = 'balanced';

export const GROUND_LIVELINESS_DIALS: Readonly<
  Record<GroundLiveliness, Readonly<Record<GroundStage, GroundStrength>>>
> = {
  lively: { room: 'full', screen: 'full', focus: 'full' },
  balanced: GROUND_STAGE_DEFAULTS,
  calm: { room: 'full', screen: 'calm', focus: 'calm' },
};

/** Veils scale with the choice; never past this, so the world always shows a little. */
const VEIL_SCALE: Readonly<Record<GroundLiveliness, number>> = {
  lively: 0.8,
  balanced: 1,
  calm: 1.3,
};
export const MAX_GROUND_VEIL = 0.95;

export function isGroundLiveliness(value: unknown): value is GroundLiveliness {
  return value === 'lively' || value === 'balanced' || value === 'calm';
}

export function groundDialOf(
  liveliness: GroundLiveliness = DEFAULT_GROUND_LIVELINESS,
): Readonly<Record<GroundStage, GroundStrength>> {
  return GROUND_LIVELINESS_DIALS[liveliness];
}

/** How much paper covers the floor on a kind of screen, for this choice. */
export function groundVeilOf(
  stage: GroundStage,
  liveliness: GroundLiveliness = DEFAULT_GROUND_LIVELINESS,
  base: number = GROUND_VEIL_DEFAULTS[stage],
): number {
  return Math.min(MAX_GROUND_VEIL, base * VEIL_SCALE[liveliness]);
}

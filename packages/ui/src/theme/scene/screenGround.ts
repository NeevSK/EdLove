import type { ScenePresence } from './resolveScene';

/**
 * How loud the world's ground is behind each kind of screen: a policy, not a
 * per-screen choice. Every screen stands on the world's ground; a screen only
 * says what kind of screen it is, and this table, the person's own setting
 * (Comfort.ground) and the phone's budget (verger's stage tier, which can only
 * calm it further) decide how much of the ground shows.
 *
 * - home: a room's front floor, welcome and entry screens.
 * - inside: pages within a room.
 * - focus: settings, notifications, forms, reading: work that wants calm.
 */
export type ScreenKind = 'home' | 'inside' | 'focus';

/** The person's choice, in Visual settings. */
export type GroundLiveliness = 'lively' | 'balanced' | 'calm';

export interface GroundPolicy {
  presence: Record<GroundLiveliness, Record<ScreenKind, ScenePresence>>;
  /** How much of the ground covers the floor on a quiet screen (1 hides it). */
  quietVeil: Record<GroundLiveliness, number>;
}

/** The defaults. A dial, not a law: change the table, not the screens. */
export const GROUND_POLICY: GroundPolicy = {
  presence: {
    lively: { home: 'full', inside: 'band', focus: 'band' },
    balanced: { home: 'full', inside: 'band', focus: 'quiet' },
    calm: { home: 'band', inside: 'quiet', focus: 'quiet' },
  },
  quietVeil: { lively: 0.85, balanced: 0.9, calm: 0.95 },
};

export const DEFAULT_GROUND_LIVELINESS: GroundLiveliness = 'balanced';

export function screenPresence(
  kind: ScreenKind,
  liveliness: GroundLiveliness = DEFAULT_GROUND_LIVELINESS,
  policy: GroundPolicy = GROUND_POLICY,
): ScenePresence {
  return policy.presence[liveliness][kind];
}

export function quietVeilOf(
  liveliness: GroundLiveliness = DEFAULT_GROUND_LIVELINESS,
  policy: GroundPolicy = GROUND_POLICY,
): number {
  return policy.quietVeil[liveliness];
}

/**
 * Spacing as relations, not numbers. Space says what belongs together:
 * things inside one control sit closest, siblings in a group next, groups
 * stand apart, sections apart again. Components ask for a relation; density
 * and the person's text size open or close the whole page together.
 */

export type SpaceRelation = 'inside' | 'between' | 'group' | 'section';

/** `compact` for working screens, `comfortable` for everything else. */
export type SpaceDensity = 'compact' | 'comfortable';

export const space: Record<SpaceRelation, Record<SpaceDensity, number>> = {
  inside: { compact: 4, comfortable: 8 },
  between: { compact: 8, comfortable: 12 },
  group: { compact: 20, comfortable: 24 },
  section: { compact: 32, comfortable: 40 },
};

/**
 * The gap for a relation. Larger text needs more air, but not in proportion
 * (a 2x font would push groups off the screen), so the scale is capped.
 */
export function gapFor(
  relation: SpaceRelation,
  density: SpaceDensity = 'comfortable',
  fontScale = 1,
): number {
  return Math.round(space[relation][density] * Math.min(1.5, Math.max(1, fontScale)));
}

/**
 * Fixed size scales for kit pieces that do not change per world: icons,
 * the narrowest a grid column may get, and how wide a card in a rail is.
 */

export type KitSize = 'sm' | 'md' | 'lg';

export const iconSize: Record<KitSize, number> = { sm: 16, md: 20, lg: 24 };

/** A grid adds a column whenever another one this wide fits. */
export const gridMin: Record<KitSize, number> = { sm: 140, md: 200, lg: 280 };

/** Card widths in a rail, and the width under which a wide card stacks. */
export const cardWidth: Record<KitSize, number> = { sm: 148, md: 220, lg: 300 };
export const WIDE_CARD_STACKS_BELOW = 360;

/** Under this width a row puts its detail below its label instead of beside it. */
export const ROW_STACKS_BELOW = 300;

/** Columns that fit `width` when each must be at least `min` wide, between 1 and `max`. */
export function columnsFor(width: number, min: number, gap: number, max = 6): number {
  if (width <= 0) return 1;
  return Math.max(1, Math.min(max, Math.floor((width + gap) / (min + gap))));
}

/** The smallest a pressable thing may be, in each direction (WCAG 2.5.8, platform guides). */
export const touchTarget = { min: 44 } as const;

import type { ToolbarAction } from './contracts';

/** Narrower than this, actions with an icon show the icon alone (its name stays spoken). */
export const ICONS_ONLY_BELOW = 480;
export const TOOLBAR_GAP = 4;

interface Sizing {
  /** The platform's touch minimum (48 Android, 44 elsewhere). */
  touchMin: number;
  /** The person's text size (1 = default). */
  fontScale?: number;
}

/** Roughly how wide an action draws, so the row can decide what folds. */
export function actionWidth(
  a: ToolbarAction,
  iconsOnly: boolean,
  { touchMin, fontScale = 1 }: Sizing,
) {
  if (a.icon && iconsOnly) return touchMin;
  return Math.max(touchMin, Math.round(a.label.length * 8.5 * fontScale) + (a.icon ? 56 : 32));
}

/**
 * How many actions show before the rest fold into "More", in the order given.
 * Room is kept for "More" whenever something would fold.
 */
export function actionsThatFit(
  actions: readonly ToolbarAction[],
  width: number,
  sizing: Sizing,
): { shown: number; iconsOnly: boolean } {
  const iconsOnly = width < ICONS_ONLY_BELOW;
  let used = 0;
  for (let i = 0; i < actions.length; i++) {
    const w = actionWidth(actions[i]!, iconsOnly, sizing) + (i > 0 ? TOOLBAR_GAP : 0);
    const moreRoom = i < actions.length - 1 ? sizing.touchMin + TOOLBAR_GAP : 0;
    if (used + w + moreRoom > width) return { shown: i, iconsOnly };
    used += w;
  }
  return { shown: actions.length, iconsOnly };
}

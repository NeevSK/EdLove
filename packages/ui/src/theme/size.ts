/**
 * Size classes: one word for how much room the screen gives, so the shell and screens adapt the
 * same way from a small phone (A24 at 360dp, older 2 GB phones under it) to a tablet.
 *
 * - compact: under 360dp wide. Docked tab bar, compact header, single column, tighter gutters.
 * - regular: a phone. Floating tab bar, full header, single column.
 * - medium: a large phone in landscape or a small tablet. A rail at the side, two columns allowed.
 * - expanded: a tablet. A rail, two or three columns, reading width held.
 */

export type SizeClass = 'compact' | 'regular' | 'medium' | 'expanded';

export function sizeClassOf(width: number): SizeClass {
  if (width < 360) return 'compact';
  if (width < 600) return 'regular';
  if (width < 840) return 'medium';
  return 'expanded';
}

export interface ShellLayout {
  size: SizeClass;
  /** Where the rooms sit: along the bottom edge, floating above the floor, or a rail at the side. */
  tabs: 'docked' | 'floating' | 'rail';
  /** Side gutter for screen content. */
  gutter: number;
  /** The widest a column of reading text grows; content centres beyond it. */
  readable: number;
  /** How many columns a screen's grid may use. */
  columns: 1 | 2 | 3;
}

/** The shell's layout for this width, honouring the person's choice of tab bar where it fits. */
export function shellLayoutOf(
  width: number,
  choice: 'auto' | 'docked' | 'floating' = 'auto',
): ShellLayout {
  const size = sizeClassOf(width);
  const wide = size === 'medium' || size === 'expanded';
  const tabs = wide
    ? 'rail'
    : choice === 'auto'
      ? size === 'compact'
        ? 'docked'
        : 'floating'
      : choice;
  return {
    size,
    tabs,
    gutter: size === 'compact' ? 14 : size === 'regular' ? 20 : 28,
    readable: 680,
    columns: size === 'expanded' ? 3 : size === 'medium' ? 2 : 1,
  };
}

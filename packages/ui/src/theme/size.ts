/**
 * Size classes: one word for how much room the screen gives, so the shell and screens adapt the
 * same way from a small phone (A24 at 360dp, older 2 GB phones under it) to a tablet.
 *
 * - compact: under 360dp wide. Docked tab bar, compact header, single column, tighter gutters.
 * - regular: a phone. Floating tab bar, full header, single column.
 * - medium: a large phone in landscape or a small tablet. A rail at the side, two columns allowed.
 * - expanded: a tablet. A rail, two or three columns, reading width held.
 *
 * Width alone is not enough: a phone on its side is wide but very short, and a 20:9 phone feels
 * nothing like a 4:3 tablet. So the layout also reads the height and the aspect:
 *
 * - posture: portrait or landscape, from which side is longer.
 * - aspect: tall (20:9 and longer phones), classic (16:9 to 19:9), square (tablets, foldables
 *   open, anything under 1.45).
 * - stance: how the shell is held. `upright` is the phone's usual look; `wide` is a tablet or a
 *   big screen with room for a header and a rail; `hud` is a phone on its side, held like a game:
 *   no header row, the person, rooms, help and bell all on a rail by the left thumb, the action by
 *   the right thumb, and every bit of height given to the content and the world.
 */

export type SizeClass = 'compact' | 'regular' | 'medium' | 'expanded';
export type Posture = 'portrait' | 'landscape';
export type AspectClass = 'tall' | 'classic' | 'square';
export type Stance = 'upright' | 'wide' | 'hud';

/** Under this height (dp) a landscape screen has no room for a header row as well as content. */
export const HUD_MAX_HEIGHT = 520;

export function sizeClassOf(width: number): SizeClass {
  if (width < 360) return 'compact';
  if (width < 600) return 'regular';
  if (width < 840) return 'medium';
  return 'expanded';
}

export function aspectClassOf(width: number, height: number): AspectClass {
  const long = Math.max(width, height);
  const short = Math.max(1, Math.min(width, height));
  const ratio = long / short;
  if (ratio >= 2.0) return 'tall';
  if (ratio >= 1.45) return 'classic';
  return 'square';
}

export interface ShellLayout {
  size: SizeClass;
  posture: Posture;
  aspect: AspectClass;
  stance: Stance;
  /** Where the rooms sit: along the bottom edge, floating above the floor, or a rail at the side. */
  tabs: 'docked' | 'floating' | 'rail';
  /** Whether a header row sits across the top (false in `hud`: the rail carries its controls). */
  header: boolean;
  /** Side gutter for screen content. */
  gutter: number;
  /** The widest a column of reading text grows; content centres beyond it. */
  readable: number;
  /** How many columns a screen's grid may use. */
  columns: 1 | 2 | 3;
  /** Vertical rhythm: tighter on a short screen so a card's head and its first lines both show. */
  rhythm: { top: number; gap: number };
}

/**
 * The shell's layout for this screen, honouring the person's choice of tab bar where it fits.
 * `height` is optional so older callers keep their width-only behaviour (treated as portrait).
 */
export function shellLayoutOf(
  width: number,
  choice: 'auto' | 'docked' | 'floating' = 'auto',
  height?: number,
): ShellLayout {
  const h = height ?? Math.max(width * 2, 1);
  const posture: Posture = width > h ? 'landscape' : 'portrait';
  const aspect = aspectClassOf(width, h);
  const short = posture === 'landscape' && h < HUD_MAX_HEIGHT;
  const size = sizeClassOf(width);
  const wide = size === 'medium' || size === 'expanded';
  const stance: Stance = short ? 'hud' : wide ? 'wide' : 'upright';
  const tabs =
    stance !== 'upright'
      ? 'rail'
      : choice === 'auto'
        ? size === 'compact'
          ? 'docked'
          : 'floating'
        : choice;
  // Columns follow the width left beside the rail, not the screen's width.
  const usable = tabs === 'rail' ? width - 88 : width;
  const columns: 1 | 2 | 3 = usable >= 900 ? 3 : usable >= 560 ? 2 : 1;
  return {
    size,
    posture,
    aspect,
    stance,
    tabs,
    header: stance !== 'hud',
    gutter: size === 'compact' ? 14 : size === 'regular' ? 20 : stance === 'hud' ? 22 : 28,
    // A wide, short screen reads best in a slightly wider column (fewer, longer lines).
    readable: stance === 'hud' ? 760 : 680,
    columns,
    rhythm: short ? { top: 10, gap: 16 } : { top: 18, gap: 22 },
  };
}

import type { ChromeBar, FloorSpace, Orientation, WidthClass } from './types';

/** Android window size classes by width in dp. */
export function widthClassOf(width: number): WidthClass {
  if (width < 600) return 'compact';
  if (width < 840) return 'medium';
  if (width < 1200) return 'expanded';
  if (width < 1600) return 'large';
  return 'xlarge';
}

export function orientationOf(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

export interface ShareChild {
  id: string;
  min: number;
  preferred: number;
  weight: number;
}

export interface ShareResult {
  sizes: Record<string, number>;
  /** Children that could not get even their minimum, lowest weight first out. */
  folded: string[];
}

/**
 * Shares `available` among children: each gets its minimum, then what is left
 * goes by weight, never past a child's preferred size; space a child cannot
 * use goes back to the others. When the minimums alone do not fit, the
 * lowest-weight child folds and the share is run again.
 *
 *   s_i = min(p_i, m_i + (A − Σm) · w_i / Σw)
 */
export function shareSpace(available: number, children: readonly ShareChild[]): ShareResult {
  const folded: string[] = [];
  let live = [...children];
  while (live.length > 0 && live.reduce((sum, c) => sum + c.min, 0) > available) {
    // Lowest weight folds; on a tie, the later one, so reading order keeps its head.
    const lowest = live.reduce((lo, c) => (c.weight <= lo.weight ? c : lo));
    folded.push(lowest.id);
    live = live.filter((c) => c !== lowest);
  }
  const sizes: Record<string, number> = {};
  for (const c of live) sizes[c.id] = c.min;
  let left = available - live.reduce((sum, c) => sum + c.min, 0);
  let open = live.filter((c) => c.preferred > c.min);
  // Each round either uses all that is left or fills at least one child.
  while (left > 0.0001 && open.length > 0) {
    const totalWeight = open.reduce((sum, c) => sum + Math.max(c.weight, 0.0001), 0);
    let used = 0;
    for (const c of open) {
      const want = c.preferred - (sizes[c.id] ?? 0);
      const give = Math.min(want, (left * Math.max(c.weight, 0.0001)) / totalWeight);
      sizes[c.id] = (sizes[c.id] ?? 0) + give;
      used += give;
    }
    left -= used;
    open = open.filter((c) => (sizes[c.id] ?? 0) < c.preferred - 0.0001);
    if (used < 0.0001) break;
  }
  return { sizes, folded };
}

export interface ScreenBudget {
  floor: { w: number; h: number };
  shown: string[];
  hidden: string[];
}

/**
 * Who gets the screen. The keyboard and insets come off first; then chrome
 * gives way, highest rank first, until the floor keeps its least share.
 * Essential chrome never gives way.
 */
export function screenBudget(space: FloorSpace, floorMinShare: number): ScreenBudget {
  const insets = space.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const w = Math.max(0, space.width - insets.left - insets.right);
  const usable = Math.max(0, space.height - insets.top - insets.bottom - (space.keyboard ?? 0));
  const want = space.height * floorMinShare;
  let shown: ChromeBar[] = [...space.chrome];
  const hidden: string[] = [];
  const floorHeight = () => usable - shown.reduce((sum, c) => sum + c.height, 0);
  const giving = [...space.chrome]
    .filter((c) => !c.essential)
    .sort((a, b) => b.giveWayRank - a.giveWayRank);
  for (const bar of giving) {
    if (floorHeight() >= want) break;
    shown = shown.filter((c) => c !== bar);
    hidden.push(bar.id);
  }
  return { floor: { w, h: Math.max(0, floorHeight()) }, shown: shown.map((c) => c.id), hidden };
}

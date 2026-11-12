import type { DensityTier, DepthCue, DetailTier, MotionLevel, PatternId, TimeBand } from './types';

/**
 * Every open decision in the floor system is a dial here with a default, so
 * the engine can be built and changed without anyone deciding up front.
 * "Product" marks Neev's calls (the default follows the older docs); "tune"
 * marks starting numbers to measure on real phones.
 */
export interface FloorConfig {
  /**
   * Product. Who may reorder: only labelled smart areas ("Today") and the lit
   * piece, everywhere, or never (the person's order always wins).
   * Default from the workspace canvas redesign doc: smart areas only.
   */
  reorder: 'smart-areas' | 'everywhere' | 'never';
  /** Product. Order of the hierarchy keys. */
  hierarchy: readonly ('lit' | 'time' | 'attention' | 'saved')[];
  /** Product. Area order on every floor; unknown areas go after, in input order. */
  areaOrder: readonly string[];
  /** Product. Density tier per room; rooms not listed are Standard (spacing doc 16). */
  tierByRoom: Readonly<Record<string, DensityTier>>;
  /** Product. Which of our own patterns are switched on. */
  ownPatterns: Readonly<Record<'lamp' | 'path' | 'day-river' | 'pinboard' | 'desk', boolean>>;
  /** Tune. Weight factors: w = time × attention × role × pin. */
  weights: { time: Readonly<Record<TimeBand, number>>; attention: number; pin: number };
  /** Tune. Most groups on the first screen, per tier (chunks of 3 to 6). */
  groupsOnFirstScreen: Readonly<Record<DensityTier, number>>;
  /** Tune. Most pieces a group shows before "See all", per tier. */
  piecesPerGroup: Readonly<Record<DensityTier, number>>;
  /** Tune. Gaps in dp: inside a group and between groups (kit spacing relations). */
  gaps: { between: number; group: number; section: number };
  /** Tune. Least share of the window the floor keeps before chrome gives way. */
  floorMinShare: number;
  /** Platform. Touch minimum in dp (48 on Android, 44 on iOS and the web). */
  touchMin: number;
  /** Tune. Cost budget (views) per verger tier. */
  budget: Readonly<Record<DetailTier, number>>;
  /** Tune. Motion ceiling per verger tier. */
  motionByTier: Readonly<Record<DetailTier, MotionLevel>>;
  /** Tune. Depth cues allowed per tier; all are placement, none needs motion. */
  depthByTier: Readonly<Record<DetailTier, readonly DepthCue[]>>;
  /** Tune. Text size above which grids become streams. */
  largeTextAt: number;
  /** Tune. Cheaper form of each costly pattern, used when over budget. */
  cheaper: Readonly<Partial<Record<PatternId, PatternId>>>;
}

export const DEFAULT_FLOOR_CONFIG: FloorConfig = {
  reorder: 'smart-areas',
  hierarchy: ['lit', 'time', 'attention', 'saved'],
  areaOrder: ['today', 'work', 'institution', 'outlook', 'private'],
  tierByRoom: { workspace: 'dense', self: 'calm', profile: 'calm' },
  ownPatterns: { lamp: true, path: true, 'day-river': true, pinboard: true, desk: true },
  weights: { time: { now: 3, later: 2, anytime: 1 }, attention: 2, pin: 1.5 },
  groupsOnFirstScreen: { calm: 3, standard: 4, dense: 5 },
  piecesPerGroup: { calm: 4, standard: 5, dense: 8 },
  gaps: { between: 8, group: 24, section: 40 },
  floorMinShare: 0.5,
  touchMin: 48,
  budget: { rich: 400, balanced: 250, essential: 150 },
  motionByTier: { rich: 'full', balanced: 'reduced', essential: 'none' },
  depthByTier: {
    rich: ['overlap', 'scale', 'light', 'haze', 'tilt'],
    balanced: ['overlap', 'scale', 'light'],
    essential: ['overlap', 'light'],
  },
  largeTextAt: 1.3,
  cheaper: {
    shelf: 'grouped-list',
    'circle-rail': 'grouped-list',
    'mixed-tiles': 'tile-grid',
    board: 'stream',
    'day-river': 'grouped-list',
    path: 'grouped-list',
  },
};

/** Defaults with any dials overridden; nested records merge one level deep. */
export function floorConfigWith(overrides: Partial<FloorConfig> = {}): FloorConfig {
  const base = DEFAULT_FLOOR_CONFIG;
  return {
    ...base,
    ...overrides,
    tierByRoom: { ...base.tierByRoom, ...overrides.tierByRoom },
    ownPatterns: { ...base.ownPatterns, ...overrides.ownPatterns },
    weights: {
      ...base.weights,
      ...overrides.weights,
      time: { ...base.weights.time, ...overrides.weights?.time },
    },
    groupsOnFirstScreen: { ...base.groupsOnFirstScreen, ...overrides.groupsOnFirstScreen },
    piecesPerGroup: { ...base.piecesPerGroup, ...overrides.piecesPerGroup },
    gaps: { ...base.gaps, ...overrides.gaps },
    budget: { ...base.budget, ...overrides.budget },
    motionByTier: { ...base.motionByTier, ...overrides.motionByTier },
    depthByTier: { ...base.depthByTier, ...overrides.depthByTier },
    cheaper: { ...base.cheaper, ...overrides.cheaper },
  };
}

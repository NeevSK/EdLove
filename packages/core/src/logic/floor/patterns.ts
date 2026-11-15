import type { FloorConfig } from './config';
import type {
  DetailTier,
  FloorCost,
  GroupInput,
  PatternId,
  PieceInput,
  PieceShape,
  WorldFloorBias,
} from './types';

export interface PatternSpec {
  id: PatternId;
  /** Least floor width in dp it needs. */
  minWidth: number;
  /** Pieces it suits. */
  pieces: [number, number];
  /** What the pattern itself adds to its pieces' cost. */
  cost: FloorCost;
  /** Our own pattern (switchable in config). */
  own?: boolean;
  /** Keeps tasks hidden past the first item: a task may never live only here. */
  hidesPastFirst?: boolean;
  /** How the whole pattern is spoken. */
  spoken: string;
}

const LOW: FloorCost = { views: 2, pictures: 0, moves: false };
const MID: FloorCost = { views: 6, pictures: 0, moves: false };
const HIGH: FloorCost = { views: 12, pictures: 0, moves: false };

export const PATTERNS: Readonly<Record<PatternId, PatternSpec>> = {
  hero: { id: 'hero', minWidth: 0, pieces: [1, 1], cost: LOW, spoken: '{label}' },
  lamp: { id: 'lamp', minWidth: 0, pieces: [1, 99], cost: LOW, own: true, spoken: '{label}, now' },
  stream: {
    id: 'stream',
    minWidth: 0,
    pieces: [1, 6],
    cost: LOW,
    spoken: '{label}, {total} items',
  },
  'tile-grid': {
    id: 'tile-grid',
    minWidth: 0,
    pieces: [2, 9],
    cost: LOW,
    spoken: '{label}, {total} items',
  },
  'mixed-tiles': {
    id: 'mixed-tiles',
    minWidth: 360,
    pieces: [3, 7],
    cost: LOW,
    spoken: '{label}, {total} items',
  },
  shelf: {
    id: 'shelf',
    minWidth: 0,
    pieces: [3, 12],
    cost: MID,
    hidesPastFirst: true,
    spoken: '{label}, {n} of {total}',
  },
  'circle-rail': {
    id: 'circle-rail',
    minWidth: 0,
    pieces: [3, 12],
    cost: MID,
    hidesPastFirst: true,
    spoken: '{label}, {n} of {total}',
  },
  'chip-rail': {
    id: 'chip-rail',
    minWidth: 0,
    pieces: [3, 8],
    cost: LOW,
    spoken: '{label}, {total} choices',
  },
  'grouped-list': {
    id: 'grouped-list',
    minWidth: 0,
    pieces: [1, 999],
    cost: LOW,
    spoken: '{label}, {total} items',
  },
  'one-at-a-time': {
    id: 'one-at-a-time',
    minWidth: 0,
    pieces: [1, 999],
    cost: LOW,
    spoken: 'Step {n} of {total}',
  },
  path: {
    id: 'path',
    minWidth: 0,
    pieces: [4, 20],
    cost: MID,
    own: true,
    spoken: 'Step {n} of {total}, next',
  },
  'day-river': {
    id: 'day-river',
    minWidth: 360,
    pieces: [3, 10],
    cost: MID,
    own: true,
    spoken: '{label}, in time order',
  },
  pinboard: {
    id: 'pinboard',
    minWidth: 0,
    pieces: [2, 4],
    cost: LOW,
    own: true,
    spoken: '{label}, pinned',
  },
  'list-detail': {
    id: 'list-detail',
    minWidth: 720,
    pieces: [1, 999],
    cost: MID,
    spoken: '{label}',
  },
  desk: { id: 'desk', minWidth: 840, pieces: [2, 6], cost: MID, own: true, spoken: '{label}' },
  board: { id: 'board', minWidth: 1200, pieces: [3, 5], cost: HIGH, spoken: '{label}' },
};

export interface PatternChoice {
  pattern: PatternId;
  why: string[];
}

function allowed(id: PatternId, config: FloorConfig): boolean {
  const own = config.ownPatterns as Record<string, boolean>;
  return !(PATTERNS[id].own && own[id] === false);
}

/**
 * Picks a group's pattern from its job, how many pieces it has, the width it
 * got, the person's text size and the verger tier. Returns the reasons too.
 */
export function choosePattern(
  group: GroupInput,
  pieces: readonly PieceInput[],
  width: number,
  fontScale: number,
  detail: DetailTier,
  config: FloorConfig,
  world?: WorldFloorBias,
): PatternChoice {
  const why: string[] = [];
  const n = pieces.length;
  const fits = (id: PatternId) =>
    allowed(id, config) && width >= PATTERNS[id].minWidth && n >= PATTERNS[id].pieces[0];
  const pick = (id: PatternId, reason: string, fallback: PatternId = 'stream'): PatternChoice => {
    if (fits(id)) return { pattern: id, why: [...why, reason] };
    return {
      pattern: fallback,
      why: [...why, `${reason}, but ${id} does not fit here, so ${fallback}`],
    };
  };
  const largeText = fontScale >= config.largeTextAt;
  if (largeText) why.push(`text size ${fontScale} is large`);

  if (pieces.some((p) => p.lit)) return pick('lamp', 'holds the lit piece', 'hero');
  if (group.pinned) return pick('pinboard', "the person's pins");
  if (group.job === 'step') return pick('one-at-a-time', 'steps in order', 'grouped-list');
  if (group.job === 'track') return pick('path', 'progress over time', 'grouped-list');
  if (group.job === 'find' || n > 12) return pick('grouped-list', 'finding one known thing');
  if (group.job === 'browse') {
    const shape: PieceShape | undefined = group.shape ?? world?.shelfShape;
    if (detail === 'essential') return pick('grouped-list', 'browsing on the lightest tier');
    if (shape === 'circle')
      return pick('circle-rail', 'browsing people or companions', 'grouped-list');
    return pick('shelf', 'browsing things of one kind', 'grouped-list');
  }
  if (group.job === 'glance') {
    if (largeText) return pick('stream', 'large text turns tiles into a stream');
    if (n >= 3 && n <= 7 && width >= 360)
      return pick('mixed-tiles', 'one big fact with small ones');
    return pick('tile-grid', 'compared at a glance');
  }
  const small = pieces.every((p) => p.fit.min.h <= config.touchMin);
  if (small && n >= 3 && n <= 8 && !largeText) return pick('chip-rail', 'quick actions');
  return pick('stream', 'a few things to act on');
}

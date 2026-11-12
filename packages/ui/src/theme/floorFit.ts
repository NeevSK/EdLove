import type { FloorCost, FloorFit } from '@repo/core/logic/floor';
import { cardWidth, gridMin, touchTarget } from '../tokens/sizes';

/**
 * What each kit component tells the floor engine about itself: the level it
 * sits at, the least room it can work in, the room it would like, whether it
 * takes a finger, and what it costs to draw. The engine shares space from
 * these numbers, so a component changing size changes them here, once.
 *
 * Heights are the drawn sizes in the kit (theme/build.ts and the components);
 * a control drawn under the touch minimum still lists its drawn height here
 * because it reaches the minimum with extra touch area, not extra room.
 */

const cost = (views: number, pictures = 0, moves = false): FloorCost => ({
  views,
  pictures,
  moves,
});

export const KIT_FLOOR_FIT = {
  button: {
    level: 'part',
    min: { h: 36, w: 64 },
    preferred: { h: 46 },
    interactive: true,
    cost: cost(2),
  },
  iconButton: { level: 'part', min: { h: 44, w: 44 }, interactive: true, cost: cost(2) },
  moveControl: { level: 'part', min: { h: 44, w: 88 }, interactive: true, cost: cost(5) },
  splitButton: { level: 'part', min: { h: 44, w: 112 }, interactive: true, cost: cost(5) },
  contextMenu: { level: 'part', min: { h: 0 }, interactive: true, cost: cost(2) },
  taskToolbar: { level: 'piece', min: { h: 44, w: 96 }, interactive: true, cost: cost(10) },
  autocomplete: {
    level: 'piece',
    min: { h: 48, w: 160 },
    preferred: { h: 48 },
    interactive: true,
    cost: cost(8),
  },
  miniChart: {
    level: 'part',
    min: { h: 20, w: 48 },
    preferred: { h: 28, w: 96 },
    cost: cost(2, 1),
  },
  chip: {
    level: 'part',
    min: { h: 32, w: 48 },
    preferred: { h: 36 },
    interactive: true,
    cost: cost(2),
  },
  switch: { level: 'part', min: { h: 44, w: 52 }, interactive: true, cost: cost(3) },
  checkbox: { level: 'part', min: { h: 44 }, interactive: true, cost: cost(3) },
  radio: { level: 'part', min: { h: 44 }, interactive: true, cost: cost(3) },
  badge: { level: 'part', min: { h: 20, w: 20 }, cost: cost(2) },
  avatar: {
    level: 'part',
    min: { h: 32, w: 32 },
    preferred: { h: 40, w: 40 },
    aspect: 1,
    cost: cost(2, 1),
  },
  progress: { level: 'part', min: { h: 4, w: 48 }, cost: cost(2, 0, true) },
  segmented: {
    level: 'piece',
    min: { h: 38, w: 160 },
    preferred: { h: 38 },
    interactive: true,
    cost: cost(8),
  },
  tabs: { level: 'piece', min: { h: 44, w: 160 }, interactive: true, cost: cost(8) },
  field: {
    level: 'piece',
    min: { h: 48, w: 160 },
    preferred: { h: 76 },
    interactive: true,
    cost: cost(5),
  },
  select: { level: 'piece', min: { h: 48, w: 140 }, interactive: true, cost: cost(5) },
  slider: { level: 'piece', min: { h: 44, w: 120 }, interactive: true, cost: cost(5) },
  row: { level: 'piece', min: { h: 48 }, preferred: { h: 56 }, interactive: true, cost: cost(4) },
  swipeRow: { level: 'piece', min: { h: 56 }, interactive: true, cost: cost(8, 0, true) },
  card: {
    level: 'piece',
    min: { h: 96, w: cardWidth.sm },
    preferred: { h: 140, w: cardWidth.md },
    interactive: true,
    cost: cost(8),
  },
  pebble: {
    level: 'piece',
    min: { h: 72, w: 72 },
    preferred: { h: 96, w: 96 },
    aspect: 1,
    interactive: true,
    cost: cost(5, 0, true),
  },
  media: {
    level: 'piece',
    min: { h: 120, w: gridMin.sm },
    preferred: { h: 200 },
    aspect: 16 / 9,
    cost: cost(3, 1),
  },
  emptyState: { level: 'piece', min: { h: 120 }, preferred: { h: 200 }, cost: cost(5, 1) },
  table: {
    level: 'piece',
    min: { h: 160, w: 320 },
    preferred: { h: 320 },
    interactive: true,
    cost: cost(40),
  },
  list: {
    level: 'group',
    min: { h: 48 * 3 },
    preferred: { h: 56 * 5 },
    interactive: true,
    cost: cost(20),
    spoken: '{n} of {total}',
  },
  rail: {
    level: 'group',
    min: { h: 140, w: cardWidth.sm },
    preferred: { h: 200 },
    interactive: true,
    cost: cost(24, 4),
    spoken: '{n} of {total}',
  },
  carousel: {
    level: 'group',
    min: { h: 180 },
    preferred: { h: 260 },
    interactive: true,
    cost: cost(16, 3, true),
    spoken: '{n} of {total}',
  },
  grid: {
    level: 'group',
    min: { h: 120, w: gridMin.sm },
    preferred: { h: 280 },
    interactive: true,
    cost: cost(24, 2),
  },
  section: { level: 'group', min: { h: 64 }, cost: cost(4) },
  scene: { level: 'floor', min: { h: 120 }, preferred: { h: 220 }, cost: cost(6, 2, true) },
} as const satisfies Record<string, FloorFit>;

export type KitPiece = keyof typeof KIT_FLOOR_FIT;

/**
 * The fit the engine should use on this platform: anything that takes a
 * finger is given at least the platform's touch minimum in height (48 on
 * Android, 44 elsewhere), whatever it draws.
 */
export function floorFitOf(piece: KitPiece, platform: 'ios' | 'android' | 'web'): FloorFit {
  const fit: FloorFit = KIT_FLOOR_FIT[piece];
  if (!fit.interactive) return fit;
  const target = platform === 'android' ? touchTarget.android : touchTarget.min;
  if (fit.min.h >= target) return fit;
  return { ...fit, min: { ...fit.min, h: target } };
}

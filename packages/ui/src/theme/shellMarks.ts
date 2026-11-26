/**
 * How each world marks "you are here" in the rooms bar, and the shape of its room button. Pure
 * data: the shell reads these, so a world's mark changes in one place.
 *
 * - well: a soft fill in the world's chip shape (Kele's leaf, Spark's slashed corners, Classic's pill)
 * - underline: a short lamp line under the sign (fine, precise worlds)
 * - glow: a lamp halo behind the sign (warm, soft worlds)
 * - frame: an ornament line above and below (framed, ceremonial worlds)
 */

import type { Radius, WorldId } from './types';

export type RoomMark = 'well' | 'underline' | 'glow' | 'frame';

const MARKS: Readonly<Record<WorldId, RoomMark>> = {
  classic: 'well',
  sanctuary: 'glow',
  wewa: 'well',
  ratna: 'underline',
  kele: 'well',
  tea: 'glow',
  kandyan: 'frame',
  angampora: 'well',
  perahera: 'frame',
  rosa: 'glow',
  colombo: 'underline',
  spark: 'well',
};

export function roomMarkOf(id: WorldId): RoomMark {
  return MARKS[id] ?? 'well';
}

/** A world radius fitted to something `size` tall: pills stay pills, shapes keep their character. */
export function fitRadius(r: Radius, size: number): Radius {
  const half = size / 2;
  const fit = (v: number) => Math.min(half, v >= 999 ? half : v * (size / 46));
  return typeof r === 'number' ? fit(r) : [fit(r[0]), fit(r[1]), fit(r[2]), fit(r[3])];
}

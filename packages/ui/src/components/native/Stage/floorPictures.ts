/**
 * Baked floor pictures: one small WebP per world and phase (scripts/scene-shots/bake.tsx). The app
 * registers them once; on the `floor` tier the stage shows the picture instead of drawing the still
 * layers on a Skia canvas, so a small phone spends no canvas memory or draw time on the floor.
 */

import type { Phase } from '../../../theme/types';

/** An image source as the bundler gives it (`require('…webp')`). */
export type FloorPicture = number | { uri: string };
export type FloorPictures = Readonly<
  Record<string, Readonly<Partial<Record<Phase, FloorPicture>>>>
>;

let pictures: FloorPictures = {};

export function registerFloorPictures(next: FloorPictures): void {
  pictures = next;
}

export function floorPictureFor(world: string, phase: Phase): FloorPicture | null {
  return pictures[world]?.[phase] ?? null;
}

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
let widePictures: FloorPictures = {};

/** Upright pictures, and wide ones composed for a phone on its side or a tablet. */
export function registerFloorPictures(next: FloorPictures, wide: FloorPictures = {}): void {
  pictures = next;
  widePictures = wide;
}

/** The picture for this world and phase; a wide screen gets the wide one where it was baked. */
export function floorPictureFor(world: string, phase: Phase, wide = false): FloorPicture | null {
  return (wide ? widePictures[world]?.[phase] : undefined) ?? pictures[world]?.[phase] ?? null;
}

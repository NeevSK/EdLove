/**
 * Each world's floor as scene art (see `./types`). A world without its own art yet falls back to
 * the shared landscape; Classic has none on purpose (its ground is plain).
 */

import type { WorldId } from '../../types';
import type { ArtInput } from './kit';
import type { SceneArt } from './types';
import { keleArt } from './worlds/kele';
import { rosaArt } from './worlds/rosa';
import { sanctuaryArt } from './worlds/sanctuary';
import { teaArt } from './worlds/tea';
import { wewaArt } from './worlds/wewa';

export type ArtBuilder = (input: ArtInput) => SceneArt;

/** The registry: a world draws its own floor by adding one line here. */
export const WORLD_ART: Readonly<Partial<Record<WorldId, ArtBuilder>>> = {
  kele: keleArt,
  sanctuary: sanctuaryArt,
  wewa: wewaArt,
  tea: teaArt,
  rosa: rosaArt,
};

/** Whether a world has its own scene art. */
export function hasWorldArt(id: string): boolean {
  return id in WORLD_ART;
}

/** The art for a world, or null when it has none (fall back to the shared landscape). */
export function sceneArtOf(id: string, input: ArtInput): SceneArt | null {
  const build = (WORLD_ART as Record<string, ArtBuilder | undefined>)[id];
  return build ? build(input) : null;
}

export type { ArtInput, ArtContext } from './kit';
export { contextOf } from './kit';
export * from './types';

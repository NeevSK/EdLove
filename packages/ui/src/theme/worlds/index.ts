/**
 * The worlds Gurudevi ships (twelve today, not a limit), in five families (quiet, nature,
 * cultural, bloom, modern). Classic is the plain one, for people who want a normal app. The World Atelier is where they were chosen:
 * https://claude.ai/artifact/NsvcH2ixJxNGyVQ6JQwa33
 *
 * Each is a palette (light and dark) and a dozen style decisions. Colour lives
 * in the world; controls stay ink and paper, with one lit thing at a time.
 *
 * Cultural care: worlds borrow materials, colours and patterns (lime plaster,
 * a vine band, still water, brass). They never use sacred figures or scenes.
 */

import type { WorldDefinition } from '../types';
import { angampora } from './angampora';
import { classic } from './classic';
import { colombo } from './colombo';
import { kandyan } from './kandyan';
import { kele } from './kele';
import { perahera } from './perahera';
import { ratna } from './ratna';
import { rosa } from './rosa';
import { sanctuary } from './sanctuary';
import { spark } from './spark';
import { tea } from './tea';
import { wewa } from './wewa';

/**
 * The registry: the one list of worlds. In family order: quiet, nature,
 * cultural, bloom, modern. Add a world = its folder + one line here.
 */
export const WORLDS = {
  classic,
  sanctuary,
  wewa,
  ratna,
  kele,
  tea,
  kandyan,
  angampora,
  perahera,
  rosa,
  colombo,
  spark,
} as const satisfies Record<string, WorldDefinition>;

type WorldId = keyof typeof WORLDS;

// Object.keys is typed string[]; these are exactly the registry's keys.
export const WORLD_IDS = Object.keys(WORLDS) as WorldId[];

/** One value per world, picked from its definition (signs, perches, faces). */
export function byWorld<T>(pick: (world: WorldDefinition) => T): Readonly<Record<WorldId, T>> {
  return Object.fromEntries(WORLD_IDS.map((id) => [id, pick(WORLDS[id])])) as Record<WorldId, T>;
}

export const DEFAULT_WORLD: WorldId = 'kele';

export function isWorldId(value: unknown): value is WorldId {
  return typeof value === 'string' && value in WORLDS;
}

export function worldName(id: WorldId, lang: 'en' | 'si' | 'ta' = 'en'): string {
  const world = WORLDS[id];
  if (!world) return id;
  return world.names[lang] ?? world.names.en ?? id;
}

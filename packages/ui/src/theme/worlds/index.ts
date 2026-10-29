/**
 * The eleven worlds Gurudevi ships, in five families (quiet, nature,
 * cultural, bloom, modern). The World Atelier is where they were chosen:
 * https://claude.ai/artifact/NsvcH2ixJxNGyVQ6JQwa33
 *
 * Each is a palette (light and dark) and a dozen style decisions. Colour lives
 * in the world; controls stay ink and paper, with one lit thing at a time.
 *
 * Cultural care: worlds borrow materials, colours and patterns (lime plaster,
 * a vine band, still water, brass). They never use sacred figures or scenes.
 */

import type { WorldDefinition, WorldId } from '../types';
import { sanctuary } from './sanctuary';
import { kandyan } from './kandyan';
import { wewa } from './wewa';
import { kele } from './kele';
import { angampora } from './angampora';
import { ratna } from './ratna';
import { tea } from './tea';
import { perahera } from './perahera';
import { rosa } from './rosa';
import { colombo } from './colombo';
import { spark } from './spark';

/** In family order: quiet, nature, cultural, bloom, modern. */
export const WORLDS: Readonly<Record<WorldId, WorldDefinition>> = {
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
};

export const WORLD_IDS = Object.keys(WORLDS) as WorldId[];

export const DEFAULT_WORLD: WorldId = 'sanctuary';

export function isWorldId(value: unknown): value is WorldId {
  return typeof value === 'string' && value in WORLDS;
}

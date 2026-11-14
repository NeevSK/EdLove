/**
 * The typefaces each world is written in, and how each one moves. Each world
 * keeps its own in its folder (`worlds/<id>`); these are views of the
 * registry for code that wants every world at once. Shared face definitions
 * live in `worlds/shared/faces.ts`.
 */

import type { FaceSpec, WorldFaces, WorldId, WorldLanguage, WorldMotion } from './types';
import { byWorld } from './worlds';

export const FACES: Readonly<Record<WorldId, WorldFaces>> = byWorld((w) => w.faces);

/** How each world moves; see `WorldMotion` and docs/Core/design/2026-10-26-world-model.md. */
export const MOTION: Readonly<Record<WorldId, WorldMotion>> = byWorld((w) => w.motion);

function namesOf(face: FaceSpec): string[] {
  const names = [face.upright, ...(face.italic ? [face.italic] : [])];
  for (const w of Object.values(face.weights)) if (typeof w === 'string') names.push(w);
  return names;
}

/** Every font file a world draws with, for one language (what the web must load). */
export function fontNamesOf(world: WorldId, lang: WorldLanguage): string[] {
  const f = FACES[world];
  const faces =
    lang === 'si' || lang === 'ta'
      ? [f.serif, f.sans, f[lang].serif, f[lang].sans]
      : [f.serif, f.sans];
  return [...new Set(faces.flatMap(namesOf))];
}

/**
 * The floor's shaders, compiled once on first use. They run only at the rich and middle tiers,
 * over a region of the scene (see `./shaderSource`).
 */

import { Skia, type SkRuntimeEffect } from 'react-native-skia';
import type { ArtShader } from '../../../theme/scene/art/types';
import { SHADER_SOURCE } from './shaderSource';

export { SHADER_SOURCE };

const cache = new Map<ArtShader['kind'], SkRuntimeEffect | null>();

/** The compiled shader, or null if this phone's Skia refused it (the scene simply goes without). */
export function shaderOf(kind: ArtShader['kind']): SkRuntimeEffect | null {
  if (cache.has(kind)) return cache.get(kind) ?? null;
  let effect: SkRuntimeEffect | null = null;
  try {
    effect = Skia.RuntimeEffect.Make(SHADER_SOURCE[kind]);
  } catch {
    effect = null;
  }
  cache.set(kind, effect);
  return effect;
}

/** A colour as the shader's float4 (0 to 1). */
export function colourVec(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '');
  const v = (i: number) => Number.parseInt(h.slice(i, i + 2), 16) / 255;
  return [v(0), v(2), v(4), h.length >= 8 ? v(6) : 1];
}

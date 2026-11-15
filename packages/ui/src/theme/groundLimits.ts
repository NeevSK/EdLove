import { contrastRatio, mix } from './color';
import type { WorldTokens } from './types';

/**
 * How far a custom ground may go before words on the floor stop being readable.
 *
 * A photo is laid over the world's ground at some opacity, and a wash tints it. Either can pull
 * the ground toward any colour, so the limits assume the worst pixel (pure black or pure white)
 * and keep the world's own text rules: ink 7:1 and soft ink 4.5:1 on the ground. A custom look
 * may be anything inside these limits; the limits come from the world, never from the photo.
 */

export interface GroundLimits {
  /** The most a photo may show through, 0 to 1. */
  photoOpacity: number;
  /** The most a wash colour may tint the ground, 0 to 1. */
  washAlpha: number;
}

const INK_MIN = 7;
const SOFT_MIN = 4.5;
const STEP = 0.01;

function readableOn(tokens: Pick<WorldTokens, 'ink' | 'inkSoft'>, ground: string): boolean {
  return (
    contrastRatio(tokens.ink, ground) >= INK_MIN &&
    contrastRatio(tokens.inkSoft, ground) >= SOFT_MIN
  );
}

function highestReadable(
  tokens: Pick<WorldTokens, 'ink' | 'inkSoft' | 'ground'>,
  toward: readonly string[],
  ceiling: number,
): number {
  let best = 0;
  for (let a = 0; a <= ceiling + 1e-9; a += STEP) {
    if (!toward.every((colour) => readableOn(tokens, mix(tokens.ground, colour, a)))) break;
    best = a;
  }
  return Math.round(best * 100) / 100;
}

/** The ceilings a photo and a wash may never pass, whatever the world allows. */
export const GROUND_CEILING = { photoOpacity: 0.45, washAlpha: 0.2 } as const;

/** The limits for one world's tokens (light or dark). */
export function groundLimitsOf(
  tokens: Pick<WorldTokens, 'ink' | 'inkSoft' | 'ground'>,
): GroundLimits {
  return {
    photoOpacity: highestReadable(tokens, ['#000000', '#ffffff'], GROUND_CEILING.photoOpacity),
    washAlpha: GROUND_CEILING.washAlpha,
  };
}

/** The most this wash colour may tint this world's ground and keep its words readable. */
export function washLimitOf(
  tokens: Pick<WorldTokens, 'ink' | 'inkSoft' | 'ground'>,
  wash: string,
): number {
  if (!/^#[0-9a-f]{6}$/i.test(wash)) return 0;
  return highestReadable(tokens, [wash], GROUND_CEILING.washAlpha);
}

/** A requested photo opacity, kept inside the world's limit. */
export function clampPhotoOpacity(requested: number, limits: GroundLimits): number {
  return Math.max(0, Math.min(requested, limits.photoOpacity));
}

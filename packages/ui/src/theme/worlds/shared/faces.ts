/**
 * The typefaces each world is written in, and how each one moves.
 *
 * Every name is an embedded font (apps/gurudevi-mobile/app.json, expo-font
 * plugin) whose file name and PostScript name match, built from google/fonts
 * by scripts/fonts/build-world-fonts.py. Variable faces take their weight
 * from the `wght` axis, so a world can sit between the usual steps (Sanctuary
 * reads at 380, not 400). Static faces name one file per weight.
 *
 * Sinhala and Tamil always have a face of their own, chosen to match the
 * world's voice; the Noto families are the fallback every world shares.
 */

import type {
  FaceSpec,
  FontWeight,
  WorldFaces,
  WorldId,
  WorldLanguage,
  WorldMotion,
} from '../../types';

export const STEPS: Record<FontWeight, number> = { '400': 400, '500': 500, '600': 600, '700': 700 };

export function variable(upright: string, extra: Partial<FaceSpec> = {}): FaceSpec {
  return { upright, weights: STEPS, ...extra };
}

export const NOTO_SERIF_SI = variable('NotoSerifSinhala-VF');
export const NOTO_SANS_SI = variable('NotoSansSinhala-VF');
export const NOTO_SERIF_TA = variable('NotoSerifTamil-VF');
export const NOTO_SANS_TA = variable('NotoSansTamil-VF');

export const INTER = variable('Inter-VF', { optical: [14, 32] });
export const CATAMARAN = variable('Catamaran-VF', {
  weights: { '400': 420, '500': 520, '600': 640, '700': 740 },
});

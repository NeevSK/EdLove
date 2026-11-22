/**
 * Canonical Accessibility & APCA Governance for Web Platform
 *
 * Backed by `@intuitui-labs/a11y-gate` (canonical external engine)
 * and aligned with WCAG 2.2 AA + WCAG 3.0 / APCA 0.98G standards.
 */

import {
  type ApcaEvaluation,
  calculateApca,
  evaluateApca,
  evaluateWcag,
  generateFluidClamp,
  getDeltaE,
  getWcagContrastRatio,
  hexToRgb,
  isValidSpatialQuantum,
  rgbToHex,
  type WcagRating,
} from '@intuitui-labs/a11y-gate';

export * from '@intuitui-labs/a11y-gate';

export {
  type ApcaEvaluation,
  calculateApca,
  evaluateApca,
  evaluateWcag,
  generateFluidClamp,
  getDeltaE,
  getWcagContrastRatio,
  hexToRgb,
  isValidSpatialQuantum,
  rgbToHex,
  type WcagRating,
};

/**
 * Alpha-blend a foreground color over a background color
 */
export function blendHexWithAlpha(fgHex: string, alpha: number, bgHex: string): string {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  const a = Math.max(0, Math.min(1, alpha));

  const blendedR = Math.round(fgRgb.r * a + bgRgb.r * (1 - a));
  const blendedG = Math.round(fgRgb.g * a + bgRgb.g * (1 - a));
  const blendedB = Math.round(fgRgb.b * a + bgRgb.b * (1 - a));

  return rgbToHex({ r: blendedR, g: blendedG, b: blendedB });
}

/**
 * Evaluates multi-layer composited contrast (e.g. text with alpha inside a translucent card container)
 */
export function evaluateCompositedContrast(
  textHex: string,
  textAlpha: number,
  containerHex: string,
  containerAlpha: number,
  baseSurfaceHex: string,
): { apca: ApcaEvaluation; effectiveContainer: string; effectiveText: string } {
  // 1. Compute container color blended over the underlying surface
  const effectiveContainer = blendHexWithAlpha(containerHex, containerAlpha, baseSurfaceHex);
  // 2. Compute text color blended over the effective container
  const effectiveText = blendHexWithAlpha(textHex, textAlpha, effectiveContainer);
  // 3. Evaluate perceptual contrast between the text and the container
  const apca = evaluateApca(effectiveText, effectiveContainer);

  return { apca, effectiveContainer, effectiveText };
}

/**
 * Standard Dual-Governance Contrast Checker
 * Returns true if both legal baseline (WCAG 2.2 AA) and perceptual (APCA) criteria pass.
 */
export function meetsDualStandardContrast(
  foregroundHex: string,
  backgroundHex: string,
  targetType: 'body' | 'headline' | 'control' | 'icon' = 'body',
): boolean {
  const wcag = evaluateWcag(foregroundHex, backgroundHex);
  const apca = evaluateApca(foregroundHex, backgroundHex);

  if (targetType === 'body') {
    return wcag.passesAaNormal && apca.passesBodyText;
  }
  if (targetType === 'headline') {
    return wcag.passesAaLarge && apca.passesLargeText;
  }
  return wcag.passesUiComponent && apca.absLc >= 45;
}

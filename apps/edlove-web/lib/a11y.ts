/**
 * Canonical Accessibility & Dual-Standard Governance for Web Platform
 *
 * Backed by `@intuitui-labs/a11y-gate` (canonical external engine).
 *
 * DUAL-STANDARD GOVERNANCE MODEL:
 * 1. Statutory Legal Compliance Baseline: WCAG 2.2 Level AA / AAA
 *    - The non-negotiable legal floor required by law (ADA, Section 508, EN 301 549).
 *    - 4.5:1 normal body text, 3.0:1 large text, 24px min targets. Hard failure if violated.
 * 2. Sovereign Adopted Standard: WCAG 3.0 / W3C APCA 0.98G + Pure-Ratio Psychophysics
 *    - Our primary adopted architectural and design engineering standard.
 *    - Spatial-frequency dependent lightness contrast (|Lc| >= 75 body, |Lc| >= 60 large),
 *      continuous optical tracking curves, and non-linear power-law scaling.
 */

export const DUAL_STANDARD_DOCTRINE = {
  baselineCompliance: 'WCAG 2.2 AA (Statutory Legal Minimum)',
  adoptedStandard: 'WCAG 3.0 / W3C APCA 0.98G (Sovereign Architectural Standard)',
  thresholds: {
    baseline: {
      normalTextContrast: 4.5,
      largeTextContrast: 3.0,
      uiComponentContrast: 3.0,
      minTouchTargetPx: 24,
    },
    adopted: {
      bodyTextLc: 75,
      largeTextLc: 60,
      uiComponentLc: 45,
      minTouchFloorPx: 48,
      compactTouchFloorPx: 44,
    },
  },
} as const;

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

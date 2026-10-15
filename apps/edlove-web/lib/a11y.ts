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

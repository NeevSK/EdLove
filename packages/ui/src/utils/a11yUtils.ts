/**
 * a11yUtils — Modern Accessibility & Ergonomics Infrastructure
 *
 * Integrates:
 * - Canonical @intuitui-labs/a11y-gate (APCA, WCAG 2.2/3, CVD simulations, screen audits)
 * - Mobile Ergonomics: Touch Target Geometry (>= 48dp), Safe Areas, 14px Typography Floor
 */

// Re-export spatial and motion primitives
export {
  type AuditGateStage,
  auditReactNativeScreen,
  generateFluidClamp,
  getInterpolatedMotion,
  isValidSpatialQuantum,
  type MotionIntensity,
  prefersReducedMotion,
  type ReactNativeScreenAuditResult,
  type ReactNativeScreenFinding,
  runReactNativeScreenAuditSuite,
  SPATIAL_INTERVALS,
  SPRING_PRESETS,
  type SpringSpec,
} from '@intuitui-labs/a11y-gate';

// Re-export canonical primitives from @intuitui-labs/a11y-gate
export {
  type ApcaEvaluation,
  type ApcaFontMatrix,
  calculateApca,
  evaluateApca,
  evaluateTargetSize,
  evaluateWcag,
  getApcaFontMatrix,
  getDeltaE,
  getWcagContrastRatio,
  hexToRgb as a11yHexToRgb,
  type RGB,
  rgbToHex,
  simulateCvd,
  simulateCvdHex,
  TOUCH_TARGET_STANDARDS,
  type WcagRating,
} from '@intuitui-labs/a11y-gate';

import {
  calculateApca,
  getWcagContrastRatio,
  hexToRgb,
  rgbToHex,
} from '@intuitui-labs/a11y-gate';

export interface ContrastResult {
  ratio: number;
  apca: number;
  passesAA: boolean;
  passesAAA: boolean;
  apcaRating: string;
}

/**
 * Standardize hex color string.
 */
export function toHex(color: string): string {
  try {
    const rgb = hexToRgb(color);
    return rgbToHex(rgb);
  } catch {
    return color.startsWith('#') ? color : `#${color}`;
  }
}

/**
 * APCA Contrast calculation.
 * Returns a score between -108 and 106.
 */
export function getAPCAContrast(fg: string, bg: string): number {
  try {
    return calculateApca(fg, bg);
  } catch {
    return 0;
  }
}

/**
 * APCA Level Rating based on score.
 * Lc 90: Preferred for body text.
 * Lc 75: Minimum for body text.
 * Lc 60: Minimum for large text / headlines.
 * Lc 45: Minimum for non-text graphics.
 */
export function getAPCARating(score: number): string {
  const abs = Math.abs(score);
  if (abs >= 90) return 'Silver/Gold (Excellent)';
  if (abs >= 75) return 'Bronze (Body Text Minimum)';
  if (abs >= 60) return 'Large Text Minimum';
  if (abs >= 45) return 'Graphic/UI Only';
  return 'Fail';
}

/**
 * Unified accessibility check against WCAG 2.2 and WCAG 3 / APCA.
 */
export function checkAccessibility(fg: string, bg: string): ContrastResult {
  let ratio = 1;
  let apca = 0;

  try {
    ratio = getWcagContrastRatio(fg, bg);
    apca = calculateApca(fg, bg);
  } catch (err) {
    console.warn('[a11yUtils] Error evaluating contrast:', err);
  }

  return {
    ratio,
    apca,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0,
    apcaRating: getAPCARating(apca),
  };
}

/**
 * Finds the best text color for a given background from a set of candidates.
 * Prioritizes APCA score over legacy WCAG ratio.
 */
export function getBestText(
  bg: string,
  candidates: string[] = ['#2A2318', '#FCF9F2', '#FFFFFF', '#000000'],
): string {
  let bestColor = candidates[0] || '#000000';
  let bestApca = -Infinity;

  for (const fg of candidates) {
    const score = Math.abs(getAPCAContrast(fg, bg));
    if (score > bestApca) {
      bestApca = score;
      bestColor = fg;
    }
  }
  return bestColor;
}

/* ==========================================================================
   Mobile Accessibility & Ergonomics Sub-Section
   ========================================================================== */

export const MOBILE_A11Y = {
  /** Strict Android & Sanctuary touch target floor in density-independent pixels */
  MIN_TOUCH_TARGET_DP: 48,
  /** Compact iOS touch target floor in points */
  MIN_TOUCH_TARGET_COMPACT_PT: 44,
  /** Recommended minimum reading floor for mobile labels / descriptions */
  MICRO_TYPOGRAPHY_FLOOR_PX: 14,
  /** APCA threshold for mobile body / descriptive text */
  APCA_BODY_MIN: 75,
  /** APCA threshold for headlines and large interactive buttons */
  APCA_LARGE_MIN: 60,
  /** APCA threshold for icons, indicators, and graphics */
  APCA_GRAPHIC_MIN: 45,
  /** Maximum supported dynamic font scale before forcing simplified layout */
  MAX_COMFORTABLE_FONT_SCALE: 2.0,
} as const;

/**
 * Validates whether an interactive mobile component meets touch target standards.
 */
export function checkMobileTouchTarget(
  widthDp: number,
  heightDp: number,
  standard: 'strict' | 'compact' = 'strict',
): {
  passes: boolean;
  actual: { width: number; height: number };
  required: number;
} {
  const required =
    standard === 'strict'
      ? MOBILE_A11Y.MIN_TOUCH_TARGET_DP
      : MOBILE_A11Y.MIN_TOUCH_TARGET_COMPACT_PT;
  const passes = widthDp >= required && heightDp >= required;

  return {
    passes,
    actual: { width: widthDp, height: heightDp },
    required,
  };
}

/**
 * Standard hitSlop helper to defend touch targets on compact visual icons.
 * Example: for a 24dp icon, expands hit area by 12dp on each side to reach 48dp.
 */
export function getTouchHitSlop(visualWidthDp: number, visualHeightDp: number) {
  const padX = Math.max(0, Math.ceil((MOBILE_A11Y.MIN_TOUCH_TARGET_DP - visualWidthDp) / 2));
  const padY = Math.max(0, Math.ceil((MOBILE_A11Y.MIN_TOUCH_TARGET_DP - visualHeightDp) / 2));

  return {
    top: padY,
    bottom: padY,
    left: padX,
    right: padX,
  };
}

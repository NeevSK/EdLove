/**
 * EdLove Living Design Tokens
 *
 * Mathematically derived from canonical `@intuitui-labs/a11y-gate`.
 *
 * DUAL-STANDARD GOVERNANCE MODEL:
 * 1. Statutory Legal Compliance Baseline: WCAG 2.2 Level AA / AAA
 *    - The non-negotiable statutory baseline required by law (ADA, Section 508, EN 301 549).
 *    - Strict relative luminance minimums: 4.5:1 body, 3.0:1 large, 24px targets.
 * 2. Sovereign Adopted Standard: WCAG 3.0 / W3C APCA 0.98G + Pure-Ratio Psychophysics
 *    - The primary adopted standard across our UI architecture.
 *    - Lightness contrast (|Lc| >= 75 body, |Lc| >= 60 large), continuous optical tracking curves,
 *      and proportional leading.
 */

export const DUAL_STANDARD_DOCTRINE = {
  baselineCompliance: 'WCAG 2.2 AA (Statutory Legal Minimum)',
  adoptedStandard: 'WCAG 3.0 / W3C APCA 0.98G (Sovereign Architectural Standard)',
  statutoryFloor: {
    normalTextRatio: 4.5,
    largeTextRatio: 3.0,
    uiComponentRatio: 3.0,
    minTouchTargetPx: 24,
  },
  adoptedStandardTargets: {
    bodyTextLc: 75,
    largeTextLc: 60,
    uiComponentLc: 45,
    mobileTouchFloorPx: 48,
    compactTouchFloorPx: 44,
  },
} as const;

import {
  auditAdaptiveDensity,
  auditComprehensiveA11yGate,
  auditTypographicMicroAttributes,
  calculateApca,
  computeProportionalContainerSpacing,
  computeProportionalLeading,
  computeProportionalTracking,
  computeProportionalWordSpacing,
  evaluateApca,
  evaluateCognitiveEntropy,
  evaluateReadingMeasure,
  evaluateWcag,
  generateFluidClamp,
  getDeltaE,
  getWcagContrastRatio,
  hexToRgb,
  isValidSpatialQuantum,
  PSYCHOPHYSICAL_RATIOS,
  rgbToHex,
} from '@intuitui-labs/a11y-gate';

export {
  auditAdaptiveDensity,
  auditComprehensiveA11yGate,
  auditTypographicMicroAttributes,
  calculateApca,
  computeProportionalContainerSpacing,
  computeProportionalLeading,
  computeProportionalTracking,
  computeProportionalWordSpacing,
  evaluateApca,
  evaluateCognitiveEntropy,
  evaluateReadingMeasure,
  evaluateWcag,
  generateFluidClamp,
  getDeltaE,
  getWcagContrastRatio,
  hexToRgb,
  isValidSpatialQuantum,
  PSYCHOPHYSICAL_RATIOS,
  rgbToHex,
};

export const edloveTokens = {
  colors: {
    // Primary core palette
    deepIndigo: '#0f172a', // Deepest obsidian slate ink
    secondaryInk: '#1e293b', // Deep twilight slate ink
    mutedInk: '#334155', // Authoritative clear slate ink
    warmPaper: '#FCFBF9', // Serene alabaster vellum background
    warmGold: '#9e6700', // Rich temple amber for accents & borders
    goldenRadiance: '#E5B54F', // Accent for dark cards
    pureWhite: '#FFFFFF',

    // Environment & contextual accents
    forestGreen: '#4A6357',
    dawnRose: '#E8B4B8',
    skyBlue: '#A8C5D6',
    cosmicPurple: '#9B7EBD',
    emberOrange: '#E07A5F',

    // Semantic ink aliases
    primaryInk: '#0f172a',
    midnightInk: '#0f172a',
    agedGold: '#9e6700',
  },

  interaction: {
    // Universal Mobile-First Floor: 48px touch target floor guarantees thumb ergonomics
    minTouchTarget: PSYCHOPHYSICAL_RATIOS.TOUCH_TARGET_FLOOR_PX, // 48px
    minTouchTargetCompact: 44,
    focusRingWidth: PSYCHOPHYSICAL_RATIOS.FOCUS_RING_STROKE_MIN_PX, // 2px
    focusRingOffset: PSYCHOPHYSICAL_RATIOS.FOCUS_RING_OFFSET_MIN_PX, // 2px
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    container: computeProportionalContainerSpacing(16),
  },

  typography: {
    fonts: {
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Lora", Georgia, "Times New Roman", serif',
      display: '"Cinzel", serif',
      mono: '"Fira Code", monospace',
    },

    // Scaled roles mathematically derived through continuous optical curves
    roles: {
      hero: {
        fontSize: 72,
        lineHeight: computeProportionalLeading(72, 'display').idealRatio,
        letterSpacing: computeProportionalTracking(72).idealEm,
      },
      display: {
        fontSize: 48,
        lineHeight: computeProportionalLeading(48, 'display').idealRatio,
        letterSpacing: computeProportionalTracking(48).idealEm,
      },
      h1: {
        fontSize: 36,
        lineHeight: computeProportionalLeading(36, 'headline').idealRatio,
        letterSpacing: computeProportionalTracking(36).idealEm,
      },
      h2: {
        fontSize: 28,
        lineHeight: computeProportionalLeading(28, 'headline').idealRatio,
        letterSpacing: computeProportionalTracking(28).idealEm,
      },
      h3: {
        fontSize: 22,
        lineHeight: computeProportionalLeading(22, 'headline').idealRatio,
        letterSpacing: computeProportionalTracking(22).idealEm,
      },
      bodyLarge: {
        fontSize: 18,
        lineHeight: computeProportionalLeading(18, 'body').idealRatio,
        letterSpacing: computeProportionalTracking(18).idealEm,
      },
      body: {
        fontSize: 16, // iOS Zoom Trap safe floor (>= 16px)
        lineHeight: computeProportionalLeading(16, 'body').idealRatio,
        letterSpacing: computeProportionalTracking(16).idealEm,
        wordSpacingPx: computeProportionalWordSpacing(16).idealPx,
      },
      caption: {
        fontSize: 13,
        lineHeight: computeProportionalLeading(13, 'micro').idealRatio,
        letterSpacing: computeProportionalTracking(13).idealEm,
      },
    },

    fluid: {
      bodyClamp: generateFluidClamp({ minSizePx: 16, maxSizePx: 18, minViewportPx: 375, maxViewportPx: 1200 }),
      headingClamp: generateFluidClamp({ minSizePx: 28, maxSizePx: 48, minViewportPx: 375, maxViewportPx: 1200 }),
    },
  },

  gestalt: {
    proximityMinRatio: PSYCHOPHYSICAL_RATIOS.GESTALT_PROXIMITY_MIN,
    headingClingingMinRatio: PSYCHOPHYSICAL_RATIOS.HEADING_CLINGING_MIN,
    readingMeasure: evaluateReadingMeasure(65),
  },

  governance: DUAL_STANDARD_DOCTRINE,
};

export default edloveTokens;

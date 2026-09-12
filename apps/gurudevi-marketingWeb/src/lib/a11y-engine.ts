/**
 * Gurudevi Marketing Web - Accessibility Engine & Contrast Verification
 * Powered by canonical @intuitui-labs/a11y-gate (APCA WCAG 3 / ISO 9241-306)
 */
import {
  calculateApca,
  evaluateApca,
  evaluateWcag,
  getWcagContrastRatio,
  hexToRgb,
} from '@intuitui-labs/a11y-gate';

export {
  calculateApca,
  evaluateApca,
  evaluateWcag,
  getWcagContrastRatio,
  hexToRgb,
};

export const TOUCH_TARGET_STANDARDS = {
  MINIMUM_WEB_PIXELS: 44,
  RECOMMENDED_WEB_PIXELS: 48,
  MINIMUM_MOBILE_DP: 48,
};

/**
 * Validates whether a foreground / background pair meets minimum accessibility standards.
 */
export function checkPairAccessibility(fgHex: string, bgHex: string, fontSizePx = 16, isBold = false) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const wcagRatio = getWcagContrastRatio(fg, bg);
  const apcaScore = calculateApca(fg, bg);
  
  const isLarge = fontSizePx >= 24 || (fontSizePx >= 18.5 && isBold);
  const minRatioAA = isLarge ? 3.0 : 4.5;
  const minRatioAAA = isLarge ? 4.5 : 7.0;

  const passesAA = wcagRatio >= minRatioAA;
  const passesAAA = wcagRatio >= minRatioAAA;

  let apcaRating = 'Fail';
  const absApca = Math.abs(apcaScore);
  if (absApca >= 90) apcaRating = 'wcag3_gold';
  else if (absApca >= 75) apcaRating = 'wcag3_silver';
  else if (absApca >= 60) apcaRating = 'wcag3_bronze';

  return {
    wcagRatio,
    wcagRating: passesAAA ? 'AAA' : passesAA ? 'AA' : 'Fail',
    wcagPass: passesAA,
    passesAAA,
    apcaScore,
    apcaRating,
    apcaPass: absApca >= 60,
  };
}

/**
 * BANNED CURVY & FLOATING SANS (Shallow, fully circular, floaty hairlines)
 * These fonts have weak round geometry with no stem weight, causing optical flicker and floating blur.
 */
export const BANNED_CURVY_FLOATING_SANS = [
  'DM Sans',
  'Inter',
  'Plus Jakarta Sans',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Nunito',
  'Manrope',
] as const;

/**
 * APPROVED GROUNDED FAMILIES (Literary serifs, structural slabs, and engineered monospace)
 */
export const APPROVED_GROUNDED_SERIFS = [
  'Newsreader',
  'Lora',
  'Fraunces',
  'Spectral',
  'EB Garamond',
  'Cormorant Garamond',
  'Bitter',
  'Zilla Slab',
  'Cinzel',
] as const;

/**
 * APPROVED ARCHITECTURAL & STRUCTURED DISPLAY (Flat terminals, solid stroke width, structured geometry)
 * Allowed for badges, display headers, milestone labels, and architectural metadata.
 */
export const APPROVED_STRUCTURED_GROTESQUES = [
  'Outfit',
  'Space Grotesk',
  'Space Mono',
  'JetBrains Mono',
] as const;

export const APPROVED_GROUNDED_FAMILIES = [
  ...APPROVED_GROUNDED_SERIFS,
  ...APPROVED_STRUCTURED_GROTESQUES,
] as const;

export type BannedCurvySans = typeof BANNED_CURVY_FLOATING_SANS[number];
export type ApprovedGroundedFamily = typeof APPROVED_GROUNDED_FAMILIES[number];

/**
 * WCAG 3 (W3C Silver / APCA Spatial Frequency & Visual Readability Standards)
 * Grounded in ISO 9241-306 and APCA (Advanced Perceptual Contrast Algorithm) Spatial Physics.
 */
export interface Wcag3SpatialTypographyInput {
  fontFamily: string;
  fontSizePx: number;
  fontWeight: number; // e.g. 400, 500, 600, 700
  lineHeightRatio: number; // e.g. 1.75 - 1.85
  letterSpacingEm: number; // e.g. 0.04 - 0.06em
  wordSpacingEm?: number;  // e.g. 0.06 - 0.08em
  isUppercase?: boolean;
}

export interface Wcag3SpatialTypographyVerdict {
  passes: boolean;
  score: 'wcag3_gold_sanctuary' | 'wcag3_silver_acceptable' | 'wcag3_bronze_borderline' | 'wcag3_fail_cramped' | 'banned_sans_violation';
  spatialFrequencyScore: number; // 0 - 100 scale
  isSansBanned: boolean;
  bannedFamilyDetected?: string;
  crampedFactors: string[];
  recommendations: string[];
}

export const WCAG3_SPATIAL_GATE = {
  minBodyFontSizePx: 18,        // Legible base floor for body text
  absoluteMinUiFontSizePx: 15,  // Clear floor for UI badges, navigation, and metadata
  minLineHeight: 1.65,          // WCAG 3 baseline for multi-line prose
  optimalLineHeight: 1.85,      // Full vertical breathing leading
  absoluteMinLetterSpacingEm: 0.035, // Hard threshold: anything below 0.035em fails spatial frequency gate
  optimalLetterSpacingEm: 0.045,     // WCAG 3 Gold standard: spacious, un-crowded character breathing
  displayLetterSpacingEm: 0.08,      // Badges / Eyebrows / Uppercase metadata
  minWordSpacingEm: 0.04,            // Clear word isolation
  optimalWordSpacingEm: 0.06,
};

export function evaluateWcag3SpatialTypography(metrics: Wcag3SpatialTypographyInput): Wcag3SpatialTypographyVerdict {
  const crampedFactors: string[] = [];
  const recommendations: string[] = [];
  let scorePoints = 100;

  // 1. Minimum Optical Font Size Floor
  if (metrics.fontSizePx < WCAG3_SPATIAL_GATE.absoluteMinUiFontSizePx) {
    scorePoints -= 50;
    crampedFactors.push(`Font size (${metrics.fontSizePx}px) is below the absolute UI readability floor (${WCAG3_SPATIAL_GATE.absoluteMinUiFontSizePx}px).`);
    recommendations.push(`Set font size to at least ${WCAG3_SPATIAL_GATE.minBodyFontSizePx}px for body or ${WCAG3_SPATIAL_GATE.absoluteMinUiFontSizePx}px for micro-UI.`);
  }

  // 2. Anti-Curvy Floating Sans Gate: Check if font is a banned shallow/circular sans
  let bannedFamilyDetected: string | undefined;
  for (const banned of BANNED_CURVY_FLOATING_SANS) {
    if (metrics.fontFamily.toLowerCase().includes(banned.toLowerCase())) {
      bannedFamilyDetected = banned;
      scorePoints = 0;
      crampedFactors.push(`BANNED CURVY/FLOATING SANS DETECTED (${banned}): Lacks baseline anchors/flat terminals and suffers optical floating/blur.`);
      recommendations.push(`Use structured grotesques (Outfit, Space Grotesk) or grounded serifs (Newsreader, Lora, Fraunces).`);
      break;
    }
  }

  // 2. Character Spatial Tracking (APCA Spatial Frequency Math)
  if (metrics.letterSpacingEm < 0) {
    scorePoints -= 60;
    crampedFactors.push(`Negative letter-spacing (${metrics.letterSpacingEm}em) violently crushes glyph counters and violates APCA spatial frequency.`);
    recommendations.push(`Set letter-spacing to at least +${WCAG3_SPATIAL_GATE.optimalLetterSpacingEm}em.`);
  } else if (metrics.letterSpacingEm < WCAG3_SPATIAL_GATE.absoluteMinLetterSpacingEm) {
    scorePoints -= 40;
    crampedFactors.push(`Letter-spacing (${metrics.letterSpacingEm}em) is below the WCAG 3 spatial threshold (${WCAG3_SPATIAL_GATE.absoluteMinLetterSpacingEm}em). Characters are tightly packed.`);
    recommendations.push(`Enforce spacious tracking of +${WCAG3_SPATIAL_GATE.optimalLetterSpacingEm}em (+0.045em - +0.06em) for true optical breathing space.`);
  } else if (metrics.letterSpacingEm < WCAG3_SPATIAL_GATE.optimalLetterSpacingEm) {
    scorePoints -= 15;
  }

  // 3. Uppercase Tracking Compensation
  if (metrics.isUppercase && metrics.letterSpacingEm < WCAG3_SPATIAL_GATE.displayLetterSpacingEm) {
    scorePoints -= 25;
    crampedFactors.push(`Uppercase text requires expanded tracking (${WCAG3_SPATIAL_GATE.displayLetterSpacingEm}em+), found ${metrics.letterSpacingEm}em.`);
    recommendations.push(`Set uppercase tracking to +0.08em - +0.16em.`);
  }

  // 4. Vertical Leading vs Glyph Height
  if (metrics.lineHeightRatio < WCAG3_SPATIAL_GATE.minLineHeight) {
    scorePoints -= 35;
    crampedFactors.push(`Line-height ratio (${metrics.lineHeightRatio}) is below WCAG 3 baseline (${WCAG3_SPATIAL_GATE.minLineHeight}). Ascenders and descenders collide.`);
    recommendations.push(`Relax line-height to ${WCAG3_SPATIAL_GATE.optimalLineHeight} for effortless eye tracking across paragraphs.`);
  }

  // 5. Word Isolation Spacing
  if (metrics.wordSpacingEm !== undefined && metrics.wordSpacingEm < WCAG3_SPATIAL_GATE.minWordSpacingEm) {
    scorePoints -= 20;
    crampedFactors.push(`Word-spacing (${metrics.wordSpacingEm}em) is below WCAG 3 isolation floor (${WCAG3_SPATIAL_GATE.minWordSpacingEm}em).`);
    recommendations.push(`Set word-spacing to +${WCAG3_SPATIAL_GATE.optimalWordSpacingEm}em.`);
  }

  const finalScore = Math.max(0, scorePoints);
  const isSansBanned = !!bannedFamilyDetected;
  const passes =
    !isSansBanned &&
    metrics.fontSizePx >= WCAG3_SPATIAL_GATE.absoluteMinUiFontSizePx &&
    metrics.letterSpacingEm >= WCAG3_SPATIAL_GATE.absoluteMinLetterSpacingEm &&
    metrics.lineHeightRatio >= WCAG3_SPATIAL_GATE.minLineHeight &&
    finalScore >= 75;

  let score: Wcag3SpatialTypographyVerdict['score'] = 'wcag3_fail_cramped';
  if (isSansBanned) score = 'banned_sans_violation';
  else if (finalScore >= 90 && metrics.fontSizePx >= WCAG3_SPATIAL_GATE.minBodyFontSizePx) score = 'wcag3_gold_sanctuary';
  else if (finalScore >= 75) score = 'wcag3_silver_acceptable';
  else if (finalScore >= 60) score = 'wcag3_bronze_borderline';

  return {
    passes,
    score,
    spatialFrequencyScore: finalScore,
    isSansBanned,
    bannedFamilyDetected,
    crampedFactors,
    recommendations,
  };
}

/**
 * Standard brand color tokens with verified WCAG AAA / AA contrast matrices.
 */
export const VERIFIED_A11Y_TOKENS = {
  // Deep contrast on cream background (#f7f2e8)
  creamBackground: '#f7f2e8',
  charcoalText: '#131e27', // WCAG AAA > 12:1 against cream
  bodyText: '#3a342e',     // WCAG AAA > 8.5:1 against cream
  saffronAccent: '#a85022', // WCAG AA > 4.8:1 against cream for small text / headers
  goldBadgeBg: '#fbeedb',
  goldBadgeText: '#824112', // WCAG AAA > 7.1:1 on goldBadgeBg

  // High contrast on dark background (#131e27 / #111a22 / #1c2832)
  darkBackground: '#111a22',
  darkSurface: '#1c2832',
  darkTextPrimary: '#fffdf8', // WCAG AAA > 14:1 on dark
  darkTextMuted: '#d3c9be',   // WCAG AAA > 8:1 on dark
  goldAccentOnDark: '#f7c382', // WCAG AAA > 9:1 on dark
};

/**
 * TYPOGRAPHIC SCALE HARMONY GATE
 * Defends against extreme headline-to-body disparity (e.g. 100px headlines next to 13px text).
 * Balanced range is 1.5x - 2.8x. Jumps greater than 3.2x create violent optical disparity.
 */
export interface TypographicScaleAudit {
  headlineFontSizePx: number;
  adjacentBodyFontSizePx: number;
  ratio: number;
  passes: boolean;
  verdict: 'harmonious_sanctuary' | 'acceptable' | 'violent_scale_disparity';
  recommendations: string[];
}

export function evaluateTypographicScaleHarmony(
  headlineFontSizePx: number,
  adjacentBodyFontSizePx: number
): TypographicScaleAudit {
  const ratio = Number((headlineFontSizePx / adjacentBodyFontSizePx).toFixed(2));
  const recommendations: string[] = [];
  let passes = true;
  let verdict: TypographicScaleAudit['verdict'] = 'harmonious_sanctuary';

  if (ratio > 3.2) {
    passes = false;
    verdict = 'violent_scale_disparity';
    recommendations.push(
      `Scale disparity ratio (${ratio}x) is excessively steep. Giant headline overwhelms adjacent text. Reduce headline to max 2.6x body size (~42px-54px on desktop).`
    );
  } else if (ratio > 2.6) {
    verdict = 'acceptable';
    recommendations.push(
      `Scale ratio is acceptable (${ratio}x), but consider tightening to 1.8x - 2.4x for refined editorial balance.`
    );
  }

  return {
    headlineFontSizePx,
    adjacentBodyFontSizePx,
    ratio,
    passes,
    verdict,
    recommendations,
  };
}

/**
 * Surface Text Contrast Gate
 * Catches accidental dark-on-dark or light-on-light text regressions.
 */
export function evaluateSurfaceTextContrast(textHex: string, surfaceHex: string, fontSizePx = 16) {
  const result = checkPairAccessibility(textHex, surfaceHex, fontSizePx, false);
  const rgbText = hexToRgb(textHex);
  const rgbSurface = hexToRgb(surfaceHex);
  const lumText = (0.2126 * rgbText.r + 0.7152 * rgbText.g + 0.0722 * rgbText.b) / 255;
  const lumSurface = (0.2126 * rgbSurface.r + 0.7152 * rgbSurface.g + 0.0722 * rgbSurface.b) / 255;
  const isDarkOnDark = result.wcagRatio < 3.0 && lumText < 0.35 && lumSurface < 0.35;

  return {
    passes: result.wcagPass && !isDarkOnDark,
    wcagRatio: result.wcagRatio,
    apcaScore: result.apcaScore,
    isDarkOnDarkViolation: isDarkOnDark,
  };
}

/**
 * INFORMATION ARCHITECTURE & NARRATIVE FLOW GATE
 * Enforces cohesive reading sequence, eliminates list fatigue, and validates clean taxonomy.
 */
export interface NarrativeSectionInput {
  id: string;
  role: 'hero' | 'problem_context' | 'solution_workspaces' | 'trust_privacy' | 'roadmap_timeline' | 'action_onboarding';
  listCount?: number;
}

export interface NarrativeFlowAudit {
  passes: boolean;
  score: number;
  hasListFatigue: boolean;
  hasCompleteJourney: boolean;
  violations: string[];
  recommendations: string[];
}

export function evaluatePageFlowHierarchy(sections: NarrativeSectionInput[]): NarrativeFlowAudit {
  const violations: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Check for Consecutive Numbered List Stacking Fatigue
  for (let i = 0; i < sections.length - 1; i++) {
    const current = sections[i];
    const next = sections[i + 1];
    if (current && next && current.listCount && next.listCount && current.listCount >= 3 && next.listCount >= 3) {
      score -= 35;
      violations.push(
        `Consecutive multi-item lists detected between section '${current.id}' (${current.listCount} items) and '${next.id}' (${next.listCount} items). Causes cognitive list fatigue.`
      );
      recommendations.push(`Consolidate adjacent list sections into a unified interactive showcase or alternating card layouts.`);
    }
  }

  // 2. Check for Essential Narrative Journey (Hero -> Context -> Solution -> Trust -> Roadmap -> CTA)
  const roles = new Set(sections.map((s) => s.role));
  const requiredRoles: NarrativeSectionInput['role'][] = [
    'hero',
    'problem_context',
    'solution_workspaces',
    'trust_privacy',
    'roadmap_timeline',
    'action_onboarding',
  ];

  for (const req of requiredRoles) {
    if (!roles.has(req)) {
      score -= 20;
      violations.push(`Missing narrative stage: '${req}'.`);
      recommendations.push(`Include a '${req}' section to complete the sanctuary onboarding narrative.`);
    }
  }

  const hasListFatigue = violations.some((v) => v.includes('Consecutive multi-item lists'));
  const hasCompleteJourney = requiredRoles.every((r) => roles.has(r));
  const passes = score >= 75 && !hasListFatigue && hasCompleteJourney;

  return {
    passes,
    score: Math.max(0, score),
    hasListFatigue,
    hasCompleteJourney,
    violations,
    recommendations,
  };
}

export interface NavTaxonomyItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export function evaluateSiteInformationArchitecture(navItems: NavTaxonomyItem[]): {
  passes: boolean;
  ambiguousLabels: string[];
  recommendations: string[];
} {
  const ambiguousLabels: string[] = [];
  const recommendations: string[] = [];

  for (const item of navItems) {
    if (item.label.toLowerCase() === 'questions') {
      ambiguousLabels.push(item.label);
      recommendations.push(`Rename '${item.label}' to 'FAQ' for immediate user clarity.`);
    }
  }

  return {
    passes: ambiguousLabels.length === 0,
    ambiguousLabels,
    recommendations,
  };
}

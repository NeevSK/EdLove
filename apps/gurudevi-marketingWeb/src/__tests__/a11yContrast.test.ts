import { describe, it, expect } from 'vitest';
import {
  checkPairAccessibility,
  VERIFIED_A11Y_TOKENS,
  TOUCH_TARGET_STANDARDS,
  evaluateWcag3SpatialTypography,
  evaluateTypographicScaleHarmony,
  evaluateSurfaceTextContrast,
  evaluatePageFlowHierarchy,
  evaluateSiteInformationArchitecture,
  BANNED_CURVY_FLOATING_SANS,
  APPROVED_GROUNDED_FAMILIES,
} from '../lib/a11y-engine';

describe('Gurudevi Marketing Web - Accessibility & Contrast Suite', () => {
  it('validates primary charcoal truth text against cream silence background passes WCAG AAA', () => {
    const result = checkPairAccessibility(
      VERIFIED_A11Y_TOKENS.charcoalText,
      VERIFIED_A11Y_TOKENS.creamBackground,
      16,
      false
    );
    expect(result.wcagPass).toBe(true);
    expect(result.wcagRatio).toBeGreaterThanOrEqual(7.0); // WCAG AAA requirement
  });

  it('validates mud brown body copy against cream silence background meets WCAG AAA', () => {
    const result = checkPairAccessibility(
      VERIFIED_A11Y_TOKENS.bodyText,
      VERIFIED_A11Y_TOKENS.creamBackground,
      16,
      false
    );
    expect(result.wcagPass).toBe(true);
    expect(result.wcagRatio).toBeGreaterThanOrEqual(7.0);
  });

  it('validates sanctuary saffron accents meet WCAG AA standards for UI elements and bold text', () => {
    const result = checkPairAccessibility(
      VERIFIED_A11Y_TOKENS.saffronAccent,
      VERIFIED_A11Y_TOKENS.creamBackground,
      16,
      true
    );
    expect(result.wcagPass).toBe(true);
    expect(result.wcagRatio).toBeGreaterThanOrEqual(4.5);
  });

  it('validates sacred white text on dark background surfaces passes WCAG AAA', () => {
    const result = checkPairAccessibility(
      VERIFIED_A11Y_TOKENS.darkTextPrimary,
      VERIFIED_A11Y_TOKENS.darkBackground,
      16,
      false
    );
    expect(result.wcagPass).toBe(true);
    expect(result.wcagRatio).toBeGreaterThanOrEqual(7.0);
  });

  it('enforces minimum touch target standard of at least 44px', () => {
    expect(TOUCH_TARGET_STANDARDS.MINIMUM_WEB_PIXELS).toBeGreaterThanOrEqual(44);
  });

  it('strictly bans and rejects generic curvy floating sans (DM Sans, Inter, Plus Jakarta Sans, Poppins)', () => {
    for (const banned of ['DM Sans', 'Inter', 'Plus Jakarta Sans', 'Poppins', 'Roboto']) {
      const result = evaluateWcag3SpatialTypography({
        fontFamily: `"${banned}", sans-serif`,
        fontSizePx: 16,
        fontWeight: 400,
        lineHeightRatio: 1.85,
        letterSpacingEm: 0.05,
        wordSpacingEm: 0.06,
      });
      expect(result.passes).toBe(false);
      expect(result.isSansBanned).toBe(true);
      expect(result.score).toBe('banned_sans_violation');
      expect(result.bannedFamilyDetected).toBe(banned);
    }
  });

  it('strictly rejects tight sub-0.035em letter-spacing under WCAG 3 spatial standards', () => {
    const tight = evaluateWcag3SpatialTypography({
      fontFamily: 'Newsreader, Georgia, serif',
      fontSizePx: 16,
      fontWeight: 500,
      lineHeightRatio: 1.5,
      letterSpacingEm: 0.02, // Below 0.035em floor
      wordSpacingEm: 0.02,
    });
    expect(tight.passes).toBe(false);
    expect(tight.score).toBe('wcag3_fail_cramped');
    expect(tight.crampedFactors.length).toBeGreaterThan(0);
  });

  it('strictly rejects sub-floor font sizes (< 15px) and cramped line-heights (< 1.65)', () => {
    const microText = evaluateWcag3SpatialTypography({
      fontFamily: 'Newsreader, Georgia, serif',
      fontSizePx: 12, // Sub-floor micro text (< 15px)
      fontWeight: 400,
      lineHeightRatio: 1.85,
      letterSpacingEm: 0.045,
      wordSpacingEm: 0.05,
    });
    expect(microText.passes).toBe(false);
    expect(microText.crampedFactors.some(f => f.includes('below the absolute UI readability floor'))).toBe(true);

    const crampedLeading = evaluateWcag3SpatialTypography({
      fontFamily: 'Newsreader, Georgia, serif',
      fontSizePx: 18,
      fontWeight: 400,
      lineHeightRatio: 1.4, // Cramped vertical leading (< 1.65)
      letterSpacingEm: 0.045,
      wordSpacingEm: 0.05,
    });
    expect(crampedLeading.passes).toBe(false);
  });

  it('awards WCAG 3 Gold Sanctuary status to structured display grotesques (Outfit, Space Grotesk) and grounded serifs', () => {
    for (const approved of ['Outfit', 'Space Grotesk', 'Newsreader', 'Lora', 'Fraunces', 'Bitter']) {
      const sanctuaryResult = evaluateWcag3SpatialTypography({
        fontFamily: `"${approved}", Georgia, serif`,
        fontSizePx: 18,
        fontWeight: 500,
        lineHeightRatio: 1.85,
        letterSpacingEm: 0.045, // Gold standard
        wordSpacingEm: 0.06,
      });
      expect(sanctuaryResult.passes).toBe(true);
      expect(sanctuaryResult.isSansBanned).toBe(false);
      expect(sanctuaryResult.score).toBe('wcag3_gold_sanctuary');
      expect(sanctuaryResult.spatialFrequencyScore).toBeGreaterThanOrEqual(90);
    }
  });

  it('rejects violent typographic scale disparity (> 3.2x) between headlines and body text', () => {
    // Overkill 100px headline next to 14px text (~7.1x jump) -> FAIL
    const violentDisparity = evaluateTypographicScaleHarmony(100, 14);
    expect(violentDisparity.passes).toBe(false);
    expect(violentDisparity.verdict).toBe('violent_scale_disparity');
    expect(violentDisparity.recommendations.length).toBeGreaterThan(0);

    // Balanced sanctuary scale (48px headline next to 19px body, ~2.5x jump) -> PASS
    const balancedScale = evaluateTypographicScaleHarmony(48, 19);
    expect(balancedScale.passes).toBe(true);
    expect(balancedScale.verdict).toBe('harmonious_sanctuary');
  });

  it('detects and rejects dark-on-dark text contrast failures on dark section surfaces', () => {
    // Charcoal text on dark navy surface -> FAIL (invisible text bug)
    const charcoalOnDark = evaluateSurfaceTextContrast('#131e27', '#111a22');
    expect(charcoalOnDark.passes).toBe(false);
    expect(charcoalOnDark.isDarkOnDarkViolation).toBe(true);

    // Sacred white on dark navy surface -> PASS (WCAG AAA)
    const whiteOnDark = evaluateSurfaceTextContrast('#fffdf8', '#111a22');
    expect(whiteOnDark.passes).toBe(true);
    expect(whiteOnDark.isDarkOnDarkViolation).toBe(false);
    expect(whiteOnDark.wcagRatio).toBeGreaterThanOrEqual(7.0);
  });

  it('detects and rejects cognitive list fatigue from consecutive stacked multi-item lists', () => {
    // Problematic flow: 4-item roles list followed immediately by 4-item workspaces list
    const fatiguedFlow = evaluatePageFlowHierarchy([
      { id: 'hero', role: 'hero' },
      { id: 'intro', role: 'problem_context' },
      { id: 'roles_list', role: 'problem_context', listCount: 4 },
      { id: 'workspaces_list', role: 'solution_workspaces', listCount: 4 }, // Consecutive lists!
      { id: 'trust', role: 'trust_privacy' },
      { id: 'roadmap', role: 'roadmap_timeline' },
      { id: 'cta', role: 'action_onboarding' },
    ]);
    expect(fatiguedFlow.hasListFatigue).toBe(true);
    expect(fatiguedFlow.passes).toBe(false);
    expect(fatiguedFlow.violations.some(v => v.includes('Consecutive multi-item lists detected'))).toBe(true);

    // Harmonized sanctuary flow: unified showcase with no double list stacking
    const harmonizedFlow = evaluatePageFlowHierarchy([
      { id: 'hero', role: 'hero' },
      { id: 'intro', role: 'problem_context' },
      { id: 'spaces_showcase', role: 'solution_workspaces' },
      { id: 'trust', role: 'trust_privacy' },
      { id: 'roadmap', role: 'roadmap_timeline' },
      { id: 'cta', role: 'action_onboarding' },
    ]);
    expect(harmonizedFlow.hasListFatigue).toBe(false);
    expect(harmonizedFlow.hasCompleteJourney).toBe(true);
    expect(harmonizedFlow.passes).toBe(true);
  });

  it('validates navigation taxonomy and flags ambiguous labels like "Questions"', () => {
    const ambiguousNav = evaluateSiteInformationArchitecture([
      { label: 'The ecology', href: '/about' },
      { label: 'Roadmap', href: '/#roadmap' },
      { label: 'Questions', href: '/faq' }, // Ambiguous label!
    ]);
    expect(ambiguousNav.passes).toBe(false);
    expect(ambiguousNav.ambiguousLabels).toContain('Questions');

    const cleanNav = evaluateSiteInformationArchitecture([
      { label: 'The ecology', href: '/about' },
      { label: 'Roadmap', href: '/#roadmap' },
      { label: 'FAQ', href: '/faq' }, // Clean taxonomy!
      { label: 'Support', href: '/support' },
    ]);
    expect(cleanNav.passes).toBe(true);
  });
});

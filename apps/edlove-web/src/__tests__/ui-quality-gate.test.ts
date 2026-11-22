import { describe, expect, it } from 'vitest';
import {
  calculateApca,
  evaluateApca,
  evaluateCompositedContrast,
  evaluateWcag,
  getWcagContrastRatio,
  meetsDualStandardContrast,
} from '../../lib/a11y';

/**
 * WCAG 3.0 / APCA (Accessible Perceptual Contrast Algorithm) & Dual-Standard Quality Gate
 *
 * Enforces strict perceptual contrast across all semantic surfaces and inks:
 * - APCA Body Text (|Lc| >= 75, preferred >= 90)
 * - APCA Large Text / Headings (|Lc| >= 60)
 * - APCA UI Components / Metadata (|Lc| >= 45)
 * - Strict Veto on Low-Contrast Yellows for Text
 */

describe('Rigorous WCAG 3.0 / APCA & Dual-Standard Contrast Quality Gate', () => {
  const surfaces = {
    warmPaper: '#FAF7F2',
    alabasterVellum: '#FCFBF9', // New serene, non-yellow high-luminance canvas
    pureWhite: '#FFFFFF',
    creamSilence: '#F7F2E8',
    darkInk: '#0f172a',
  };

  const inkTokens = {
    primaryInk: '#0f172a', // Deepest obsidian slate ink
    secondaryInk: '#1e293b', // Deep twilight slate ink
    mutedInk: '#334155', // Authoritative slate ink for metadata
    forbiddenYellow: '#E7CB16', // Low-contrast yellow (prohibited for text)
    goldenRadiance: '#E5B54F', // Accent for dark surfaces
    sacredWhite: '#FCFBF9', // Inverse text on dark cards
  };

  it('enforces WCAG 3 / APCA body text criteria (|Lc| >= 75) on light surfaces', () => {
    // 1. Primary ink on warm paper
    const apcaPrimary = evaluateApca(inkTokens.primaryInk, surfaces.warmPaper);
    expect(apcaPrimary.absLc).toBeGreaterThanOrEqual(90);
    expect(apcaPrimary.passesBodyText).toBe(true);

    // 2. Primary ink on pure white cards
    const apcaCard = evaluateApca(inkTokens.primaryInk, surfaces.pureWhite);
    expect(apcaCard.absLc).toBeGreaterThanOrEqual(90);
    expect(apcaCard.passesBodyText).toBe(true);
  });

  it('enforces WCAG 3 / APCA large text and heading criteria (|Lc| >= 60)', () => {
    // Secondary ink on warm paper (headings, badges)
    const apcaSecondary = evaluateApca(inkTokens.secondaryInk, surfaces.warmPaper);
    expect(apcaSecondary.absLc).toBeGreaterThanOrEqual(75);
    expect(apcaSecondary.passesLargeText).toBe(true);

    // Muted ink on warm paper (captions, colophons)
    const apcaMuted = evaluateApca(inkTokens.mutedInk, surfaces.warmPaper);
    expect(apcaMuted.absLc).toBeGreaterThanOrEqual(60);
    expect(apcaMuted.passesLargeText).toBe(true);
  });

  it('enforces WCAG 3 / APCA inverse text criteria on dark surfaces (footer, pills, buttons)', () => {
    // Inverse white/cream text on dark primary ink
    const apcaInverse = evaluateApca(inkTokens.sacredWhite, surfaces.darkInk);
    expect(apcaInverse.absLc).toBeGreaterThanOrEqual(90);
    expect(apcaInverse.passesBodyText).toBe(true);

    // Gold badge on dark primary ink
    const apcaGoldOnDark = evaluateApca(inkTokens.goldenRadiance, surfaces.darkInk);
    expect(apcaGoldOnDark.absLc).toBeGreaterThanOrEqual(60);
    expect(apcaGoldOnDark.passesLargeText).toBe(true);
  });

  it('strictly vetoes low-contrast yellow/gold for body text on paper surfaces', () => {
    // Proves that forbidden yellow (#E7CB16) fails WCAG 3 body text requirements
    const apcaForbidden = evaluateApca(inkTokens.forbiddenYellow, surfaces.warmPaper);
    expect(apcaForbidden.absLc).toBeLessThan(60);
    expect(apcaForbidden.passesBodyText).toBe(false);
  });

  it('evaluates composited card container contrast and verifies solid text over semi-translucent cards', () => {
    // Test translucent card (bg-white/90) with solid primary ink text (#131e27 at 100% alpha)
    const solidOnCard = evaluateCompositedContrast(
      inkTokens.primaryInk,
      1.0, // 100% solid opacity
      surfaces.pureWhite,
      0.92, // 92% card opacity over warm paper
      surfaces.warmPaper,
    );
    expect(solidOnCard.apca.absLc).toBeGreaterThanOrEqual(90);
    expect(solidOnCard.apca.passesBodyText).toBe(true);

    // Verify that fading text opacity down to 0.40 on a translucent card degrades contrast below acceptable body reading standards
    const fadedOnCard = evaluateCompositedContrast(
      inkTokens.primaryInk,
      0.4, // 40% faint text
      surfaces.pureWhite,
      0.7,
      surfaces.warmPaper,
    );
    expect(fadedOnCard.apca.absLc).toBeLessThan(70);
    expect(fadedOnCard.apca.passesBodyText).toBe(false);
  });

  it('satisfies Dual-Standard Governance (WCAG 2.2 AA + WCAG 3.0 APCA)', () => {
    // Body text satisfies both standards
    expect(meetsDualStandardContrast(inkTokens.primaryInk, surfaces.warmPaper, 'body')).toBe(true);

    // Headline text satisfies both standards
    expect(meetsDualStandardContrast(inkTokens.secondaryInk, surfaces.warmPaper, 'headline')).toBe(
      true,
    );

    // UI control satisfies both standards
    expect(meetsDualStandardContrast(inkTokens.primaryInk, surfaces.warmPaper, 'control')).toBe(
      true,
    );

    // Ratio verification
    const ratio = getWcagContrastRatio(inkTokens.primaryInk, surfaces.warmPaper);
    expect(ratio).toBeGreaterThanOrEqual(10.0);
  });
});

describe('@intuitui-labs/a11y-gate Comprehensive Gate & Adversarial SRE Suite', () => {
  it('executes full auditComprehensiveA11yGate on EdLove production token architecture', async () => {
    const { auditComprehensiveA11yGate } = await import('../../lib/a11y');

    const result = auditComprehensiveA11yGate({
      name: 'EdLove Sanctuary Production Surface',
      theme: {
        name: 'edlove-alabaster-vellum',
        background: '#FCFBF9',
        surface: '#FFFFFF',
        textPrimary: '#0f172a',
        textSecondary: '#1e293b',
        textMuted: '#334155',
        primaryCtaBg: '#0f172a',
        primaryCtaFg: '#FCFBF9',
      },
      colorPairs: [
        {
          fg: '#0f172a',
          bg: '#FCFBF9',
          role: 'body',
        },
        {
          fg: '#1e293b',
          bg: '#FCFBF9',
          role: 'headline',
        },
        {
          fg: '#FCFBF9',
          bg: '#0f172a',
          role: 'body',
        },
      ],
      ratioSpec: {
        viewportWidthPx: 1280,
        viewportHeightPx: 800,
        canvasMarginHorizontalPx: 64,
        contentWidthPx: 1152,
        interContainerGutterPx: 32,
        intraContainerPaddingPx: 32,
        childGapPx: 16,
        labelToInputGapPx: 8,
        inputToNextGroupGapPx: 24,
        headingMarginTopPx: 32,
        headingMarginBottomPx: 12,
        fontSizePx: 18,
        fontWeight: 400,
        lineHeightPx: 28,
        letterSpacingEm: 0.005,
        touchHitDimensionPx: 48,
        visualGlyphDimensionPx: 24,
        role: 'body',
      },
      hotspots: {
        fieldModalities: ['text-typing', 'tap-pill', 'segmented-picker', 'slider'],
        minAdqThreshold: 0.35,
        maxConsecutiveMonotonyThreshold: 3,
      },
    });

    expect(result.passesGate).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.grade).toBe('AAA');
    expect(result.wcag3Tier).toBe('Gold');
    expect(result.subsystems.themePassed).toBe(true);
    expect(result.subsystems.baselinePassed).toBe(true);
    expect(result.subsystems.wcag3Passed).toBe(true);
    expect(result.subsystems.ratioPassed).toBe(true);
    expect(result.subsystems.diversityPassed).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('proves adversarial SRE resilience against malformed colors without throwing crashes', async () => {
    const { auditComprehensiveA11yGate } = await import('../../lib/a11y');

    let hostileResult: any;
    expect(() => {
      hostileResult = auditComprehensiveA11yGate({
        name: 'Hostile Corrupted Spec',
        colorPairs: [
          {
            fg: 'corrupted-hex',
            bg: '#',
            role: 'body',
          },
        ],
      });
    }).not.toThrow();

    expect(hostileResult.passesGate).toBe(false);
    expect(hostileResult.grade).toBe('Fail');
    expect(hostileResult.errors.length).toBeGreaterThan(0);
  });

  it('rejects touch targets under 44px with prescriptive remediation', async () => {
    const { auditComprehensiveA11yGate } = await import('../../lib/a11y');

    const subtargetResult = auditComprehensiveA11yGate({
      name: 'Sub-Target Spec',
      ratioSpec: {
        viewportWidthPx: 390,
        viewportHeightPx: 844,
        canvasMarginHorizontalPx: 16,
        contentWidthPx: 358,
        interContainerGutterPx: 16,
        intraContainerPaddingPx: 16,
        childGapPx: 12,
        labelToInputGapPx: 6,
        inputToNextGroupGapPx: 16,
        headingMarginTopPx: 24,
        headingMarginBottomPx: 8,
        fontSizePx: 16,
        fontWeight: 400,
        lineHeightPx: 24,
        letterSpacingEm: 0,
        touchHitDimensionPx: 32, // Violates 44px / 48px standard
        visualGlyphDimensionPx: 16,
        role: 'body',
      },
    });

    expect(subtargetResult.passesGate).toBe(false);
    expect(subtargetResult.subsystems.ratioPassed).toBe(false);
    expect(
      subtargetResult.errors.some((e: string) =>
        e.includes('Touch hit target (32px) is below the physical 44px thumb contact floor'),
      ),
    ).toBe(true);
  });
});

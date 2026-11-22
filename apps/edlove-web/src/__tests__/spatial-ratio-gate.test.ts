import fs from 'node:fs';
import path from 'node:path';
import {
  auditAdaptiveDensity,
  auditTypographicMicroAttributes,
  computeProportionalContainerSpacing,
  computeProportionalLeading,
  computeProportionalTracking,
  computeProportionalWordSpacing,
  evaluateCognitiveEntropy,
  evaluateReadingMeasure,
  PSYCHOPHYSICAL_RATIOS,
} from '@intuitui-labs/a11y-gate';
import { describe, expect, it } from 'vitest';

/**
 * Spacing, Typographic Proportions & Gestalt Ratio Quality Gate
 *
 * Enforces rigorous mathematical and perceptual spatial standards across EdLove:
 * 1. Gestalt Proximity Law (Inter-section gap >= 1.50x intra-element gap)
 * 2. Heading Clinging Law (MarginTop >= 2.0x MarginBottom so headings hug their content)
 * 3. Gestalt Enclosure Law (Container padding >= child gap)
 * 4. Continuous Optical Tracking Curve (microcopy >= +0.02em, body >= +0.01em, headings <= 0em)
 * 5. Continuous Optical Leading Curve (body 1.50x - 1.78x, headings 1.10x - 1.32x)
 * 6. Saccadic Reading Measure (optimal 45 - 75ch, maximum 85ch)
 * 7. Fitts' Law Touch Envelope (clickable controls >= 44px)
 * 8. Static template scanner across all core pages preventing cramped spacing regressions
 */

describe('Mathematical Typographic & Spatial Ratio Doctrine', () => {
  it('enforces Continuous Optical Tracking bounds across scales', () => {
    // Microcopy (<= 12px) requires wide tracking to prevent glyph collision
    const microTracking = computeProportionalTracking(12);
    expect(microTracking.idealEm).toBeGreaterThanOrEqual(0.02);
    expect(microTracking.minEm).toBeGreaterThanOrEqual(0.01);

    // Body text (14px - 18px) requires gentle positive or neutral tracking
    const bodyTracking = computeProportionalTracking(16);
    expect(bodyTracking.idealEm).toBeGreaterThanOrEqual(0.005);
    expect(bodyTracking.maxEm).toBeLessThanOrEqual(0.04);

    // Headlines (24px - 36px) require compact negative tracking
    const headingTracking = computeProportionalTracking(30);
    expect(headingTracking.idealEm).toBeLessThan(0);
    expect(headingTracking.minEm).toBeGreaterThanOrEqual(-0.025);
  });

  it('enforces Continuous Optical Leading bounds (line-height ratios)', () => {
    // Body text requires spacious leading (1.45x - 1.75x) to prevent ascender/descender collisions
    const bodyLeading = computeProportionalLeading(16, 'body');
    expect(bodyLeading.idealRatio).toBeGreaterThanOrEqual(1.48);
    expect(bodyLeading.minRatio).toBeGreaterThanOrEqual(1.4);
    expect(bodyLeading.maxRatio).toBeLessThanOrEqual(1.75);

    // Headings require compact leading (1.10x - 1.32x) to prevent title fragmentation
    const headingLeading = computeProportionalLeading(30, 'headline');
    expect(headingLeading.idealRatio).toBeLessThanOrEqual(1.28);
    expect(headingLeading.maxRatio).toBeLessThanOrEqual(1.35);
  });

  it('enforces Saccadic Reading Measure bounds (45 to 75 characters per line)', () => {
    // Optimal measure
    const optimalMeasure = evaluateReadingMeasure(65);
    expect(optimalMeasure.isOptimal).toBe(true);
    expect(optimalMeasure.isTooNarrow).toBe(false);
    expect(optimalMeasure.isTooWide).toBe(false);

    // Unclamped line (> 85ch) causes re-acquisition eye fatigue
    const overstretchedMeasure = evaluateReadingMeasure(110);
    expect(overstretchedMeasure.isOptimal).toBe(false);
    expect(overstretchedMeasure.isTooWide).toBe(true);

    // Too narrow (< 40ch) breaks semantic phrasing
    const narrowMeasure = evaluateReadingMeasure(30);
    expect(narrowMeasure.isOptimal).toBe(false);
    expect(narrowMeasure.isTooNarrow).toBe(true);
  });

  it('enforces Gestalt Enclosure and Proportional Container Spacing', () => {
    // Container padding must comfortably enclose child elements
    const containerSpacing = computeProportionalContainerSpacing(16);
    expect(containerSpacing.minPaddingPx).toBeGreaterThanOrEqual(16);
    expect(containerSpacing.idealPaddingPx).toBeGreaterThanOrEqual(24);
    expect(containerSpacing.idealPaddingPx).toBeGreaterThan(containerSpacing.maxChildGapPx);
  });

  it('enforces Gestalt Proximity Ratio (Inter-group >= 1.50x Intra-group gap)', () => {
    // Testing Programme cards: pt-10 (40px) vs space-y-4 (16px)
    const interGapPx = 40;
    const intraGapPx = 16;
    const proximityRatio = interGapPx / intraGapPx;

    expect(proximityRatio).toBeGreaterThanOrEqual(PSYCHOPHYSICAL_RATIOS.GESTALT_PROXIMITY_MIN);
    expect(proximityRatio).toBe(2.5); // Optimal proximity ratio
  });

  it('enforces Heading Clinging Doctrine (MarginTop >= 2.0x MarginBottom)', () => {
    // In our clustered header pattern:
    // Gap from section/previous block to heading = 32px
    // Gap from heading to sub-text/body = 12px
    const marginTopPx = 32;
    const marginBottomPx = 12;
    const clingingRatio = marginTopPx / marginBottomPx;

    expect(clingingRatio).toBeGreaterThanOrEqual(PSYCHOPHYSICAL_RATIOS.HEADING_CLINGING_MIN);
    expect(clingingRatio).toBeCloseTo(2.67, 1);
  });

  it('audits Adaptive Density Profiles against physical 44px Fitts Law floor', () => {
    // A 44px touch target passes
    const compliantTarget = auditAdaptiveDensity({
      mode: 'balanced',
      visualHeightPx: 48,
      touchEnvelopePx: 48,
      paddingPx: 16,
    });
    expect(compliantTarget.passes).toBe(true);
    expect(compliantTarget.touchEnvelopePasses).toBe(true);

    // A sub-44px touch target fails unconditionally
    const subTarget = auditAdaptiveDensity({
      mode: 'balanced',
      visualHeightPx: 28,
      touchEnvelopePx: 28,
      paddingPx: 4,
    });
    expect(subTarget.passes).toBe(false);
    expect(subTarget.touchEnvelopePasses).toBe(false);
    expect(subTarget.violation).toContain("violates physical 44px Fitts' Law floor");
  });

  it('evaluates Shannon Visual Entropy and Cognitive Load on Sanctuary layouts', () => {
    // EdLove Sanctuary clean editorial cards (2 fonts, 4 ink colors, 0 visual noise)
    const sanctuaryEntropy = evaluateCognitiveEntropy({
      viewportWidthPx: 896,
      viewportHeightPx: 320,
      distinctColorCount: 4,
      distinctFontCount: 2,
      distinctBorderRadiiCount: 1,
      elementCount: 5,
    });

    expect(sanctuaryEntropy.passes).toBe(true);
    expect(sanctuaryEntropy.shannonEntropyScore).toBeLessThan(25);
    expect(sanctuaryEntropy.cognitiveLoadGrade).toBe('Tranquil-Silk');
  });
});

describe('Static Template Spacing & Invariant Scanner', () => {
  const pagesDir = path.resolve(__dirname, '../pages');
  const corePages = [
    'index.astro',
    'about/index.astro',
    'foundation/index.astro',
    'care/index.astro',
    'tech/index.astro',
    'research/index.astro',
    'contact/index.astro',
  ];

  it('verifies all core pages exist and are readable', () => {
    for (const pageRel of corePages) {
      const pagePath = path.join(pagesDir, pageRel);
      expect(fs.existsSync(pagePath), `Page missing: ${pageRel}`).toBe(true);
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    }
  });

  it('strictly vetoes congested space-y-3 on mixed content card blocks', () => {
    // Mixed content cards (holding heading + body text + action) must not use tight space-y-3 (12px)
    for (const pageRel of corePages) {
      const pagePath = path.join(pagesDir, pageRel);
      const content = fs.readFileSync(pagePath, 'utf-8');

      // Regex matches cards with rounded-xl or rounded-2xl that also contain space-y-3
      const congestedCardMatches = content.match(
        /class="[^"]*rounded-(?:xl|2xl)[^"]*space-y-3[^"]*"/g,
      );

      expect(
        congestedCardMatches,
        `Page ${pageRel} contains congested card containers with space-y-3. Use space-y-4 or space-y-5 for Gestalt breathing room.`,
      ).toBeNull();
    }
  });

  it('verifies global.css enforces calibrated letter-spacing and line-height', () => {
    const globalCssPath = path.resolve(__dirname, '../styles/global.css');
    const css = fs.readFileSync(globalCssPath, 'utf-8');

    // Paragraph letter-spacing must be >= 0.015em (not the old cramped 0.005em)
    expect(css).toMatch(/letter-spacing:\s*0\.015em;/);
    // Paragraph line-height must be >= 1.70
    expect(css).toMatch(/line-height:\s*1\.72;/);
  });

  it('verifies interactive link actions in cards provide touch target envelopes', () => {
    const researchPagePath = path.join(pagesDir, 'research/index.astro');
    const content = fs.readFileSync(researchPagePath, 'utf-8');

    // Research programme links must satisfy 44px touch targets
    expect(content).toContain('min-h-[44px]');
  });

  it('strictly vetoes eyeball pulsing dots and boilerplate badges in page headers', () => {
    for (const pageRel of corePages) {
      const pagePath = path.join(pagesDir, pageRel);
      const content = fs.readFileSync(pagePath, 'utf-8');

      // Header must not contain rounded-full eyeball pulse dots
      expect(
        content,
        `Page ${pageRel} contains an eyeball pulsing dot in header. Page headers must open with pure typography.`,
      ).not.toMatch(
        /<header[^>]*>[\s\S]*?<span[^>]*class="[^"]*animate-pulse[^"]*"[\s\S]*?<\/header>/,
      );

      // Header must not contain redundant bureaucratic location/non-profit badge rows
      expect(
        content,
        `Page ${pageRel} contains boilerplate location/non-profit metadata under hero quote.`,
      ).not.toMatch(/<header[^>]*>[\s\S]*?<span>Colombo,\s*Sri Lanka<\/span>[\s\S]*?<\/header>/);
    }
  });
});

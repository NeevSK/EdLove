import { Theme } from '@repo/ui/theme/Theme';
import {
  auditReactNativeScreen,
  checkAccessibility,
  checkMobileTouchTarget,
  evaluateApca,
  evaluateWcag,
  getApcaFontMatrix,
  getTouchHitSlop,
  MOBILE_A11Y,
  simulateCvdHex,
} from '@repo/ui/utils/a11yUtils';
import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('Canonical A11y Gate Integration [@intuitui-labs/a11y-gate]', {
  tags: ['a11y', 'fast'],
}, () => {
  describe('APCA / WCAG 3 Perceptual Contrast', () => {
    it('computes APCA contrast and font weight matrix', () => {
      const evalResult = evaluateApca(Theme.colors.textPrimary, Theme.colors.backgroundLight);

      expect(evalResult.absLc).toBeGreaterThanOrEqual(MOBILE_A11Y.APCA_BODY_MIN);
      expect(evalResult.passesBodyText).toBe(true);
      expect(evalResult.passesLargeText).toBe(true);

      const matrix = getApcaFontMatrix(evalResult.absLc);
      expect(matrix.w400).toBeDefined();
      expect(matrix.w700).toBeDefined();
      expect(Number(matrix.w400)).toBeLessThanOrEqual(16);
    });

    it('validates dual-standard compliance (WCAG 2.2 AA + APCA)', () => {
      const check = checkAccessibility(Theme.colors.textPrimary, Theme.colors.backgroundLight);

      expect(check.ratio).toBeGreaterThanOrEqual(4.5);
      expect(check.passesAA).toBe(true);
      expect(Math.abs(check.apca)).toBeGreaterThanOrEqual(MOBILE_A11Y.APCA_BODY_MIN);
      expect(check.apcaRating).toMatch(/(Excellent|Minimum)/);
    });
  });

  describe('Color Vision Deficiency (CVD) Simulation', () => {
    it('simulates protanopia and deuteranopia without color collapse', () => {
      const primaryHex = Theme.colors.sanctuarySaffron;
      const protan = simulateCvdHex(primaryHex, 'protanopia');
      const deutan = simulateCvdHex(primaryHex, 'deuteranopia');
      const tritan = simulateCvdHex(primaryHex, 'tritanopia');

      expect(protan).toMatch(/^#[0-9a-f]{6}$/i);
      expect(deutan).toMatch(/^#[0-9a-f]{6}$/i);
      expect(tritan).toMatch(/^#[0-9a-f]{6}$/i);

      // Contrast must still be viable against dark background under CVD
      const wcagProtan = evaluateWcag(protan, Theme.colors.backgroundDark);
      expect(wcagProtan.passesAaLarge).toBe(true);
    });
  });

  describe('Mobile Ergonomics & Touch Target Geometry', () => {
    it('enforces strict 48dp minimum touch target standard', () => {
      expect(MOBILE_A11Y.MIN_TOUCH_TARGET_DP).toBe(48);
      expect(MOBILE_A11Y.MIN_TOUCH_TARGET_COMPACT_PT).toBe(44);

      const fullButton = checkMobileTouchTarget(120, 52);
      expect(fullButton.passes).toBe(true);

      const smallPill = checkMobileTouchTarget(36, 36);
      expect(smallPill.passes).toBe(false);
      expect(smallPill.required).toBe(48);
    });

    it('calculates hitSlop defense for compact interactive icons', () => {
      const iconSlop = getTouchHitSlop(24, 24);
      expect(iconSlop.top).toBe(12);
      expect(iconSlop.bottom).toBe(12);
      expect(iconSlop.left).toBe(12);
      expect(iconSlop.right).toBe(12);
      // Total effective touch area: 24 + 12 + 12 = 48dp
      expect(24 + iconSlop.top + iconSlop.bottom).toBe(48);
      expect(24 + iconSlop.left + iconSlop.right).toBe(48);
    });
  });

  describe('Step 0 Qualitative UX & Step 1 Visual Screen Gate', () => {
    it('catches sub-14px micro-text and undersized touch targets on mobile component code', () => {
      const sampleCode = `
        <View>
          <Text className="text-[10px]">Tiny Text</Text>
          <Pressable className="py-1 px-2">
            <Text>Submit</Text>
          </Pressable>
          <Checkbox value="terms" />
        </View>
      `;
      const audit = auditReactNativeScreen(sampleCode, 'SampleTestScreen');
      expect(audit.isCompliant).toBe(false);
      expect(audit.findings.some((f) => f.rule === 'MOBILE_TYPOGRAPHY_FLOOR_14PX')).toBe(true);
      expect(audit.findings.some((f) => f.rule === 'TOUCH_TARGET_48DP_UNDERSIZED')).toBe(true);
      expect(audit.findings.some((f) => f.rule === 'COGNITIVE_FRICTION_CHECKBOX')).toBe(true);
    });

    it('accurately catches legacy WelcomeScreen.tsx violations', () => {
      const legacyPath = path.resolve(
        __dirname,
        '../../../../packages/ui/src/screens/WelcomeScreen.tsx',
      );
      const legacyCode = fs.readFileSync(legacyPath, 'utf8');
      const legacyAudit = auditReactNativeScreen(legacyCode, 'WelcomeScreen.tsx');

      // Accurately flags legacy design debt
      expect(legacyAudit.isCompliant).toBe(false);
      expect(legacyAudit.summary.errors).toBeGreaterThan(0);
      expect(legacyAudit.findings.some((f) => f.rule === 'MOBILE_TYPOGRAPHY_FLOOR_14PX')).toBe(
        true,
      );
      expect(legacyAudit.findings.some((f) => f.rule === 'COGNITIVE_FRICTION_CHECKBOX')).toBe(true);
      expect(legacyAudit.findings.some((f) => f.rule === 'NESTED_CARD_CLUTTER')).toBe(true);
    });

    it('validates SanctuaryWelcomeScreen.tsx passes quality gate with 100% compliance', () => {
      const sanctuaryPath = path.resolve(
        __dirname,
        '../../../../packages/ui/src/screens/SanctuaryWelcomeScreen.tsx',
      );
      const sanctuaryCode = fs.readFileSync(sanctuaryPath, 'utf8');
      const sanctuaryAudit = auditReactNativeScreen(sanctuaryCode, 'SanctuaryWelcomeScreen.tsx');

      expect(
        sanctuaryAudit.isCompliant,
        `Unexpected audit findings:\n${JSON.stringify(sanctuaryAudit.findings, null, 2)}`,
      ).toBe(true);
      expect(sanctuaryAudit.summary.errors).toBe(0);
    });
  });
});

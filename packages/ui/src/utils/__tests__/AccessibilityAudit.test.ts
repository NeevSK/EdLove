import { getContrastRatio, getAccessibleTextColor } from '../colorUtils';
import { checkAccessibility } from '../a11yUtils';
import { phaseMatrix, resolvePhaseTokens } from '../../theme/Theme';
import { TemporalPhase } from '../../context/types';

describe('Accessibility Audit - WCAG 2.1 Contrast Ratios', () => {
    const phases: TemporalPhase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
    const modes: ('light' | 'dark')[] = ['light', 'dark'];

    const AA_THRESHOLD = 4.5;
    const AAA_THRESHOLD = 7.0;

    describe('Accent Backgrounds (Primary Action)', () => {
        phases.forEach(phase => {
            modes.forEach(mode => {
                it(`[${phase}/${mode}] accent.action meets AA (>= 4.5:1)`, () => {
                    const tokens = resolvePhaseTokens(phase, mode === 'dark');
                    const bg = tokens.accent.action;
                    const fg = tokens.text.inverse; // Text intended for accent backgrounds

                    const ratio = getContrastRatio(fg, bg);

                    // We expect at least AA compliance for our primary action buttons
                    expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
                });

                it(`[${phase}/${mode}] reward.action meets AA (>= 4.5:1)`, () => {
                    const tokens = resolvePhaseTokens(phase, mode === 'dark');
                    const bg = tokens.accent.reward;
                    const fg = tokens.text.inverse;

                    const ratio = getContrastRatio(fg, bg);
                    expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
                });
            });
        });
    });

    describe('Surface Contrast (Primary Text)', () => {
        phases.forEach(phase => {
            modes.forEach(mode => {
                it(`[${phase}/${mode}] primary text vs gradient node 0 meets AA (>= 4.5:1)`, () => {
                    const tokens = resolvePhaseTokens(phase, mode === 'dark');
                    const bg = tokens.gradientNodes[0];
                    const fg = tokens.text.primary;

                    const ratio = getContrastRatio(fg, bg);
                    expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
                });
            });
        });
    });

    describe('APCA - Perceptual Contrast Audit', () => {
        phases.forEach(phase => {
            modes.forEach(mode => {
                it(`[${phase}/${mode}] primary text meets APCA body text minimum (Lc >= 75)`, () => {
                    const tokens = resolvePhaseTokens(phase, mode === 'dark');
                    const bg = tokens.gradientNodes[0];
                    const fg = tokens.text.primary;

                    const { apca } = checkAccessibility(fg, bg);
                    // APCA Lc 75 is recommended for body text
                    expect(Math.abs(apca)).toBeGreaterThanOrEqual(75);
                });

                it(`[${phase}/${mode}] accent inverse text meets APCA minimum (Lc >= 60)`, () => {
                    const tokens = resolvePhaseTokens(phase, mode === 'dark');
                    const bg = tokens.accent.action;
                    const fg = tokens.text.inverse;

                    const { apca } = checkAccessibility(fg, bg);
                    // APCA Lc 60 is minimum for large text/headlines
                    expect(Math.abs(apca)).toBeGreaterThanOrEqual(60);
                });
            });
        });
    });

    describe('Living Theme Text Selection Integrity', () => {
        it('getAccessibleTextColor accurately identifies AA passes', () => {
            const result = getAccessibleTextColor('#FFFFFF'); // White bg
            expect(result.color).toBe('#2A2318'); // Should pick dark text
            expect(result.passesAA).toBe(true);
            expect(result.ratio).toBeGreaterThan(AA_THRESHOLD);
        });

        it('identifies failures when no candidate passes (Boundary check)', () => {
            // Check a mid-luminance color like a bright grey to see how it handles failure
            const result = getAccessibleTextColor('#888888');
            // Even if it fails AA, it should pick the best candidate
            expect(result.ratio).toBeGreaterThan(1);
        });
    });
});

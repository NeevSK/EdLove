import { resolvePhaseTokens } from '../theme/Theme';

describe('resolvePhaseTokens', () => {
    it('returns dark tokens for night/dark', () => {
        const tokens = resolvePhaseTokens('night', true);
        expect(tokens.gradientNodes[0]).toBe('#020617');
        expect(tokens.accent.action).toBe('#FDD925');
    });

    it('returns light tokens for morning/light', () => {
        const tokens = resolvePhaseTokens('morning', false);
        expect(tokens.accent.action).toBe('#16A34A'); // leaf green
        expect(tokens.accent.reward).toBe('#EA580C'); // saffron
    });

    it('returns dark tokens for dusk/dark', () => {
        const tokens = resolvePhaseTokens('dusk', true);
        expect(tokens.accent.action).toBe('#0EA5E9'); // teal
    });

    it('all 6 phases resolve without throwing', () => {
        const phases = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'] as const;
        phases.forEach(phase => {
            expect(() => resolvePhaseTokens(phase, false)).not.toThrow();
            expect(() => resolvePhaseTokens(phase, true)).not.toThrow();
        });
    });
});

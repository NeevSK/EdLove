const { resolveClassicTokens, resolvePhaseTokens } = require('../theme/Theme');

describe('resolvePhaseTokens', () => {
    it('returns scene tokens for night/dark', () => {
        const tokens = resolvePhaseTokens('night', true);

        expect(tokens.scene.world.bg).toBe('#0F131C');
        expect(tokens.scene.chrome.bg).toBe(tokens.glass.surface.bg);
        expect(tokens.scene.elevated.bg).toBe(tokens.glass.modal.bg);
        expect(tokens.text.onWorld).toBe('#FCF9F2');
        expect(tokens.accent.action).toBe('#FDD925');
    });

    it('returns scene tokens for morning/light', () => {
        const tokens = resolvePhaseTokens('morning', false);

        expect(tokens.scene.world.bg).toBe('#F5EDD6');
        expect(tokens.scene.canvas.bg).toBe('#DCFCE7');
        expect(tokens.text.onCanvas).toBe('#2A2318');
        expect(tokens.accent.action).toBe('#8BBF7A');
        expect(tokens.text.onAccent).toBe(tokens.text.inverse);
    });

    it('all six phases resolve without throwing in both worlds', () => {
        const phases = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];

        phases.forEach((phase) => {
            expect(() => resolvePhaseTokens(phase, false)).not.toThrow();
            expect(() => resolvePhaseTokens(phase, true)).not.toThrow();
        });
    });

    it('classic tokens project into the same scene contract', () => {
        const lightClassic = resolveClassicTokens(false);
        const darkClassic = resolveClassicTokens(true);

        expect(lightClassic.scene.canvas.bg).toBe('#FAF7ED');
        expect(lightClassic.text.onCanvas).toBe('#2A2318');
        expect(darkClassic.scene.world.bg).toBe('#0F131C');
        expect(darkClassic.text.onWorld).toBe('#FCF9F2');
    });
});

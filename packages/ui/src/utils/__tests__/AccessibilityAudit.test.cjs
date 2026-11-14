const {
  compositeColorOverBackground,
  getContrastRatio,
  getAccessibleTextColor,
} = require('../colorUtils');
const { checkAccessibility } = require('../a11yUtils');
const { resolvePhaseTokens } = require('../../theme/Theme');

describe('Accessibility Audit - scene and accent contrast', () => {
  const phases = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
  const modes = ['light', 'dark'];
  const AA_THRESHOLD = 4.5;

  const resolveSceneBackground = (tokens, layerName) => {
    switch (layerName) {
      case 'world':
        return tokens.scene.world.bg;
      case 'chrome':
        return compositeColorOverBackground(tokens.scene.chrome.bg, tokens.scene.world.bg);
      case 'canvas':
        return tokens.scene.canvas.bg;
      case 'surface':
        return compositeColorOverBackground(tokens.scene.surface.bg, tokens.scene.canvas.bg);
      case 'elevated':
        return compositeColorOverBackground(tokens.scene.elevated.bg, tokens.scene.canvas.bg);
      case 'interactive':
        return compositeColorOverBackground(tokens.scene.interactive.bg, tokens.scene.surface.bg);
      default:
        throw new Error(`Unknown scene layer: ${layerName}`);
    }
  };

  describe('Accent backgrounds', () => {
    phases.forEach((phase) => {
      modes.forEach((mode) => {
        it(`[${phase}/${mode}] action accent meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(tokens.text.onAccent, tokens.accent.action);

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });

        it(`[${phase}/${mode}] danger accent meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(tokens.text.onDanger, tokens.accent.danger);

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });
      });
    });
  });

  describe('Scene layer text pairings', () => {
    phases.forEach((phase) => {
      modes.forEach((mode) => {
        it(`[${phase}/${mode}] text.onWorld meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(
            tokens.text.onWorld,
            resolveSceneBackground(tokens, 'world'),
          );

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });

        it(`[${phase}/${mode}] text.onChrome meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(
            tokens.text.onChrome,
            resolveSceneBackground(tokens, 'chrome'),
          );

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });

        it(`[${phase}/${mode}] text.onCanvas meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(
            tokens.text.onCanvas,
            resolveSceneBackground(tokens, 'canvas'),
          );

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });

        it(`[${phase}/${mode}] text.onSurface meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(
            tokens.text.onSurface,
            resolveSceneBackground(tokens, 'surface'),
          );

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });

        it(`[${phase}/${mode}] text.onElevated meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(
            tokens.text.onElevated,
            resolveSceneBackground(tokens, 'elevated'),
          );

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });

        it(`[${phase}/${mode}] text.onInteractive meets AA`, () => {
          const tokens = resolvePhaseTokens(phase, mode === 'dark');
          const ratio = getContrastRatio(
            tokens.text.onInteractive,
            resolveSceneBackground(tokens, 'interactive'),
          );

          expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
        });
      });
    });
  });

  describe('APCA spot checks', () => {
    it('scene canvas text meets APCA body recommendation', () => {
      const tokens = resolvePhaseTokens('morning', false);
      const { apca } = checkAccessibility(tokens.text.onCanvas, tokens.scene.canvas.bg);

      expect(Math.abs(apca)).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Readable text helper', () => {
    it('selects a dark text color for white-ish backgrounds', () => {
      const result = getAccessibleTextColor('#FFFFFF');

      expect(result.color).toBe('#000000');
      expect(result.passesAA).toBe(true);
    });

    it('still returns a candidate for difficult mid-tone backgrounds', () => {
      const result = getAccessibleTextColor('#888888');

      expect(result.ratio).toBeGreaterThan(1);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { contrastRatio, mix } from '../color';
import { GROUND_CEILING, groundLimitsOf, washLimitOf } from '../groundLimits';
import { WORLD_IDS, WORLDS } from '../worlds';

describe('ground limits keep words readable on any custom look', () => {
  for (const id of WORLD_IDS) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${id} ${mode}: a photo at the limit keeps ink 7:1 on the worst pixel`, () => {
        const tokens = WORLDS[id].palette[mode];
        const { photoOpacity } = groundLimitsOf(tokens);
        expect(photoOpacity).toBeLessThanOrEqual(GROUND_CEILING.photoOpacity);
        for (const worst of ['#000000', '#ffffff']) {
          const ground = mix(tokens.ground, worst, photoOpacity);
          expect(contrastRatio(tokens.ink, ground)).toBeGreaterThanOrEqual(7);
          expect(contrastRatio(tokens.inkSoft, ground)).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }

  it('a wash at its limit keeps the words readable', () => {
    for (const id of WORLD_IDS) {
      const tokens = WORLDS[id].palette.light;
      for (const wash of [tokens.ink, '#ff0000', '#000000', '#ffffff']) {
        const alpha = washLimitOf(tokens, wash);
        expect(contrastRatio(tokens.ink, mix(tokens.ground, wash, alpha))).toBeGreaterThanOrEqual(
          7,
        );
      }
    }
    expect(washLimitOf(WORLDS[WORLD_IDS[0]].palette.light, 'not-a-colour')).toBe(0);
  });
});

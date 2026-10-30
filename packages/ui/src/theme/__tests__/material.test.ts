import { describe, expect, it } from 'vitest';
import { buildRecipes } from '../build';
import { contrastRatio } from '../color';
import { resolveWorld } from '../resolve';
import type { Phase, WorldMode } from '../types';
import { WORLD_IDS, WORLDS } from '../worlds';

const PHASES: Phase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const MODES: WorldMode[] = ['light', 'dark'];

describe('world material and living light', { tags: ['unit'] }, () => {
  it('every theme resolves a material whose lit moments stay visible on the ground', () => {
    for (const id of WORLD_IDS)
      for (const mode of MODES)
        for (const phase of PHASES) {
          const w = resolveWorld(id, phase, mode);
          const m = w.recipes.material;
          for (const moment of ['focus', 'invalid'] as const) {
            expect(
              contrastRatio(m.states[moment].edge, w.tokens.ground),
              `${id}/${mode}/${phase} ${moment} edge`,
            ).toBeGreaterThanOrEqual(3);
          }
          for (const l of Object.values(m.states)) {
            expect(l.lift).toBeGreaterThanOrEqual(0);
            expect(l.lift).toBeLessThanOrEqual(0.2);
            expect(l.glowOpacity).toBeGreaterThanOrEqual(0);
            expect(l.glowOpacity).toBeLessThanOrEqual(0.5);
          }
          expect(m.states.rest.glowOpacity).toBe(0);
        }
  });

  it('light-mode shadows carry the world ink, not neutral black', () => {
    for (const id of WORLD_IDS) {
      const w = resolveWorld(id, 'morning', 'light');
      expect(w.recipes.material.shadow).not.toBe('#000000');
      if (w.recipes.surface.raised.shadow)
        expect(w.recipes.surface.raised.shadow.color).toBe(w.recipes.material.shadow);
    }
  });

  it('a world can say its material: no light means no glow and no lift', () => {
    const base = WORLDS.sanctuary;
    const t = base.palette.light;
    const dark = buildRecipes(t, { ...base.style, material: { light: 'none' } }, 'light');
    for (const l of Object.values(dark.material.states)) {
      expect(l.glowOpacity).toBe(0);
      expect(l.lift).toBe(0);
    }
    const quiet = buildRecipes(t, { ...base.style, material: { response: 'quiet' } }, 'light');
    const vivid = buildRecipes(t, { ...base.style, material: { response: 'vivid' } }, 'light');
    expect(vivid.material.states.press.lift).toBeGreaterThan(quiet.material.states.press.lift);
    expect(vivid.material.states.focus.glowOpacity).toBeGreaterThan(
      quiet.material.states.focus.glowOpacity,
    );
  });

  it('a warm centre leans toward the light, an even one stays on the paper', () => {
    const base = WORLDS.sanctuary;
    const t = base.palette.light;
    const even = buildRecipes(t, { ...base.style, material: { temperature: 0 } }, 'light');
    expect(even.material.wash.centre).toBe(t.raised);
    expect(even.material.wash.edge).toBe(t.raised);
    expect(even.surface.raised.wash).toBeNull();
    const warm = buildRecipes(t, { ...base.style, material: { temperature: 1 } }, 'light');
    expect(warm.material.wash.centre).not.toBe(t.raised);
  });
});

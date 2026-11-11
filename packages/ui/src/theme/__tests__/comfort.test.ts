import { describe, expect, it } from 'vitest';
import { COMFORT_SCALE, resolveWorld, scaleRecipes } from '../resolve';

describe('comfort', () => {
  const standard = resolveWorld('kele', 'morning', 'light');

  it('grows controls and spacing, never type', () => {
    const large = resolveWorld('kele', 'morning', 'light', {
      contrast: 'standard',
      transparency: 'standard',
      size: 'large',
    });
    expect(large.recipes.field.minHeight).toBeGreaterThan(standard.recipes.field.minHeight);
    expect(large.recipes.text).toEqual(standard.recipes.text);
    expect(large.recipes.row.minHeight).toBeCloseTo(
      standard.recipes.row.minHeight * COMFORT_SCALE.large,
      0,
    );
  });

  it('shrinks them for compact and leaves standard untouched', () => {
    const compact = resolveWorld('kele', 'morning', 'light', {
      contrast: 'standard',
      transparency: 'standard',
      size: 'compact',
    });
    expect(compact.recipes.row.minHeight).toBeLessThan(standard.recipes.row.minHeight);
    expect(scaleRecipes(standard.recipes, 1)).toEqual(standard.recipes);
  });

  it('a simpler look drops ornaments and textures but keeps the world', () => {
    const simple = resolveWorld('perahera', 'morning', 'light', {
      contrast: 'standard',
      transparency: 'standard',
      simple: true,
    });
    const full = resolveWorld('perahera', 'morning', 'light');
    expect(simple.tokens).toEqual(full.tokens);
    expect(simple.definition.id).toBe('perahera');
    expect(simple).not.toBe(full);
  });

  it('caches each comfort separately', () => {
    const a = resolveWorld('kele', 'morning', 'light', {
      contrast: 'standard',
      transparency: 'standard',
      size: 'large',
    });
    expect(a).not.toBe(standard);
  });
});

describe('sunlight', () => {
  it('wears the light palette at a neutral hour, whatever the clock says', async () => {
    const { resolveWorld } = await import('../resolve');
    const sun = { contrast: 'standard', transparency: 'standard', sunlight: true } as const;
    const night = resolveWorld('kele', 'night', 'dark', sun);
    const day = resolveWorld('kele', 'morning', 'light', sun);
    expect(night.tokens).toEqual(day.tokens);
  });
  it('raises every ink well past the usual contrast', async () => {
    const { resolveWorld } = await import('../resolve');
    const { contrastRatio } = await import('../color');
    const { WORLDS } = await import('../worlds');
    for (const id of Object.keys(WORLDS) as (keyof typeof WORLDS)[]) {
      const t = resolveWorld(id, 'dusk', 'light', {
        contrast: 'standard',
        transparency: 'standard',
        sunlight: true,
      }).tokens;
      expect(contrastRatio(t.ink, t.ground)).toBeGreaterThanOrEqual(15);
      expect(contrastRatio(t.inkSoft, t.ground)).toBeGreaterThanOrEqual(10);
      expect(contrastRatio(t.inkFaint, t.ground)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(t.line, t.ground)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

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

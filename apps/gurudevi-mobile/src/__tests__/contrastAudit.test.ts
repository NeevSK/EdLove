import { describe, expect, expectTypeOf, it, test } from 'vitest';
import { getContrastRatio, meetsWCAG } from '../../../../packages/core/src/hooks/useAccessibility';
import { Theme } from '../../../../packages/ui/src/theme/Theme';

type ColorCategory = 'text' | 'background' | 'border' | 'interactive';
type ColorToken = { name: string; value: string; category: ColorCategory };

function extractColors(value: unknown, prefix = ''): ColorToken[] {
  if (!value || typeof value !== 'object') return [];

  const colors: ColorToken[] = [];
  for (const [key, nested] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof nested === 'string' && nested.startsWith('#')) {
      let category: ColorCategory = 'interactive';
      if (/text/i.test(key)) category = 'text';
      else if (/bg|background|canvas|surface/i.test(key)) category = 'background';
      else if (/border/i.test(key)) category = 'border';
      colors.push({ name, value: nested, category });
    } else {
      colors.push(...extractColors(nested, name));
    }
  }
  return colors;
}

describe('theme contrast audit', { tags: ['a11y', 'theme', 'fast'] }, () => {
  const colors = extractColors(Theme.colors);
  const textColors = colors.filter((color) => color.category === 'text');
  const backgroundColors = colors.filter((color) => color.category === 'background');

  it('discovers text and background tokens', () => {
    expect(textColors.length).toBeGreaterThan(0);
    expect(backgroundColors.length).toBeGreaterThan(0);
  });

  it('enforces static color token types using expectTypeOf (T16)', () => {
    expectTypeOf(Theme.colors.textPrimary).toBeString();
    expectTypeOf(Theme.colors.backgroundLight).toBeString();
    expectTypeOf(getContrastRatio).toBeFunction();
    expectTypeOf(getContrastRatio).returns.toBeNumber();
  });

  test.for([
    {
      fg: 'textPrimary',
      fgVal: Theme.colors.textPrimary,
      bg: 'backgroundLight',
      bgVal: Theme.colors.backgroundLight,
      size: 'normal',
    },
    {
      fg: 'textSecondary',
      fgVal: Theme.colors.textSecondary,
      bg: 'backgroundLight',
      bgVal: Theme.colors.backgroundLight,
      size: 'normal',
    },
    {
      fg: 'textTertiary',
      fgVal: Theme.colors.textTertiary,
      bg: 'backgroundLight',
      bgVal: Theme.colors.backgroundLight,
      size: 'large',
    },
    {
      fg: 'sacredWhite',
      fgVal: Theme.colors.sacredWhite,
      bg: 'backgroundDark',
      bgVal: Theme.colors.backgroundDark,
      size: 'normal',
    },
    {
      fg: 'errorText',
      fgVal: Theme.colors.errorText,
      bg: 'errorBackground',
      bgVal: Theme.colors.errorBackground,
      size: 'normal',
    },
  ] as const)('WCAG AA contrast: $fg on $bg ($size) (T17 test.for)', ({ fgVal, bgVal, size }) => {
    const ratio = getContrastRatio(fgVal, bgVal);
    expect(ratio).toBeGreaterThan(1);
    expect(meetsWCAG(fgVal, bgVal, 'AA', size as any)).toBe(true);
  });
});

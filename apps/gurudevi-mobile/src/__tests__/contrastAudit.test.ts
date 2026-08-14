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

describe('theme contrast audit', () => {
  const colors = extractColors(Theme.colors);
  const textColors = colors.filter((color) => color.category === 'text');
  const backgroundColors = colors.filter((color) => color.category === 'background');

  it('discovers text and background tokens', () => {
    expect(textColors.length).toBeGreaterThan(0);
    expect(backgroundColors.length).toBeGreaterThan(0);
  });

  it('keeps supported semantic foreground/background pairs WCAG AA readable', () => {
    const pairs = [
      [
        'textPrimary',
        Theme.colors.textPrimary,
        'backgroundLight',
        Theme.colors.backgroundLight,
        'normal',
      ],
      [
        'textSecondary',
        Theme.colors.textSecondary,
        'backgroundLight',
        Theme.colors.backgroundLight,
        'normal',
      ],
      [
        'textTertiary',
        Theme.colors.textTertiary,
        'backgroundLight',
        Theme.colors.backgroundLight,
        'large',
      ],
      [
        'sacredWhite',
        Theme.colors.sacredWhite,
        'backgroundDark',
        Theme.colors.backgroundDark,
        'normal',
      ],
      [
        'errorText',
        Theme.colors.errorText,
        'errorBackground',
        Theme.colors.errorBackground,
        'normal',
      ],
    ] as const;
    const failures = pairs.flatMap(
      ([foregroundName, foreground, backgroundName, background, size]) => {
        const ratio = getContrastRatio(foreground, background);
        return meetsWCAG(foreground, background, 'AA', size)
          ? []
          : [`${foregroundName} on ${backgroundName}: ${ratio.toFixed(2)}:1`];
      },
    );

    if (failures.length > 0) {
      throw new Error(`Contrast failures (${failures.length}):\n${failures.join('\n')}`);
    }
  });
});

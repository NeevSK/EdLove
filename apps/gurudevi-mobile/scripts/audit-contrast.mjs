#!/usr/bin/env node
/**
 * Contrast Audit Script
 *
 * Validates WCAG AA contrast ratios for all theme colors.
 * Uses the theme tokens from @repo/ui/theme/Theme.ts
 */

import { Theme } from '@repo/ui/theme/Theme';
import { getContrastRatio, meetsWCAG } from '@repo/core/hooks/useAccessibility';

interface ColorToken {
  name: string;
  value: string;
  category: 'text' | 'background' | 'border' | 'interactive';
}

function extractColors(obj: any, prefix = ''): ColorToken[] {
  const colors: ColorToken[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string' && value.startsWith('#')) {
      let category: ColorToken['category'] = 'interactive';
      if (key.includes('text') || key.includes('Text')) category = 'text';
      else if (key.includes('bg') || key.includes('background') || key.includes('canvas') || key.includes('surface')) category = 'background';
      else if (key.includes('border') || key.includes('Border')) category = 'border';

      colors.push({ name: fullKey, value, category });
    } else if (typeof value === 'object' && value !== null) {
      colors.push(...extractColors(value, fullKey));
    }
  }

  return colors;
}

async function main() {
  console.log('🎨 Contrast Audit - WCAG AA Validation\n');

  const colors = extractColors(Theme.colors);
  const textColors = colors.filter((c) => c.category === 'text');
  const backgroundColors = colors.filter((c) => c.category === 'background');

  let passed = 0;
  let failed = 0;
  const results: Array<{ fg: string; bg: string; ratio: number; passed: boolean }> = [];

  // Test all text/background combinations
  for (const textColor of textColors) {
    for (const bgColor of backgroundColors) {
      const ratio = getContrastRatio(textColor.value, bgColor.value);
      const isAA = meetsWCAG(textColor.value, bgColor.value, 'AA', 'normal');
      const isAALarge = meetsWCAG(textColor.value, bgColor.value, 'AA', 'large');

      if (isAA || isAALarge) {
        passed++;
      } else {
        failed++;
      }

      results.push({
        fg: `${textColor.name} (${textColor.value})`,
        bg: `${bgColor.name} (${bgColor.value})`,
        ratio,
        passed: isAA || isAALarge,
      });
    }
  }

  // Print results
  console.log('\n📊 Contrast Audit Results');
  console.log('==========================\n');

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.fg} on ${result.bg}: ${result.ratio.toFixed(2)}:1`);
  }

  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\n❌ Contrast audit FAILED - WCAG AA violations found');
    process.exit(1);
  } else {
    console.log('\n✅ Contrast audit PASSED - All combinations meet WCAG AA');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
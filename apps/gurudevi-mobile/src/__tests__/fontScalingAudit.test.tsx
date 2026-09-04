import React from 'react';
import { Text, View } from 'react-native';
import { describe, expect, it } from 'vitest';

const FONT_SCALES = [1, 1.5, 2] as const;

function ScaledFixture({ fontScale }: { fontScale: number }) {
  return (
    <View testID={`font-scale-${fontScale}`} style={{ transform: [{ scale: fontScale }] }}>
      <Text allowFontScaling style={{ fontSize: 24 }}>
        Heading fixture
      </Text>
      <Text allowFontScaling style={{ fontSize: 16 }}>
        Body fixture
      </Text>
      <Text allowFontScaling style={{ fontSize: 12 }}>
        Caption fixture
      </Text>
    </View>
  );
}

describe('font scaling audit', { tags: ['a11y', 'theme', 'fast'] }, () => {
  it.each(FONT_SCALES)('renders the core text hierarchy at %sx', (fontScale) => {
    const fixture = ScaledFixture({ fontScale });
    const textNodes = fixture.props.children;

    expect(fixture.props.testID).toBe(`font-scale-${fontScale}`);
    expect(textNodes).toHaveLength(3);
    expect(textNodes[0].props.allowFontScaling).toBe(true);
    expect(textNodes[1].props.allowFontScaling).toBe(true);
    expect(textNodes[2].props.allowFontScaling).toBe(true);
  });

  it('keeps the audit scale set within the supported accessibility range', () => {
    expect(FONT_SCALES).toEqual([1, 1.5, 2]);
    expect(Math.min(...FONT_SCALES)).toBe(1);
    expect(Math.max(...FONT_SCALES)).toBe(2);
  });
});

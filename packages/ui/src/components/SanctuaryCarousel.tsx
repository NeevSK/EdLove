import React from 'react';
import { Dimensions } from 'react-native';
import Animated, { withTiming } from 'react-native-reanimated';
// @ts-expect-error - Module has no type declarations
import Carousel from 'react-native-reanimated-carousel';
import { Theme } from '@repo/ui/theme/Theme';

export interface SanctuaryCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  /** Space between each item */
  gap?: number;
  /** Padding on leading and trailing edges */
  paddingHorizontal?: number;
  /** Number of visible items in the viewport */
  visibleCount?: number;
  /** Enable parallax shrink effect on inactive items */
  parallax?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * SanctuaryCarousel - Netflix-style horizontal card scroller with parallax.
 * Backed by react-native-reanimated-carousel for 60fps animations.
 */
export function SanctuaryCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  gap = Theme.spacing.md,
  paddingHorizontal = Theme.spacing.lg,
  visibleCount = 4,
  parallax = true,
}: SanctuaryCarouselProps<T>) {
  const itemWidth = (screenWidth - paddingHorizontal * 2 - gap * (visibleCount - 1)) / visibleCount;

  return (
    <Carousel
      data={data}
      renderItem={({ item, index }: { item: T; index: number }) => (
        <React.Fragment key={keyExtractor(item, index)}>
          <Animated.View style={{ width: itemWidth, marginRight: index < data.length - 1 ? gap : 0 }}>
            {renderItem(item, index)}
          </Animated.View>
        </React.Fragment>
      )}
      keyExtractor={keyExtractor}
      itemWidth={itemWidth}
      sliderWidth={screenWidth}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal }}
      loop={false}
      autoPlay={false}
      snapEnabled
      layout={{
        type: 'horizontal-stack',
        visibleCount,
        spacing: gap,
        scaleStep: 0.04,
      }}
      itemAnimation={
        parallax
          ? ({ progress }: { progress: number }) => ({
              opacity: withTiming(1 - Math.abs(progress) * 0.3),
              transform: [{ scale: withTiming(1 - Math.abs(progress) * 0.08) }],
            })
          : undefined
      }
    />
  );
}
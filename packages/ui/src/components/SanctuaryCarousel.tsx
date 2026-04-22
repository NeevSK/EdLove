import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';

export interface SanctuaryCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  /** Space between each item */
  gap?: number;
  /** Padding on leading and trailing edges */
  paddingHorizontal?: number;
}

/**
 * SanctuaryCarousel - generic horizontal card scroller backed by FlatList.
 * Use as a DRY alternative to ad-hoc horizontal ScrollViews containing card lists.
 */
export function SanctuaryCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  gap = Theme.spacing.md,
  paddingHorizontal = Theme.spacing.lg,
}: SanctuaryCarouselProps<T>) {
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item, index) => keyExtractor(item, index)}
      renderItem={({ item, index }) => (
        <View style={{ marginRight: index < data.length - 1 ? gap : 0 }}>
          {renderItem(item, index)}
        </View>
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Theme.spacing.sm,
  },
});

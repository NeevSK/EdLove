import React from 'react';
import { View, StyleSheet, RefreshControl, type StyleProp, type ViewStyle } from 'react-native';
import { FlashList, type FlashListProps, type ListRenderItem } from '@shopify/flash-list';
import { useVisualCapabilities } from '../context/VisualCapabilities';
import { LayoutLoopSentinel } from '../sentinels/LayoutLoopSentinel';
import { BrandedEmptyState } from './BrandedEmptyState';
import { SkeletonList } from './Skeleton';

export interface SovereignVirtualListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  name: string;
  data: T[] | null | undefined;
  renderItem: ListRenderItem<T>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * SovereignVirtualList
 *
 * High-performance list primitive powered by Shopify FlashList v2 with
 * LayoutLoopSentinel circuit breaker protection and Fine UI empty/loading states.
 */
export function SovereignVirtualList<T>({
  name,
  data,
  renderItem,
  isLoading = false,
  emptyTitle = 'A clear place to begin',
  emptyMessage = 'No entries found in this collection.',
  onRefresh,
  isRefreshing = false,
  containerStyle,
  testID,
  ListEmptyComponent,
  refreshControl,
  drawDistance,
  ...flashListProps
}: SovereignVirtualListProps<T>) {
  // verger's `list-window` lever narrows how far ahead rows render; a caller's value wins.
  const { listDrawDistance } = useVisualCapabilities();
  if (isLoading && (!data || data.length === 0)) {
    return (
      <View style={[styles.container, containerStyle]} testID={testID ? `${testID}-loading` : undefined}>
        <SkeletonList count={6} />
      </View>
    );
  }

  const resolvedEmpty = ListEmptyComponent ?? (
    <BrandedEmptyState title={emptyTitle} message={emptyMessage} />
  );

  const resolvedRefreshControl =
    refreshControl ??
    (onRefresh ? (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor="#D4843A"
        colors={['#D4843A']}
      />
    ) : undefined);

  return (
    <LayoutLoopSentinel name={`SovereignVirtualList:${name}`} style={[styles.container, containerStyle]}>
      <FlashList<T>
        testID={testID}
        data={data ?? []}
        renderItem={renderItem}
        ListEmptyComponent={resolvedEmpty}
        refreshControl={resolvedRefreshControl}
        drawDistance={drawDistance ?? listDrawDistance}
        {...flashListProps}
      />
    </LayoutLoopSentinel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

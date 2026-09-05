import EmptyState from '@repo/ui/components/EmptyState';
import { BookOpen } from '@repo/ui/icons';
import { RefreshControl } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { FlashList, type FlashListProps } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface SanctuaryFlashListProps<T>
  extends Omit<FlashListProps<T>, 'refreshControl' | 'masonry'> {
  /** Estimated size of a single list item (Optional in v2, Auto-calculated) */
  estimatedItemSize?: number;
  /** Whether the list is currently refreshing */
  refreshing?: boolean;
  /** Function to call when refreshing */
  onRefresh?: () => void;
  /** Optional empty state content */
  emptyComponent?: React.ReactElement;
  /** Color of the refresh spinner */
  refreshColor?: string;
  /** Style for the content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Enable masonry grid layout */
  masonry?: boolean;
  /** Number of columns in masonry mode */
  numColumns?: number;
}

/**
 * SanctuaryFlashList - A high-performance list component optimized for component recycling.
 *
 * Philosophy: Performance is silent but essential for presence.
 * This component wraps @shopify/flash-list with Sanctuary-themed defaults.
 *
 * @example
 * <SanctuaryFlashList
 *   data={resources}
 *   renderItem={({ item }) => <ResourceRow resource={item} />}
 *   estimatedItemSize={Theme.listSizes.resourceRow}
 * />
 */
export function SanctuaryFlashList<T>({
  data,
  renderItem,
  estimatedItemSize,
  refreshing = false,
  onRefresh,
  emptyComponent,
  refreshColor,
  contentContainerStyle,
  ListEmptyComponent,
  masonry,
  numColumns = 2,
  ...props
}: SanctuaryFlashListProps<T>) {
  const renderEmpty = useCallback(() => {
    if (emptyComponent) return emptyComponent;

    if (ListEmptyComponent) {
      if (React.isValidElement(ListEmptyComponent)) return ListEmptyComponent;
      const EmptyComp = ListEmptyComponent as any;
      return <EmptyComp />;
    }

    return (
      <EmptyState
        icon={<BookOpen size={48} color={Theme.colors.sanctuarySaffron} />}
        title="Silence in the Sanctuary"
        description="Your first discovery is waiting to be found here."
      />
    );
  }, [emptyComponent, ListEmptyComponent]);

  return (
    <FlashList
      {...(props as any)}
      data={data}
      renderItem={renderItem}
      estimatedItemSize={estimatedItemSize}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[{ paddingBottom: Theme.spacing.xl }, contentContainerStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshColor || Theme.colors.sanctuarySaffron}
            colors={[refreshColor || Theme.colors.sanctuarySaffron]}
          />
        ) : null
      }
      masonry={masonry}
      numColumns={masonry ? numColumns : undefined}
    />
  );
}

export default SanctuaryFlashList;

import React, { useCallback } from 'react';
import { RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import EmptyState from './EmptyState';
import { BookOpen } from 'lucide-react-native';

export interface SanctuaryFlashListProps<T> extends Omit<FlashListProps<T>, 'refreshControl'> {
  /** Estimated size of a single list item (RECOGNIZED BY RECYCLER) */
  estimatedItemSize: number;
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
  ...props
}: SanctuaryFlashListProps<T>) {
  const colors = useThemedColors();

  const renderEmpty = useCallback(() => {
    if (emptyComponent) return emptyComponent;

    if (ListEmptyComponent) {
      if (React.isValidElement(ListEmptyComponent)) return ListEmptyComponent;
      const EmptyComp = ListEmptyComponent as any;
      return <EmptyComp />;
    }

    return (
      <EmptyState
        icon={BookOpen}
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
        ) : undefined
      }
    />
  );
}

export default SanctuaryFlashList;

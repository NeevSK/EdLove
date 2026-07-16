/**
 * Web implementation for SanctuaryFlashList.
 *
 * Sanctuary V3: Migrated to @shopify/flash-list v2.
 * FlashList v2 is a JS-only solution and officially supports React Native for Web.
 * This ensures identical performance behavior and component recycling across all platforms.
 */

import { BookOpen } from '@repo/ui/icons';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { RefreshControl } from '../primitives';
import { Theme } from '../theme/Theme';
import EmptyState from './EmptyState';
import type { SanctuaryFlashListProps } from './SanctuaryFlashList';

function SanctuaryFlashListWeb<T>({
  data,
  renderItem,

  estimatedItemSize, // Used in v2
  refreshing = false,
  onRefresh,
  emptyComponent,
  refreshColor,
  contentContainerStyle,
  ListEmptyComponent,
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
        icon={BookOpen as any}
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
      contentContainerStyle={[
        { paddingBottom: Theme.spacing.xl },
        contentContainerStyle as StyleProp<ViewStyle>,
      ]}
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
    />
  );
}

export default SanctuaryFlashListWeb;

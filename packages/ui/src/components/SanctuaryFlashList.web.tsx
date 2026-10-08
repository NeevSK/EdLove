import EmptyState from '@repo/ui/components/EmptyState';
import type { SanctuaryFlashListProps } from '@repo/ui/components/SanctuaryFlashList';
import { BookOpen } from '@repo/ui/icons';
import { RefreshControl } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { FlashListRef };

function SanctuaryFlashListWeb<T>({
  data,
  renderItem,
  refreshing = false,
  onRefresh,
  emptyComponent,
  refreshColor,
  contentContainerStyle,
  ListEmptyComponent,
  ref,
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
      ref={ref}
      {...(props as any)}
      data={data}
      renderItem={renderItem}
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

export const SanctuaryFlashList = SanctuaryFlashListWeb;
export default SanctuaryFlashListWeb;

/**
 * Web fallback for SanctuaryFlashList.
 *
 * @shopify/flash-list is optimised for native recycler views and does not have
 * reliable web support.  On web Metro resolves this .web.tsx file instead of
 * SanctuaryFlashList.tsx, swapping FlashList for React Native's built-in
 * FlatList which works correctly on all platforms.
 *
 * The public API (props) is kept identical so every call site compiles without
 * changes.
 */
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import EmptyState from './EmptyState';
import { BookOpen } from 'lucide-react-native';
import type { SanctuaryFlashListProps } from './SanctuaryFlashList';

function SanctuaryFlashListWeb<T>({
    data,
    renderItem,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    estimatedItemSize: _estimatedItemSize, // API compatibility only — FlatList doesn't require it
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
        <FlatList
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
                ) : undefined
            }
        />
    );
}

export default SanctuaryFlashListWeb;

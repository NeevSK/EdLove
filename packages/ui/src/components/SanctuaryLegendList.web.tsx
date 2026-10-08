/**
 * Web implementation for SanctuaryLegendList.
 *
 * Web has no hardware keyboard lift, so this renders a plain LegendList.
 * `@legendapp/list/react-native` resolves to the DOM build on web via its
 * package `browser` condition. Keyboard-aware props are accepted for a shared
 * interface and ignored.
 */

import { LegendList, type LegendListRef } from '@legendapp/list/react-native';
import EmptyState from '@repo/ui/components/EmptyState';
import type { SanctuaryLegendListProps } from '@repo/ui/components/SanctuaryLegendList';
import { useOptionalChatContext } from '@repo/ui/context/ChatContext';
import { BookOpen } from '@repo/ui/icons';
import { Theme } from '@repo/ui/theme/Theme';
import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export function SanctuaryLegendList<ItemT>({
  data,
  renderItem,
  keyboardLiftBehavior: _keyboardLiftBehavior,
  keyboardOffset: _keyboardOffset,
  anchoredEndSpace: _anchoredEndSpace,
  contentInsetEndAdjustment: _contentInsetEndAdjustment,
  initialScrollAtEnd = true,
  maintainScrollAtEnd,
  onRefresh,
  refreshing,
  emptyComponent,
  ListEmptyComponent,
  contentContainerStyle,
  ref,
  ...rest
}: SanctuaryLegendListProps<ItemT>) {
  const chat = useOptionalChatContext();

  const innerRef = useRef<LegendListRef>(null);

  useImperativeHandle(ref, () => innerRef.current as LegendListRef, []);

  useEffect(() => {
    if (!chat) return;
    chat.registerList(innerRef.current);
    return () => {
      chat.registerList(null);
    };
  }, [chat]);

  useEffect(() => {
    if (!chat || chat.eventId === 0) return;
    if (chat.consumeSkipNextScroll()) return;
    const target = chat.scrollIndexSV.value;
    if (Number.isFinite(target)) {
      innerRef.current?.scrollToIndex({ index: target, animated: true }).catch(() => undefined);
    }
  }, [chat, chat?.eventId]);

  const renderEmpty = useCallback(() => {
    if (emptyComponent) return emptyComponent;

    if (ListEmptyComponent) {
      if (React.isValidElement(ListEmptyComponent)) return ListEmptyComponent;
      const EmptyComp = ListEmptyComponent as React.ComponentType;
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
    <LegendList
      {...(rest as any)}
      data={data}
      renderItem={renderItem}
      initialScrollAtEnd={initialScrollAtEnd}
      maintainScrollAtEnd={maintainScrollAtEnd}
      ref={innerRef}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        { paddingBottom: Theme.spacing.xl },
        contentContainerStyle as StyleProp<ViewStyle>,
      ]}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

export type { LegendListRef };
export default SanctuaryLegendList;

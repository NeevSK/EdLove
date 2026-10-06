import { KeyboardAwareLegendList } from '@legendapp/list/keyboard';
import { LegendList, type LegendListProps, type LegendListRef } from '@legendapp/list/react-native';
import EmptyState from '@repo/ui/components/EmptyState';
import { useOptionalChatContext } from '@repo/ui/context/ChatContext';
import { BookOpen } from '@repo/ui/icons';
import { Theme } from '@repo/ui/theme/Theme';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

export type SanctuaryChatKeyboardLift = 'always' | 'whenAtEnd' | 'persistent' | 'never';

export interface SanctuaryAnchoredEndSpace {
  anchorIndex: number;
  anchorOffset?: number;
  anchorMaxSize?: number;
  onSizeChanged?: (size: number) => void;
  onReady?: (info: {
    anchorIndex: number | undefined;
    anchorKey: string | undefined;
    size: number;
  }) => void;
}

export interface SanctuaryLegendListProps<ItemT>
  extends Omit<
    LegendListProps<ItemT>,
    'refreshControl' | 'refScrollView' | 'renderScrollComponent'
  > {
  /**
   * Keyboard lift behavior. When provided, the list renders through
   * `KeyboardAwareLegendList` (keyboard-controller `KeyboardChatScrollView`).
   * - `'whenAtEnd'` — ChatGPT feel, ideal for AI chat.
   * - `'always'` — Telegram feel, ideal for community chat.
   */
  keyboardLiftBehavior?: SanctuaryChatKeyboardLift;
  /** Distance between the bottom of the screen and the list (e.g. above bottom tabs). */
  keyboardOffset?: number;
  /** AI streaming-reply anchor (trailing space under the anchored reply while it streams). */
  anchoredEndSpace?: SanctuaryAnchoredEndSpace;
  /**
   * Composer growth in px, drives the list bottom content inset. Defaults to the
   * `ChatProvider` value so a `ChatComposer` can grow the list without wiring.
   */
  contentInsetEndAdjustment?: SharedValue<number>;
  /** Optional empty state element; falls back to the Sanctuary default. */
  emptyComponent?: React.ReactElement;
  /** Style for the content container (appended to a Sanctuary bottom-padding default). */
  contentContainerStyle?: StyleProp<ViewStyle>;
}

function SanctuaryLegendListInner<ItemT>(
  {
    data,
    renderItem,
    keyboardLiftBehavior,
    keyboardOffset,
    anchoredEndSpace,
    contentInsetEndAdjustment: contentInsetProp,
    initialScrollAtEnd = true,
    maintainScrollAtEnd,
    onRefresh,
    refreshing,
    emptyComponent,
    ListEmptyComponent,
    contentContainerStyle,
    ...rest
  }: SanctuaryLegendListProps<ItemT>,
  forwardedRef: React.ForwardedRef<LegendListRef>,
) {
  const chat = useOptionalChatContext();
  const fallbackInset = useSharedValue(0);
  const contentInsetEndAdjustment =
    contentInsetProp ?? chat?.contentInsetEndAdjustment ?? fallbackInset;

  const innerRef = useRef<LegendListRef>(null);

  useImperativeHandle(forwardedRef, () => innerRef.current as LegendListRef, []);

  // Register the list so a co-located ChatComposer can report its growth.
  useEffect(() => {
    if (!chat) return;
    chat.registerList(innerRef.current, { keyboardAware: !!keyboardLiftBehavior });
    return () => {
      chat.registerList(null);
    };
  }, [chat, keyboardLiftBehavior]);

  // Programmatic scroll reaction — replaces per-screen scroll-to-end effects.
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

  const sharedProps = {
    data,
    renderItem,
    initialScrollAtEnd,
    maintainScrollAtEnd,
    ref: innerRef,
    ListEmptyComponent: renderEmpty,
    contentContainerStyle: [
      { paddingBottom: Theme.spacing.xl },
      contentContainerStyle as StyleProp<ViewStyle>,
    ],
    refreshing,
    onRefresh,
  };

  if (keyboardLiftBehavior) {
    return (
      <KeyboardAwareLegendList
        {...(sharedProps as any)}
        {...(rest as any)}
        keyboardLiftBehavior={keyboardLiftBehavior}
        keyboardOffset={keyboardOffset}
        anchoredEndSpace={anchoredEndSpace}
        contentInsetEndAdjustment={contentInsetEndAdjustment}
      />
    );
  }

  return <LegendList {...(sharedProps as any)} {...(rest as any)} />;
}

export type { LegendListRef };

export const SanctuaryLegendList = forwardRef(SanctuaryLegendListInner) as <ItemT = any>(
  props: SanctuaryLegendListProps<ItemT> & { ref?: React.Ref<LegendListRef> | undefined },
) => React.ReactElement | null;

export default SanctuaryLegendList;

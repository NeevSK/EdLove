import type { LegendListRef } from '@legendapp/list/react-native';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

export interface ChatScrollOptions {
  /**
   * When true, the next programmatic scroll request is recorded but the chat
   * list skips performing it (used when the scroll was already handled by the
   * consumer, e.g. a user-initiated tap that jumps to the latest message).
   */
  skipNextScroll?: boolean;
}

export interface ChatContextValue {
  /** Monotonic counter bumped by every scroll request; the chat list reacts to changes. */
  eventId: number;
  /**
   * Target list index for the pending scroll (write access is owned by the
   * provider; the list only reads `.value`).
   */
  scrollIndexSV: SharedValue<number>;
  /** Composer height in px; drives the chat list bottom content inset (growing composer). */
  contentInsetEndAdjustment: SharedValue<number>;
  /** Register the active chat list (with whether it is keyboard-aware). */
  registerList: (list: LegendListRef | null, options?: { keyboardAware?: boolean }) => void;
  /** Request a programmatic scroll to `index`; the list performs it on `eventId` change. */
  scrollToIndex: (index: number, options?: ChatScrollOptions) => void;
  /** Report the composer height so the list bottom inset tracks the growing composer. */
  syncComposerHeight: (height: number) => void;
  /** Consume the skip-next-scroll flag; returns true if the last request was a skip. */
  consumeSkipNextScroll: () => boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

/**
 * ChatProvider — coordinates the chat scroll layer for a single chat screen.
 *
 * Owns every mutable scroll primitive (`scrollIndexSV`, `skipNextScroll`,
 * `listRef`, `contentInsetEndAdjustment`) and exposes only stable callbacks, so
 * the shared list/composer foundation replaces per-screen inverted-list
 * scroll-to-end `useEffect` plumbing without leaking mutable refs to consumers.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const scrollIndexSV = useSharedValue(0);
  const contentInsetEndAdjustment = useSharedValue(0);

  // All mutations flow through this stable ref handle so the React compiler's
  // immutability rules are satisfied (refs are the sanctioned escape hatch).
  const stateRef = useRef<{
    scrollIndexSV: SharedValue<number>;
    contentInsetEndAdjustment: SharedValue<number>;
    listRef: LegendListRef | null;
    listKeyboardAware: boolean;
    skipNextScroll: boolean;
  }>({
    scrollIndexSV,
    contentInsetEndAdjustment,
    listRef: null,
    listKeyboardAware: false,
    skipNextScroll: false,
  });

  const [eventId, setEventId] = useState(0);

  const registerList = useCallback(
    (list: LegendListRef | null, options?: { keyboardAware?: boolean }) => {
      stateRef.current.listRef = list;
      stateRef.current.listKeyboardAware = options?.keyboardAware ?? false;
      if (list && !stateRef.current.listKeyboardAware) {
        list.reportContentInset?.({ bottom: stateRef.current.contentInsetEndAdjustment.value });
      }
    },
    [],
  );

  const syncComposerHeight = useCallback((height: number) => {
    stateRef.current.contentInsetEndAdjustment.value = height;
    if (stateRef.current.listRef && !stateRef.current.listKeyboardAware) {
      stateRef.current.listRef.reportContentInset?.({ bottom: height });
    }
  }, []);

  const scrollToIndex = useCallback((index: number, options?: ChatScrollOptions) => {
    stateRef.current.scrollIndexSV.value = index;
    if (options?.skipNextScroll) {
      stateRef.current.skipNextScroll = true;
    }
    setEventId((prev) => prev + 1);
  }, []);

  const consumeSkipNextScroll = useCallback(() => {
    if (stateRef.current.skipNextScroll) {
      stateRef.current.skipNextScroll = false;
      return true;
    }
    return false;
  }, []);

  const value = useMemo(
    () => ({
      eventId,
      scrollIndexSV,
      contentInsetEndAdjustment,
      registerList,
      scrollToIndex,
      syncComposerHeight,
      consumeSkipNextScroll,
    }),
    [
      eventId,
      scrollIndexSV,
      contentInsetEndAdjustment,
      registerList,
      scrollToIndex,
      syncComposerHeight,
      consumeSkipNextScroll,
    ],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

/** Non-throwing variant for shared components that also work standalone. */
export function useOptionalChatContext(): ChatContextValue | undefined {
  return useContext(ChatContext);
}

/**
 * Returns the chat scroll request function for the nearest chat list.
 * The list performs the scroll when `eventId` changes; pass `skipNextScroll`
 * when the scroll was already performed so the list ignores the request.
 */
export function useChatScrollToIndex() {
  return useChatContext().scrollToIndex;
}

/**
 * What a room's scrolling page passes to its ScrollView: reading down tucks the chrome away (the
 * header shrinks to one line, the rooms bar and the floating action slide off), reading up or
 * reaching the top brings it back, and the floor's life pauses while the page moves.
 */

import { useCallback } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useScrollChromeCollapser } from '../../../hooks/useScrollChromeCollapser';
import { useStageScroll } from '../Stage/StageContext';

export function useRoomScroll() {
  const chrome = useScrollChromeCollapser();
  const stage = useStageScroll();
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => chrome.onScroll(e),
    [chrome.onScroll],
  );
  return {
    onScroll,
    scrollEventThrottle: 32,
    onScrollBeginDrag: stage.onScrollBeginDrag,
    onScrollEndDrag: stage.onScrollEndDrag,
    onMomentumScrollEnd: stage.onMomentumScrollEnd,
  };
}

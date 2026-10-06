import React, { forwardRef } from 'react';
import {
  KeyboardChatScrollView,
  type KeyboardChatScrollViewProps,
} from 'react-native-keyboard-controller';
import Reanimated from 'react-native-reanimated';

export type { KeyboardChatScrollViewProps } from 'react-native-keyboard-controller';

/**
 * SanctuaryChatScrollView — the shared keyboard layer for chat surfaces.
 *
 * Wraps `react-native-keyboard-controller`'s `KeyboardChatScrollView` so chat
 * screens use it in place of raw `KeyboardAvoidingView`:
 * - `keyboardLiftBehavior="whenAtEnd"` for AI/ChatGPT feel,
 *   `"always"` (default) for community chat.
 * - `extraContentPadding` drives the bottom inset as the composer grows.
 * - `blankSpace` reserves a streaming-reply anchor under the newest message.
 */
export interface SanctuaryChatScrollViewProps extends KeyboardChatScrollViewProps {
  /** @default 'always' */
  keyboardLiftBehavior?: KeyboardChatScrollViewProps['keyboardLiftBehavior'];
}

function SanctuaryChatScrollViewInner(
  { keyboardLiftBehavior = 'always', ...props }: SanctuaryChatScrollViewProps,
  ref: React.ForwardedRef<React.ComponentRef<typeof Reanimated.ScrollView>>,
) {
  return (
    <KeyboardChatScrollView ref={ref} keyboardLiftBehavior={keyboardLiftBehavior} {...props} />
  );
}

export const SanctuaryChatScrollView = forwardRef(SanctuaryChatScrollViewInner);

export default SanctuaryChatScrollView;

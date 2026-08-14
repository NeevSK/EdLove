import { useOptionalChatContext } from '@repo/ui/context/ChatContext';
import { BrandPulse } from './BrandPulse';
import { Image as ImageIcon, Send } from '@repo/ui/icons';
import { Box, HStack, Icon, InputField, Pressable } from '@repo/ui/primitives';
import React, { useCallback } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

export interface ChatComposerProps {
  /** Current draft text. */
  value: string;
  onChangeText: (text: string) => void;
  /** Called when the send button is pressed. */
  onSend: () => void;
  placeholder?: string;
  /** Whether a send is in flight (shows a spinner). */
  isSending?: boolean;
  disabled?: boolean;
  maxLength?: number;
  /** Growing composer min/max heights. */
  minHeight?: number;
  maxHeight?: number;
  /** Optional attachment slot. When `onPressAttachment` is set, a default attachment button renders. */
  onPressAttachment?: () => void;
  isAttachmentActive?: boolean;
  /** Escape hatch to fully replace the default attachment button. */
  renderAttachment?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * ChatComposer — shared grow/shrink multiline composer for AI + community chat.
 *
 * Measures its own height and reports it to the co-located chat list via
 * `ChatProvider` (`contentInsetEndAdjustment` + `reportContentInset`) so the
 * newest message stays visible as the input grows. The keyboard lift itself is
 * handled by the list's keyboard layer, not here.
 */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  placeholder,
  isSending = false,
  disabled = false,
  maxLength = 500,
  minHeight = 44,
  maxHeight = 140,
  onPressAttachment,
  isAttachmentActive = false,
  renderAttachment,
  containerStyle,
  accessibilityLabel = 'Message input',
}: ChatComposerProps) {
  const chat = useOptionalChatContext();

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!chat) return;
      const { height } = event.nativeEvent.layout;
      chat.syncComposerHeight(height);
    },
    [chat],
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <Box
      onLayout={handleLayout}
      className="bg-phase-surface border-t border-border px-4 py-3 shadow-sm"
      style={containerStyle}
    >
      <HStack className="gap-3 items-end">
        {renderAttachment ??
          (onPressAttachment ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add attachment"
              accessibilityHint="Opens the attachment picker"
              onPress={onPressAttachment}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                isAttachmentActive ? 'bg-phase-interactive' : 'bg-phase-canvas'
              }`}
            >
              <Icon
                as={ImageIcon}
                size="sm"
                className={isAttachmentActive ? 'text-inverted' : 'text-ink/40'}
              />
            </Pressable>
          ) : null)}

        <Box className="flex-1 bg-phase-canvas border border-border rounded-[20px] px-1 py-1">
          <InputField
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={placeholder ?? 'Type your message'}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline
            maxLength={maxLength}
            style={{ minHeight, maxHeight }}
            className="px-4 py-2.5 text-base text-ink font-medium"
            returnKeyType="default"
          />
        </Box>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityHint={isSending ? 'Sending your message' : 'Sends your message'}
          onPress={onSend}
          disabled={!canSend || isSending}
          className={`w-12 h-12 rounded-full items-center justify-center shadow-lg transition-all ${
            canSend ? 'bg-phase-interactive active:scale-95' : 'bg-ink/5'
          }`}
        >
          {isSending ? (
            <BrandPulse size={18} tintColor="#FFFFFF" />
          ) : (
            <Icon as={Send} size="sm" className={canSend ? 'text-white' : 'text-ink/20'} />
          )}
        </Pressable>
      </HStack>
    </Box>
  );
}

export default ChatComposer;

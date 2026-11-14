import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { proseMarkdownStyle } from './native/Media/EnrichedMarkdownAdapter';
import { useWorldContext } from '../theme/native/WorldContext';

export type MessageBubbleVariant = 'user' | 'assistant' | 'group';

export interface MessageBubbleProps {
  /**
   * Markdown source string rendered by `react-native-enriched-markdown`.
   * Resizes the lib's `browser` field routes web to the WASM build
   * (`lib/module/index.web.js`); native resolves `main`/`module`.
   */
  content: string;
  /**
   * Bubble styling:
   * - `'user'` — accent bubble, aligned to the end (AI assistant, own message).
   * - `'assistant'` — surface bubble, aligned to the start.
   * - `'group'` — community message; alignment + author row driven by `isOwn`.
   */
  variant?: MessageBubbleVariant;
  /** For `'group'`: whether this is the current user's own message. */
  isOwn?: boolean;
  authorName?: string;
  timestamp?: string;
  /** Optional avatar rendered for others in `'group'` bubbles. */
  renderAvatar?: React.ReactNode;
  onPressAuthor?: () => void;
  /** Max width class for the bubble. @default 'max-w-[75%]' */
  maxWidthClassName?: string;
  bubbleClassName?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  /** Optional callback when a fenced code block is tapped (e.g. to open in Artifact Canvas). */
  onCodeBlockPress?: (code: string, language?: string) => void;
}

function MessageBubbleInner({
  content,
  variant = 'assistant',
  isOwn = false,
  authorName,
  timestamp,
  renderAvatar,
  onPressAuthor,
  maxWidthClassName = 'max-w-[75%]',
  bubbleClassName,
  style,
  onCodeBlockPress,
}: MessageBubbleProps) {
  const isUser = variant === 'user' || (variant === 'group' && isOwn);
  const alignEnd = isUser;
  const showAuthorRow = variant === 'group' && !isOwn && authorName;
  // Text and bubble share one source: the lamp for the person's own words, raised paper otherwise.
  const { world, language } = useWorldContext();
  const bubblePaint = isUser
    ? { backgroundColor: world.tokens.lamp, borderColor: world.tokens.lamp }
    : { backgroundColor: world.tokens.raised, borderColor: world.tokens.line };

  return (
    <HStack className={`${alignEnd ? 'justify-end' : 'justify-start'} mb-4 px-5`} style={style}>
      {!alignEnd && renderAvatar ? <Box className="mr-3">{renderAvatar}</Box> : null}

      <VStack className={`${maxWidthClassName} gap-1 ${alignEnd ? 'items-end' : 'items-start'}`}>
        {showAuthorRow && (
          <Text
            className="text-[10px] font-black uppercase tracking-widest text-ink/40 ml-1"
            onPress={onPressAuthor}
          >
            {authorName}
          </Text>
        )}
        <Box
          className={`px-4 py-3 rounded-2xl border ${
            isUser
              ? 'bg-phase-interactive border-phase-interactive rounded-tr-sm'
              : 'bg-phase-surface border-border rounded-tl-sm'
          } ${bubbleClassName ?? ''}`}
          style={bubblePaint}
        >
          <EnrichedMarkdownText
            markdown={content}
            selectable
            flavor="github"
            streamingAnimation={!isUser}
            streamingConfig={{
              tableMode: 'progressive',
              codeBlockMode: 'progressive',
            }}
            md4cFlags={{
              latexMath: true,
              admonitions: true,
            }}
            onCodeBlockPress={
              onCodeBlockPress
                ? (event) => {
                    const payload = (event as { nativeEvent?: { code?: string; language?: string } })
                      ?.nativeEvent;
                    if (payload?.code) {
                      onCodeBlockPress(payload.code, payload.language);
                    }
                  }
                : undefined
            }
            markdownStyle={proseMarkdownStyle(world.recipes.prose[isUser ? 'lamp' : 'ground'], world, language)}
          />
        </Box>
        {timestamp ? (
          <Text className="text-[9px] font-bold text-ink/20 px-1">{timestamp}</Text>
        ) : null}
      </VStack>
    </HStack>
  );
}

export const MessageBubble = React.memo(MessageBubbleInner);

export default MessageBubble;

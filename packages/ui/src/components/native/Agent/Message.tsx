import { LegendList } from '@legendapp/list/react-native';
import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import type { MessageBubbleContract, MessageListContract } from '../../../theme/contracts';
import { edgeStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { AGENT_ENGLISH, shouldAnnounce } from '../../shared/agent';
import { Button } from '../Button/Button';
import { FileCard } from '../Media/FileCard';
import { Markdown } from '../Media/Markdown';
import { EmptyState } from '../States/States';

export interface MessageBubbleProps extends MessageBubbleContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * One message. The person's own words sit on the world's lamp, replies on
 * raised paper; the corner nearest the author is tucked. A streaming reply is
 * marked busy and is announced once, when it completes.
 */
export function MessageBubble({
  author,
  content,
  state = 'complete',
  authorName,
  time,
  attachments,
  onOpenAttachment,
  onRetry,
  labels,
  style,
}: MessageBubbleProps) {
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  const m = world.recipes.message;
  const own = author === 'self';
  const paint = own ? m.self : m.other;
  const who = own ? l.you : author === 'assistant' ? l.assistant : (authorName ?? '');

  const previous = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (shouldAnnounce(previous.current, state)) {
      AccessibilityInfo.announceForAccessibility(`${who}: ${content}`);
    }
    previous.current = state;
  }, [state, who, content]);

  const meta = [author === 'other' ? authorName : undefined, time].filter(Boolean).join(' · ');
  const interrupted = state === 'stopped' || state === 'failed';

  return (
    <View style={[styles.row, { alignItems: own ? 'flex-end' : 'flex-start' }, style]}>
      <View
        accessibilityLabel={who}
        accessibilityState={{ busy: state === 'streaming' }}
        style={[
          styles.bubble,
          {
            backgroundColor: paint.fill,
            borderRadius: m.radius,
            paddingHorizontal: m.padding.x,
            paddingVertical: m.padding.y,
            gap: gapFor('inside'),
          },
          own ? { borderTopRightRadius: m.tucked } : { borderTopLeftRadius: m.tucked },
          edgeStyle(paint.edge),
        ]}
      >
        {content ? <Markdown source={content} tone={own ? 'lamp' : 'ground'} /> : null}
        {attachments?.map((file) => (
          <FileCard
            key={file.uri}
            file={file}
            onOpen={onOpenAttachment ? () => onOpenAttachment(file) : undefined}
          />
        ))}
      </View>
      {interrupted ? (
        <View style={styles.interrupted}>
          <RNText
            accessibilityRole="alert"
            style={[
              typeStyle(m.meta, language, world),
              state === 'failed' ? { color: world.recipes.message.state.failed } : null,
            ]}
          >
            {state === 'failed' ? l.failed : l.stopped}
          </RNText>
          {onRetry ? <Button label={l.retry} variant="quiet" size="sm" onPress={onRetry} /> : null}
        </View>
      ) : null}
      {meta ? <RNText style={typeStyle(m.meta, language, world)}>{meta}</RNText> : null}
    </View>
  );
}

export interface MessageListProps<T> extends MessageListContract<T> {
  style?: StyleProp<ViewStyle>;
}

/**
 * A conversation, on Legend List (the same engine and props on web): starts
 * at the latest message, stays pinned to the end only while the person is
 * there, keeps their place when older messages load at the top, and sits
 * short conversations at the bottom like any chat.
 */
export function MessageList<T>({
  items,
  keyOf,
  renderItem,
  label,
  empty,
  onStartReached,
  style,
}: MessageListProps<T>) {
  if (items.length === 0 && empty) return <EmptyState {...empty} />;
  return (
    <LegendList
      data={items}
      keyExtractor={(item) => keyOf(item)}
      renderItem={({ item, index }) => <View role="listitem">{renderItem(item, index)}</View>}
      estimatedItemSize={88}
      alignItemsAtEnd
      initialScrollAtEnd
      maintainScrollAtEnd
      maintainScrollAtEndThreshold={0.15}
      maintainVisibleContentPosition
      onStartReached={onStartReached}
      onStartReachedThreshold={0.5}
      role="list"
      aria-label={label}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 4, paddingHorizontal: 16, paddingVertical: 6 },
  bubble: { maxWidth: '86%' },
  interrupted: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

'use client';

import { LegendList } from '@legendapp/list/react';
import { useEffect, useRef, useState } from 'react';
import type { MessageBubbleContract, MessageListContract } from '../../../theme/contracts';
import { AGENT_ENGLISH, shouldAnnounce } from '../../shared/agent';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { FileCard } from '../Media/FileCard';
import { Markdown } from '../Media/Markdown';
import { EmptyState } from '../States/States';

export interface MessageBubbleProps extends MessageBubbleContract {
  className?: string;
}

/**
 * One message. Own words on the world's lamp, replies on raised paper. While
 * it streams it is marked busy; a polite live region says it once, complete.
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
  className,
}: MessageBubbleProps) {
  const l = { ...AGENT_ENGLISH, ...labels };
  const own = author === 'self';
  const who = own ? l.you : author === 'assistant' ? l.assistant : (authorName ?? '');
  const previous = useRef<string | undefined>(undefined);
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    if (shouldAnnounce(previous.current, state)) setSpoken(`${who}: ${content}`);
    previous.current = state;
  }, [state, who, content]);
  const meta = [author === 'other' ? authorName : undefined, time].filter(Boolean).join(' · ');
  const interrupted = state === 'stopped' || state === 'failed';
  return (
    <div className={cx('gd-message', className)} data-author={author}>
      <div
        className="gd-message-bubble"
        role="group"
        aria-label={who}
        aria-busy={state === 'streaming' || undefined}
      >
        {content ? <Markdown source={content} tone={own ? 'lamp' : 'ground'} /> : null}
        {attachments?.map((file) => (
          <FileCard
            key={file.uri}
            file={file}
            onOpen={onOpenAttachment ? () => onOpenAttachment(file) : undefined}
          />
        ))}
      </div>
      {interrupted ? (
        <div className="gd-message-interrupted" data-state={state}>
          <p role="alert">{state === 'failed' ? l.failed : l.stopped}</p>
          {onRetry ? <Button label={l.retry} variant="quiet" size="sm" onClick={onRetry} /> : null}
        </div>
      ) : null}
      {meta ? <p className="gd-message-meta">{meta}</p> : null}
      <p className="gd-visually-hidden" aria-live="polite">
        {spoken}
      </p>
    </div>
  );
}

export interface MessageListProps<T> extends MessageListContract<T> {
  className?: string;
}

/**
 * A conversation on Legend List (the same engine and props as native):
 * starts at the end, follows new messages only while the person is there,
 * keeps their place when older ones load, and sits short chats at the bottom.
 * Give it a height (it is its own scroller).
 */
export function MessageList<T>({
  items,
  keyOf,
  renderItem,
  label,
  empty,
  onStartReached,
  className,
}: MessageListProps<T>) {
  if (items.length === 0 && empty) return <EmptyState {...empty} />;
  return (
    <LegendList
      data={items}
      keyExtractor={(item) => keyOf(item)}
      renderItem={({ item, index }) => <div role="listitem">{renderItem(item, index)}</div>}
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
      className={cx('gd-message-list', className)}
    />
  );
}

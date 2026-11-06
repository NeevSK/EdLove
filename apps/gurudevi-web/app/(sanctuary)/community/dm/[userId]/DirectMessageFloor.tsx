'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { getExploreCapacityMeta, isExploreCapacity } from '@/lib/explore/exploreCapacity';
import { type ChatMessage, useCommunityChat } from '@/lib/hooks/useCommunityChat';
import {
  ApprovalCard,
  Composer,
  Inline,
  MessageBubble,
  MessageList,
  Stack,
  Surface,
  Text,
  ThinkingTrace,
} from '@repo/ui/components/web';
import styles from './dm.module.css';

interface DirectMessageFloorProps {
  targetUserId: string;
  displayName: string;
  capacity?: string;
}

export function DirectMessageFloor({
  targetUserId,
  displayName,
  capacity,
}: Readonly<DirectMessageFloorProps>) {
  const isTutii = targetUserId.toLowerCase() === 'tutii';
  const threadId = `dm-${targetUserId}`;
  const { messages, sendMessage, isOffline, pendingCount } = useCommunityChat(
    threadId,
    displayName,
  );
  const roleLabel = capacity && isExploreCapacity(capacity)
    ? getExploreCapacityMeta(capacity).label
    : null;
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetName = isTutii
    ? 'Tutii Companion (AI Mentor)'
    : targetUserId === 'anoma'
      ? 'Mrs. Anoma Ratnayake (Educator)'
      : `Member (${targetUserId})`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend ?? draft).trim();
    if (!content) return;

    setDraft('');
    try {
      await sendMessage(content);

      // If messaging Tutii, trigger responsive companion turn
      if (isTutii) {
        setIsStreaming(true);
        setTimeout(async () => {
          await sendMessage(
            `I received your reflection: "${content}".\n\nAs your sanctuary academic companion, I am reviewing your notes and lesson plans. What aspect would you like to explore deeper?`,

          );
          setIsStreaming(false);
        }, 800);
      }
    } catch {
      setDraft(content);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.dmHeader}>
        <div className={styles.headerInfo}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/community"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Community
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isTutii ? <span aria-hidden="true" style={{ fontSize: "1.2rem" }}>?</span> : null}
            <h1 style={{ margin: 0 }}>{targetName}</h1>
          </div>
          <p>
            {isTutii
              ? 'Sanctuary Academic & Wellbeing Companion � Pluggable Provider Stream'
              : 'Direct pedagogical channel � End-to-end encrypted session'}
            {roleLabel ? <span className={styles.roleTag}> � Your role: {roleLabel}</span> : null}
          </p>
        </div>
      </header>

      {/* Message List Stage */}
      <div className={styles.messageList}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.messageRow} ${m.isSelf ? styles.messageRowSelf : ''}`}
          >
            <div className={styles.avatar}>{isTutii && !m.isSelf ? '?' : m.senderInitials}</div>
            <div className={`${styles.messageBubble} ${m.isSelf ? styles.messageBubbleSelf : ''}`}>
              <span className={styles.authorName}>
                {m.isSelf ? 'You' : m.senderName}
                {m.isSelf && roleLabel ? <span className={styles.roleTag}> � {roleLabel}</span> : null}
              </span>
              <p className={styles.messageText}>{m.text}</p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginTop: '0.2rem',
                }}
              >
                <span className={styles.messageTime}>{m.time}</span>
                {m.status === 'pending_sync' && (
                  <span style={{ fontSize: '0.7rem', color: '#a85022', fontStyle: 'italic' }}>
                    ? Queued offline
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isStreaming ? (
          <div className={styles.messageRow}>
            <div className={styles.avatar}>?</div>
            <div className={styles.messageBubble}>
              <span className={styles.authorName}>Tutii Companion</span>
              <ThinkingTrace content="Reflecting on your pedagogy notes..." state="thinking" />
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Composer Field */}
      <div style={{ padding: '0.5rem 1rem 1rem 1rem' }}>
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={() => void handleSend(draft)}
          placeholder={
            isTutii
              ? 'Message Tutii... (ask for lesson ideas, reflections, or guidance)'
              : 'Send a private message... (Enter to send)'
          }
          label="Direct message input"
          busy={isStreaming}
          onStop={() => setIsStreaming(false)}
          maxLength={3000}
        />
      </div>
    </div>
  );
}

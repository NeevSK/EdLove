'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { getExploreCapacityMeta, isExploreCapacity } from '@/lib/explore/exploreCapacity';
import { type ChatMessage, useCommunityChat } from '@/lib/repositories/communityChatRepository';
import styles from './chat.module.css';

interface GroupChatFloorProps {
  groupId: string;
  displayName: string;
  capacity?: string;
}

export function GroupChatFloor({ groupId, displayName, capacity }: Readonly<GroupChatFloorProps>) {
  const { messages, sendMessage, isOffline, pendingCount } = useCommunityChat(groupId, displayName);
  const roleLabel = capacity && isExploreCapacity(capacity)
    ? getExploreCapacityMeta(capacity).label
    : null;
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const groupTitle =
    groupId === 'class-10a' ? 'Grade 10-A Sanctuary Circle' : `Discussion Circle (${groupId})`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    const content = draft;
    setDraft('');
    try {
      await sendMessage(content);
    } catch {
      setDraft(content);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.chatHeader}>
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
          <h1>{groupTitle}</h1>
          <p>
            Real-time pedagogical channel • 34 participants online
            {roleLabel ? <span className={styles.roleTag}> · Your role: {roleLabel}</span> : null}
          </p>
        </div>
      </header>

      <div className={styles.messageList}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.messageRow} ${m.isSelf ? styles.messageRowSelf : ''}`}
          >
            <div className={styles.avatar}>{m.senderInitials}</div>
            <div className={`${styles.messageBubble} ${m.isSelf ? styles.messageBubbleSelf : ''}`}>
              <span className={styles.authorName}>
                {m.isSelf ? 'You' : m.senderName}
                {m.isSelf && roleLabel ? <span className={styles.roleTag}> · {roleLabel}</span> : null}
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
                    ⏳ Queued offline
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className={styles.composeBar}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Share a thoughtful message with the circle... (Enter to send)"
          className={styles.inputField}
          rows={1}
        />
        <button type="submit" className={styles.sendButton} aria-label="Send message">
          Send
        </button>
      </form>
    </div>
  );
}

'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { type ChatMessage, useCommunityChat } from '@/lib/repositories/communityChatRepository';
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
  const threadId = `dm-${targetUserId}`;
  const { messages, sendMessage, isOffline, pendingCount } = useCommunityChat(
    threadId,
    displayName,
  );
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetName =
    targetUserId === 'anoma' ? 'Mrs. Anoma Ratnayake (Educator)' : `Member (${targetUserId})`;

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
          <h1>{targetName}</h1>
          <p>Direct pedagogical channel • End-to-end encrypted session</p>
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
              <span className={styles.authorName}>{m.isSelf ? 'You' : m.senderName}</span>
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
          placeholder="Send a private message... (Enter to send)"
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

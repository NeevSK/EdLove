/**
 * DirectMessageScreen.web.tsx \u2014 Pattern A: full web replacement
 *
 * The native DirectMessageScreen wraps BaseChatScreen which uses RN FlatList,
 * TextInput, and KeyboardAvoidingView.  On web Metro resolves this file instead.
 *
 * Identical chat UX to GroupChatScreen.web.tsx but wired to the DM data sources:
 *  - communityAPI.getDirectMessages(conversationId)
 *  - communityAPI.sendDirectMessage(conversationId, content)
 *  - Supabase subscription on 'direct_messages' table
 */

import { socialAPI } from '@repo/core/api';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { useStore, useTemporalStore } from '@repo/core/logic';

import { formatTimestamp } from '@repo/ui/utils/dateTimeUtils';
import { safeBack } from '@repo/ui/utils/navigation';
import { getInitialsFromName } from '@repo/ui/utils/stringUtils';
import { router, useLocalSearchParams } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { communityAPI } from '@repo/community/api/community';
import HeaderMoreMenu from '@repo/community/components/HeaderMoreMenu';

interface ChatMessage {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: { full_name?: string | null; avatar_url?: string | null } | null;
}

export default function DirectMessageScreen() {
  const params = useLocalSearchParams<{ conversationId?: string; userName?: string }>();
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const userName = Array.isArray(params.userName) ? params.userName[0] : params.userName;
  const { user } = useStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | undefined>();
  const [isBlocked, setIsBlocked] = useState(false);
  const { viewDate, viewScale, isPastView } = useTemporalStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }, 60);
  }, []);

  // \u2500\u2500 Initial load \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  useEffect(() => {
    async function fetchContext() {
      try {
        const msgs = (await communityAPI.getDirectMessages(
          conversationId,
          60,
          viewDate,
          viewScale,
        )) as ChatMessage[];
        setMessages(msgs);

        const { data: convData } = await supabase
          .from('direct_conversations')
          .select('user1_id, user2_id')
          .eq('id', conversationId)
          .single();

        if (convData && user) {
          const otherId = convData.user1_id === user.id ? convData.user2_id : convData.user1_id;
          setTargetUserId(otherId);

          const blocked = await socialAPI.isBlockingActive(otherId);
          setIsBlocked(blocked);
        }
      } catch (e: any) {
        console.error('[DirectMessage] load error', e);
      } finally {
        setLoading(false);
      }
    }
    void fetchContext();
  }, [conversationId, user, viewDate, viewScale]);

  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading, scrollToBottom]);

  // \u2500\u2500 Real-time subscription \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  useEffect(() => {
    const channel = supabase
      .channel(`dm_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const handlePayload = async () => {
            const { data } = await supabase
              .from('direct_messages')
              .select('*, author:users!direct_messages_sender_id_fkey(full_name, avatar_url)')
              .eq('id', payload.new.id)
              .single();
            if (!data) return;
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data as ChatMessage];
            });
            scrollToBottom();
          };
          void handlePayload();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, scrollToBottom]);

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || !user || isPastView) return;
    setSending(true);
    setDraft('');

    // eslint-disable-next-line no-restricted-syntax
    const optimisticId = `opt_${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      author_id: user.id,
      content,
      created_at: new Date().toISOString(),
      author: {
        full_name: user.full_name || 'You',
        avatar_url: user.avatar_url,
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      const real = (await communityAPI.sendDirectMessage(conversationId, content)) as ChatMessage;
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? real : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(content);
    } finally {
      setSending(false);
    }
  }, [draft, user, conversationId, isPastView, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--background)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface)',
        }}
      >
        <button
          type="button"
          onClick={() => safeBack('/community')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ink-ghost)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-body)',
            padding: '4px 8px',
            borderRadius: '8px',
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink)' }}>{userName}</div>
          <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Private Message</div>
        </div>
        <HeaderMoreMenu
          conversationId={conversationId}
          targetUserId={targetUserId}
          targetUserName={userName}
        />
      </div>

      {/* Message list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 24px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {loading ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-ghost)',
              fontSize: '14px',
            }}
          >
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-ghost)',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '32px' }}>✉️</div>
            <div style={{ fontSize: '14px' }}>Start a private conversation with {userName}.</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.author_id === user?.id;
            const authorName = msg.author?.full_name || userName;
            const initials = getInitialsFromName(authorName);
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: isOwn ? 'var(--sanctuary-saffron)' : 'var(--water)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'white',
                    overflow: 'hidden',
                  }}
                >
                  {msg.author?.avatar_url ? (
                    <img
                      src={msg.author.avatar_url}
                      alt={authorName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '72%',
                    gap: '2px',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomRightRadius: isOwn ? '4px' : '16px',
                      borderBottomLeftRadius: isOwn ? '16px' : '4px',
                      background: isOwn ? 'var(--sanctuary-saffron)' : 'var(--background-alt)',
                      border: isOwn ? 'none' : '1px solid var(--border-light)',
                      color: isOwn ? '#FCF9F2' : 'var(--ink)',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>
                    {formatTimestamp(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose bar */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          padding: '12px 24px',
          background: 'var(--surface)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        {isPastView ? (
          <div
            style={{
              flex: 1,
              padding: '12px',
              textAlign: 'center',
              color: 'var(--ink-ghost)',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            Viewing historical sanctuary records.
          </div>
        ) : isBlocked ? (
          <div
            style={{
              flex: 1,
              padding: '12px',
              textAlign: 'center',
              color: 'var(--ink-ghost)',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            This conversation is currently paused. {userName} or you have restricted interactions.
          </div>
        ) : (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${userName}... (Enter to send, Shift+Enter for new line)`}
              rows={1}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border)',
                background: 'var(--background-alt)',
                color: 'var(--ink)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.5',
                outline: 'none',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '120px',
                overflow: 'auto',
              }}
            />
            <button
              type="button"
              onClick={() => {
                void handleSend();
              }}
              disabled={!draft.trim() || sending}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                background: draft.trim() ? 'var(--sanctuary-saffron)' : 'var(--border)',
                border: 'none',
                cursor: draft.trim() ? 'pointer' : 'default',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              {sending ? '...' : '➤'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

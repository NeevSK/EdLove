/**
 * GroupChatScreen.web.tsx — Pattern A: full web replacement
 *
 * The native GroupChatScreen wraps BaseChatScreen which uses RN FlatList,
 * TextInput, and KeyboardAvoidingView — none of which produce a great web
 * experience.  On web Metro resolves this file instead.
 *
 * We implement the same real-time chat using:
 *  - A CSS-scrollable <div> message list (no FlatList)
 *  - A plain <textarea> compose bar
 *  - Supabase postgres_changes subscription for instant messages
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '@repo/core';
import { supabase } from '@repo/core/native';
import { useStore, useTemporalStore } from '@repo/core/logic';;
import { formatTimestamp, getInitialsFromName } from '@repo/ui';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { communityAPI } from '../api/community';
import HeaderMoreMenu from '../components/HeaderMoreMenu';

interface ChatMessage {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: { full_name?: string | null; avatar_url?: string | null } | null;
}

type GroupChatRoute = {
  key: string;
  name: 'GroupChat';
  params: { groupId: string; groupName: string };
};

export default function GroupChatScreen() {
  const route = useRoute<GroupChatRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const { groupId, groupName } = route.params;
  const { user } = useStore();
  const { viewDate, viewScale, isPastView } = useTemporalStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 60);
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    communityAPI
      .getGroupMessages(groupId, 60, viewDate, viewScale)
      .then((data: any) => setMessages(data as ChatMessage[]))
      .catch((e: any) => console.error('[GroupChat] load error', e))
      .finally(() => setLoading(false));
  }, [groupId, viewDate, viewScale]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading, scrollToBottom]);

  // ── Real-time subscription ───────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`group_chat_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('group_messages')
            .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          if (!data) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data as ChatMessage];
          });
          scrollToBottom();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, scrollToBottom]);

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || !user || isPastView) return;
    setSending(true);
    setDraft('');

    const optimisticId = `opt_${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      author_id: user.id,
      content,
      created_at: new Date().toISOString(),
      author: { full_name: user.full_name || 'You', avatar_url: user.avatar_url },
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      const real = (await communityAPI.sendGroupMessage(groupId, content)) as ChatMessage;
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? real : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(content);
    } finally {
      setSending(false);
    }
  }, [draft, user, groupId, isPastView, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
          onClick={() => navigation.goBack()}
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
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink)' }}>
            {groupName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Group Chat</div>
        </div>
        <HeaderMoreMenu conversationId={groupId} groupId={groupId} targetUserName={groupName} />
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
            Loading messages…
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
            <div style={{ fontSize: '32px' }}>💬</div>
            <div style={{ fontSize: '14px' }}>No messages yet. Say hello 👋</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.author_id === user?.id;
            const authorName = msg.author?.full_name || 'Unknown';
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
                <button
                  onClick={() =>
                    !isOwn &&
                    navigation.navigate('PublicProfile', { id: msg.author_id, type: 'user' })
                  }
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: isOwn ? 'var(--sanctuary-saffron)' : 'var(--water)',
                    border: 'none',
                    cursor: isOwn ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'white',
                    overflow: 'hidden',
                    padding: 0,
                  }}
                >
                  {msg.author?.avatar_url ? (
                    <img
                      src={msg.author.avatar_url}
                      alt={authorName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </button>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '72%',
                    gap: '2px',
                  }}
                >
                  {!isOwn && (
                    <span
                      style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginLeft: '2px' }}
                    >
                      {authorName}
                    </span>
                  )}
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
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isPastView
              ? 'Viewing historical group chat records.'
              : 'Write a message… (Enter to send, Shift+Enter for new line)'
          }
          rows={1}
          disabled={isPastView}
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
          onClick={handleSend}
          disabled={isPastView || !draft.trim() || sending}
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
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  );
}

/**
 * AIAssistantScreen.web.tsx \u2014 Web override for the AI Assistant
 *
 * Replaces the native screen which uses FlatList + TextInput + KeyboardAvoidingView.
 * On web, Metro resolves this file.
 *
 * Features:
 *  - CSS-based scrollable message list (no FlatList)
 *  - <textarea> compose bar with Enter-to-send / Shift+Enter for newline
 *  - Calls the real ai-assistant edge function via useAIAgent hook
 *  - Shows active gaps as clickable prompts
 *  - Responsive two-column layout on wide screens
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import { usePermissions, useStore } from '@repo/core/logic';

import { formatTimestamp } from '@repo/ui/utils/dateTimeUtils';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAIAgent } from '../hooks/useAIAgent';

export default function AIAssistantScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const { user } = useStore();
  const userId = context.userId;
  const { messages, isThinking, sendMessage, activeGaps, refreshStatus, clearHistory } =
    useAIAgent();

  const initialMessageProcessed = useRef(false);

  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load active gaps on mount
  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  // Handle initial message from navigation context
  useEffect(() => {
    const { initialMessage } = route.params || {};
    if (initialMessage && !initialMessageProcessed.current && !isThinking) {
      initialMessageProcessed.current = true;
      void sendMessage(initialMessage);
    }
  }, [route.params, sendMessage, isThinking]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  }, []);

  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || isThinking) return;
    setDraft('');
    await sendMessage(content);
    textareaRef.current?.focus();
  }, [draft, isThinking, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGapPrompt = (gap: any) => {
    const prompt = `Help me with: ${gap.title}. Suggested action: ${gap.suggestedAction}.`;
    setDraft(prompt);
    textareaRef.current?.focus();
  };

  if (!userId) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--background)',
          gap: '16px',
          padding: '32px',
        }}
      >
        <div style={{ fontSize: '40px' }}>\u2728</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)' }}>
          Sign in to meet your Sanctuary Guide
        </div>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--ink-ghost)',
            textAlign: 'center',
            maxWidth: '360px',
            lineHeight: '1.6',
          }}
        >
          The AI assistant is personalised to your role, school, and learning orientation. Sign in
          to begin.
        </p>
        <button type="button" className="premium-button" onClick={() => navigation.navigate('Auth')}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: 'var(--background)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Left sidebar: active gaps */}
      <div
        style={{
          width: '280px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '24px 20px 16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '800',
              color: 'var(--ink-ghost)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}
          >
            School Flow
          </div>
          {activeGaps.length === 0 ? (
            <div
              style={{
                fontSize: '13px',
                color: 'var(--ink-ghost)',
                lineHeight: '1.5',
              }}
            >
              All clear \u2726 No pending items.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeGaps.map((gap) => (
                <button
                  key={gap.id}
                  type="button"
                  onClick={() => handleGapPrompt(gap)}
                  style={{
                    background:
                      gap.priority === 'high' ? 'rgba(231,76,60,0.08)' : 'rgba(243,156,18,0.08)',
                    border: `1.5px solid ${gap.priority === 'high' ? 'rgba(231,76,60,0.25)' : 'rgba(243,156,18,0.25)'}`,
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: gap.priority === 'high' ? '#c0392b' : '#e67e22',
                      marginBottom: '2px',
                    }}
                  >
                    {gap.priority === 'high' ? '\u26A1' : '\u26A0'} {gap.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                    {gap.suggestedAction}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Clear history */}
        <div
          style={{
            marginTop: 'auto',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <button
            type="button"
            onClick={clearHistory}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: 'var(--ink-ghost)',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
              width: '100%',
            }}
          >
            \uD83D\uDDD1 Clear conversation
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
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
            onClick={() => navigation.goBack()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-ghost)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: '600',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            \u2190 Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>\u2728</span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: 'var(--ink)',
                }}
              >
                {t('aiAssistant.title') || 'Sanctuary Guide'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
              {t('aiAssistant.subtitle') || 'Your AI companion for reflection and school flow'}
            </div>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--ink-ghost)',
              background: 'var(--background-alt)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid var(--border-light)',
            }}
          >
            {context.activeBond?.capacity ?? context.primaryCapacity ?? 'member'}
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '10px',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    background: isUser
                      ? 'var(--sanctuary-saffron)'
                      : 'linear-gradient(135deg, var(--gurudevi-violet, #8b5cf6), var(--sanctuary-saffron))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isUser ? '12px' : '16px',
                    color: 'white',
                    fontWeight: '700',
                  }}
                >
                  {isUser ? (user?.full_name?.[0] ?? '?') : '\u2728'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '18px',
                      borderBottomRightRadius: isUser ? '4px' : '18px',
                      borderBottomLeftRadius: isUser ? '18px' : '4px',
                      background: isUser ? 'var(--sanctuary-saffron)' : 'var(--background-alt)',
                      border: isUser ? 'none' : '1px solid var(--border-light)',
                      color: isUser ? '#FCF9F2' : 'var(--ink)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Thinking indicator */}
          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                \u2728
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '18px',
                  borderBottomLeftRadius: '4px',
                  background: 'var(--background-alt)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'var(--ink-ghost)',
                      animation: 'pulse 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Compose bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            padding: '16px 24px',
            background: 'var(--surface)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              t('aiAssistant.placeholder') ||
              'Ask anything\u2026 (Enter to send, Shift+Enter for new line)'
            }
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1.5px solid var(--border)',
              background: 'var(--background-alt)',
              color: 'var(--ink)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '160px',
              overflow: 'auto',
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || isThinking}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              flexShrink: 0,
              background:
                draft.trim() && !isThinking ? 'var(--sanctuary-saffron)' : 'var(--border)',
              border: 'none',
              cursor: draft.trim() && !isThinking ? 'pointer' : 'default',
              color: 'white',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            {isThinking ? '\u2026' : '\u27A4'}
          </button>
        </div>
      </div>
    </div>
  );
}

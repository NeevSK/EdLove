import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  type DMConversation,
  getExploreSampleConversations,
} from '../../../../lib/community/conversations-contract';
import { type ChatMessage, useCommunityChat } from '../../../../lib/hooks/useCommunityChat';
import styles from '../community.module.css';

const TUTII_PROMPT_CHIPS = [
  'Help summarize my notes',
  'Spark an inquiry question',
  'Explain wetland salinity',
  'Morning calm reflection',
];

const FALLBACK_CONVERSATION: DMConversation = {
  id: 'tutii',
  name: 'Tutii',
  role: 'AI Firefly Guide',
  avatar: '✨',
  isSpecial: true,
  snippet: 'Ayubowan! What are you exploring today?',
};

export function CommunityDirectMessagesStage({
  displayName = 'Seeker',
  initialActiveId = 'tutii',
  initialIncognito = false,
}: Readonly<{
  displayName?: string;
  initialActiveId?: string;
  initialIncognito?: boolean;
}>) {
  const conversations = useMemo(() => getExploreSampleConversations(), []);
  const [activeId, setActiveId] = useState<string>(initialActiveId);
  const [isIncognito, setIsIncognito] = useState(initialIncognito);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const streamEndRef = useRef<HTMLDivElement>(null);

  const activeThreadKey = `dm-${activeId}`;
  const activeConv: DMConversation =
    conversations.find((c) => c.id === activeId) ?? FALLBACK_CONVERSATION;

  const { messages, sendMessage } = useCommunityChat(activeThreadKey, displayName, {
    isEphemeral: isIncognito,
  });

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? draft).trim();
    if (!textToSend) return;

    if (!customText) setDraft('');

    try {
      await sendMessage(textToSend);

      // If chatting with Tutii, generate an intelligent companion response
      if (activeId === 'tutii') {
        setIsTyping(true);
        window.setTimeout(async () => {
          let reply = `Thank you for sharing: "${textToSend}".`;
          const lower = textToSend.toLowerCase();

          if (lower.includes('summarize') || lower.includes('notes')) {
            reply = `Here is a structured summary of what we've reviewed:\n\n• Core Subject: Wetland Ecology & Salinity\n• Key Finding: Plant roots adapt selectively under tidal stress\n• Next Step: Would you like to share this as an inquiry in Grade 10-A Circle?`;
          } else if (lower.includes('inquiry') || lower.includes('question') || lower.includes('science')) {
            reply = `A wonderful inquiry angle: "How does water salinity affect root density in local mangrove seedlings?"\n\nThis would be an inspiring seed to discuss in the Lotus Sanctuary circle!`;
          } else if (lower.includes('calm') || lower.includes('breath') || lower.includes('morning')) {
            reply = `Take a gentle pause. Inhale for 4 counts, hold for 4, exhale softly. Notice what feels steady around you in this learning sanctuary.`;
          } else {
            reply = `I am reflecting with you on "${textToSend}". As your sanctuary companion, I can help you turn this thought into a learning artifact or save it to your vault. What shall we do next?`;
          }

          try {
            await sendMessage(reply);
          } finally {
            setIsTyping(false);
          }
        }, 750);
      }
    } catch {
      if (!customText) setDraft(textToSend);
    }
  };

  const renderAvatarGlyph = (c: DMConversation) => {
    if (c.id === 'tutii') return <span aria-hidden="true">✨</span>;
    if (c.id === 'saved') return <span aria-hidden="true">📌</span>;
    return <span aria-hidden="true">👤</span>;
  };

  return (
    <div className={styles.dmMasterDetail}>
      {/* LEFT RAIL: CONVERSATIONS */}
      <aside className={styles.dmConversationRail} aria-label="Direct Conversations">
        <div className={styles.dmRailHeader}>
          <h3>Messages</h3>
        </div>
        <ul className={styles.dmConversationList}>
          {conversations.map((c) => {
            const isSelected = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`${styles.dmConversationItem} ${isSelected ? styles.dmConversationActive : ''}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className={`${styles.dmAvatar} ${c.isSpecial ? styles.dmAvatarSpecial : ''}`}>
                    {renderAvatarGlyph(c)}
                  </div>
                  <div className={styles.dmConversationInfo}>
                    <div className={styles.dmConversationNameRow}>
                      <span className={styles.dmConversationName}>{c.name}</span>
                    </div>
                    <div className={styles.dmConversationSnippet}>{c.snippet}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* RIGHT STAGE: ACTIVE CHAT */}
      <section className={styles.dmStage} aria-label={`Conversation with ${activeConv.name}`}>
        {/* Header Bar */}
        <header className={styles.dmHeaderBar}>
          <div className={styles.dmHeaderTarget}>
            <div className={`${styles.dmAvatar} ${activeConv.isSpecial ? styles.dmAvatarSpecial : ''}`}>
              {renderAvatarGlyph(activeConv)}
            </div>
            <div>
              <h3>{activeConv.name}</h3>
              <p>{activeConv.role}</p>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.dmIncognitoBtn} ${isIncognito ? styles.dmIncognitoActive : ''}`}
            onClick={() => setIsIncognito((prev) => !prev)}
            aria-pressed={isIncognito}
            title={isIncognito ? 'Disable Incognito Mode' : 'Enable Incognito Mode (Unpersisting)'}
          >
            <span aria-hidden="true">🕶️</span>
            <span>{isIncognito ? 'Incognito Mode: ON' : 'Incognito Mode: OFF'}</span>
          </button>
        </header>

        {/* Incognito Notice */}
        {isIncognito && (
          <div className={styles.incognitoBanner} role="status">
            <span aria-hidden="true">🛡️</span>
            <span>
              Ephemeral Session: Messages are kept only in temporary memory and will evaporate completely when this tab closes.
            </span>
          </div>
        )}

        {/* Message Stream */}
        <div className={styles.dmMessageStream} role="log" aria-live="polite">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.isSelf ? styles.dmBubbleSelf : styles.dmBubblePeer}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              <time className={m.isSelf ? styles.dmTimeSelf : styles.dmTimePeer}>
                {m.time} {m.status === 'pending_sync' ? '· ⏳' : ''}
              </time>
            </div>
          ))}

          {isTyping && (
            <div className={styles.dmBubblePeer} style={{ fontStyle: 'italic', opacity: 0.8 }}>
              Tutii is thinking…
            </div>
          )}

          <div ref={streamEndRef} />
        </div>

        {/* Tutii Prompt Suggestions */}
        {activeId === 'tutii' && (
          <div className={styles.tutiiPromptBar} aria-label="Suggested questions for Tutii">
            {TUTII_PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={styles.tutiiChip}
                onClick={() => void handleSend(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Composer */}
        <form
          className={styles.dmComposerForm}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <input
            type="text"
            className={styles.dmInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              activeId === 'tutii'
                ? 'Ask Tutii a question or share a reflection…'
                : activeId === 'saved'
                  ? 'Save a private note, quote, or draft to yourself…'
                  : `Message ${activeConv.name}…`
            }
            maxLength={1000}
          />
          <button
            type="submit"
            className={styles.dmSendBtn}
            disabled={!draft.trim()}
          >
            <span aria-hidden="true">🕊️</span>
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}
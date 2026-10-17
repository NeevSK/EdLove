'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import styles from './assistant.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const presetPrompts = [
  'Draft a 45-minute lesson plan on wetland plant adaptations',
  'Suggest reflective check-in questions for morning assembly',
  'Strategies for supporting students experiencing exam stress',
  'How to integrate contemplative pauses into mathematics problem solving',
];

interface AIAssistantFloorProps {
  displayName: string;
  capacity?: string;
}

export function AIAssistantFloor({ displayName, capacity }: Readonly<AIAssistantFloorProps>) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Ayubowan, ${displayName}. I am your sanctuary pedagogical co-pilot. How can I assist your teaching, contemplative curriculum design, or classroom reflection today?`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuery = (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = `Here is a structured pedagogical recommendation for "${text.slice(0, 40)}...":\n\n`;
      reply +=
        '1. **Centering Intention (5 mins)**: Open with a breath pause using the Breath Guide to allow students to transition from morning travel to focused attention.\n';
      reply +=
        '2. **Experiential Inquiry (25 mins)**: Provide tangible artifacts or botanical specimens; encourage peer observations in pairs.\n';
      reply +=
        '3. **Synthesis & Reflection (15 mins)**: Invite students to record key observations in their reflective logs or Fire Journal before concluding.';

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 750);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(draft);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/agent-lab"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Agent Lab
            </Link>
          </div>
          <h1>Pedagogical AI Assistant</h1>
          <p>
            Curricular co-pilot grounded in Sri Lankan national standards and contemplative values.
          </p>
        </div>

        <span className={styles.privacyBadge}>🛡️ Zero Commercial Telemetry</span>
      </header>

      {/* Preset Prompt Chips */}
      <div className={styles.promptChips}>
        {presetPrompts.map((p) => (
          <button key={p} type="button" className={styles.chip} onClick={() => sendQuery(p)}>
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className={styles.messagesList}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.messageBubble} ${
              m.role === 'user' ? styles.messageUser : styles.messageAssistant
            }`}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
        {isThinking && (
          <div className={`${styles.messageBubble} ${styles.messageAssistant}`}>
            <em>Synthesizing pedagogical counsel...</em>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Compose */}
      <form onSubmit={handleSubmit} className={styles.composeArea}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendQuery(draft);
            }
          }}
          placeholder="Ask pedagogical advice, lesson pacing, or curriculum design... (Enter to send)"
          className={styles.inputField}
          rows={1}
        />
        <button type="submit" disabled={isThinking} className={styles.sendBtn}>
          Send
        </button>
      </form>
    </div>
  );
}

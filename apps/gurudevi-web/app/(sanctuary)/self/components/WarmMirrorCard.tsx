'use client';

import { BookOpen } from 'lucide-react';

interface WarmMirrorCardProps {
  userId?: string;
  text?: string | null;
  onClose?: () => void;
}

export function WarmMirrorCard({ text, onClose }: WarmMirrorCardProps) {
  const content =
    text ||
    'This week, your reflections centered around creating calm pacing, listening attentively during mentoring sessions, and establishing steady personal boundaries.';

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7' }}>
        <BookOpen size={16} />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Your Week as a Story
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6, color: '#334155' }}>
        {content}
      </p>
    </div>
  );
}

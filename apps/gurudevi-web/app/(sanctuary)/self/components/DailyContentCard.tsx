'use client';

import { Lightbulb, Sparkles } from 'lucide-react';

interface DailyContentCardProps {
  userId?: string;
  onClose?: () => void;
}

export function DailyContentCard({ onClose }: DailyContentCardProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
        <Lightbulb size={18} />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Daily Contemplation
        </span>
      </div>
      <blockquote
        style={{
          margin: 0,
          fontStyle: 'italic',
          fontSize: '1rem',
          color: '#1e293b',
          lineHeight: 1.6,
        }}
      >
        “Quiet minds find direction not by racing forward, but by steadying the ground beneath
        them.”
      </blockquote>
      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
        Curated for your reflective practice today.
      </div>
    </div>
  );
}

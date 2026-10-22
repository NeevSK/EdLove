'use client';

import { Activity, Sparkles } from '@repo/ui/icons';

interface ResonancePatternCardProps {
  userId?: string;
  onClose?: () => void;
}

export function ResonancePatternCard({ onClose }: ResonancePatternCardProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: 'rgba(168, 85, 247, 0.05)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
        <Sparkles size={16} />
        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Emotional Resonance Fingerprint
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>
        Your energy shows steady morning alignment and reflective depth in early evenings. Focus blocks feel most natural between 09:00 and 11:30.
      </p>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '0.5rem',
          fontSize: '0.8125rem',
          color: '#334155',
        }}
      >
        <div><strong>Primary Anchor:</strong> Serene Insight</div>
        <div><strong>Flow Rhythm:</strong> Morning Focus</div>
      </div>
    </div>
  );
}

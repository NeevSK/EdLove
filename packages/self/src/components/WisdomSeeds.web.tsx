/**
 * WisdomSeeds.web.tsx
 *
 * Web override. The native version uses expo-haptics + useSafeMutation.
 * On web we use a direct Supabase insert with optimistic local update
 * and a clean HTML form. Metro resolves this over WisdomSeeds.tsx on web.
 */
import { supabase } from '@repo/core/native';

import { Lightbulb } from 'lucide-react-native';
import React, { useState } from 'react';
import { useWisdom } from '../hooks/useWisdom';

interface WisdomSeedsProps {
  userId?: string;
}

export default function WisdomSeeds({ userId }: WisdomSeedsProps) {
  const { notes, isLoading, setNotes } = useWisdom(userId);
  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!insight.trim() || !userId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('wisdom_notes')
        .insert({ user_id: userId, insight: insight.trim() })
        .select()
        .single();
      if (!error && data) {
        setNotes((prev) => [data, ...prev]);
        setInsight('');
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={16} color="var(--sanctuary-saffron)" />
          <span style={{ fontSize: '14px', fontWeight: '800' }}>Wisdom Seeds</span>
          {!isLoading && notes.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'var(--background-alt)',
                borderRadius: '6px',
                color: 'var(--ink-ghost)',
              }}
            >
              {notes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            fontSize: '11px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: showForm ? 'var(--sanctuary-saffron)' : 'transparent',
            color: showForm ? 'var(--text-on-action)' : 'var(--ink-ghost)',
            cursor: 'pointer',
            fontWeight: '700',
            transition: 'all 0.2s',
          }}
        >
          {showForm ? 'Cancel' : '+ Plant Seed'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            autoFocus
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            placeholder="An insight, principle, or fragment of understanding..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--sanctuary-saffron)',
              background: 'var(--background-alt)',
              color: 'var(--ink)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving || !insight.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'var(--sanctuary-saffron)',
              color: 'var(--text-on-action)',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: saving || !insight.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !insight.trim() ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {saving ? '...' : '+ Plant'}
          </button>
        </div>
      )}

      {/* Seeds list */}
      {isLoading ? (
        <div
          style={{
            height: '60px',
            background: 'var(--background-alt)',
            borderRadius: '10px',
            animation: 'pulse 1.5s infinite',
          }}
        />
      ) : notes.length === 0 ? (
        <div
          style={{
            padding: '20px',
            background: 'var(--background-alt)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
            No wisdom seeds yet. Plant your first insight above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.slice(0, 6).map((note: any) => (
            <div
              key={note.id}
              style={{
                padding: '14px 18px',
                background: 'var(--background-alt)',
                borderRadius: '12px',
                borderLeft: '3px solid var(--sanctuary-saffron)',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  color: 'var(--ink-soft)',
                  margin: 0,
                }}
              >
                "{note.insight}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

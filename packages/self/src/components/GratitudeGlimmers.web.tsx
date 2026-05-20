/**
 * GratitudeGlimmers.web.tsx
 *
 * Web override. The native version uses expo-haptics + @repo/ui components.
 * On web we deliver the same gratitude entry CRUD with 3 categories
 * and the same Supabase backend.
 * Metro resolves this over GratitudeGlimmers.tsx on the web platform.
 */

import { formatDistanceToNow } from 'date-fns';
import { Heart, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useGratitude } from '../hooks/useGratitude';
import type { GratitudeEntry } from '../types';

interface GratitudeGlimmersProps {
  userId?: string;
}

type Category = 'student-said' | 'colleague-kindness' | 'personal-win';

const CATEGORIES: Array<{
  value: Category;
  label: string;
  emoji: string;
  color: string;
}> = [
  {
    value: 'student-said',
    label: 'A student said\u2026',
    emoji: '\uD83D\uDCAC',
    color: '#8B5CF6',
  },
  {
    value: 'colleague-kindness',
    label: 'Colleague kindness',
    emoji: '\uD83E\uDD1D',
    color: '#3B82F6',
  },
  {
    value: 'personal-win',
    label: 'Personal win',
    emoji: '\uD83C\uDFC6',
    color: '#F59E0B',
  },
];

export default function GratitudeGlimmers({ userId }: GratitudeGlimmersProps) {
  const { entries, isLoading, setEntries, addGratitudeEntry } = useGratitude(userId);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('student-said');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || !userId) return;
    setSaving(true);
    try {
      const data = await addGratitudeEntry({
        content: content.trim(),
        category,
      });
      if (data) {
        setEntries((prev) => [data, ...prev]);
        setContent('');
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const getCategoryMeta = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0]!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={16} color="#EF4444" />
          <span style={{ fontSize: '14px', fontWeight: '800' }}>Gratitude Glimmers</span>
          {!isLoading && entries.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'var(--background-alt)',
                borderRadius: '6px',
                color: 'var(--ink-ghost)',
              }}
            >
              {entries.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: showForm ? '#EF4444' : 'transparent',
            color: showForm ? '#fff' : 'var(--ink-ghost)',
            cursor: 'pointer',
            fontWeight: '700',
            transition: 'all 0.2s',
          }}
        >
          <Plus size={12} color={showForm ? '#fff' : 'var(--ink-ghost)'} />
          {showForm ? 'Cancel' : 'Add Glimmer'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            background: 'var(--background-alt)',
            borderRadius: '12px',
          }}
        >
          {/* Category selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: `1.5px solid ${category === cat.value ? cat.color : 'var(--border)'}`,
                  background: category === cat.value ? `${cat.color}18` : 'transparent',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: category === cat.value ? cat.color : 'var(--ink-ghost)',
                  transition: 'all 0.2s',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSave();
            }}
            placeholder="What's one thing you're grateful for right now?"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'white',
              color: 'var(--ink)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            style={{
              padding: '10px',
              borderRadius: '10px',
              background: '#EF4444',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: saving || !content.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !content.trim() ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : '🙏 Add Glimmer'}
          </button>
        </div>
      )}

      {/* Entries */}
      {isLoading ? (
        <div
          style={{
            height: '60px',
            background: 'var(--background-alt)',
            borderRadius: '10px',
          }}
        />
      ) : entries.length === 0 ? (
        <div
          style={{
            padding: '20px',
            background: 'var(--background-alt)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
            No glimmers yet. Even the smallest gratitude changes how we see the day.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {entries.slice(0, 6).map((entry: GratitudeEntry) => {
            const meta = getCategoryMeta(entry.category);
            return (
              <div
                key={entry.id}
                style={{
                  padding: '14px 18px',
                  background: 'var(--background-alt)',
                  borderRadius: '12px',
                  borderLeft: `3px solid ${meta.color}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{meta.emoji}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      color: 'var(--ink-ghost)',
                    }}
                  >
                    {formatDistanceToNow(new Date(entry.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--ink-soft)',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  {entry.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

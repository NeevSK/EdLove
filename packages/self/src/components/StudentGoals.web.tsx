/**
 * StudentGoals.web.tsx
 *
 * Web override. Same Supabase backend via useStudentGoals hook.
 * Metro resolves this over StudentGoals.tsx on the web platform.
 */

import { Circle, CircleCheck, Target } from '@repo/ui/icons';
import { useState } from 'react';
import { useStudentGoals } from '@repo/self/hooks/useStudentGoals';
import type { Goal } from '@repo/self/types';

interface StudentGoalsProps {
  userId: string;
}

export default function StudentGoals({ userId }: StudentGoalsProps) {
  const { goals, isLoading, addGoal, updateGoal } = useStudentGoals(userId);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await addGoal(text.trim());
      setText('');
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (goal: Goal) => {
    setUpdating(goal.id);
    const newVal = !goal.is_completed;
    await updateGoal(goal.id, {
      is_completed: newVal,
      progress: newVal ? 100 : goal.progress,
    });
    setUpdating(null);
  };

  const handleProgress = async (goal: Goal, progress: number) => {
    await updateGoal(goal.id, { progress });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={15} color="var(--water)" />
          <span style={{ fontSize: '13px', fontWeight: '800' }}>My Goals</span>
          {!isLoading && goals.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                background: 'var(--background-alt)',
                borderRadius: '5px',
                color: 'var(--ink-ghost)',
              }}
            >
              {goals.filter((g) => g.is_completed).length}/{goals.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          style={{
            fontSize: '11px',
            padding: '5px 11px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: showForm ? 'var(--water)' : 'transparent',
            color: showForm ? '#fff' : 'var(--ink-ghost)',
            cursor: 'pointer',
            fontWeight: '700',
          }}
        >
          {showForm ? 'Cancel' : '+ Goal'}
        </button>
      </div>

      {showForm && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleAdd();
              }
            }}
            placeholder="What do you want to achieve?"
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--water)',
              background: 'var(--background-alt)',
              color: 'var(--ink)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => {
              void handleAdd();
            }}
            disabled={saving || !text.trim()}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'var(--water)',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: saving || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !text.trim() ? 0.6 : 1,
            }}
          >
            {saving ? '...' : 'Add'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          style={{
            height: '48px',
            background: 'var(--background-alt)',
            borderRadius: '10px',
          }}
        />
      ) : goals.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
          No goals yet. Plant your first one above.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.map((goal) => (
            <div
              key={goal.id}
              style={{
                padding: '12px 14px',
                background: 'var(--background-alt)',
                borderRadius: '10px',
                opacity: goal.is_completed ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: goal.is_completed ? 0 : '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    void handleToggle(goal);
                  }}
                  disabled={updating === goal.id}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  {goal.is_completed ? (
                    <CircleCheck size={18} color="var(--moss)" />
                  ) : (
                    <Circle size={18} color="var(--border)" />
                  )}
                </button>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    flex: 1,
                    textDecoration: goal.is_completed ? 'line-through' : 'none',
                    color: goal.is_completed ? 'var(--ink-ghost)' : 'var(--ink)',
                  }}
                >
                  {goal.text}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                  {goal.progress ?? 0}%
                </span>
              </div>
              {!goal.is_completed && (
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={goal.progress ?? 0}
                  onChange={(e) => {
                    void handleProgress(goal, Number(e.target.value));
                  }}
                  style={{
                    accentColor: 'var(--water)',
                    marginLeft: '28px',
                    display: 'block',
                    width: 'calc(100% - 28px)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

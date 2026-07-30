/**
 * WindDownRitual.web.tsx
 *
 * Web override. Uses the shared self feature repository for persistence.
 * Metro resolves this over WindDownRitual.tsx on the web platform.
 */

import { CircleCheck } from '@repo/ui/icons';
import { useState } from 'react';
import { saveWindDownRitual } from '@repo/self/api/selfFeatureRepository';

interface WindDownRitualProps {
  userId?: string;
}

type RitualStep = {
  id: string;
  title: string;
  description: string;
  hasInput?: boolean;
  placeholder?: string;
};

const STEPS: RitualStep[] = [
  {
    id: 'breathe',
    title: '<, Breathe',
    description: 'Take three slow, deep breaths. Breathe in for 4 counts, hold for 4, out for 6.',
  },
  {
    id: 'reflect',
    title: '< What went well?',
    description: 'One thing that went well today, however small.',
    hasInput: true,
    placeholder: 'Something I noticed...',
  },
  {
    id: 'release',
    title: '<C Release',
    description: 'One thing to let go of before you sleep.',
    hasInput: true,
    placeholder: 'I release...',
  },
  {
    id: 'intent',
    title: "P Tomorrow's seed",
    description: 'One gentle intention for tomorrow.',
    hasInput: true,
    placeholder: 'Tomorrow I will...',
  },
];
const DEFAULT_STEP: RitualStep = {
  id: 'breathe',
  title: '<, Breathe',
  description: 'Take three slow, deep breaths. Breathe in for 4 counts, hold for 4, out for 6.',
};

export default function WindDownRitual({ userId }: WindDownRitualProps) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const current = STEPS[step] ?? STEPS[0] ?? DEFAULT_STEP;
  const nextStep = STEPS[step + 1];
  const isLast = step === STEPS.length - 1;
  const nextStepLabel = (nextStep ?? current).title.split(' ').slice(1).join(' ');

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      try {
        if (userId) {
          await saveWindDownRitual(userId, {
            went_well: values.reflect ?? '',
            to_release: values.release ?? '',
            tomorrow_intent: values.intent ?? '',
          });
        }
      } catch {
        // Non-fatal; completing the ritual matters more than the save succeeding.
      } finally {
        setSaving(false);
        setCompleted(true);
      }
      return;
    }

    setStep((value) => value + 1);
  };

  if (completed) {
    return (
      <div
        style={{
          padding: '28px',
          background: 'rgba(139,92,246,0.06)',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid rgba(139,92,246,0.15)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Rest well.</div>
        <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
          Your wind-down is complete. You have tended to your inner garden for today.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {STEPS.map((item, index) => (
          <div
            key={item.id}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: index <= step ? '#8B5CF6' : 'var(--border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div
        style={{
          padding: '28px',
          background: 'var(--background-alt)',
          borderRadius: '16px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
          {current.title}
        </div>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--ink-ghost)',
            lineHeight: '1.6',
            marginBottom: current.hasInput ? '16px' : '24px',
          }}
        >
          {current.description}
        </p>
        {current.hasInput && (
          <textarea
            value={values[current.id] ?? ''}
            onChange={(event) =>
              setValues((value) => ({
                ...value,
                [current.id]: event.target.value,
              }))
            }
            placeholder={current.placeholder}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'white',
              color: 'var(--ink)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              resize: 'vertical',
              marginBottom: '16px',
              boxSizing: 'border-box',
            }}
          />
        )}

        <button
          onClick={handleNext}
          disabled={saving}
          style={{
            padding: '11px 24px',
            borderRadius: '10px',
            background: '#8B5CF6',
            color: '#fff',
            border: 'none',
            fontWeight: '700',
            fontSize: '14px',
            cursor: saving ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {' '}
          {saving ? (
            'Saving...'
          ) : isLast ? (
            <>
              <CircleCheck size={16} color="#fff" /> Complete Ritual
            </>
          ) : (
            `Next -> ${nextStepLabel}`
          )}
        </button>
      </div>
      {step > 0 && (
        <button
          onClick={() => setStep((value) => value - 1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-ghost)',
            fontSize: '12px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {' '}
          {'<- Back'}
        </button>
      )}
    </div>
  );
}

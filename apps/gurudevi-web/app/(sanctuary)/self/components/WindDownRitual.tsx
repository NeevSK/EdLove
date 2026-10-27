'use client';

import { Check, CircleCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { saveWindDownRitual } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './wind-down-ritual.module.css';

interface WindDownRitualProps {
  userId?: string;
  onClose?: () => void;
}

const STEPS = [
  {
    id: 'breathe',
    title: '🌬️ Gentle Reset',
    description:
      'Inhale deeply for 4 counts, hold for 4, exhale slowly for 6. Let tension dissipate from your neck and spine.',
  },
  {
    id: 'reflect',
    title: '✨ What went well today?',
    description: 'Notice one moment, gesture, or observation that brought peace or clarity.',
    hasInput: true,
    placeholder: 'Something positive I noticed today was...',
  },
  {
    id: 'release',
    title: '🍃 Release & Unload',
    description: 'Name one unresolved concern or task you choose to lay down until tomorrow.',
    hasInput: true,
    placeholder: 'I release and set aside...',
  },
];

export function WindDownRitual({ userId, onClose }: WindDownRitualProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [reflectText, setReflectText] = useState('');
  const [releaseText, setReleaseText] = useState('');
  const [completed, setCompleted] = useState(false);

  const step = STEPS[currentStepIdx] ?? STEPS[0];

  const handleNext = async () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      try {
        await saveWindDownRitual(userId ?? 'guest', {
          went_well: reflectText,
          to_release: releaseText,
          tomorrow_intent: 'Rest and rejuvenation',
        });
      } catch {
        // Optimistic completion
      }
      setCompleted(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Wind Down Ritual</h2>
        <p className={styles.subtitle}>
          A peaceful closing transition to separate daytime demands from evening rest
        </p>
      </div>

      {!completed ? (
        <>
          <div className={styles.stepper}>
            {STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`${styles.stepNode} ${idx <= currentStepIdx ? styles.stepNodeActive : ''}`}
              >
                <div
                  className={`${styles.stepCircle} ${idx === currentStepIdx ? styles.stepCircleActive : ''}`}
                >
                  {idx + 1}
                </div>
                <span>{s.id.toUpperCase()}</span>
              </div>
            ))}
          </div>

          <div className={styles.ritualBody}>
            <div className={styles.stepTitle}>{step?.title ?? ''}</div>
            <p className={styles.stepDesc}>{step?.description ?? ''}</p>

            {step?.hasInput && (
              <input
                type="text"
                placeholder={step.placeholder}
                value={step.id === 'reflect' ? reflectText : releaseText}
                onChange={(e) =>
                  step.id === 'reflect'
                    ? setReflectText(e.target.value)
                    : setReleaseText(e.target.value)
                }
                className={styles.input}
              />
            )}

            <button type="button" onClick={handleNext} className={styles.nextBtn}>
              {currentStepIdx === STEPS.length - 1 ? (
                <>
                  <Check size={16} />
                  <span>Complete Wind-Down</span>
                </>
              ) : (
                <span>Next Transition →</span>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className={styles.ritualBody}>
          <CircleCheck size={48} color="#22c55e" />
          <div className={styles.stepTitle}>Rest Well & Be at Ease</div>
          <p className={styles.stepDesc}>
            Your day has been safely acknowledged and folded away. Return to your sanctuary whenever
            you wish.
          </p>
        </div>
      )}
    </div>
  );
}

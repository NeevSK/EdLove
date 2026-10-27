'use client';

import { ArrowRight, Brain, Check } from 'lucide-react';
import { useState } from 'react';
import { useThoughtRecords } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './reframe-wizard.module.css';

interface ReframeWizardProps {
  userId?: string;
  onClose?: () => void;
}

const TRAPS = [
  'All-or-Nothing Thinking',
  'Catastrophizing',
  'Mind Reading',
  'Emotional Reasoning',
  'Overgeneralization',
  'Personalization',
];

export function ReframeWizard({ userId, onClose }: ReframeWizardProps) {
  const { addThoughtRecord } = useThoughtRecords(userId);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [automaticThought, setAutomaticThought] = useState('');
  const [feeling, setFeeling] = useState('');
  const [selectedTrap, setSelectedTrap] = useState('');
  const [balancedReframe, setBalancedReframe] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleFinish = async () => {
    try {
      await addThoughtRecord({
        automatic_thought: automaticThought,
        feeling_name: feeling || 'anxious',
        trap_name: selectedTrap || 'Catastrophizing',
        balanced_perspective: balancedReframe,
      });
    } catch {
      // Graceful completion
    }
    setIsCompleted(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Thought Reframe Wizard</h2>
        <p className={styles.subtitle}>
          Deconstruct unhelpful internal narratives with compassionate, evidence-based cognitive
          reframing
        </p>
      </div>

      {!isCompleted ? (
        <>
          <div className={styles.stepper}>
            <span className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''}`}>
              1. Notice
            </span>
            <span className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`}>
              2. Name
            </span>
            <span className={`${styles.stepDot} ${step >= 3 ? styles.stepDotActive : ''}`}>
              3. Spot Trap
            </span>
            <span className={`${styles.stepDot} ${step >= 4 ? styles.stepDotActive : ''}`}>
              4. Reframe
            </span>
          </div>

          <div className={styles.wizardCard}>
            {step === 1 && (
              <>
                <div className={styles.question}>What automatic thought is looping right now?</div>
                <textarea
                  rows={3}
                  placeholder="e.g., 'I didn't finish grading and tomorrow's lesson will be chaotic...'"
                  value={automaticThought}
                  onChange={(e) => setAutomaticThought(e.target.value)}
                  className={styles.textarea}
                  required
                />
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    disabled={!automaticThought.trim()}
                    onClick={() => setStep(2)}
                    className={styles.nextBtn}
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className={styles.question}>What emotion is tied to this thought?</div>
                <input
                  type="text"
                  placeholder="e.g., Overwhelmed, Apprehensive, Self-critical"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                  required
                />
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    disabled={!feeling.trim()}
                    onClick={() => setStep(3)}
                    className={styles.nextBtn}
                  >
                    <span>Spot the Trap</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className={styles.question}>Does this fit a known cognitive distortion?</div>
                <div className={styles.trapsGrid}>
                  {TRAPS.map((trap) => (
                    <button
                      key={trap}
                      type="button"
                      className={`${styles.trapBtn} ${selectedTrap === trap ? styles.trapBtnActive : ''}`}
                      onClick={() => setSelectedTrap(trap)}
                    >
                      {trap}
                    </button>
                  ))}
                </div>
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    disabled={!selectedTrap}
                    onClick={() => setStep(4)}
                    className={styles.nextBtn}
                  >
                    <span>Balanced Reframe</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className={styles.question}>
                  What is a fairer, more compassionate perspective?
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g., 'One incomplete stack does not define my teaching. The core activities are set, and I can pace the session gently.'"
                  value={balancedReframe}
                  onChange={(e) => setBalancedReframe(e.target.value)}
                  className={styles.textarea}
                  required
                />
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    disabled={!balancedReframe.trim()}
                    onClick={handleFinish}
                    className={styles.nextBtn}
                  >
                    <Check size={16} />
                    <span>Anchor Reframe</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <Brain size={48} color="#0284c7" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Perspective Restored</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', maxWidth: '420px' }}>
            You have successfully observed your thought, named the trap, and established an
            anchored, objective perspective.
          </p>
        </div>
      )}
    </div>
  );
}

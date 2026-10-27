'use client';

import { Battery, BatteryCharging, BatteryLow, BatteryMedium, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { playSingingBowlChime } from '../../../../lib/sanctuary/audioSanctuary';
import { logReminderFeedback } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './daily-sadhana-modal.module.css';
import { SacredLotusMandala } from './SacredLotusMandala';

interface DailySadhanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const INTENTIONS = [
  'Gentle Presence',
  'Patience & Grace',
  'Clear Focus',
  'Restful Boundaries',
  'Warm Kindness',
  'Quiet Confidence',
];

export function DailySadhanaModal({ isOpen, onClose, userId }: DailySadhanaModalProps) {
  const effectiveUserId = userId ?? 'guest';
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [breathCount, setBreathCount] = useState<number>(1);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [secondsInPhase, setSecondsInPhase] = useState<number>(4);
  const [selectedIntention, setSelectedIntention] = useState<string>('Gentle Presence');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBreathCount(1);
      setBreathPhase('inhale');
      setSecondsInPhase(4);
      setIsCompleted(false);
    }
  }, [isOpen]);

  // Breathing timer engine for Step 2
  useEffect(() => {
    if (!isOpen || step !== 2) return;

    const timer = setInterval(() => {
      setSecondsInPhase((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        if (breathPhase === 'inhale') {
          setBreathPhase('hold-in');
          return 4;
        }
        if (breathPhase === 'hold-in') {
          setBreathPhase('exhale');
          return 4;
        }
        if (breathPhase === 'exhale') {
          setBreathPhase('hold-out');
          return 4;
        }
        // breathPhase === 'hold-out'
        if (breathCount < 3) {
          setBreathCount((c) => c + 1);
          setBreathPhase('inhale');
          return 4;
        }
        // All 3 breaths done! Advance to Step 3
        setStep(3);
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step, breathPhase, breathCount]);

  const handleFinish = useCallback(async () => {
    setIsCompleted(true);
    playSingingBowlChime(432); // Soothing 432Hz harmonic tone

    try {
      // Log somatic breath session & care feedback
      await logReminderFeedback(effectiveUserId, {
        reminder_id: `sadhana-${Date.now()}`,
        user_id: effectiveUserId,
        action: 'done',
        category: 'breathe',
        note: `Sadhana Intention: ${selectedIntention} (Energy: ${energyLevel}/5)`,
      });

      // Persist today's intention for floor living presence
      if (typeof window !== 'undefined') {
        const todayStr = new Date().toISOString().slice(0, 10);
        window.localStorage.setItem(
          'sanctuary_today_sadhana',
          JSON.stringify({
            date: todayStr,
            intention: selectedIntention,
            energyLevel,
            timestamp: Date.now(),
          }),
        );
        window.dispatchEvent(new CustomEvent('sanctuary_sadhana_saved'));
      }
    } catch {
      // Graceful fallback
    }

    setTimeout(() => {
      onClose();
    }, 1600);
  }, [effectiveUserId, selectedIntention, energyLevel, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="sadhana-title">
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close Daily Sadhana"
        >
          <X size={18} />
        </button>

        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepDotActive : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepDotActive : ''}`} />
          <div className={`${styles.stepDot} ${step >= 3 ? styles.stepDotActive : ''}`} />
        </div>

        {isCompleted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Sparkles size={40} color="#0d9488" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Sadhana Complete
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Your energy is centered. May your presence steady your day.
            </p>
          </div>
        ) : step === 1 ? (
          <div>
            <h2 id="sadhana-title" className={styles.stepTitle}>
              Capacity Check
            </h2>
            <p className={styles.stepSubtitle}>
              Honoring your actual energy is the first step of genuine practice.
            </p>

            <div className={styles.energyGrid}>
              {[
                { level: 1, label: 'Depleted', icon: BatteryLow, color: '#e11d48' },
                { level: 2, label: 'Low', icon: BatteryLow, color: '#f59e0b' },
                { level: 3, label: 'Steady', icon: BatteryMedium, color: '#10b981' },
                { level: 4, label: 'Energized', icon: Battery, color: '#0284c7' },
                { level: 5, label: 'Radiant', icon: BatteryCharging, color: '#8b5cf6' },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  className={`${styles.energyBtn} ${energyLevel === item.level ? styles.energyBtnSelected : ''}`}
                  onClick={() => {
                    setEnergyLevel(item.level);
                    setStep(2);
                  }}
                >
                  <item.icon size={22} color={item.color} />
                  <span className={styles.energyNum}>{item.level}</span>
                  <span className={styles.energyLabel}>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.skipBtn}
              onClick={() => setStep(2)}
            >
              Continue to Breath Centering →
            </button>
          </div>
        ) : step === 2 ? (
          <div>
            <h2 id="sadhana-title" className={styles.stepTitle}>
              Concentric Breath Centering
            </h2>
            <p className={styles.stepSubtitle}>
              Three conscious breaths to settle the nervous system into steady flow.
            </p>

            <div className={styles.breathContainer}>
              <SacredLotusMandala phase={breathPhase} size={180} />

              <div className={styles.breathPhaseLabel}>
                {breathPhase === 'inhale'
                  ? 'Inhale Slowly'
                  : breathPhase === 'hold-in'
                    ? 'Hold & Settle'
                    : breathPhase === 'exhale'
                      ? 'Release Completely'
                      : 'Gentle Stillness'}
              </div>

              <div className={styles.breathCountText}>
                Breath {breathCount} of 3 · {secondsInPhase}s
              </div>
            </div>

            <button
              type="button"
              className={styles.skipBtn}
              onClick={() => setStep(3)}
            >
              Next: Intention Anchor →
            </button>
          </div>
        ) : (
          <div>
            <h2 id="sadhana-title" className={styles.stepTitle}>
              Today's Intention Anchor
            </h2>
            <p className={styles.stepSubtitle}>
              Select the quality you choose to embody in your circle today.
            </p>

            <div className={styles.intentionsGrid}>
              {INTENTIONS.map((intention) => (
                <button
                  key={intention}
                  type="button"
                  className={`${styles.intentionChip} ${selectedIntention === intention ? styles.intentionChipActive : ''}`}
                  onClick={() => setSelectedIntention(intention)}
                >
                  {intention}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.completeBtn}
              onClick={() => void handleFinish()}
            >
              Seal Intention & Center
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

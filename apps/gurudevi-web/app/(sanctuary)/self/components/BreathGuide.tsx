'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './breath-guide.module.css';

interface BreathGuideProps {
  onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathStep {
  phase: Phase;
  durationMs: number;
  label: string;
  emoji: string;
  accentColor: string;
  scale: number;
}

const CYCLE: readonly BreathStep[] = [
  {
    phase: 'inhale',
    durationMs: 4000,
    label: 'Inspire Deeply',
    emoji: '🪷',
    accentColor: '#3b82f6',
    scale: 1.45,
  },
  {
    phase: 'hold',
    durationMs: 2000,
    label: 'Pause in Fullness',
    emoji: '✨',
    accentColor: '#f59e0b',
    scale: 1.45,
  },
  {
    phase: 'exhale',
    durationMs: 6000,
    label: 'Release Slowly',
    emoji: '🍃',
    accentColor: '#10b981',
    scale: 0.8,
  },
  {
    phase: 'rest',
    durationMs: 2000,
    label: 'Rest in Stillness',
    emoji: '🕊️',
    accentColor: '#8b5cf6',
    scale: 1.0,
  },
];

const DEFAULT_STEP: BreathStep = {
  phase: 'inhale',
  durationMs: 4000,
  label: 'Inspire Deeply',
  emoji: '🪷',
  accentColor: '#3b82f6',
  scale: 1.45,
};

function getStep(index: number): BreathStep {
  return CYCLE[index] ?? DEFAULT_STEP;
}

const TOTAL_CYCLES = 4;

export function BreathGuide({ onComplete }: Readonly<BreathGuideProps>) {
  const [active, setActive] = useState(false);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    timerRef.current = null;
    countdownIntervalRef.current = null;
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const finish = () => {
    clearAllTimers();
    setActive(false);
    setDone(true);
    onComplete?.();
  };

  const advanceStep = (currentCycle: number, currentPhase: number) => {
    const nextPhase = (currentPhase + 1) % CYCLE.length;
    const nextCycle = nextPhase === 0 ? currentCycle + 1 : currentCycle;

    if (nextCycle >= TOTAL_CYCLES) {
      finish();
      return;
    }

    setCycleIdx(nextCycle);
    setPhaseIdx(nextPhase);

    const stepInfo = getStep(nextPhase);
    startCountdown(stepInfo.durationMs);

    timerRef.current = setTimeout(() => {
      advanceStep(nextCycle, nextPhase);
    }, stepInfo.durationMs);
  };

  const startCountdown = (durationMs: number) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    let secondsLeft = Math.ceil(durationMs / 1000);
    setSecondsRemaining(secondsLeft);

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setSecondsRemaining(Math.max(0, secondsLeft));
      if (secondsLeft <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);
  };

  const start = () => {
    clearAllTimers();
    setActive(true);
    setCycleIdx(0);
    setPhaseIdx(0);
    setDone(false);

    const firstStep = getStep(0);
    startCountdown(firstStep.durationMs);

    timerRef.current = setTimeout(() => {
      advanceStep(0, 0);
    }, firstStep.durationMs);
  };

  const stop = () => {
    clearAllTimers();
    setActive(false);
  };

  const currentStep = getStep(phaseIdx);
  const progressPercent =
    ((cycleIdx * CYCLE.length + phaseIdx + 1) / (TOTAL_CYCLES * CYCLE.length)) * 100;

  return (
    <div className={styles.container}>
      <div>
        <span className={styles.badge}>Somatic Regulation</span>
        <h3 className={styles.title}>Breath Resonance</h3>
      </div>

      {done ? (
        <div className={styles.completedCard}>
          <span className={styles.completedIcon} aria-hidden="true">
            🌱
          </span>
          <h4 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '1.3rem' }}>
            Grounded & Present
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Breath cycle fulfilled. Your nervous system has recalibrated toward equilibrium.
          </p>
          <button className={styles.primaryButton} onClick={start} type="button">
            Restart Cycle
          </button>
        </div>
      ) : (
        <>
          <div className={styles.orbWrapper}>
            <div
              className={styles.haloRing}
              style={{ borderColor: active ? currentStep.accentColor : undefined }}
            />
            <div className={styles.haloRingOuter} />
            <div
              className={styles.orb}
              style={{
                transform: active ? `scale(${currentStep.scale})` : 'scale(1)',
                borderColor: active ? currentStep.accentColor : 'rgba(212, 132, 58, 0.4)',
                boxShadow: active
                  ? `0 0 50px -4px ${currentStep.accentColor}55, inset 0 2px 10px rgba(255, 255, 255, 0.9)`
                  : undefined,
              }}
            >
              <span className={styles.orbIcon} aria-hidden="true">
                {active ? currentStep.emoji : '🌬️'}
              </span>
              {active && <span className={styles.orbSeconds}>{secondsRemaining}s</span>}
            </div>
          </div>

          <div className={styles.statusZone}>
            {active ? (
              <>
                <p className={styles.phaseLabel} style={{ color: currentStep.accentColor }}>
                  {currentStep.label}
                </p>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressBar}
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: currentStep.accentColor,
                    }}
                  />
                </div>
                <span className={styles.cycleText}>
                  Cycle {cycleIdx + 1} of {TOTAL_CYCLES}
                </span>
              </>
            ) : (
              <p className={styles.idleHint}>
                Follow the gentle 4-2-6-2 cadence to anchor your presence and release physical
                tension.
              </p>
            )}
          </div>

          <button
            className={
              active ? `${styles.primaryButton} ${styles.stopButton}` : styles.primaryButton
            }
            onClick={active ? stop : start}
            type="button"
          >
            {active ? 'Cease Exercise' : 'Initiate Breath Cycle'}
          </button>
        </>
      )}
    </div>
  );
}

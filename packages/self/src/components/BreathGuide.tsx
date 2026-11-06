/**
 * BREATH GUIDE COMPONENT
 * Petal-guided breathing companion
 * 1-minute breathing exercise with visual and haptic rhythm
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useFeedbackOptional } from '@repo/ui/context';
import { Button } from '@repo/ui/components/native';
import { Wind } from '@repo/ui/icons';
import { Blur, Canvas, Circle } from 'react-native-skia';
import { useTranslation } from 'react-i18next';
import { logReminderFeedback } from '@repo/self/data/selfFeature.data';

interface BreathGuideProps {
  onComplete?: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

type BreathStep = {
  phase: BreathPhase;
  duration: number;
  instruction: string;
};

const TOTAL_CYCLES = 4;

const BREATH_SEQUENCE: BreathStep[] = [
  { phase: 'inhale', duration: 4000, instruction: 'Inhale' },
  { phase: 'hold', duration: 2000, instruction: 'Hold' },
  { phase: 'exhale', duration: 6000, instruction: 'Exhale' },
  { phase: 'rest', duration: 2000, instruction: 'Rest' },
];

function getScaleForPhase(phase: BreathPhase, active: boolean): number {
  if (!active) return 0.9;
  if (phase === 'exhale') return 0.8;
  if (phase === 'rest') return 0.92;
  return 1.4;
}

function getOpacityForPhase(phase: BreathPhase, active: boolean): number {
  if (!active) return 0.5;
  if (phase === 'exhale') return 0.5;
  if (phase === 'rest') return 0.7;
  return 1;
}

export default function BreathGuide({ onComplete }: BreathGuideProps) {
  const { t } = useTranslation();
  const { emit: emitFeedback } = useFeedbackOptional();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const sequence = useMemo(
    () =>
      BREATH_SEQUENCE.map((step) => ({
        ...step,
        instruction: t(`self.${step.phase}`) || step.instruction,
      })),
    [t],
  );

  const currentStep = sequence[phaseIndex] ?? sequence[0];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerPhaseFeedback = useCallback(
    (phase: BreathPhase) => {
      if (phase === 'inhale') emitFeedback('breath-start');
      else if (phase === 'exhale') emitFeedback('breath-end');
      else emitFeedback('selection');
    },
    [emitFeedback],
  );

  const finishSession = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setCurrentCycle(0);
    setPhaseIndex(0);
    emitFeedback('success');
    void logReminderFeedback('mobile_user', {
      reminder_id: `breath-guide-${Date.now()}`,
      user_id: 'mobile_user',
      action: 'done',
      category: 'breathe',
      note: 'Completed 1-minute somatic breath guide',
    }).catch(() => {});
    onComplete?.();
  }, [clearTimer, emitFeedback, onComplete]);

  useEffect(() => clearTimer, [clearTimer]);

  function stepForward(cycle: number, phase: number) {
    const nextPhase = (phase + 1) % sequence.length;
    const nextCycle = nextPhase === 0 ? cycle + 1 : cycle;

    if (nextCycle >= TOTAL_CYCLES) {
      finishSession();
      return;
    }

    const nextStep = sequence[nextPhase];
    if (!nextStep) {
      finishSession();
      return;
    }

    triggerPhaseFeedback(nextStep.phase);
    setPhaseIndex(nextPhase);
    setCurrentCycle(nextCycle);
    timerRef.current = setTimeout(() => stepForward(nextCycle, nextPhase), nextStep.duration);
  }

  const startSession = useCallback(() => {
    clearTimer();
    setIsActive(true);
    setCurrentCycle(0);
    setPhaseIndex(0);
    const firstStep = sequence[0];
    if (!firstStep) return;
    triggerPhaseFeedback(firstStep.phase);
    timerRef.current = setTimeout(() => stepForward(0, 0), firstStep.duration);
  }, [clearTimer, sequence, stepForward, triggerPhaseFeedback]);

  const stopSession = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setCurrentCycle(0);
    setPhaseIndex(0);
  }, [clearTimer]);

  const phase = currentStep?.phase ?? 'rest';
  const scale = getScaleForPhase(phase, isActive);
  const opacity = getOpacityForPhase(phase, isActive);
  const rotation = isActive && phase === 'exhale' ? currentCycle * 45 : 0;
  const progress =
    ((currentCycle * sequence.length + phaseIndex + 1) / (TOTAL_CYCLES * sequence.length)) * 100;

  return (
    <View className="items-center p-lg gap-lg">
      <View className="items-center justify-center min-h-[250px]">
        {Platform.OS !== 'web' ? (
          <Canvas style={{ width: 170, height: 170, position: 'absolute' }}>
            <Circle
              cx={85}
              cy={85}
              r={75 * scale}
              color={isActive ? '#8B5CF6' : '#7C3AED'}
              opacity={opacity * 0.3}
            >
              <Blur blur={12} />
            </Circle>
            <Circle cx={85} cy={85} r={60 * scale} color="#8B5CF6" opacity={opacity * 0.15} />
          </Canvas>
        ) : null}
        <View
          className="w-[150px] h-[150px] rounded-full bg-gurudeviViolet items-center justify-center shadow-xl shadow-gurudeviViolet/60"
          style={{
            transform: [{ scale }, { rotate: `${rotation}deg` }],
            opacity,
            elevation: 10,
          }}
        >
          <Text className="text-5xl">🌸</Text>
        </View>
      </View>

      {isActive && (
        <View className="items-center gap-1">
          <Text className="text-ink text-2xl font-semibold text-center">
            {currentStep?.instruction ?? 'Begin...'}
          </Text>
          <Text className="text-mistGray text-sm">
            {t('self.cycleCount', {
              current: currentCycle + 1,
              total: TOTAL_CYCLES,
            }) || `Cycle ${currentCycle + 1} of ${TOTAL_CYCLES}`}
          </Text>
        </View>
      )}

      <View className="mt-lg">
        {!isActive ? (
          <Button
            size="lg"
            variant="primary"
            icon={Wind}
            label={t('self.startBreathing') || 'Start Breathing'}
            onPress={startSession}
            accessibilityHint="Begins the guided breathing session"
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop breathing guide"
            accessibilityHint="Ends the guided breathing session"
            onPress={stopSession}
          >
            <Text className="text-mistGray text-sm underline">{t('self.stop') || 'Stop'}</Text>
          </Pressable>
        )}
      </View>

      {!isActive && (
        <View className="mt-md p-md bg-black/5 rounded-comfortable items-center">
          <Text className="text-mistGray text-xs text-center italic">
            {t('self.breathHero') || 'One minute of breathing, an hour of calm.'}
          </Text>
        </View>
      )}

      <View className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <View className="h-full bg-gurudeviViolet rounded-full" style={{ width: `${progress}%` }} />
      </View>
    </View>
  );
}

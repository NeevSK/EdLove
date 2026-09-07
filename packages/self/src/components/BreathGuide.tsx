/**
 * BREATH GUIDE COMPONENT
 * Petal-guided breathing companion
 * 1-minute breathing exercise with visual and haptic rhythm
 */

import { useFeedbackOptional } from '@repo/ui/context';
import { Wind } from '@repo/ui/icons';
import { Box, Button, ButtonText, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { Blur, Canvas, Circle } from '@shopify/react-native-skia';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

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
    <VStack className="items-center p-lg gap-lg">
      <Box className="items-center justify-center min-h-[250px]">
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
        <Box
          className="w-[150px] h-[150px] rounded-full bg-gurudeviViolet items-center justify-center shadow-xl shadow-gurudeviViolet/60"
          style={{
            transform: [{ scale }, { rotate: `${rotation}deg` }],
            opacity,
            elevation: 10,
          }}
        >
          <Text className="text-5xl">🌸</Text>
        </Box>
      </Box>

      {isActive && (
        <VStack className="items-center gap-1">
          <Text className="text-ink text-2xl font-semibold text-center">
            {currentStep?.instruction ?? 'Begin...'}
          </Text>
          <Text className="text-mistGray text-sm">
            {t('self.cycleCount', {
              current: currentCycle + 1,
              total: TOTAL_CYCLES,
            }) || `Cycle ${currentCycle + 1} of ${TOTAL_CYCLES}`}
          </Text>
        </VStack>
      )}

      <Box className="mt-lg">
        {!isActive ? (
          <Button
            size="lg"
            onPress={startSession}
            accessibilityLabel="Start breathing guide"
            accessibilityHint="Begins the guided breathing session"
            className="rounded-full bg-gurudeviViolet px-xl flex-row items-center justify-center"
          >
            <Icon as={Wind} className="text-white mr-2" size={20} />
            <ButtonText className="text-white">
              {t('self.startBreathing') || 'Start Breathing'}
            </ButtonText>
          </Button>
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
      </Box>

      {!isActive && (
        <Box className="mt-md p-md bg-black/5 rounded-comfortable items-center">
          <Text className="text-mistGray text-xs text-center italic">
            {t('self.breathHero') || 'One minute of breathing, an hour of calm.'}
          </Text>
        </Box>
      )}

      <Box className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <Box className="h-full bg-gurudeviViolet rounded-full" style={{ width: `${progress}%` }} />
      </Box>
    </VStack>
  );
}

/**
 * BREATH GUIDE (Web)
 * 4-2-6-2 breathing rhythm optimized for web performance.
 */

import { Box, Button, ButtonText, Heading, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { Activity, Pause, Play, RotateCcw, ShieldCheck, Wind } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';

interface BreathGuideProps {
  onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

type BreathStep = {
  phase: Phase;
  duration: number;
  label: string;
  accentColor: string;
};

const CYCLE: BreathStep[] = [
  { phase: 'inhale', duration: 4000, label: 'Inspire Deeply', accentColor: '#3B82F6' },
  { phase: 'hold', duration: 2000, label: 'Pause in Fullness', accentColor: '#F6B100' },
  { phase: 'exhale', duration: 6000, label: 'Release Slowly', accentColor: '#10B981' },
  { phase: 'rest', duration: 2000, label: 'Rest in Stillness', accentColor: '#6A6358' },
];

const TOTAL_CYCLES = 4;

type BreathState = {
  active: boolean;
  cycleIdx: number;
  phaseIdx: number;
  done: boolean;
};

const INITIAL_STATE: BreathState = {
  active: false,
  cycleIdx: 0,
  phaseIdx: 0,
  done: false,
};

export default function BreathGuide({ onComplete }: BreathGuideProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<BreathState>(INITIAL_STATE);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const finish = () => {
    clearTimer();
    setState({
      active: false,
      cycleIdx: 0,
      phaseIdx: 0,
      done: true,
    });
    onComplete?.();
  };

  const step = (cycleIdx: number, phaseIdx: number) => {
    const nextPhaseIdx = (phaseIdx + 1) % CYCLE.length;
    const nextCycleIdx = nextPhaseIdx === 0 ? cycleIdx + 1 : cycleIdx;

    if (nextCycleIdx >= TOTAL_CYCLES) {
      finish();
      return;
    }

    const nextStep = CYCLE[nextPhaseIdx];
    if (!nextStep) {
      finish();
      return;
    }

    setState({
      active: true,
      cycleIdx: nextCycleIdx,
      phaseIdx: nextPhaseIdx,
      done: false,
    });
    timerRef.current = setTimeout(() => step(nextCycleIdx, nextPhaseIdx), nextStep.duration);
  };

  const start = () => {
    clearTimer();
    setState({
      active: true,
      cycleIdx: 0,
      phaseIdx: 0,
      done: false,
    });
    const firstStep = CYCLE[0];
    if (firstStep) {
      timerRef.current = setTimeout(() => step(0, 0), firstStep.duration);
    }
  };

  const stop = () => {
    clearTimer();
    setState(INITIAL_STATE);
  };

  useEffect(() => () => clearTimer(), []);

  const activePhase = CYCLE[state.phaseIdx] ?? CYCLE[0];
  const scale =
    state.active && (activePhase?.phase === 'inhale' || activePhase?.phase === 'hold')
      ? 1.5
      : state.active && activePhase?.phase === 'exhale'
        ? 0.75
        : 1;
  const progress =
    ((state.cycleIdx * CYCLE.length + state.phaseIdx + 1) / (TOTAL_CYCLES * CYCLE.length)) * 100;

  return (
    <VStack className="items-center gap-10 py-8">
      <VStack className="items-center gap-2">
        <HStack className="items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <Icon as={Activity} size={10} className="text-sanctuarySaffron" />
          <Text className="text-[9px] uppercase font-black tracking-[0.3em] text-mistGray/60">
            Somatic Regulation
          </Text>
        </HStack>
        <Heading size="md" className="text-sacredWhite font-black tracking-tighter">
          Breath Resonance
        </Heading>
      </VStack>

      {state.done ? (
        <VStack className="items-center p-10 bg-shroud rounded-[40px] border border-white/10 shadow-2xl max-w-sm">
          <Box className="w-20 h-20 rounded-full bg-emeraldGreen/10 items-center justify-center mb-6">
            <Icon as={ShieldCheck} className="text-emeraldGreen" size={40} />
          </Box>
          <Heading
            size="sm"
            className="text-center text-sacredWhite font-black tracking-tight mb-3"
          >
            Grounded & Presence
          </Heading>
          <Text className="text-center text-mistGray/60 text-sm leading-relaxed mb-8">
            Breath cycle established. Your nervous system is now back in its natural equilibrium.
          </Text>
          <Button
            onPress={start}
            className="bg-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20 rounded-2xl w-full h-14"
          >
            <HStack className="items-center gap-2">
              <Icon as={RotateCcw} size={18} className="text-obsidian" />
              <ButtonText className="font-black uppercase tracking-widest text-xs text-obsidian">
                Resume Flow
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      ) : (
        <VStack className="items-center gap-12 w-full">
          <Box className="relative items-center justify-center">
            <Box
              className="w-40 h-40 items-center justify-center rounded-full transition-all duration-700"
              style={{
                transform: [{ scale }],
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: state.active
                  ? (activePhase?.accentColor ?? 'rgba(255,255,255,0.05)')
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <Icon
                as={Wind}
                size={48}
                className={state.active ? 'text-sanctuarySaffron' : 'text-mistGray/10'}
              />
            </Box>
            {state.active && (
              <>
                <Box
                  className="absolute inset-[-20px] rounded-full border border-white/5 animate-ping opacity-20"
                  style={{ borderColor: activePhase?.accentColor }}
                />
                <Box
                  className="absolute inset-[-40px] rounded-full border border-white/5 animate-ping opacity-10"
                  style={{ borderColor: activePhase?.accentColor }}
                />
              </>
            )}
          </Box>

          <VStack className="items-center h-24 gap-4 w-64">
            {state.active ? (
              <>
                <Heading className="text-3xl font-black tracking-tighter text-center text-sanctuarySaffron transition-colors duration-500">
                  {activePhase?.label}
                </Heading>
                <VStack className="items-center gap-3 w-full">
                  <Box className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <Box
                      className="h-full bg-sanctuarySaffron transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </Box>
                  <HStack className="justify-between w-full px-1">
                    <Text className="text-mistGray/30 text-[9px] font-black uppercase tracking-widest">
                      Rhythm Cycle
                    </Text>
                    <Text className="text-sacredWhite/60 text-[9px] font-black uppercase tracking-widest">
                      {state.cycleIdx + 1} of {TOTAL_CYCLES}
                    </Text>
                  </HStack>
                </VStack>
              </>
            ) : (
              <VStack className="items-center gap-2 opacity-40">
                <Text className="text-mistGray text-sm font-bold tracking-tight">
                  Harmonize your pulse
                </Text>
                <Text className="text-mistGray/60 text-[10px] uppercase font-black tracking-[0.2em] italic">
                  ~1 Minute 4-2-6-2 Calibration
                </Text>
              </VStack>
            )}
          </VStack>

          <Button
            onPress={state.active ? stop : start}
            className={`px-12 h-16 rounded-[20px] shadow-2xl transition-all active:scale-[0.98] ${
              state.active
                ? 'bg-shroud border border-white/10'
                : 'bg-sanctuarySaffron shadow-sanctuarySaffron/30'
            }`}
          >
            <HStack className="items-center gap-3">
              <Icon
                as={state.active ? Pause : Play}
                size={20}
                className={state.active ? 'text-sacredWhite' : 'text-obsidian'}
              />
              <ButtonText
                className={`font-black uppercase tracking-[0.15em] text-xs ${
                  state.active ? 'text-sacredWhite' : 'text-obsidian'
                }`}
              >
                {state.active ? 'Cease Exercise' : 'Initiate Resonance'}
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      )}
    </VStack>
  );
}

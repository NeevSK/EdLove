/**
 * BREATH GUIDE (Web)
 * 4-2-6-2 breathing rhythm optimized for web performance.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption.
 */

import { Box, Button, ButtonText, Heading, HStack, Icon, Text, VStack } from '@repo/ui';
import { Activity, Pause, Play, RotateCcw, ShieldCheck, Sparkles, Wind } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BreathGuideProps {
  onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const CYCLE: Array<{
  phase: Phase;
  duration: number;
  label: string;
  color: string;
  accentColor: string;
}> = [
  {
    phase: 'inhale',
    duration: 4000,
    label: 'Inspire Deeply',
    color: 'text-skyBlue',
    accentColor: '#3B82F6',
  },
  {
    phase: 'hold',
    duration: 2000,
    label: 'Pause in Fullness',
    color: 'text-sanctuarySaffron',
    accentColor: '#F6B100',
  },
  {
    phase: 'exhale',
    duration: 6000,
    label: 'Release Slowly',
    color: 'text-emeraldGreen',
    accentColor: '#10B981',
  },
  {
    phase: 'rest',
    duration: 2000,
    label: 'Rest in Stillness',
    color: 'text-mistGray',
    accentColor: '#6A6358',
  },
];

const TOTAL_CYCLES = 4;

export default function BreathGuide({ onComplete }: BreathGuideProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePhase = CYCLE[phaseIdx] || CYCLE[0]!;

  const advance = (cycleIndex: number, phaseIndex: number) => {
    const nextPhaseIndex = (phaseIndex + 1) % CYCLE.length;
    const nextCycleIndex = nextPhaseIndex === 0 ? cycleIndex + 1 : cycleIndex;
    const nextPhase = CYCLE[nextPhaseIndex];

    if (nextCycleIndex >= TOTAL_CYCLES) {
      setActive(false);
      setDone(true);
      onComplete?.();
      return;
    }

    if (!nextPhase) return;

    setPhaseIdx(nextPhaseIndex);
    setCycleIdx(nextCycleIndex);
    timerRef.current = setTimeout(
      () => advance(nextCycleIndex, nextPhaseIndex),
      nextPhase.duration,
    );
  };

  const start = () => {
    setDone(false);
    setPhaseIdx(0);
    setCycleIdx(0);
    setActive(true);
    // Start after first phase duration
    const firstPhase = CYCLE[0];
    if (firstPhase) {
      timerRef.current = setTimeout(() => advance(0, 0), firstPhase.duration);
    }
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Web Scale Logic using ARRAYS for React Native compatibility
  const scale =
    active && (activePhase.phase === 'inhale' || activePhase.phase === 'hold')
      ? 1.5
      : active && activePhase.phase === 'exhale'
        ? 0.75
        : 1.0;

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

      {done ? (
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
          {/* Breathing Orb */}
          <Box className="relative items-center justify-center">
            <Box
              className="w-40 h-40 items-center justify-center rounded-full transition-all duration-700"
              style={
                {
                  transform: [{ scale }],
                  transition: `transform ${active ? activePhase.duration : 600}ms cubic-bezier(0.4, 0, 0.2, 1), background 500ms, border-color 500ms`,
                  background: active
                    ? `radial-gradient(circle, ${activePhase.accentColor}33 0%, ${activePhase.accentColor}05 100%)`
                    : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${active ? activePhase.accentColor : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: active ? `0 0 60px ${activePhase.accentColor}11` : 'none',
                } as any
              }
            >
              <Icon
                as={Wind}
                size={48}
                className={active ? activePhase.color : 'text-mistGray/10'}
              />
            </Box>

            {/* Outer Pulse Rings */}
            {active && (
              <>
                <Box
                  className="absolute inset-[-20px] rounded-full border border-white/5 animate-ping opacity-20"
                  style={{ borderColor: activePhase.accentColor, animationDuration: '3s' } as any}
                />
                <Box
                  className="absolute inset-[-40px] rounded-full border border-white/5 animate-ping opacity-10"
                  style={{ borderColor: activePhase.accentColor, animationDuration: '4s' } as any}
                />
              </>
            )}
          </Box>

          {/* Status Text */}
          <VStack className="items-center h-24 gap-4 w-64">
            {active ? (
              <>
                <Heading
                  className={`${activePhase.color} transition-colors duration-500 text-3xl font-black tracking-tighter text-center`}
                >
                  {activePhase.label}
                </Heading>
                <VStack className="items-center gap-3 w-full">
                  <Box className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <Box
                      className={`h-full ${activePhase.color.replace('text-', 'bg-')} transition-all duration-300`}
                      style={
                        {
                          width: `${((cycleIdx * CYCLE.length + phaseIdx + 1) / (TOTAL_CYCLES * CYCLE.length)) * 100}%`,
                        } as any
                      }
                    />
                  </Box>
                  <HStack className="justify-between w-full px-1">
                    <Text className="text-mistGray/30 text-[9px] font-black uppercase tracking-widest">
                      Rhythm Cycle
                    </Text>
                    <Text className="text-sacredWhite/60 text-[9px] font-black uppercase tracking-widest">
                      {cycleIdx + 1} of {TOTAL_CYCLES}
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

          {/* Action Button */}
          {!done && (
            <Button
              onPress={active ? stop : start}
              className={`px-12 h-16 rounded-[20px] shadow-2xl transition-all active:scale-[0.98] ${
                active
                  ? 'bg-shroud border border-white/10'
                  : 'bg-sanctuarySaffron shadow-sanctuarySaffron/30'
              }`}
            >
              <HStack className="items-center gap-3">
                <Icon
                  as={active ? Pause : Play}
                  size={20}
                  className={active ? 'text-sacredWhite' : 'text-obsidian'}
                />
                <ButtonText
                  className={`font-black uppercase tracking-[0.15em] text-xs ${active ? 'text-sacredWhite' : 'text-obsidian'}`}
                >
                  {active ? 'Cease Exercise' : 'Initiate Resonance'}
                </ButtonText>
              </HStack>
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
}

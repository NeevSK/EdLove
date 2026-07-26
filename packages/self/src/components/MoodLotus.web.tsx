/**
 * MOOD LOTUS (Web)
 * Somatic mood resonance and paced breathing module.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and integrated Sanctuary design tokens.
 */

import { useTemporalStore } from '@repo/core/logic';
import { Activity, ChevronRight, CircleCheck, Clock, Wind } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useEffect, useRef, useState } from 'react';
import { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useMoodLogs } from '@/hooks/useMoodLogs';

interface MoodLotusProps {
  userId?: string;
  onMoodChange?: (mood: number) => void;
  variant?: 'summary' | 'detail';
}

const LOTUS_EMOJIS = ['', '🪷', '🌷', '🌸', '💐', '✨'];
const MOOD_OPTION_LABELS = ['', 'Struggling', 'Challenging', 'Okay', 'Good', 'Flourishing'];
const MOOD_TOKEN_COLORS = [
  '',
  'text-emberRed',
  'text-amberGlow',
  'text-mistGray',
  'text-emeraldGreen',
  'text-sanctuarySaffron',
];
const MOOD_TOKEN_BGS = [
  '',
  'bg-emberRed',
  'bg-amberGlow',
  'bg-mistGray',
  'bg-emeraldGreen',
  'bg-sanctuarySaffron',
];
const _MOOD_ACCENTS = ['', '#FF453A', '#FF9F0A', '#6A6358', '#34C759', '#F6B100'];

const BREATH_STEPS = [
  { label: 'Breathe In', seconds: 4, color: 'text-skyBlue', accent: '#3B82F6' },
  { label: 'Sustain', seconds: 4, color: 'text-amberGlow', accent: '#FF9F0A' },
  {
    label: 'Breathe Out',
    seconds: 6,
    color: 'text-emeraldGreen',
    accent: '#10B981',
  },
];

export default function MoodLotus({ userId, onMoodChange, variant = 'summary' }: MoodLotusProps) {
  const { moodHistory, addMoodLog, isLoading } = useMoodLogs(userId);
  const isPastView = useTemporalStore((s) => s.isPastView);

  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const [breathStep, setBreathStep] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, []);

  const latestScore = moodHistory[0]?.mood_score ?? null;
  const displayScore = selected ?? latestScore;
  const isDetail = variant === 'detail';

  const handleSave = async () => {
    if (!selected || !userId) return;
    const moodMap: Record<number, 'sad' | 'frustrated' | 'calm' | 'curious' | 'joyful'> = {
      1: 'sad',
      2: 'frustrated',
      3: 'calm',
      4: 'curious',
      5: 'joyful',
    };
    setSaving(true);
    try {
      await addMoodLog(moodMap[selected], note || undefined);
      onMoodChange?.(selected);
      setSaved(true);
      setNote('');
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Failed to log mood:', error);
    } finally {
      setSaving(false);
    }
  };

  const startBreath = () => {
    setBreathStep(0);
    setBreathActive(true);
    const durations = [4000, 4000, 6000];
    let i = 0;
    const cycle = () => {
      breathTimerRef.current = setTimeout(() => {
        i = (i + 1) % 3;
        setBreathStep(i);
        cycle();
      }, durations[i]);
    };
    cycle();
  };

  const stopBreath = () => {
    if (breathTimerRef.current) {
      clearTimeout(breathTimerRef.current);
      breathTimerRef.current = null;
    }
    setBreathActive(false);
    setBreathStep(0);
  };

  return (
    <VStack className={`gap-8 ${isDetail ? 'w-full' : ''}`}>
      <HStack className={`gap-8 ${isDetail ? 'flex-col lg:flex-row' : 'flex-col'}`}>
        {/* Interaction Mainframe */}
        <VStack className="flex-1 gap-8">
          {/* Semantic Header */}
          <HStack className="justify-between items-center">
            <VStack className="gap-1">
              <HStack className="items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 self-start">
                <Icon as={Activity} size={10} className="text-sanctuarySaffron" />
                <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-mistGray/60">
                  Somatic Resonance
                </Text>
              </HStack>
              <Heading size="md" className="text-sacredWhite font-black tracking-tighter">
                Your Current Presence
              </Heading>
            </VStack>
            {!isDetail && (
              <Pressable
                onPress={() => {
                  if (showBreath) stopBreath();
                  setShowBreath((v) => !v);
                }}
                className={`px-4 py-2 rounded-xl transition-all active:scale-95 ${showBreath ? 'bg-shroud border border-white/10' : 'bg-white/5 border border-white/10'}`}
              >
                <HStack className="items-center gap-2">
                  <Icon
                    as={Wind}
                    size={14}
                    className={showBreath ? 'text-mistGray' : 'text-sanctuarySaffron'}
                  />
                  <Text
                    className={`text-[11px] font-black uppercase tracking-widest ${showBreath ? 'text-mistGray' : 'text-sanctuarySaffron'}`}
                  >
                    Breath Control
                  </Text>
                </HStack>
              </Pressable>
            )}
          </HStack>

          {/* Aesthetic Lotus Visualization */}
          <Box className="items-center justify-center p-12 bg-shroud rounded-[40px] border border-white/5 min-h-[300px] relative overflow-hidden shadow-2xl">
            {/* Dynamic Glow Aura */}
            {displayScore && (
              <Box
                className={`absolute w-[200px] h-[200px] blur-[100px] opacity-20 rounded-full transition-all duration-1000 ${MOOD_TOKEN_BGS[displayScore]}`}
                style={{ transform: [{ scale: 1.5 }] }}
              />
            )}

            <AnimatedView layout={Layout} entering={FadeIn.duration(600)}>
              <Text
                className={`${isDetail ? 'text-[140px]' : 'text-[100px]'} select-none transition-transform duration-500 hover:scale-110 drop-shadow-2xl`}
              >
                {LOTUS_EMOJIS[displayScore ?? 0] || '🪷'}
              </Text>
            </AnimatedView>

            {displayScore !== null && (
              <Box className="items-center mt-6">
                <AnimatedView entering={FadeInDown}>
                  <Heading
                    className={`text-2xl font-black tracking-tighter ${MOOD_TOKEN_COLORS[displayScore]}`}
                  >
                    {MOOD_OPTION_LABELS[displayScore]}
                  </Heading>
                </AnimatedView>
                <Text className="text-mistGray/40 text-[10px] uppercase font-black tracking-[0.2em] mt-1">
                  Status Synchronized
                </Text>
              </Box>
            )}
          </Box>

          {/* Petal Input Array */}
          <VStack className="gap-6">
            <HStack className="justify-center gap-4">
              {[1, 2, 3, 4, 5].map((score) => (
                <Pressable
                  key={score}
                  onPress={() => !isPastView && setSelected(score)}
                  className={`w-16 h-16 rounded-[20px] items-center justify-center transition-all duration-300 active:scale-90 ${
                    selected === score
                      ? `${MOOD_TOKEN_BGS[score]} border-2 border-white/20 shadow-xl -translate-y-2`
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Text className="text-3xl">{LOTUS_EMOJIS[score]}</Text>
                </Pressable>
              ))}
            </HStack>

            {/* Intention Log */}
            {selected !== null && (
              <AnimatedView entering={FadeInDown} layout={Layout} className="gap-4">
                <VStack className="gap-1.5">
                  <Text className="text-[10px] uppercase font-black tracking-widest text-mistGray/40 pl-1">
                    Resonance Note
                  </Text>
                  <Input className="bg-shroud border-white/10 h-14 rounded-2xl shadow-inner">
                    <InputField
                      placeholder={
                        isPastView ? 'Preserved Record' : 'Capture the essence of this moment...'
                      }
                      value={note}
                      onChangeText={setNote}
                      readOnly={isPastView}
                      className="text-sacredWhite text-sm"
                      placeholderTextColor="#6A635844"
                    />
                  </Input>
                </VStack>
                <Button
                  onPress={handleSave}
                  isDisabled={saving || isPastView}
                  className={`h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98] ${displayScore ? MOOD_TOKEN_BGS[displayScore] : 'bg-sanctuarySaffron'}`}
                >
                  <HStack className="items-center gap-2">
                    {saving ? (
                      <Spinner size="small" color="#FFFFFF" />
                    ) : saved ? (
                      <Icon as={CircleCheck} size={18} className="text-white" />
                    ) : null}
                    <ButtonText className="text-white font-black uppercase tracking-widest text-xs">
                      {saving ? 'Syncing...' : saved ? 'Resonance Captured' : 'Commit Intention'}
                    </ButtonText>
                  </HStack>
                </Button>
              </AnimatedView>
            )}
          </VStack>

          {/* Dynamic Paced Breathing (Web Optimized) */}
          {(showBreath || isDetail) && (
            <AnimatedView entering={FadeInDown} layout={Layout}>
              <Box className="p-8 bg-skyBlue/5 rounded-[32px] border border-skyBlue/10 items-center justify-center shadow-xl">
                <VStack className="items-center gap-6 w-full">
                  <HStack className="items-center gap-2 px-3 py-1 bg-skyBlue/10 rounded-full border border-skyBlue/20">
                    <Icon as={Wind} size={10} className="text-skyBlue" />
                    <Text className="text-[9px] font-black uppercase tracking-[0.2em] text-skyBlue">
                      Nervous System Calibration
                    </Text>
                  </HStack>

                  {breathActive ? (
                    <VStack className="items-center gap-6">
                      <VStack className="items-center gap-1">
                        <Text
                          className={`text-4xl font-black tracking-tighter transition-colors duration-500 ${BREATH_STEPS[breathStep]?.color}`}
                        >
                          {BREATH_STEPS[breathStep]?.label}
                        </Text>
                        <HStack className="items-center gap-2 opacity-40">
                          <Icon as={Clock} className="text-mistGray" size={12} />
                          <Text className="text-[10px] text-mistGray font-black uppercase tracking-widest">
                            {BREATH_STEPS[breathStep]?.seconds}s Remaining
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Pulsing Visualizer */}
                      <Box
                        className="w-24 h-24 rounded-full transition-all duration-1000 items-center justify-center"
                        style={
                          {
                            background: `radial-gradient(circle, ${BREATH_STEPS[breathStep]?.accent}44 0%, transparent 70%)`,
                            transform: [
                              {
                                scale: breathStep === 1 ? 1.5 : breathStep === 2 ? 0.8 : 1.2,
                              },
                            ],
                          } as any
                        }
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onPress={stopBreath}
                        className="rounded-xl border-white/10 h-10 px-8"
                      >
                        <ButtonText className="text-mistGray text-[10px] font-black uppercase tracking-widest">
                          End Session
                        </ButtonText>
                      </Button>
                    </VStack>
                  ) : (
                    <VStack className="items-center gap-6">
                      <Text className="text-sm text-mistGray/60 text-center max-w-sm leading-relaxed font-medium">
                        Harmonize your pulse with a 4-4-6 rhythmic flow designed to root your
                        presence and dissolve cognitive static.
                      </Text>
                      <Button
                        onPress={startBreath}
                        className="bg-skyBlue rounded-2xl h-12 px-10 shadow-lg shadow-skyBlue/20"
                      >
                        <HStack className="items-center gap-2">
                          <Icon as={Activity} size={16} className="text-white" />
                          <ButtonText className="text-white font-black uppercase tracking-widest text-[11px]">
                            Initiate Flow
                          </ButtonText>
                        </HStack>
                      </Button>
                    </VStack>
                  )}
                </VStack>
              </Box>
            </AnimatedView>
          )}
        </VStack>

        {/* Historical Temporal Sidebar */}
        {isDetail && (
          <VStack className="w-full lg:w-[360px] gap-6">
            <HStack className="items-center gap-2 px-1">
              <Box className="w-6 h-6 rounded-full bg-mistGray/10 items-center justify-center">
                <Icon as={Clock} className="text-mistGray" size={12} />
              </Box>
              <Heading size="xs" className="text-mistGray/60 font-black uppercase tracking-[0.2em]">
                Temporal Echoes
              </Heading>
            </HStack>

            <VStack className="gap-3">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    className="h-24 bg-shroud rounded-2xl border border-white/5 animate-pulse"
                  />
                ))
              ) : moodHistory.length > 0 ? (
                moodHistory.slice(0, 10).map((m, idx) => (
                  <AnimatedView key={m.id} entering={FadeInDown.delay(idx * 100)}>
                    <HStack className="p-5 bg-shroud rounded-[24px] border border-white/5 items-center gap-5 hover:border-white/10 transition-colors">
                      <Box
                        className={`w-12 h-12 rounded-[18px] items-center justify-center shadow-lg ${MOOD_TOKEN_BGS[m.mood_score]}`}
                      >
                        <Text className="text-2xl">{LOTUS_EMOJIS[m.mood_score]}</Text>
                      </Box>
                      <VStack className="flex-1">
                        <HStack className="justify-between items-center w-full">
                          <Text className="text-sm font-black tracking-tight text-sacredWhite">
                            {MOOD_OPTION_LABELS[m.mood_score]}
                          </Text>
                          <Icon as={ChevronRight} size={12} className="text-mistGray/20" />
                        </HStack>
                        <Text className="text-[10px] text-mistGray/40 uppercase font-black tracking-widest">
                          {new Date(m.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        {m.note && (
                          <Box className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <Text className="text-[11px] text-mistGray/80 leading-relaxed italic">
                              "{m.note}"
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </HStack>
                  </AnimatedView>
                ))
              ) : (
                <Box className="py-12 items-center opacity-20">
                  <Text className="text-xs font-black uppercase tracking-widest text-mistGray">
                    No echoes found
                  </Text>
                </Box>
              )}
            </VStack>
          </VStack>
        )}
      </HStack>
    </VStack>
  );
}

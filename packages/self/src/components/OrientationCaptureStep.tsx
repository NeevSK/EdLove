/**
 * ORIENTATION CAPTURE STEP
 * Onboarding step for learning preference orientation.
 * Standardized to Zero-Legacy: purged corrupted imports and migrated to Sanctuary V3 architecture.
 */

import type { OrientationSeeds as ProfileOrientationSeeds } from '@repo/profile';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  FolderCheck,
  Map as MapIcon,
  Microscope,
  PenTool,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  WavesHorizontal,
  Wrench,
  Zap,
} from 'lucide-react-native';
import type React from 'react';
import { useCallback, useState } from 'react';
import Animated, { FadeIn, FadeInRight, Layout } from 'react-native-reanimated';

type OrientationSeeds = {
  depth_breadth: number;
  reflect_act: number;
  solo_social: number;
  steady_surge: number;
  source: 'seeded' | 'inferred' | 'mixed';
  seeded_at?: string;
  last_updated?: string;
};

// ============================================================================
// DATA
// ============================================================================

interface OptionCard {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description?: string;
  delta: Partial<Record<'depth_breadth' | 'reflect_act' | 'solo_social' | 'steady_surge', number>>;
}

interface Question {
  situation: string;
  prompt: string;
  options: [OptionCard, OptionCard, OptionCard, OptionCard];
}

const QUESTIONS: Question[] = [
  {
    situation: 'A free Sunday afternoon. You want to learn something new.',
    prompt: 'Which feels most like you?',
    options: [
      {
        icon: Microscope,
        label: 'Precision Depth',
        description: 'Go deep into one fascinating topic for hours',
        delta: { depth_breadth: -20, reflect_act: -10 },
      },
      {
        icon: MapIcon,
        label: 'Expansive Journey',
        description: 'Browse widely — follow curiosity wherever it leads',
        delta: { depth_breadth: 20, reflect_act: 10 },
      },
      {
        icon: Wrench,
        label: 'Active Creation',
        description: 'Try making or building something new straight away',
        delta: { reflect_act: 20, depth_breadth: 0 },
      },
      {
        icon: BookOpen,
        label: 'Quiet Absorption',
        description: 'Sit quietly, read, and let ideas settle',
        delta: { reflect_act: -20, depth_breadth: -5 },
      },
    ],
  },
  {
    situation: 'You are stuck on a difficult problem at school or work.',
    prompt: 'What gives you the most energy?',
    options: [
      {
        icon: User,
        label: 'Internal Synthesis',
        description: 'Stepping away to think it through alone first',
        delta: { solo_social: -22 },
      },
      {
        icon: Users,
        label: 'Collaborative Echo',
        description: 'Talking it through with a colleague or friend',
        delta: { solo_social: 22 },
      },
      {
        icon: PenTool,
        label: 'Visible Reasoning',
        description: 'Writing or drawing your thoughts to clarify them',
        delta: { solo_social: -12, reflect_act: -10 },
      },
      {
        icon: RefreshCw,
        label: 'Dynamic Iteration',
        description: 'Trying different approaches until something clicks',
        delta: { solo_social: 12, reflect_act: 12 },
      },
    ],
  },
  {
    situation: 'A big project is ahead of you — a term, a semester, a year.',
    prompt: 'How do you work best?',
    options: [
      {
        icon: Calendar,
        label: 'Steady Rhythm',
        description: 'Steady daily progress — consistent steps',
        delta: { steady_surge: -22 },
      },
      {
        icon: Zap,
        label: 'Focused Sprints',
        description: 'Deep focused bursts, then intuitive rest',
        delta: { steady_surge: 22 },
      },
      {
        icon: WavesHorizontal,
        label: 'Natural Flow',
        description: 'Let energy rise and fall naturally with the work',
        delta: { steady_surge: 10, reflect_act: -8 },
      },
      {
        icon: FolderCheck,
        label: 'Milestone Order',
        description: 'Clear structure with planned checkpoints',
        delta: { steady_surge: -12, reflect_act: -10 },
      },
    ],
  },
];

// ============================================================================
// PROPS
// ============================================================================

export interface OrientationCaptureStepProps {
  onComplete: (seeds: ProfileOrientationSeeds) => void;
  onSkip: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const OrientationCaptureStep = ({
  onComplete,
  onSkip,
  onBack,
  currentStep,
  totalSteps,
}: OrientationCaptureStepProps) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedPerQuestion, setSelectedPerQuestion] = useState<number[]>([]);

  const isLast = questionIndex === QUESTIONS.length - 1;

  const handleSelect = useCallback(
    (optionIndex: number) => {
      hapticLight();
      const updated = [...selectedPerQuestion];
      updated[questionIndex] = optionIndex;
      setSelectedPerQuestion(updated);

      setTimeout(() => {
        if (isLast) {
          const seeds = computeSeeds([...updated]);
          hapticSuccess();
          onComplete(seeds);
        } else {
          setQuestionIndex((qi) => qi + 1);
        }
      }, 300);
    },
    [questionIndex, selectedPerQuestion, isLast, onComplete],
  );

  const handleBack = useCallback(() => {
    hapticLight();
    if (questionIndex > 0) {
      setQuestionIndex((qi) => qi - 1);
    } else {
      onBack();
    }
  }, [questionIndex, onBack]);

  const question = QUESTIONS[questionIndex];
  if (!question) return null;

  const selected = selectedPerQuestion[questionIndex] ?? -1;

  return (
    <VStack className="flex-1 bg-shroud">
      {/* Step Indicator */}
      <HStack className="justify-center gap-2 pt-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Box
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStep
                ? 'w-8 bg-sanctuarySaffron'
                : i < currentStep
                  ? 'w-2 bg-emeraldGreen'
                  : 'w-2 bg-white/10'
            }`}
          />
        ))}
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View layout={Layout} entering={FadeIn.duration(600)}>
          <VStack className="gap-2 mb-10">
            <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-[0.3em]">
              Sequence {questionIndex + 1} of {QUESTIONS.length}
            </Text>
            <Heading size="lg" className="text-sacredWhite font-black leading-tight tracking-tight">
              {question.situation}
            </Heading>
            <Text className="text-mistGray/50 text-sm font-medium italic mt-1">
              {question.prompt}
            </Text>
          </VStack>
        </Animated.View>

        {/* Options Grid-ish */}
        <VStack className="gap-4">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <Animated.View key={opt.label} entering={FadeInRight.delay(i * 100)} layout={Layout}>
                <Pressable
                  onPress={() => handleSelect(i)}
                  accessibilityRole="button"
                  className={`p-6 rounded-3xl border transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-sanctuarySaffron/10 border-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/10'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <HStack className="items-center gap-5">
                    <Box
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${isSelected ? 'bg-sanctuarySaffron' : 'bg-white/5'}`}
                    >
                      <Icon
                        as={opt.icon}
                        size={24}
                        className={isSelected ? 'text-obsidian' : 'text-mistGray/40'}
                      />
                    </Box>
                    <VStack className="flex-1 gap-1">
                      <Text
                        className={`text-sm font-bold ${isSelected ? 'text-sacredWhite' : 'text-mistGray/80'}`}
                      >
                        {opt.label}
                      </Text>
                      <Text className="text-xs text-mistGray/40 font-medium leading-relaxed">
                        {opt.description}
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
              </Animated.View>
            );
          })}
        </VStack>

        {/* Privacy note */}
        <HStack className="mt-12 gap-2 bg-white/3 p-4 rounded-2xl border border-white/5">
          <Icon as={ShieldCheck} size={14} className="text-emeraldGreen shrink-0 mt-0.5" />
          <Text className="text-[10px] text-mistGray/40 font-medium leading-relaxed">
            Your choices remain private to your local sanctuary. We use these insights to resonate
            more deeply with your natural rhythm — never for categorization.
          </Text>
        </HStack>
      </ScrollView>

      {/* Footer actions */}
      <HStack className="p-6 pb-12 gap-4 items-center">
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          className="flex-1 h-14 rounded-2xl border border-white/10 items-center justify-center flex-row gap-2 active:bg-white/5"
        >
          <Icon as={ChevronLeft} className="text-mistGray/60" size={16} />
          <Text className="text-mistGray/60 text-sm font-black uppercase tracking-widest">
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          className="flex-1 items-center justify-center h-14 active:opacity-50"
        >
          <Text className="text-mistGray/30 text-xs font-black uppercase tracking-widest">
            Skip for now
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
};

// ============================================================================
// SEED COMPUTATION
// ============================================================================

export function computeSeeds(selections: number[]): OrientationSeeds {
  const acc: Record<'depth_breadth' | 'reflect_act' | 'solo_social' | 'steady_surge', number> = {
    depth_breadth: 50,
    reflect_act: 50,
    solo_social: 50,
    steady_surge: 50,
  };

  selections.forEach((optIdx, qIdx) => {
    const currentQuestion = QUESTIONS[qIdx];
    if (!currentQuestion) return;

    const option = currentQuestion.options[optIdx];
    if (!option) return;

    const delta = option.delta;
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined && key in acc) {
        const k = key as keyof typeof acc;
        acc[k] = Math.max(0, Math.min(100, acc[k] + (val as number)));
      }
    }
  });

  return {
    depth_breadth: acc.depth_breadth || 50,
    reflect_act: acc.reflect_act || 50,
    solo_social: acc.solo_social || 50,
    steady_surge: acc.steady_surge || 50,
    source: 'seeded',
    seeded_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
}

import { studentPotentialAPI } from '@repo/core/api/studentPotential';
import { useScaffoldDismissal } from '@repo/core/hooks';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Brain, Check, Heart, Sparkles, Users, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { Theme } from '@repo/ui/theme/Theme';
import { hapticLight, hapticMedium, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TactilePulseGestureProps {
  student: {
    id: string;
    student_id?: string | null;
    full_name?: string;
    name?: string;
    roll_number?: number | string | null;
  } | null;
  classroomId: string;
  isOpen: boolean;
  onClose: () => void;
  onPulseRecorded?: (pulse: {
    studentId: string;
    dimensionKey: string;
    score: number;
    silverLining: string;
  }) => void;
}

const CANONICAL_DIMENSIONS = [
  {
    key: 'cognitive_flow',
    label: 'Cognitive Flow',
    description: 'Deep immersion, problem-solving tenacity & focus',
    color: '#D4843A',
    icon: Brain,
  },
  {
    key: 'emotional_resonance',
    label: 'Emotional Resonance',
    description: 'Self-grounding, active listening & empathy',
    color: '#E5A967',
    icon: Heart,
  },
  {
    key: 'social_weaving',
    label: 'Social Weaving',
    description: 'Generous collaboration & uplifting peer support',
    color: '#4A7C59',
    icon: Users,
  },
  {
    key: 'creative_spark',
    label: 'Creative Spark',
    description: 'Divergent imagination, curiosity & originality',
    color: '#8F5C38',
    icon: Sparkles,
  },
  {
    key: 'practical_mastery',
    label: 'Practical Mastery',
    description: 'Hands-on craft execution & iterative refinement',
    color: '#2B4C3F',
    icon: Check,
  },
] as const;

const SCORE_LEVELS = [
  { value: 40, label: 'Emerging', description: 'Early spark detected' },
  { value: 65, label: 'Harmonizing', description: 'Steady constructive flow' },
  { value: 85, label: 'Resonating', description: 'Vibrant, uplifting mastery' },
  { value: 100, label: 'Transcendent', description: 'Exceptional breakthrough' },
] as const;

const QUICK_SILVER_LININGS = [
  'Quiet, unbreakable focus today',
  'Empathetically uplifted a struggling peer',
  'Tenacious curiosity through complex problem',
  'Creative breakthrough on open inquiry',
  'Hands-on craft executed with deep care',
] as const;

export const TactilePulseGesture: React.FC<TactilePulseGestureProps> = ({
  student,
  classroomId,
  isOpen,
  onClose,
  onPulseRecorded,
}) => {
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();
  const { completeScaffold } = useScaffoldDismissal('first_potential_attunement', 1);

  const [selectedDimension, setSelectedDimension] = useState<string>('cognitive_flow');
  const [selectedScore, setSelectedScore] = useState<number>(85);
  const [selectedSilverLining, setSelectedSilverLining] = useState<string>(QUICK_SILVER_LININGS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!student) return null;
  const studentDisplayName = student.full_name || student.name || 'Student';

  const handleRecordPulse = async () => {
    try {
      setIsSubmitting(true);
      hapticMedium();

      // Upsert the potential attunement via API
      await studentPotentialAPI.upsert({
        student_id: student.student_id || student.id,
        classroom_id: classroomId,
        cognitive_flow: selectedDimension === 'cognitive_flow' ? selectedScore : 70,
        emotional_resonance: selectedDimension === 'emotional_resonance' ? selectedScore : 70,
        social_weaving: selectedDimension === 'social_weaving' ? selectedScore : 65,
        creative_spark: selectedDimension === 'creative_spark' ? selectedScore : 75,
        practical_mastery: selectedDimension === 'practical_mastery' ? selectedScore : 70,
        silver_lining: selectedSilverLining,
        potential_notes: [
          {
            dimension: selectedDimension,
            score: selectedScore,
            recorded_at: new Date().toISOString(),
          },
        ],
      });

      hapticSuccess();
      completeScaffold();

      onPulseRecorded?.({
        studentId: student.student_id || student.id,
        dimensionKey: selectedDimension,
        score: selectedScore,
        silverLining: selectedSilverLining,
      });

      showToast({
        message: `Attunement pulse recorded for ${studentDisplayName}`,
        type: 'success',
      });

      onClose();
    } catch (error) {
      console.error('[TactilePulseGesture] Failed to record pulse:', error);
      showToast({
        message: 'Could not record pulse. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('classroom.pulse.title') || 'Tactile Resonance Pulse'}
      footer={
        <HStack className="gap-3 w-full">
          <Button
            onPress={onClose}
            className="flex-1 bg-sanctuary-surface-tertiary rounded-full h-12"
          >
            <ButtonText className="text-sanctuary-text">
              {t('common.cancel') || 'Cancel'}
            </ButtonText>
          </Button>
          <Button
            onPress={handleRecordPulse}
            disabled={isSubmitting}
            className="flex-1 bg-sanctuarySaffron rounded-full h-12 shadow-md"
          >
            <ButtonText className="text-white font-bold">
              {isSubmitting ? 'Attuning...' : 'Record Pulse'}
            </ButtonText>
          </Button>
        </HStack>
      }
    >
      <VStack className="gap-6 py-2">
        {/* Header / Student Context */}
        <HStack className="items-center justify-between p-3 rounded-2xl bg-sanctuary-surface-secondary border border-sanctuary-border/30">
          <HStack className="gap-3 items-center">
            <Box className="w-10 h-10 rounded-full bg-sanctuarySaffron/10 border border-sanctuarySaffron/30 items-center justify-center">
              <Text className="text-sanctuarySaffron font-black text-sm">
                {student.roll_number ?? '#'}
              </Text>
            </Box>
            <VStack>
              <Text className="text-sanctuary-text font-bold text-base">
                {studentDisplayName}
              </Text>
              <Text className="text-xs text-sanctuary-text-tertiary">
                8-Second Symmetrical Attunement
              </Text>
            </VStack>
          </HStack>
          <Box className="px-2.5 py-1 rounded-full bg-templeGold/10 border border-templeGold/30">
            <Text className="text-[10px] font-black text-templeGold uppercase tracking-wider">
              Living Pulse
            </Text>
          </Box>
        </HStack>

        {/* 1. Dimension Selector */}
        <VStack className="gap-2">
          <Text className="text-xs font-bold text-sanctuary-text-secondary uppercase tracking-wider">
            1. Select Radiant Dimension
          </Text>
          <HStack className="flex-wrap gap-2">
            {CANONICAL_DIMENSIONS.map((dim) => {
              const isSelected = selectedDimension === dim.key;
              return (
                <Pressable
                  key={dim.key}
                  onPress={() => {
                    hapticLight();
                    setSelectedDimension(dim.key);
                  }}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                    isSelected
                      ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron'
                      : 'bg-sanctuary-surface-secondary border-sanctuary-border/30'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={dim.label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Icon
                    as={dim.icon}
                    size={14}
                    className={isSelected ? 'text-sanctuarySaffron' : 'text-sanctuary-text-tertiary'}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-sanctuarySaffron' : 'text-sanctuary-text-secondary'
                    }`}
                  >
                    {dim.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* 2. Score Level Selector */}
        <VStack className="gap-2">
          <Text className="text-xs font-bold text-sanctuary-text-secondary uppercase tracking-wider">
            2. Attunement Amplitude
          </Text>
          <HStack className="gap-2 justify-between">
            {SCORE_LEVELS.map((lvl) => {
              const isSelected = selectedScore === lvl.value;
              return (
                <Pressable
                  key={lvl.value}
                  onPress={() => {
                    hapticLight();
                    setSelectedScore(lvl.value);
                  }}
                  className={`flex-1 p-2.5 rounded-xl border items-center ${
                    isSelected
                      ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron'
                      : 'bg-sanctuary-surface-secondary border-sanctuary-border/30'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={`${lvl.label} - ${lvl.value}%`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className={`text-base font-black ${
                      isSelected ? 'text-sanctuarySaffron' : 'text-sanctuary-text'
                    }`}
                  >
                    {lvl.value}%
                  </Text>
                  <Text
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-sanctuarySaffron' : 'text-sanctuary-text-tertiary'
                    }`}
                  >
                    {lvl.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* 3. Silver Lining Tag */}
        <VStack className="gap-2">
          <HStack className="items-center gap-1.5">
            <Icon as={Sparkles} size={14} className="text-templeGold" />
            <Text className="text-xs font-bold text-sanctuary-text-secondary uppercase tracking-wider">
              3. Silver Lining Spark
            </Text>
          </HStack>
          <VStack className="gap-1.5">
            {QUICK_SILVER_LININGS.map((lining) => {
              const isSelected = selectedSilverLining === lining;
              return (
                <Pressable
                  key={lining}
                  onPress={() => {
                    hapticLight();
                    setSelectedSilverLining(lining);
                  }}
                  className={`p-2.5 rounded-xl border ${
                    isSelected
                      ? 'bg-templeGold/10 border-templeGold'
                      : 'bg-sanctuary-surface-secondary border-sanctuary-border/30'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={lining}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className={`text-xs ${
                      isSelected ? 'text-templeGold font-semibold' : 'text-sanctuary-text-secondary'
                    }`}
                  >
                    "{lining}"
                  </Text>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      </VStack>
    </SanctuaryModal>
  );
};

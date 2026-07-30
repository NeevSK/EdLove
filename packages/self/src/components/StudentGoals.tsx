/**
 * STUDENT GOALS
 * Student-specific feature for tracking personal momentum and goals.
 * Standardized to Zero-Legacy: purified className utilities and ensured tag closure integrity.
 */

import { useSafeMutation } from '@repo/core/hooks';

import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { ChevronRight, Flame, Goal, Minus, Plus, Sparkles, Target, Trophy } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  InputField,
  Progress,
  ProgressFilledTrack,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';
import { useStudentGoals } from '@repo/self/hooks/useStudentGoals';

interface StudentGoalsProps {
  userId: string;
}

export default function StudentGoals({ userId }: StudentGoalsProps) {
  const { t } = useTranslation();
  const { goals, refreshData, isLoading, addGoal, updateGoal } = useStudentGoals(userId);

  const [newGoalText, setNewGoalText] = useState('');
  const [streak, setStreak] = useState(0);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    // Mock streak for now
    setStreak(5);
  }, []);

  const { mutate: saveGoal, isLoading: isSaving } = useSafeMutation(
    async (text: string) => {
      await addGoal(text);
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setNewGoalText('');
        setShowAddGoal(false);
        refreshData();
      },
    },
  );

  const handleAddGoal = async () => {
    if (!newGoalText.trim() || !userId) return;
    hapticLight();
    await saveGoal(newGoalText.trim());
  };

  const { mutate: updateGoalProgress } = useSafeMutation(
    async (variables: { id: string; progress: number }) => {
      await updateGoal(variables.id, { progress: variables.progress });
    },
    {
      onSuccess: () => {
        hapticLight();
        refreshData();
      },
    },
  );

  const handleUpdateProgress = (goalId: string, newProgress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    updateGoalProgress({ id: goalId, progress: clampedProgress });
  };

  const getStreakMessage = (days: number): string => {
    if (days === 0) return t('studentGoals.streakStart') || 'Start your streak!';
    return t('studentGoals.streakDays', { days }) || `${days} Day Streak`;
  };

  if (isLoading && userId) {
    return (
      <VStack className="gap-lg p-lg">
        <SkeletonCard height={120} />
        <SkeletonCard height={200} />
      </VStack>
    );
  }

  return (
    <VStack className="gap-lg p-lg">
      {/* Momentum Card */}
      <AnimatedView entering={FadeInUp.duration(600)}>
        <Box className="p-lg bg-obsidian rounded-comfortable border-l-4 border-l-sanctuarySaffron border-y border-r border-white/5 shadow-2xl">
          <VStack className="gap-4">
            <HStack className="justify-between items-center">
              <HStack className="items-center gap-2">
                <Icon as={Flame} className="text-sanctuarySaffron" size={20} />
                <Text className="text-sacredWhite/60 font-black uppercase tracking-[0.2em] text-[10px]">
                  Momentum
                </Text>
              </HStack>
              <Box className="bg-sanctuarySaffron/10 px-2 py-1 rounded-full">
                <Text className="text-sanctuarySaffron text-[10px] font-bold">Active</Text>
              </Box>
            </HStack>

            <VStack className="items-center py-2">
              <Text className="text-sanctuarySaffron text-4xl font-black tracking-tight text-center">
                {getStreakMessage(streak)}
              </Text>
              <Text className="text-mistGray text-xs text-center mt-2 opacity-60 italic">
                {t('studentGoals.streakDesc') || 'Keep completing tasks to fuel the fire.'}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </AnimatedView>

      {/* Goals Header */}
      <VStack className="gap-md">
        <HStack className="justify-between items-center px-1">
          <HStack className="items-center gap-3">
            <Icon as={Goal} className="text-sanctuarySaffron" size={24} />
            <Heading size="lg" className="text-sacredWhite font-black tracking-tight">
              {t('studentGoals.goalsTitle') || 'My Intentions'}
            </Heading>
          </HStack>

          <Button
            variant="ghost"
            onPress={() => {
              hapticLight();
              setShowAddGoal(!showAddGoal);
            }}
            className="px-0"
          >
            <ButtonText className="text-sanctuarySaffron font-bold text-sm">
              {showAddGoal
                ? t('common.cancel') || 'Close'
                : t('studentGoals.addGoal') || '+ New Goal'}
            </ButtonText>
          </Button>
        </HStack>

        {/* Add Goal Input */}
        {showAddGoal && (
          <AnimatedView entering={FadeInUp} layout={Layout.springify()}>
            <Box className="p-lg bg-white/5 rounded-3xl border border-white/10 mb-4 shadow-xl">
              <VStack className="gap-lg">
                <Box className="bg-obsidian rounded-2xl border border-white/10 p-2 h-16 justify-center">
                  <InputField
                    placeholder={t('studentGoals.goalPlaceholder') || 'What do you want to master?'}
                    value={newGoalText}
                    onChangeText={setNewGoalText}
                    className="text-sacredWhite px-4"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                  />
                </Box>

                <Button
                  onPress={handleAddGoal}
                  isDisabled={!newGoalText.trim() || isSaving}
                  className="bg-emeraldGreen h-14 rounded-full shadow-lg shadow-emeraldGreen/20"
                >
                  <HStack className="items-center gap-2">
                    <Icon as={Sparkles} className="text-white" size={18} />
                    <ButtonText className="text-white font-black uppercase tracking-widest text-xs">
                      {isSaving ? 'Planting...' : 'Set Foundation'}
                    </ButtonText>
                  </HStack>
                </Button>
              </VStack>
            </Box>
          </AnimatedView>
        )}

        {/* Goals List */}
        <VStack className="gap-4">
          {goals.map((goal, index) => (
            <AnimatedView
              key={goal.id}
              entering={FadeInRight.delay(index * 100)}
              layout={Layout.springify()}
            >
              <Box className="p-lg bg-white/5 rounded-3xl border border-white/5 shadow-sm">
                <VStack className="gap-5">
                  <HStack className="justify-between items-start">
                    <Text className="text-sacredWhite font-bold text-md flex-1 pr-4 leading-relaxed">
                      {goal.text}
                    </Text>
                    <Box
                      className={`px-3 py-1 rounded-full ${goal.progress === 100 ? 'bg-emeraldGreen/10' : 'bg-sanctuarySaffron/10'}`}
                    >
                      <Text
                        className={`text-[10px] font-black tracking-widest uppercase ${goal.progress === 100 ? 'text-emeraldGreen' : 'text-sanctuarySaffron'}`}
                      >
                        {goal.progress}%
                      </Text>
                    </Box>
                  </HStack>

                  <VStack className="gap-3">
                    <Progress
                      value={goal.progress}
                      className="h-2.5 bg-white/5 rounded-full overflow-hidden"
                    >
                      <ProgressFilledTrack
                        className={
                          goal.progress === 100 ? 'bg-emeraldGreen' : 'bg-sanctuarySaffron'
                        }
                      />
                    </Progress>

                    <HStack className="justify-between items-center">
                      {goal.progress < 100 ? (
                        <HStack className="gap-4">
                          <Button
                            onPress={() => {
                              hapticLight();
                              handleUpdateProgress(goal.id, goal.progress - 10);
                            }}
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 items-center justify-center p-0"
                          >
                            <Icon as={Minus} className="text-mistGray" size={20} />
                          </Button>

                          <Button
                            onPress={() => {
                              hapticLight();
                              handleUpdateProgress(goal.id, goal.progress + 10);
                            }}
                            className="w-12 h-12 rounded-full bg-sanctuarySaffron items-center justify-center p-0 shadow-lg shadow-sanctuarySaffron/20"
                          >
                            <Icon as={Plus} className="text-obsidian" size={20} />
                          </Button>
                        </HStack>
                      ) : (
                        <HStack className="items-center gap-2 bg-emeraldGreen/20 px-4 py-2 rounded-full border border-emeraldGreen/30">
                          <Icon as={Trophy} className="text-emeraldGreen" size={16} />
                          <Text className="text-emeraldGreen font-black uppercase tracking-widest text-[11px]">
                            {t('studentGoals.completed') || 'Mastered!'}
                          </Text>
                        </HStack>
                      )}

                      <Icon as={ChevronRight} size={20} className="text-mistGray/20" />
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            </AnimatedView>
          ))}

          {/* Empty State */}
          {goals.length === 0 && !showAddGoal && (
            <AnimatedView
              entering={FadeInUp}
              className="py-20 items-center justify-center opacity-40"
            >
              <Icon as={Target} size={64} className="text-white mb-4" />
              <Text className="text-mistGray text-center italic font-medium">
                {t('studentGoals.noGoals') || 'No intentions set yet.'}
              </Text>
              <Text className="text-mistGray/50 text-[10px] uppercase font-bold tracking-widest mt-2">
                Define your path to mastery.
              </Text>
            </AnimatedView>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
}

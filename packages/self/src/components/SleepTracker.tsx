/**
 * SLEEP TRACKER
 * Morning check-in: "How was your sleep?"
 * Simple, gentle way to track sleep quality
 */

import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';

import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Moon, Sparkles } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Slider,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSleepTracker } from '@repo/self/hooks/useSleepTracker';

interface SleepTrackerProps {
  userId?: string;
  disabled?: boolean;
}

export default function SleepTracker({ userId, disabled: componentDisabled }: SleepTrackerProps) {
  const { context } = usePermissions();
  const activeUserId = userId || context.userId || undefined;
  const { sleepLogs, refreshData, isLoading, addSleepLog } = useSleepTracker(activeUserId);
  const { t } = useTranslation();

  const [sleepQuality, setSleepQuality] = useState(3);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  // Animation values
  const moonScale = useSharedValue(1);
  const starsOpacity = useSharedValue(0.6);

  const SLEEP_QUALITY = useMemo(
    () => [
      {
        value: 1,
        label: t('sleepTracker.restless') || 'Restless',
        emoji: '😰',
        color: 'text-emberRed',
        bg: 'bg-emberRed',
        description: t('sleepTracker.restlessDesc') || 'Difficult night, tossing and turning.',
      },
      {
        value: 2,
        label: t('sleepTracker.poor') || 'Poor',
        emoji: '😔',
        color: 'text-amberGlow',
        bg: 'bg-amberGlow',
        description: t('sleepTracker.poorDesc') || 'Woke up feeling tired and unrefreshed.',
      },
      {
        value: 3,
        label: t('sleepTracker.okay') || 'Okay',
        emoji: '😐',
        color: 'text-mistGray',
        bg: 'bg-mistGray',
        description: t('sleepTracker.okayDesc') || 'Average sleep, feeling functional.',
      },
      {
        value: 4,
        label: t('sleepTracker.good') || 'Good',
        emoji: '😊',
        color: 'text-emeraldGreen',
        bg: 'bg-emeraldGreen',
        description: t('sleepTracker.goodDesc') || 'Slept mostly through, feeling rested.',
      },
      {
        value: 5,
        label: t('sleepTracker.excellent') || 'Excellent',
        emoji: '😌',
        color: 'text-sanctuarySaffron',
        bg: 'bg-sanctuarySaffron',
        description:
          t('sleepTracker.excellentDesc') || 'Deep, peaceful sleep. Feeling rejuvenated.',
      },
    ],
    [t],
  );

  const currentQuality = SLEEP_QUALITY[sleepQuality - 1] || SLEEP_QUALITY[2]!;

  useEffect(() => {
    if (!activeUserId || !sleepLogs.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = sleepLogs.find((log) => new Date(log.created_at) >= today);

    if (todayLog) {
      setHasLoggedToday(true);
      setSleepQuality(todayLog.quality);
    }
  }, [sleepLogs, activeUserId]);

  useEffect(() => {
    // Gentle breathing animation
    moonScale.value = withRepeat(
      withTiming(1.05, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    starsOpacity.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [moonScale, starsOpacity]);

  const { mutate: saveLog, isLoading: isSaving } = useSafeMutation(
    async (quality: number) => {
      await addSleepLog(quality as any);
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setHasLoggedToday(true);
        refreshData();
      },
    },
  );

  const handleSaveSleepLog = async () => {
    if (!activeUserId || componentDisabled) return;
    hapticLight();
    await saveLog(sleepQuality);
  };

  const animatedMoonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: moonScale.value }],
  }));

  const animatedStarsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 11;

  if (isLoading && activeUserId) {
    return (
      <VStack className="p-lg gap-lg">
        <SkeletonCard height={40} />
        <SkeletonCard height={280} />
      </VStack>
    );
  }

  if (!isMorning && !hasLoggedToday) {
    return (
      <VStack className="p-lg gap-lg items-center justify-center min-h-[200px] bg-obsidian rounded-comfortable border border-white/5">
        <Icon as={Moon} className="text-sanctuarySaffron mb-4" size={48} />
        <Text className="text-mistGray text-center">
          {t('sleepTracker.notTime') || 'Sleep tracking is available in the morning (5am - 11am)'}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack className="p-lg gap-lg">
      {/* Header */}
      <VStack className="gap-1">
        <Heading className="text-sacredWhite" size="lg">
          {t('sleepTracker.title') || 'Morning Rest'}
        </Heading>
        <Text className="text-mistGray text-sm">
          {t('sleepTracker.subtitle') || 'Understanding your rest helps you care for yourself.'}
        </Text>
      </VStack>

      {/* Sleep visualization */}
      <Box className="items-center justify-center p-xl bg-obsidian rounded-comfortable min-h-[220px] relative border border-white/5">
        {/* Animated stars */}
        <AnimatedView style={[animatedStarsStyle]} className="absolute top-5 right-8">
          <Icon as={Sparkles} className="text-indigo-400" size={24} />
        </AnimatedView>

        {/* Emoji Feedback */}
        <AnimatedView style={animatedMoonStyle}>
          <Text className="text-[96px]">{currentQuality.emoji}</Text>
        </AnimatedView>

        <VStack className="items-center mt-4">
          <Text className={`text-2xl font-bold ${currentQuality.color}`}>
            {currentQuality.label}
          </Text>
          <Text className="text-mistGray text-sm italic text-center">
            {currentQuality.description}
          </Text>
        </VStack>
      </Box>

      {/* Slider and Logging Controls */}
      {!hasLoggedToday ? (
        <VStack className="gap-6">
          <Box className="px-md">
            <Slider
              value={sleepQuality}
              onValueChange={(value: number) => {
                hapticLight();
                setSleepQuality(value);
              }}
              minValue={1}
              maxValue={5}
              step={1}
              className="h-10 w-full"
            />

            <HStack className="justify-between mt-4">
              <Text className="text-dimGray text-xs">
                {t('sleepTracker.restless') || 'Restless'}
              </Text>
              <Text className="text-dimGray text-xs">
                {t('sleepTracker.excellent') || 'Excellent'}
              </Text>
            </HStack>
          </Box>

          <Button
            size="lg"
            onPress={handleSaveSleepLog}
            isDisabled={isSaving || componentDisabled}
            className={`rounded-full h-14 ${currentQuality.bg}`}
          >
            <ButtonText className="text-white font-bold">
              {isSaving ? t('common.loading') : t('sleepTracker.logButton') || 'Log Rest'}
            </ButtonText>
          </Button>
        </VStack>
      ) : (
        <AnimatedView entering={FadeIn}>
          <VStack className="p-lg bg-emeraldGreen/10 rounded-comfortable items-center border border-emeraldGreen/20 gap-2">
            <Text className="text-emeraldGreen font-bold text-md">
              ✓ {t('sleepTracker.alreadyLogged') || 'Rest Logged Today'}
            </Text>
            <Text className="text-mistGray text-xs">
              {t('sleepTracker.tomorrowHint') || 'You can record your next rest tomorrow morning.'}
            </Text>
          </VStack>
        </AnimatedView>
      )}

      {/* Philosophy note */}
      <Box className="p-md bg-white/5 rounded-comfortable border border-white/5">
        <Text className="text-mistGray text-xs text-center italic">
          {t('sleepTracker.philosophy') || '💤 Rest is sacred. Your wellbeing matters.'}
        </Text>
      </Box>
    </VStack>
  );
}

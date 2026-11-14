/**
 * SLEEP TRACKER
 * Morning check-in: "How was your sleep?"
 * Reconstructed: Purged legacy UI primitives and SkeletonLoader; replaced with React Native primitives + @repo/ui/theme/native.
 */

import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useSleepTracker } from '@repo/self/hooks/useSleepTracker';
import { Moon, Sparkles } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SleepTrackerProps {
  userId?: string;
  disabled?: boolean;
}

export default function SleepTracker({ userId, disabled: componentDisabled }: SleepTrackerProps) {
  const { tokens } = useWorld();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId || undefined;
  const {
    sleepLogs,
    refreshData,
    isLoading,
    addSleepLog,
    error: historyError,
  } = useSleepTracker(activeUserId);
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

  const { mutate: saveLog, isPending: isSaving } = useSafeMutation(
    async (quality: number) => {
      await addSleepLog(quality as any);
    },
    {
      mutationKey: 'addSleepLog',
      scope: 'self',
      mutationType: 'CREATE',
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
      <View className="p-5 gap-5">
        <View className="h-10 rounded-2xl bg-white/5" />
        <View className="h-[280px] rounded-2xl bg-white/5" />
      </View>
    );
  }

  if (!isMorning && !hasLoggedToday) {
    return (
      <View className="p-5 gap-5 items-center justify-center min-h-[200px] bg-obsidian rounded-comfortable border border-white/5">
        <Moon className="text-sanctuarySaffron mb-4" size={48} color={tokens.lampDeep} />
        <Text className="text-mistGray text-center">
          {t('sleepTracker.notTime') || 'Sleep tracking is available in the morning (5am - 11am)'}
        </Text>
      </View>
    );
  }

  return (
    <View className="p-5 gap-5">
      {historyError ? (
        <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
          <Text className="flex-1 text-sm text-mistGray" accessibilityRole="alert">
            {historyError} Showing the last available log.
          </Text>
          <Pressable
            onPress={() => void refreshData()}
            className="px-3 py-1.5 rounded-lg border border-white/20 active:bg-white/10"
            accessibilityLabel="Retry loading sleep history"
          >
            <Text className="text-sacredWhite text-xs font-bold">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Header */}
      <View className="gap-1">
        <Text className="text-sacredWhite text-xl font-bold">
          {t('sleepTracker.title') || 'Morning Rest'}
        </Text>
        <Text className="text-mistGray text-sm">
          {t('sleepTracker.subtitle') || 'Understanding your rest helps you care for yourself.'}
        </Text>
      </View>

      {/* Sleep visualization */}
      <View className="items-center justify-center p-6 bg-obsidian rounded-comfortable min-h-[220px] relative border border-white/5">
        {/* Animated stars */}
        <Animated.View style={[animatedStarsStyle]} className="absolute top-5 right-8">
          <Sparkles className="text-indigo-400" size={24} color={tokens.ornament} />
        </Animated.View>

        {/* Emoji Feedback */}
        <Animated.View style={animatedMoonStyle}>
          <Text className="text-[96px]">{currentQuality.emoji}</Text>
        </Animated.View>

        <View className="items-center mt-4">
          <Text className={`text-2xl font-bold ${currentQuality.color}`}>
            {currentQuality.label}
          </Text>
          <Text className="text-mistGray text-sm italic text-center">
            {currentQuality.description}
          </Text>
        </View>
      </View>

      {/* Selector and Logging Controls */}
      {!hasLoggedToday ? (
        <View className="gap-6">
          <View className="px-2">
            <View className="flex-row justify-between items-center gap-2">
              {SLEEP_QUALITY.map((sq) => {
                const isSelected = sq.value === sleepQuality;
                return (
                  <Pressable
                    key={sq.value}
                    onPress={() => {
                      hapticLight();
                      setSleepQuality(sq.value);
                    }}
                    className={`flex-1 items-center justify-center py-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white/30 scale-105'
                        : 'bg-white/5 border-white/5 opacity-60'
                    }`}
                  >
                    <Text className="text-2xl mb-1">{sq.emoji}</Text>
                    <Text className="text-[10px] font-black uppercase text-sacredWhite">
                      {sq.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row justify-between mt-4">
              <Text className="text-dimGray text-xs">
                {t('sleepTracker.restless') || 'Restless'}
              </Text>
              <Text className="text-dimGray text-xs">
                {t('sleepTracker.excellent') || 'Excellent'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleSaveSleepLog}
            disabled={isSaving || componentDisabled}
            accessibilityLabel={isSaving ? 'Saving sleep quality' : 'Log sleep quality'}
            accessibilityState={{ busy: isSaving, disabled: Boolean(componentDisabled) }}
            className={`rounded-full h-14 items-center justify-center active:scale-98 ${currentQuality.bg} ${
              isSaving || componentDisabled ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-bold text-base">
              {isSaving ? t('common.loading') : t('sleepTracker.logButton') || 'Log Rest'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Animated.View entering={FadeIn}>
          <View className="p-5 bg-emeraldGreen/10 rounded-comfortable items-center border border-emeraldGreen/20 gap-2">
            <Text className="text-emeraldGreen font-bold text-base">
              ✓ {t('sleepTracker.alreadyLogged') || 'Rest Logged Today'}
            </Text>
            <Text className="text-mistGray text-xs">
              {t('sleepTracker.tomorrowHint') || 'You can record your next rest tomorrow morning.'}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Philosophy note */}
      <View className="p-4 bg-white/5 rounded-comfortable border border-white/5">
        <Text className="text-mistGray text-xs text-center italic">
          {t('sleepTracker.philosophy') || '💤 Rest is sacred. Your wellbeing matters.'}
        </Text>
      </View>
    </View>
  );
}

/**
 * PulseDashboard - The "Entrance" to the Daily Sanctuary
 * Provides high-level briefings, context, and daily motivation.
 * Refactored to Zero-Legacy: fixed syntax corruption in navigation, standardized design tokens,
 * and improved visual hierarchy with Sanctuary V3 components.
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  type ClassroomStackParamList,
  usePendingActions,
  usePermissions,
  useStore,
} from '@repo/core';
import {
  Box,
  BreathAnimation,
  DailyResonanceCard,
  GlassCard,
  Heading,
  HStack,
  Icon,
  Pressable,
  RefreshControl,
  ScrollView,
  SkeletonCard,
  Text,
  VStack,
} from '@repo/ui';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dailyContentAPI } from '../api/dailyContent';

export function PulseDashboard({ onEnterDetails }: { onEnterDetails: () => void }) {
  const { t } = useTranslation();
  const user = useStore((state) => state.user);
  const userName = useStore((state) => state.userName);
  const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);
  const [dailyContent, setDailyContent] = useState<{ motivation: any; didYouKnow: any } | null>(
    null,
  );

  const {
    attendancePending,
    gradingPending,
    isLoading: actionsLoading,
    refresh: refreshActions,
  } = usePendingActions(user?.id);

  const loadContent = async () => {
    try {
      const content = await dailyContentAPI.getTodaysContent();
      setDailyContent(content);
    } catch (err) {
      console.error('Failed to load daily content:', err);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadContent(), refreshActions()]);
    setRefreshing(false);
  }, [refreshActions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning') || 'Good Morning';
    if (hour < 17) return t('greeting.afternoon') || 'Good Afternoon';
    return t('greeting.evening') || 'Good Evening';
  };

  const hasActions = attendancePending.length > 0 || gradingPending.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-obsidian"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F6BF8C" />
      }
    >
      <VStack className="px-lg pt-xl gap-8">
        {/* 1. The Welcome Breath */}
        <BreathAnimation delay={100}>
          <VStack className="gap-1">
            <Text className="text-mistGray text-sm font-medium tracking-wide">
              {getGreeting()},
            </Text>
            <Heading size="3xl" className="text-sacredWhite font-bold">
              {userName || 'Seeker'}
            </Heading>
          </VStack>
        </BreathAnimation>

        {/* 2. Daily Motivation (The Spark) */}
        <BreathAnimation delay={250}>
          <DailyResonanceCard
            title={t('pulse.motivation') || 'Daily Spark'}
            content={
              dailyContent?.motivation?.content ||
              'May your day be filled with peace and resonance.'
            }
            author={dailyContent?.motivation?.author || 'Sanctuary'}
            icon={Sparkles}
            type="motivation"
          />
        </BreathAnimation>

        {/* 3. Did You Know? (The Wisdom) */}
        <BreathAnimation delay={400}>
          <DailyResonanceCard
            title={t('pulse.wisdom') || 'Seed of Wisdom'}
            content={
              dailyContent?.didYouKnow?.content ||
              'Did you know? Every student brings a unique harmony to the classroom.'
            }
            icon={BookOpen}
            type="wisdom"
          />
        </BreathAnimation>

        {/* 4. Clerical Relief / Action Pulse */}
        <BreathAnimation delay={550}>
          <GlassCard className="p-lg rounded-comfortable border border-white/5 shadow-2xl bg-white/5">
            <VStack className="gap-6">
              <HStack className="justify-between items-center">
                <VStack className="gap-1">
                  <Heading size="md" className="text-sacredWhite">
                    {t('pulse.actions') || 'Pulse Items'}
                  </Heading>
                  <Text className="text-mistGray text-xs">Essential check-ins and tasks.</Text>
                </VStack>
                <Box className="bg-sanctuarySaffron/10 p-2 rounded-full border border-sanctuarySaffron/20">
                  <Icon as={Calendar} className="text-sanctuarySaffron" size={20} />
                </Box>
              </HStack>

              {actionsLoading ? (
                <VStack className="gap-sm">
                  <SkeletonCard height={72} />
                  <SkeletonCard height={72} />
                </VStack>
              ) : !hasActions ? (
                <HStack className="items-center py-4 gap-3 bg-emeraldGreen/5 border border-emeraldGreen/10 rounded-xl px-4 justify-center">
                  <Icon as={CheckCircle} size={20} className="text-emeraldGreen" />
                  <Text className="text-emeraldGreen font-bold text-sm">
                    {t('pulse.allClear') || 'Your Sanctuary path is clear 🧘'}
                  </Text>
                </HStack>
              ) : (
                <VStack className="gap-3">
                  {attendancePending.map((item) => (
                    <PulseActionItem
                      key={item.classroomId}
                      title={`${t('pulse.markAttendance') || 'Mark Attendance'}: ${item.classroomName}`}
                      time={t('pulse.beforeNine') || 'Immediate Attention'}
                      status="pending"
                      onPress={() =>
                        navigation.navigate('Attendance', {
                          classroomId: item.classroomId,
                          classroomName: item.classroomName,
                        })
                      }
                    />
                  ))}
                  {gradingPending.map((item) => (
                    <PulseActionItem
                      key={item.assignmentId}
                      title={`${t('pulse.grade') || 'Grade'}: ${item.assignmentTitle}`}
                      time={`${item.ungradedCount} ${t('pulse.submissions') || 'submission(s)'} · ${item.classroomName}`}
                      status="upcoming"
                      onPress={() =>
                        navigation.navigate('Gradebook', {
                          classroomId: item.classroomId,
                          classroomName: item.classroomName,
                        })
                      }
                    />
                  ))}
                </VStack>
              )}
            </VStack>
          </GlassCard>
        </BreathAnimation>

        {/* 5. Entrance to Full View */}
        <BreathAnimation delay={700}>
          <HStack className="justify-center pt-8">
            <Pressable
              onPress={onEnterDetails}
              className="flex-row items-center gap-2 bg-sanctuarySaffron px-8 py-4 rounded-full shadow-lg shadow-sanctuarySaffron/30"
            >
              <Text className="text-obsidian font-black uppercase tracking-[1px] text-sm">
                {t('pulse.view_full') || 'Explore Full Sanctuary'}
              </Text>
              <Icon as={ChevronRight} size={16} className="text-obsidian" />
            </Pressable>
          </HStack>
        </BreathAnimation>
      </VStack>
    </ScrollView>
  );
}

function PulseActionItem({ title, time, status, onPress }: any) {
  return (
    <Pressable onPress={onPress} className="active:opacity-70 transition-opacity">
      <HStack className="p-4 bg-white/[0.03] rounded-xl border border-white/5 justify-between items-center">
        <VStack className="flex-1 mr-4 gap-1.5">
          <Text className="text-sacredWhite text-sm font-bold" numberOfLines={2}>
            {title}
          </Text>
          <HStack className="items-center gap-2">
            <Icon as={Clock} size={12} className="text-mistGray opacity-60" />
            <Text className="text-mistGray text-[11px] italic font-medium">{time}</Text>
          </HStack>
        </VStack>
        <Box
          className={`px-3 py-1.5 rounded-full border ${
            status === 'pending'
              ? 'bg-sanctuarySaffron/10 border-sanctuarySaffron/20'
              : 'bg-indigo-400/10 border-indigo-400/20'
          }`}
        >
          <Text
            className={`text-[10px] font-black uppercase tracking-wider ${
              status === 'pending' ? 'text-sanctuarySaffron' : 'text-indigo-400'
            }`}
          >
            {status}
          </Text>
        </Box>
      </HStack>
    </Pressable>
  );
}

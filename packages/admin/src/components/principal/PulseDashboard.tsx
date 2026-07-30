import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import { SanctuaryChip } from '@repo/ui/components/SanctuaryChip';
import SkeletonLoader from '@repo/ui/components/SkeletonLoader';
import { HeartPulse, TrendingUp, Users, Zap } from '@repo/ui/icons';
import { Box, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useSchoolPulseQuery } from '@repo/admin/hooks/useDashboardHooks';

interface PulseDashboardProps {
  schoolId: string;
}

export default function PulseDashboard({ schoolId }: PulseDashboardProps) {
  const { data: pulse, isLoading: loading, error } = useSchoolPulseQuery(schoolId);

  if (loading) {
    return (
      <VStack className="gap-6 p-4">
        <SkeletonLoader height={200} />
        <HStack className="gap-4">
          <SkeletonLoader height={120} className="flex-1" />
          <SkeletonLoader height={120} className="flex-1" />
        </HStack>
      </VStack>
    );
  }

  if (error || !pulse) {
    return null;
  }

  return (
    <VStack className="gap-6">
      {/* Primary Pulse Card */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <SanctuaryCard className="bg-phase-surface shadow-sm border border-phase-border">
          <VStack
            className="gap-6 p-6"
            accessible={true}
            accessibilityLabel={`Institutional Resonance Score: ${pulse.resonance_score} percent. Trend: ${pulse.trend}`}
          >
            <HStack className="justify-between items-center">
              <HStack className="gap-3 items-center">
                <Box className="p-2.5 rounded-xl bg-phase-danger/10">
                  <Icon as={HeartPulse} size="sm" className="text-phase-danger" />
                </Box>
                <Text className="text-base font-black text-phaseText-primary">Resonance Pulse</Text>
              </HStack>
              <Box className="bg-phase-interactive rounded-full px-3 py-1">
                <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                  {pulse.trend}
                </Text>
              </Box>
            </HStack>

            <HStack className="justify-between items-end">
              <VStack className="gap-1">
                <Text className="text-4xl font-black text-phaseText-primary tracking-tighter">
                  {pulse.resonance_score}%
                </Text>
                <Text className="text-[13px] font-bold text-phaseText-muted">
                  Value Alignment Index
                </Text>
              </VStack>
              <LivingGlow glowColor="rgba(99, 102, 241, 0.5)" size={50} />
            </HStack>
          </VStack>
        </SanctuaryCard>
      </Animated.View>

      {/* Metrics Grid */}
      <HStack className="gap-4">
        <Box className="flex-1">
          <Animated.View entering={FadeInUp.delay(200)}>
            <SanctuaryCard className="bg-phase-surface border border-phase-border shadow-sm">
              <VStack className="gap-2 p-4">
                <HStack className="gap-1.5 items-center">
                  <Icon as={Users} size="xs" className="text-phaseText-muted" />
                  <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-muted">
                    Participation
                  </Text>
                </HStack>
                <Text className="text-2xl font-black text-phaseText-primary">
                  {pulse.participation_rate}%
                </Text>
              </VStack>
            </SanctuaryCard>
          </Animated.View>
        </Box>
        <Box className="flex-1">
          <Animated.View entering={FadeInUp.delay(300)}>
            <SanctuaryCard className="bg-phase-surface border border-phase-border shadow-sm">
              <VStack className="gap-2 p-4">
                <HStack className="gap-1.5 items-center">
                  <Icon as={TrendingUp} size="xs" className="text-phaseText-muted" />
                  <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-muted">
                    Interaction
                  </Text>
                </HStack>
                <Text className="text-2xl font-black text-phaseText-primary">
                  {pulse.interaction_volume}
                </Text>
              </VStack>
            </SanctuaryCard>
          </Animated.View>
        </Box>
      </HStack>

      {/* Trending Interests */}
      <Animated.View entering={FadeInUp.delay(400)}>
        <VStack className="gap-4 mt-2">
          <HStack className="gap-2 items-center">
            <Icon as={Zap} size="xs" className="text-phase-interactive" />
            <Text className="text-[14px] font-black text-phaseText-primary uppercase tracking-widest">
              Trending Focus
            </Text>
          </HStack>
          <HStack className="gap-2.5 flex-wrap">
            {pulse.top_subjects.map((subject) => (
              <SanctuaryChip
                key={subject}
                label={subject}
                variant="tag"
                size="sm"
                className="border-phase-border bg-phase-canvas"
              />
            ))}
          </HStack>
        </VStack>
      </Animated.View>
    </VStack>
  );
}

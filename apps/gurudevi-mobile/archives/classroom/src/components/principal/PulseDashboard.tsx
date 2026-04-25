import { useSchoolPulse } from '@repo/profile';
import {
  Box,
  HStack,
  LivingGlow,
  SanctuaryCard,
  SanctuaryChip,
  SkeletonLoader,
  Text,
  Theme,
  useThemedColors,
  VStack,
} from '@repo/ui';
import { HeartPulse, TrendingUp, Users, Zap } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PulseDashboardProps {
  schoolId: string;
}

export default function PulseDashboard({ schoolId }: PulseDashboardProps) {
  const { pulse, loading, error } = useSchoolPulse(schoolId);
  const colors = useThemedColors();

  if (loading) {
    return (
      <VStack space="md" p="$4">
        <SkeletonLoader height={180} />
        <HStack space="md">
          <SkeletonLoader height={100} style={{ flex: 1 }} />
          <SkeletonLoader height={100} style={{ flex: 1 }} />
        </HStack>
      </VStack>
    );
  }

  if (error || !pulse) {
    return null;
  }

  return (
    <VStack space="lg">
      {/* Primary Pulse Card */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <SanctuaryCard variant="glass">
          <VStack
            space="lg"
            p="$4"
            accessible={true}
            accessibilityLabel={`Institutional Resonance Score: ${pulse.resonance_score} percent. Trend: ${pulse.trend}`}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="sm" alignItems="center">
                <Box
                  sx={{
                    backgroundColor: `${Theme.colors.emberRed}20`,
                    p: Theme.spacing.sm,
                    borderRadius: Theme.corners.comfortable,
                  }}
                >
                  <HeartPulse color={Theme.colors.emberRed} size={20} />
                </Box>
                <Text color={colors.text} size="md" bold>
                  Institutional Resonance
                </Text>
              </HStack>
              <SanctuaryChip label={pulse.trend.toUpperCase()} selected={true} size="sm" />
            </HStack>

            <HStack justifyContent="space-between" alignItems="flex-end">
              <VStack>
                <Text color={colors.text} size="4xl" bold>
                  {pulse.resonance_score}%
                </Text>
                <Text color={colors.textSecondary} size="sm">
                  Alignment with Sanctuary Values
                </Text>
              </VStack>
              <LivingGlow glowColor={Theme.colors.sanctuarySaffron} size={60} />
            </HStack>
          </VStack>
        </SanctuaryCard>
      </Animated.View>

      {/* Metrics Grid */}
      <HStack space="md">
        <Box sx={{ flex: 1 }}>
          <Animated.View entering={FadeInUp.delay(200)}>
            <SanctuaryCard>
              <VStack space="xs" p="$3">
                <HStack space="xs" alignItems="center">
                  <Users color={colors.textTertiary} size={14} />
                  <Text color={colors.textSecondary} size="xs" bold>
                    Participation
                  </Text>
                </HStack>
                <Text color={colors.text} size="lg" bold>
                  {pulse.participation_rate}%
                </Text>
              </VStack>
            </SanctuaryCard>
          </Animated.View>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Animated.View entering={FadeInUp.delay(300)}>
            <SanctuaryCard>
              <VStack space="xs" p="$3">
                <HStack space="xs" alignItems="center">
                  <TrendingUp color={colors.textTertiary} size={14} />
                  <Text color={colors.textSecondary} size="xs" bold>
                    Volume
                  </Text>
                </HStack>
                <Text color={colors.text} size="lg" bold>
                  {pulse.interaction_volume}
                </Text>
              </VStack>
            </SanctuaryCard>
          </Animated.View>
        </Box>
      </HStack>

      {/* Trending Interests */}
      <Animated.View entering={FadeInUp.delay(400)}>
        <VStack space="sm">
          <HStack space="xs" alignItems="center">
            <Zap color={Theme.colors.sanctuarySaffron} size={16} />
            <Text color={colors.text} size="sm" bold>
              Trending Interests
            </Text>
          </HStack>
          <HStack space="sm" flexWrap="wrap">
            {pulse.top_subjects.map((subject) => (
              <SanctuaryChip key={subject} label={subject} variant="tag" size="sm" />
            ))}
          </HStack>
        </VStack>
      </Animated.View>
    </VStack>
  );
}

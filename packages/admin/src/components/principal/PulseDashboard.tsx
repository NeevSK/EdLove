import React from 'react';
import {
    Icon,
    VStack,
    HStack,
    Text,
    Box,
    SanctuaryCard,
    useTheme,
    LivingGlow,
    SkeletonLoader,
    SanctuaryChip
} from '@repo/ui';
import { Zap, TrendingUp, Users, HeartPulse } from 'lucide-react-native';
import { useSchoolPulse } from '@repo/profile/hooks/useSchoolPulse';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PulseDashboardProps {
    schoolId: string;
}

export default function PulseDashboard({ schoolId }: PulseDashboardProps) {
    const { pulse, loading, error } = useSchoolPulse(schoolId);
    const theme = useTheme();

    if (loading) {
        return (
            <VStack className="gap-4 p-4">
                <SkeletonLoader height={180} />
                <HStack className="gap-4">
                    <SkeletonLoader height={100} className="flex-1" />
                    <SkeletonLoader height={100} className="flex-1" />
                </HStack>
            </VStack>
        );
    }

    if (error || !pulse) {
        return null;
    }

    return (
        <VStack className="gap-4">
            {/* Primary Pulse Card */}
            <Animated.View entering={FadeInUp.delay(100)}>
                <SanctuaryCard className="bg-phase-surface/40">
                    <VStack
                        className="gap-4 p-4"
                        accessible={true}
                        accessibilityLabel={`Institutional Resonance Score: ${pulse.resonance_score} percent. Trend: ${pulse.trend}`}
                    >
                        <HStack className="justify-between items-center">
                            <HStack className="gap-2 items-center">
                                <Box 
                                    className="p-2 rounded-xl"
                                    style={{ backgroundColor: `${theme.accent.danger}22` }}
                                >
                                    <HeartPulse color={theme.accent.danger} size={20} />
                                </Box>
                                <Text className="text-md font-bold text-phaseText-primary">
                                    Institutional Resonance
                                </Text>
                            </HStack>
                            <SanctuaryChip
                                label={pulse.trend.toUpperCase()}
                                selected={true}
                                size="sm"
                            />
                        </HStack>

                        <HStack className="justify-between items-end">
                            <VStack>
                                <Text className="text-4xl font-bold text-phaseText-primary">
                                    {pulse.resonance_score}%
                                </Text>
                                <Text className="text-sm text-phaseText-secondary">
                                    Alignment with Sanctuary Values
                                </Text>
                            </VStack>
                            <LivingGlow glowColor={theme.accent.action} size={60} />
                        </HStack>
                    </VStack>
                </SanctuaryCard>
            </Animated.View>

            {/* Metrics Grid */}
            <HStack className="gap-4">
                <Box className="flex-1">
                    <Animated.View entering={FadeInUp.delay(200)}>
                        <SanctuaryCard>
                            <VStack className="gap-1 p-3">
                                <HStack className="gap-1 items-center">
                                    <Icon as={Users} size="xs" className="text-phaseText-muted" />
                                    <Text className="text-xs font-bold text-phaseText-secondary">
                                        Participation
                                    </Text>
                                </HStack>
                                <Text className="text-lg font-bold text-phaseText-primary">
                                    {pulse.participation_rate}%
                                </Text>
                            </VStack>
                        </SanctuaryCard>
                    </Animated.View>
                </Box>
                <Box className="flex-1">
                    <Animated.View entering={FadeInUp.delay(300)}>
                        <SanctuaryCard>
                            <VStack className="gap-1 p-3">
                                <HStack className="gap-1 items-center">
                                    <Icon as={TrendingUp} size="xs" className="text-phaseText-muted" />
                                    <Text className="text-xs font-bold text-phaseText-secondary">
                                        Volume
                                    </Text>
                                </HStack>
                                <Text className="text-lg font-bold text-phaseText-primary">
                                    {pulse.interaction_volume}
                                </Text>
                            </VStack>
                        </SanctuaryCard>
                    </Animated.View>
                </Box>
            </HStack>

            {/* Trending Interests */}
            <Animated.View entering={FadeInUp.delay(400)}>
                <VStack className="gap-3">
                    <HStack className="gap-2 items-center">
                        <Zap color={theme.accent.action} size={16} />
                        <Text className="text-sm font-bold text-phaseText-primary">
                            Trending Interests
                        </Text>
                    </HStack>
                    <HStack className="gap-2 flex-wrap">
                        {pulse.top_subjects.map((subject) => (
                            <SanctuaryChip
                                key={subject}
                                label={subject}
                                variant="tag"
                                size="sm"
                            />
                        ))}
                    </HStack>
                </VStack>
            </Animated.View>
        </VStack>
    );
}

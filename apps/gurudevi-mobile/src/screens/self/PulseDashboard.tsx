import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    GlassCard,
    DailyResonanceCard,
    useThemedColors,
    BreathAnimation
} from '@repo/ui';
import { useUserRole, useStore, dailyContentAPI } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { Sparkles, Calendar, BookOpen, Clock } from 'lucide-react-native';

/**
 * PulseDashboard - The "Entrance" to the Daily Sanctuary
 * Provides high-level briefings, context, and daily motivation.
 */
export default function PulseDashboard({ onEnterDetails }: { onEnterDetails: () => void }) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const teacherName = useStore((state) => state.teacherName);
    const colors = useThemedColors();
    const [refreshing, setRefreshing] = React.useState(false);
    const [dailyContent, setDailyContent] = React.useState<{ motivation: any; didYouKnow: any } | null>(null);

    const loadContent = async () => {
        const content = await dailyContentAPI.getTodaysContent();
        setDailyContent(content);
    };

    React.useEffect(() => {
        loadContent();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadContent();
        setRefreshing(false);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('greeting.morning') || 'Good Morning';
        if (hour < 17) return t('greeting.afternoon') || 'Good Afternoon';
        return t('greeting.evening') || 'Good Evening';
    };

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />
            }
        >
            <VStack space="xl" px="$4" pt="$8">
                {/* 1. The Welcome Breath */}
                <BreathAnimation delay={100}>
                    <VStack space="xs">
                        <Text sx={{ color: colors.textSecondary, fontSize: '$sm', fontFamily: 'Inter_400Regular' }}>
                            {getGreeting()},
                        </Text>
                        <Heading size="2xl" sx={{ color: colors.text, fontFamily: 'Outfit_700Bold' }}>
                            {teacherName}
                        </Heading>
                    </VStack>
                </BreathAnimation>

                {/* 2. Daily Motivation (The Spark) */}
                <BreathAnimation delay={250}>
                    <DailyResonanceCard
                        title={t('pulse.motivation') || 'Daily Spark'}
                        content={dailyContent?.motivation?.content || 'May your day be filled with peace and resonance.'}
                        author={dailyContent?.motivation?.author || 'Sanctuary'}
                        icon={Sparkles}
                        type="motivation"
                    />
                </BreathAnimation>

                {/* 3. Did You Know? (The Wisdom) */}
                <BreathAnimation delay={400}>
                    <DailyResonanceCard
                        title={t('pulse.wisdom') || 'Seed of Wisdom'}
                        content={dailyContent?.didYouKnow?.content || 'Did you know? Every student brings a unique harmony to the classroom.'}
                        icon={BookOpen}
                        type="wisdom"
                    />
                </BreathAnimation>

                {/* 4. Clerical Relief / Action Pulse */}
                <BreathAnimation delay={550}>
                    <GlassCard sx={{ p: Theme.spacing.lg, borderRadius: Theme.corners.generous }}>
                        <VStack space="md">
                            <HStack justifyContent="space-between" alignItems="center">
                                <Heading size="md" sx={{ color: colors.text }}>
                                    {t('pulse.actions') || 'Today\'s Pulse'}
                                </Heading>
                                <Calendar color={colors.action} size={20} />
                            </HStack>

                            <VStack space="sm">
                                <PulseActionItem
                                    title="Mark Morning Attendance"
                                    time="Before 9:00 AM"
                                    status="pending"
                                    onPress={() => { }}
                                />
                                <PulseActionItem
                                    title="Grade Science Assignment"
                                    time="By End of Day"
                                    status="upcoming"
                                    onPress={() => { }}
                                />
                            </VStack>
                        </VStack>
                    </GlassCard>
                </BreathAnimation>

                {/* 5. Entrance to Full View */}
                <BreathAnimation delay={700}>
                    <HStack justifyContent="center" pt="$4">
                        <Text
                            sx={{
                                color: colors.action,
                                fontSize: Theme.typography.fontSize.sm,
                                fontWeight: '$bold'
                            }}
                            onPress={onEnterDetails}
                        >
                            {t('pulse.view_full') || 'Enter Full Sanctuary'} →
                        </Text>
                    </HStack>
                </BreathAnimation>
            </VStack>
        </ScrollView>
    );
}

function PulseActionItem({ title, time, status, onPress }: any) {
    const colors = useThemedColors();
    return (
        <HStack
            sx={{
                p: Theme.spacing.md,
                backgroundColor: Theme.colors.glass.dark.highlight,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: Theme.colors.glass.dark.border
            }}
            justifyContent="space-between"
            alignItems="center"
        >
            <VStack space="xs">
                <Text sx={{ color: colors.text, fontSize: '$sm', fontWeight: '$600' }}>{title}</Text>
                <HStack space="xs" alignItems="center">
                    <Clock size={12} color={colors.textTertiary} />
                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}>{time}</Text>
                </HStack>
            </VStack>
            <Box
                sx={{
                    px: '$2',
                    py: '$1',
                    borderRadius: Theme.corners.full,
                    backgroundColor: status === 'pending'
                        ? `${Theme.colors.sanctuarySaffron}26`
                        : Theme.colors.glass.dark.highlight
                }}
            >
                <Text sx={{
                    color: status === 'pending' ? Theme.colors.sanctuarySaffron : colors.textTertiary,
                    fontSize: Theme.typography.fontSize.xs,
                    fontWeight: '$600'
                }}>
                    {status.toUpperCase()}
                </Text>
            </Box>
        </HStack>
    );
}

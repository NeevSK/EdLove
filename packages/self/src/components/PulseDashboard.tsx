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
    BreathAnimation,
    SkeletonCard,
    useTheme
} from '@repo/ui';
import { usePermissions, useStore, usePendingActions } from '@repo/core';
import { ClassroomStackParamList } from '@repo/core'; // Keep core as it's cross-domain
import { useTranslation } from 'react-i18next';
import { Sparkles, Calendar, BookOpen, Clock, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { dailyContentAPI } from '../api/dailyContent';

/**
 * PulseDashboard - The "Entrance" to the Daily Sanctuary
 * Provides high-level briefings, context, and daily motivation.
 */
export function PulseDashboard({ onEnterDetails }: { onEnterDetails: () => void }) {
    const { t } = useTranslation();
    const { can, context } = usePermissions();
    const authority = context.roles[0];
    const user = useStore((state) => state.user);
    const userName = useStore((state) => state.userName);
    const { isDark, accent, glass, glow, text, gradientNodes } = useTheme();
    const colors = useThemedColors();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const [refreshing, setRefreshing] = React.useState(false);
    const [dailyContent, setDailyContent] = React.useState<{ motivation: any; didYouKnow: any } | null>(null);

    const { attendancePending, gradingPending, isLoading: actionsLoading, refresh: refreshActions } =
        usePendingActions(user?.id);

    const loadContent = async () => {
        const content = await dailyContentAPI.getTodaysContent();
        setDailyContent(content);
    };

    React.useEffect(() => {
        loadContent();
    }, []);

    const onRefresh = React.useCallback(async () => {
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
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} /
            }
        
            <VStack space="xl" px="$4" pt="$8"
                {/* 1. The Welcome Breath */}
                <BreathAnimation delay={100}
                    <VStack space="xs"
                        <Text sx={{ color: colors.textSecondary, fontSize: '$sm', fontFamily: 'Inter_400Regular' }}
                            {getGreeting()},
                        </Text
                        <Heading size="2xl" sx={{ color: colors.text, fontFamily: 'Outfit_700Bold' }}
                            {userName}
                        </Heading
                    </VStack
                </BreathAnimation

                {/* 2. Daily Motivation (The Spark) */}
                <BreathAnimation delay={250}
                    <DailyResonanceCard
                        title={t('pulse.motivation') || 'Daily Spark'}
                        content={dailyContent?.motivation?.content || 'May your day be filled with peace and resonance.'}
                        author={dailyContent?.motivation?.author || 'Sanctuary'}
                        icon={Sparkles}
                        type="motivation"
                    /
                </BreathAnimation

                {/* 3. Did You Know? (The Wisdom) */}
                <BreathAnimation delay={400}
                    <DailyResonanceCard
                        title={t('pulse.wisdom') || 'Seed of Wisdom'}
                        content={dailyContent?.didYouKnow?.content || 'Did you know? Every student brings a unique harmony to the classroom.'}
                        icon={BookOpen}
                        type="wisdom"
                    /
                </BreathAnimation

                {/* 4. Clerical Relief / Action Pulse */}
                <BreathAnimation delay={550}
                    <GlassCard sx={{ p: Theme.spacing.lg, borderRadius: Theme.corners.generous }}
                        <VStack space="md"
                            <HStack justifyContent="space-between" alignItems="center"
                                <Heading size="md" sx={{ color: colors.text }}
                                    {t('pulse.actions') || 'Today\'s Pulse'}
                                </Heading
                                <Calendar color={colors.action} size={20} /
                            </HStack

                            {actionsLoading ? (
                                <VStack space="sm"
                                    <SkeletonCard height={56} /
                                    <SkeletonCard height={56} /
                                </VStack
                            ) : !hasActions ? (
                                <HStack space="sm" alignItems="center" py="$2"
                                    <CheckCircle size={16} color={Theme.colors.sageGreen} /
                                    <Text sx={{ color: colors.textSecondary, fontSize: '$sm' }}
                                        {t('pulse.allClear') || 'Your day is clear \uD83E\uDEB7'}
                                    </Text
                                </HStack
                            ) : (
                                <VStack space="sm"
                                    {attendancePending.map((item) => (
                                        <PulseActionItem
                                            key={item.classroomId}
                                            title={`${t('pulse.markAttendance') || 'Mark Attendance'}: ${item.classroomName}`}
                                            time={t('pulse.beforeNine') || 'Before 9:00 AM'}
                                            status="pending"
                                            isDark={isDark}
                                            onPress={() => navigation.navigate('Attendance', {
                                                classroomId: item.classroomId,
                                                classroomName: item.classroomName,
                                            })}
                                        /
                                    ))}
                                    {gradingPending.map((item) => (
                                        <PulseActionItem
                                            key={item.assignmentId}
                                            title={`${t('pulse.grade') || 'Grade'}: ${item.assignmentTitle}`}
                                            time={`${item.ungradedCount} ${t('pulse.submissions') || 'submission(s)'} \u00B7 ${item.classroomName}`}
                                            status="upcoming"
                                            isDark={isDark}
                                            onPress={() => navigation.navigate('Gradebook', {
                                                classroomId: item.classroomId,
                                                classroomName: item.classroomName,
                                            })}
                                        /
                                    ))}
                                </VStack
                            )}
                        </VStack
                    </GlassCard
                </BreathAnimation

                {/* 5. Entrance to Full View */}
                <BreathAnimation delay={700}
                    <HStack justifyContent="center" pt="$4"
                        <Text
                            sx={{
                                color: colors.action,
                                fontSize: Theme.typography.fontSize.sm,
                                fontWeight: '$bold'
                            }}
                            onPress={onEnterDetails}
                        
                            {t('pulse.view_full') || 'Enter Full Sanctuary'} \u2192
                        </Text
                    </HStack
                </BreathAnimation
            </VStack
        </ScrollView
    );
}

function PulseActionItem({ title, time, status, onPress, isDark }: any) {
    const colors = useThemedColors();
    return (
        <HStack
            sx={{
                p: Theme.spacing.md,
                backgroundColor: isDark ? colors.tertiary : '#FAF7ED', // Silk for light mode
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.border
            }}
            justifyContent="space-between"
            alignItems="center"
        
            <VStack space="xs" sx={{ flex: 1, marginRight: Theme.spacing.sm }}
                <Text sx={{ color: colors.text, fontSize: '$sm', fontWeight: '$600' }} numberOfLines={3}>{title}</Text
                <HStack space="xs" alignItems="center"
                    <Clock size={12} color={colors.textTertiary} /
                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}>{time}</Text
                </HStack
            </VStack
            <Box
                sx={{
                    px: '$2',
                    py: '$1',
                    borderRadius: Theme.corners.full,
                    backgroundColor: status === 'pending'
                        ? `${Theme.colors.sanctuarySaffron}26`
                        : Theme.colors.skyBlue
                }}
            
                <Text sx={{
                    color: status === 'pending' ? Theme.colors.sanctuarySaffron : colors.textTertiary,
                    fontSize: Theme.typography.fontSize.xs,
                    fontWeight: '$600'
                }}
                    {status.toUpperCase()}
                </Text
            </Box
        </HStack
    );
}

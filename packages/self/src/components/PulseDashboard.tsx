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
    useTheme,
    Pressable
} from '@repo/ui';
import { usePermissions, useStore, usePendingActions } from '@repo/core';
import { ClassroomStackParamList } from '@repo/core'; 
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
        try {
            const content = await dailyContentAPI.getTodaysContent();
            setDailyContent(content);
        } catch (err) {
            console.error('Failed to load daily content:', err);
        }
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
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />
            }
        >
            <VStack space="xl" sx={{ paddingHorizontal: 16, paddingTop: 32 }}>
                {/* 1. The Welcome Breath */}
                <BreathAnimation delay={100}>
                    <VStack space="xs">
                        <Text sx={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                            {getGreeting()},
                        </Text>
                        <Heading size="2xl" sx={{ color: colors.text, fontFamily: 'Outfit_700Bold' }}>
                            {userName}
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
                    <GlassCard sx={{ padding: Theme.spacing.lg, borderRadius: Theme.corners.generous }}>
                        <VStack space="md">
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Heading size="md" sx={{ color: colors.text }}>
                                    {t('pulse.actions') || "Today's Pulse"}
                                </Heading>
                                <Calendar color={colors.action} size={20} />
                            </HStack>

                            {actionsLoading ? (
                                <VStack space="sm">
                                    <SkeletonCard height={56} />
                                    <SkeletonCard height={56} />
                                </VStack>
                            ) : !hasActions ? (
                                <HStack space="sm" sx={{ alignItems: 'center', paddingVertical: 8 }}>
                                    <CheckCircle size={16} color={Theme.colors.sageGreen} />
                                    <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                                        {t('pulse.allClear') || 'Your day is clear 🧘'}
                                    </Text>
                                </HStack>
                            ) : (
                                <VStack space="sm">
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
                                        />
                                    ))}
                                    {gradingPending.map((item) => (
                                        <PulseActionItem
                                            key={item.assignmentId}
                                            title={`${t('pulse.grade') || 'Grade'}: ${item.assignmentTitle}`}
                                            time={`${item.ungradedCount} ${t('pulse.submissions') || 'submission(s)'} · ${item.classroomName}`}
                                            status="upcoming"
                                            isDark={isDark}
                                            onPress={() => navigation.navigate('Gradebook', {
                                                classroomId: item.classroomId,
                                                classroomName: item.classroomName,
                                            })}
                                        />
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    </GlassCard>
                </BreathAnimation>

                {/* 5. Entrance to Full View */}
                <BreathAnimation delay={700}>
                    <HStack sx={{ justifyContent: "center", paddingTop: 16 }}>
                        <Pressable onPress={onEnterDetails}>
                            <Text
                                sx={{
                                    color: colors.action,
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}
                            >
                                {t('pulse.view_full') || 'Enter Full Sanctuary'} →
                            </Text>
                        </Pressable>
                    </HStack>
                </BreathAnimation>
            </VStack>
        </ScrollView>
    );
}

function PulseActionItem({ title, time, status, onPress, isDark }: any) {
    const colors = useThemedColors();
    return (
        <Pressable onPress={onPress}>
            <HStack
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: isDark ? colors.tertiary : '#FAF7ED',
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: colors.border,
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <VStack space="xs" sx={{ flex: 1, marginRight: Theme.spacing.sm }}>
                    <Text sx={{ color: colors.text, fontSize: 14, fontWeight: '600' }} numberOfLines={3}>
                        {title}
                    </Text>
                    <HStack space="xs" sx={{ alignItems: "center" }}>
                        <Clock size={12} color={colors.textTertiary} />
                        <Text sx={{ color: colors.textTertiary, fontSize: 12 }}>{time}</Text>
                    </HStack>
                </VStack>
                <Box
                    sx={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 50,
                        backgroundColor: status === 'pending'
                            ? `${Theme.colors.sanctuarySaffron}26`
                            : Theme.colors.skyBlue
                    }}
                >
                    <Text sx={{
                        color: status === 'pending' ? Theme.colors.sanctuarySaffron : colors.textTertiary,
                        fontSize: 12,
                        fontWeight: '600'
                    }}>
                        {status.toUpperCase()}
                    </Text>
                </Box>
            </HStack>
        </Pressable>
    );
}

import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
    SkeletonCard,
    Theme,
    useThemedColors,
    PositiveInvitation,
    SandboxBanner,
    hapticLight
} from '@repo/ui';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import {
    Zap,
    BookOpen,
    ClipboardCheck,
    MessageSquare,
    Star,
    Layout
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useFeatureAccess, useStore, ClassroomStackParamList, api, supabase } from '@repo/core';
import ClassroomList from './ClassroomList';

interface StudentDashboardProps {
    onRefresh?: () => void;
    schoolId?: string;
    userId?: string;
}

export default function StudentDashboard({ onRefresh, schoolId, userId }: StudentDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { isDemoMode } = useStore();
    const { isGuest } = useFeatureAccess();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const colors = useThemedColors();
    const [stats, setStats] = useState({
        enrolledClasses: 0,
        pendingAssignments: 0,
        unlockedRewards: 0
    });

    const handleClassroomsLoaded = (loadedClassrooms: any[]) => {
        setStats(prev => ({
            ...prev,
            enrolledClasses: loadedClassrooms.length
        }));
        setIsLoading(false);
    };

    const QuickAction = ({ icon: LucideIcon, label, onPress, color }: any) => (
        <VStack
            alignItems="center"
            sx={{
                flex: 1,
                gap: Theme.spacing.xs
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    hapticLight();
                    onPress();
                }}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.tertiary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border
                }}
            >
                <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
            </TouchableOpacity>
            <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 10, fontWeight: '700' }}>
                {label}
            </Text>
        </VStack>
    );

    const StatWidget = ({ icon: LucideIcon, label, value, color }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 100
            }}
        >
            <VStack sx={{ gap: 4 }}>
                <LucideIcon color={color || colors.textSecondary} size={20} />
                <Text color={colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}>
                    {label}
                </Text>
                <Text color={colors.text} sx={{ fontSize: 24, fontWeight: '700' }}>
                    {value}
                </Text>
            </VStack>
        </Box>
    );

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary }}>
            {isDemoMode && <SandboxBanner />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Theme.spacing.lg }}>

                {/* Learning Journey Greeting */}
                <Animated.View entering={FadeInDown.duration(400)}>
                    <VStack sx={{ gap: 4, marginBottom: Theme.spacing.lg }}>
                        <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.xl }}>
                            {t('classroom.studentDashboardHeading') || 'Your Learning Journey'} 🌟
                        </Heading>
                        <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.sm }}>
                            {t('classroom.studentDashboardIntro') || 'Step into your sanctuaries and grow with love.'}
                        </Text>
                    </VStack>
                </Animated.View>

                {/* Quick Shortcuts */}
                <Animated.View entering={FadeInDown.delay(50)}>
                    <HStack sx={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.xl, justifyContent: 'space-between' }}>
                        <QuickAction
                            icon={BookOpen}
                            label={t('classroom.library') || 'Library'}
                            onPress={() => navigation.navigate('Library' as any)}
                            color={Theme.colors.amberGlow}
                        />
                        <QuickAction
                            icon={MessageSquare}
                            label={t('community.sanctuaries') || 'Sanctuaries'}
                            onPress={() => navigation.navigate('Community' as any)}
                            color={Theme.colors.gurudeviBlue}
                        />
                        <QuickAction
                            icon={Star}
                            label={t('student.rewards') || 'Rewards'}
                            onPress={() => {
                                hapticLight();
                                useStore.getState().showToast(t('common.comingSoon') || 'Rewards are blossoming soon! 🌸', 'info');
                            }}
                            color={Theme.colors.sanctuarySaffron}
                        />
                        <QuickAction
                            icon={Layout}
                            label={t('student.timetable') || 'Timetable'}
                            onPress={() => {
                                hapticLight();
                                useStore.getState().showToast(t('common.comingSoon') || 'Timetables are in preparation. 🍃', 'info');
                            }}
                            color={Theme.colors.sageGreen}
                        />
                    </HStack>
                </Animated.View>

                {isGuest && (
                    <Animated.View entering={FadeInDown.delay(75)}>
                        <PositiveInvitation
                            type="guest"
                            context="classroom"
                            onAction={() => {
                                hapticLight();
                                navigation.navigate('Auth' as any);
                            }}
                        />
                    </Animated.View>
                )}

                {/* Growth Stats */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <HStack sx={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.xl }}>
                        <StatWidget
                            icon={ClipboardCheck}
                            label={t('student.activeClasses') || 'My Classes'}
                            value={stats.enrolledClasses}
                            color={Theme.colors.gurudeviBlue}
                        />
                        <StatWidget
                            icon={Zap}
                            label={t('student.pendingTasks') || 'Assignments'}
                            value={stats.pendingAssignments}
                            color={Theme.colors.amberGlow}
                        />
                    </HStack>
                </Animated.View>

                {/* Enrolled Sanctuaries Section */}
                <Animated.View entering={FadeInDown.delay(150)}>
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.lg }}>
                            {t('classroom.yourSanctuaries') || 'Your Sanctuaries'} 🍃
                        </Heading>

                        <ClassroomList
                            onClassroomPress={(classroom) => {
                                hapticLight();
                                navigation.navigate('Classroom' as any, {
                                    screen: 'ClassroomDetails',
                                    params: {
                                        classroomId: classroom.id,
                                        classroomName: classroom.name
                                    }
                                });
                            }}
                            onDataLoaded={handleClassroomsLoaded}
                            isNested={true}
                            refreshTrigger={refreshTrigger}
                            emptyContent={
                                <PositiveInvitation
                                    context="classroom"
                                    onAction={() => { }} // Handled by ClassroomScreen usually
                                />
                            }
                        />

                        {isGuest && (
                            <PositiveInvitation
                                type="guest"
                                onAction={() => {
                                    hapticLight();
                                    // TODO: Conversion navigation
                                }}
                            />
                        )}
                    </VStack>
                </Animated.View>
            </ScrollView>
        </VStack>
    );
}


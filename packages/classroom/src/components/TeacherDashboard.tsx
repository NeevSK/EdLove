import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Icon,
    SkeletonCard,
    Theme,
    useThemedColors,
    GlobalHeader,
    PositiveInvitation,
    SandboxBanner,
    hapticLight
} from '@repo/ui';
import { Alert } from 'react-native';
import {
    Plus,
    ClipboardCheck,
    BookOpen,
    Users,
    School,
    Zap
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useFeatureAccess, useStore, ClassroomStackParamList } from '@repo/core';
import ClassroomList from './ClassroomList';
import CreateClassroomModal from './CreateClassroomModal';

interface TeacherDashboardProps {
    onRefresh?: () => void;
}

export default function TeacherDashboard({ onRefresh }: TeacherDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { teacherName, isDemoMode } = useStore();
    const { isGuest } = useFeatureAccess();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const colors = useThemedColors();
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [stats, setStats] = useState({
        activeClasses: 0,
        totalStudents: 0
    });

    // We'll update stats whenever the classroom list changes
    const handleClassroomsLoaded = (loadedClassrooms: any[]) => {
        setClassrooms(loadedClassrooms);
        setStats({
            activeClasses: loadedClassrooms.length,
            totalStudents: loadedClassrooms.reduce((acc, curr) => acc + (curr.student_count || 0), 0)
        });
        setIsLoading(false);
    };

    const QuickAction = ({ icon: LucideIcon, label, onPress, color }: any) => (
        <Pressable
            onPress={() => {
                hapticLight();
                onPress();
            }}
            sx={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
            }}
        >
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.tertiary,
                    marginBottom: Theme.spacing.sm
                }}
            >
                <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
            </Box>
            <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 12, fontWeight: '700' }}>
                {isDemoMode ? `⚡ (${t('demoMode.simulationAlert')}) ${label}` : label}
            </Text>
        </Pressable>
    );

    const StatCard = ({ icon: LucideIcon, label, value, color }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <VStack sx={{ zIndex: 1, gap: '$1' }}>
                <Text color={colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}>
                    {label}
                </Text>
                <Text color={colors.text} sx={{ fontSize: 32, fontWeight: '700' }}>
                    {value}{isDemoMode && '*'}
                </Text>
            </VStack>
            {isDemoMode && (
                <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                    <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />
                </Box>
            )}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    opacity: 0.1
                }}
            >
                <LucideIcon color={colors.text} size={80} />
            </Box>
        </Box>
    );

    const DashboardSkeleton = () => (
        <VStack sx={{ gap: '$6' }}>
            <HStack sx={{ gap: '$4' }}>
                <SkeletonCard height={80} style={{ flex: 1 }} />
                <SkeletonCard height={80} style={{ flex: 1 }} />
                <SkeletonCard height={80} style={{ flex: 1 }} />
                <SkeletonCard height={80} style={{ flex: 1 }} />
            </HStack>
            <HStack sx={{ gap: '$4' }}>
                <SkeletonCard height={120} style={{ flex: 1 }} />
                <SkeletonCard height={120} style={{ flex: 1 }} />
            </HStack>
            <VStack sx={{ gap: '$4' }}>
                <SkeletonCard height={100} />
                <SkeletonCard height={100} />
            </VStack>
        </VStack>
    );

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary, gap: '$6' }}>
            {isDemoMode && <SandboxBanner />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Theme.spacing.lg }}>
                {/* Greeting Intro */}
                <VStack sx={{ gap: '$1', marginBottom: '$4', marginTop: '$2' }}>
                    <Text color={colors.textSecondary} sx={{ fontSize: '$sm' }}>
                        {t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
                    </Text>
                </VStack>

                {/* Quick Actions */}
                <HStack sx={{ gap: '$4', marginBottom: '$6' }}>
                    <QuickAction
                        icon={Plus}
                        label={t('classroom.createClass') || 'Create Class'}
                        onPress={() => {
                            setModalMode('create');
                            setIsCreateModalOpen(true);
                        }}
                    />
                    <QuickAction
                        icon={Users}
                        label={t('classroom.joinClass') || 'Join Class'}
                        onPress={() => {
                            setModalMode('join');
                            setIsCreateModalOpen(true);
                        }}
                        color={Theme.colors.sanctuarySaffron}
                    />
                    <QuickAction
                        icon={ClipboardCheck}
                        label={t('classroom.attendance') || 'Attendance'}
                        onPress={() => {
                            if (classrooms.length > 0) {
                                navigation.navigate('Attendance', {
                                    classroomId: classrooms[0].id,
                                    classroomName: classrooms[0].name
                                });
                            } else {
                                Alert.alert(t('common.noClassrooms') || "No Classrooms", t('common.noClassroomsDesc') || "No active classrooms found.");
                            }
                        }}
                        color={Theme.colors.sageGreen}
                    />
                    <QuickAction
                        icon={BookOpen}
                        label={t('classroom.library') || 'Library'}
                        onPress={() => {
                            // TODO: Library navigation
                        }}
                        color={Theme.colors.amberGlow}
                    />
                </HStack>

                {/* Statistics */}
                <HStack sx={{ gap: '$4', marginBottom: '$8' }}>
                    <StatCard
                        icon={School}
                        label={t('classroom.statActiveClasses') || 'Active Classes'}
                        value={stats.activeClasses}
                    />
                    <StatCard
                        icon={Users}
                        label={t('classroom.statTotalStudents') || 'Total Students'}
                        value={stats.totalStudents}
                    />
                </HStack>

                {/* Classroom List Section */}
                <VStack sx={{ gap: '$4' }}>
                    <HStack justifyContent="space-between" alignItems="center">
                        <Heading color={colors.text} sx={{ fontSize: '$lg' }}>
                            {t('classroom.yourClassrooms') || 'Your Classrooms'} 🍃
                        </Heading>
                    </HStack>

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
                                onAction={() => {
                                    setModalMode('create');
                                    setIsCreateModalOpen(true);
                                }}
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
            </ScrollView>

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                mode={modalMode}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </VStack>
    );
}

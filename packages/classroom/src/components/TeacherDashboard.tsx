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
    Zap,
    MessageCircle,
    ShieldCheck,
    Plus,
    Users,
    BookOpen,
    School,
    ScanLine
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useFeatureAccess, useStore, ClassroomStackParamList, api, supabase } from '@repo/core';
import ClassroomList from './ClassroomList';
import CreateClassroomModal from './CreateClassroomModal';
import { ScannerModal } from '@repo/scanner-kit';
import TeacherFeedbackModal from './teacher/TeacherFeedbackModal';
import { Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import TeacherAdminWidget from './TeacherAdminWidget';

interface TeacherDashboardProps {
    onRefresh?: () => void;
    schoolId?: string;
    userId?: string;
}

export default function TeacherDashboard({ onRefresh, schoolId, userId }: TeacherDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { teacherName, isDemoMode } = useStore();
    const { isGuest } = useFeatureAccess();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
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

    const handleScan = async (data: string) => {
        // Handle join-class:UUID
        let classId = data;
        if (data.startsWith('join-class:')) {
            classId = data.replace('join-class:', '');
        }

        try {
            const { data: { user } } = await supabase.auth.getUser(); // supabase is already imported in some packages via @repo/core
            // Wait, supabase isn't imported here. I should use useStore or api.
            // Actually, let's just open the Join Modal with this ID pre-filled or auto-submit.

            // For now, let's just use the api to join
            if (user) {
                await api.classrooms.update(classId, { teacher_id: user.id });
                setRefreshTrigger(prev => prev + 1);
                Alert.alert("Success", "You have joined the classroom.");
            }
        } catch (err) {
            console.error("Failed to join via QR", err);
            Alert.alert("Error", "Could not join classroom. Please check the QR code.");
        } finally {
            setIsScannerOpen(false);
        }
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
            <VStack sx={{ zIndex: 1, gap: Theme.spacing.xs }}>
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
        <VStack sx={{ gap: Theme.spacing.xl }}>
            <HStack sx={{ gap: Theme.spacing.md }}>
                <SkeletonCard height={80} style={{ flex: 1 }} />
                <SkeletonCard height={80} style={{ flex: 1 }} />
                <SkeletonCard height={80} style={{ flex: 1 }} />
                <SkeletonCard height={80} style={{ flex: 1 }} />
            </HStack>
            <HStack sx={{ gap: Theme.spacing.md }}>
                <SkeletonCard height={120} style={{ flex: 1 }} />
                <SkeletonCard height={120} style={{ flex: 1 }} />
            </HStack>
            <VStack sx={{ gap: Theme.spacing.md }}>
                <SkeletonCard height={100} />
                <SkeletonCard height={100} />
            </VStack>
        </VStack>
    );

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary, gap: Theme.spacing.xl }}>
            {isDemoMode && <SandboxBanner />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Theme.spacing.lg }}>
                {/* Greeting Intro */}
                <VStack sx={{ gap: 4, marginBottom: Theme.spacing.md, marginTop: Theme.spacing.sm }}>
                    <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.sm }}>
                        {t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
                    </Text>
                </VStack>

                {/* Quick Actions - Primary */}
                <HStack sx={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
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
                        icon={ScanLine}
                        label={t('classroom.scanToJoin') || 'Scan QR'}
                        onPress={() => setIsScannerOpen(true)}
                        color={Theme.colors.amberGlow}
                    />
                </HStack>

                {/* Quick Actions - Utility */}
                <HStack sx={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.lg }}>
                    <QuickAction
                        icon={ShieldCheck}
                        label={t('teacher.admin.portal') || 'Admin'}
                        onPress={() => setIsAdminModalOpen(true)}
                        color={Theme.colors.sageGreen}
                    />
                    <QuickAction
                        icon={BookOpen}
                        label={t('classroom.library') || 'Library'}
                        onPress={() => {
                            navigation.navigate('Library' as any);
                        }}
                        color={Theme.colors.amberGlow}
                    />
                    <QuickAction
                        icon={MessageCircle}
                        label={t('teacher.actions.principalEcho') || 'Principal Echo'}
                        onPress={() => setIsFeedbackModalOpen(true)}
                        color={Theme.colors.emberRed}
                    />
                </HStack>

                {/* Statistics */}
                <HStack sx={{ gap: Theme.spacing.md, marginBottom: Theme.spacing.sm }}>
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
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <HStack justifyContent="space-between" alignItems="center">
                        <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.lg }}>
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

            <ScannerModal
                visible={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                title="Join Classroom"
                accentColor={Theme.colors.sanctuarySaffron}
            />

            <TeacherFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                schoolId={schoolId || ''}
                teacherId={userId || ''}
            />

            {/* Admin Portal Modal */}
            <Modal
                visible={isAdminModalOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsAdminModalOpen(false)}
            >
                <Box flex={1} sx={{ backgroundColor: colors.primary }}>
                    <Box sx={{
                        paddingTop: 50,
                        paddingBottom: Theme.spacing.md,
                        paddingHorizontal: Theme.spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border
                    }}>
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="lg" color={colors.text}>
                                {t('teacher.admin.portal') || 'Administrative Portal'}
                            </Heading>
                            <TouchableOpacity
                                onPress={() => {
                                    hapticLight();
                                    setIsAdminModalOpen(false);
                                }}
                                style={{
                                    padding: 8,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                }}
                            >
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </HStack>
                    </Box>
                    <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg }}>
                        <TeacherAdminWidget
                            onAction={(action) => {
                                console.log('Admin Action:', action);
                                // Handle specific navigations if needed
                                if (action === 'Attendance' && classrooms.length > 0) {
                                    setIsAdminModalOpen(false);
                                    navigation.navigate('Attendance', {
                                        classroomId: classrooms[0].id,
                                        classroomName: classrooms[0].name
                                    });
                                }
                            }}
                        />
                    </ScrollView>
                </Box>
            </Modal>
        </VStack>
    );
}

import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
    Pressable,
    SkeletonCard,
    Theme,
    useThemedColors,
    PositiveInvitation,
    SandboxBanner,
    hapticLight,
    useLotusToast,
    useRegisterFAB,
} from '@repo/ui';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    Zap,
    MessageCircle,
    ShieldCheck,
    Plus,
    Users,
    BookOpen,
    School,
    ScanLine,
    ClipboardList,
    Wind,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useFeatureAccess, useStore, ClassroomStackParamList, FlowResolver, identityAPI, useTemporalStore } from '@repo/core';
import { BreathGuide } from '@repo/self';
import {
    TeacherAdminPortalModal,
    TeacherEchoHistoryModal,
    TeacherFeedbackModal,
} from '@repo/people';
import { ClassroomList, CreateClassroomModal } from '../components';
import { TemporalNavigator } from '@repo/ui';
import { ScannerModal, resolveQR } from '@repo/scanner-kit';
import { X } from 'lucide-react-native';

interface TeacherDashboardProps {
    onRefresh?: () => void;
    schoolId?: string;
    userId?: string;
}

export default function TeacherDashboard({ onRefresh, schoolId, userId }: TeacherDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { isDemoMode } = useStore();
    const { isGuest } = useFeatureAccess();
    const { showToast } = useLotusToast();
    const colors = useThemedColors();
    const { isPastView } = useTemporalStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isBreathingOpen, setIsBreathingOpen] = useState(false);
    const [showEchoHistory, setShowEchoHistory] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [stats, setStats] = useState({
        activeClasses: 0,
        totalStudents: 0,
    });

    useRegisterFAB({
        tabType: 'classroom',
        onPress: () => {
            setModalMode('create');
            setIsCreateModalOpen(true);
        },
        icon: <Plus size={24} color="#FFF" />,
        visible: !isGuest && !isPastView,
    });

    useEffect(() => {
        void onRefresh;
    }, [onRefresh]);

    const handleClassroomsLoaded = (loadedClassrooms: any[]) => {
        setClassrooms(loadedClassrooms);
        setStats({
            activeClasses: loadedClassrooms.length,
            totalStudents: loadedClassrooms.reduce((acc, curr) => acc + (curr.student_count || 0), 0),
        });
    };

    const handleScan = async (data: string) => {
        setIsScannerOpen(false);
        const result = resolveQR(data);

        if (!result.ok) {
            showToast({ message: 'This QR code is not recognised by Gurudevi.', type: 'error' });
            return;
        }

        const { payload } = result;

        try {
            const internalUserId = await identityAPI.getMyInternalId();
            if (!internalUserId) return;

            if (payload.action === 'join_class') {
                const flowResult = await FlowResolver.resolveQR(payload, internalUserId);
                if (flowResult.outcome === 'success') {
                    setRefreshTrigger((prev) => prev + 1);
                    showToast({ message: 'Joined classroom!', type: 'success' });
                } else {
                    showToast({ message: flowResult.message || 'Could not join classroom.', type: 'error' });
                }
            } else if (payload.action === 'join_school') {
                showToast({ message: 'Open the school join flow from the welcome screen.', type: 'info' });
            } else {
                showToast({ message: `QR scanned. Action: ${payload.action}`, type: 'info' });
            }
        } catch (err) {
            console.error('Failed to handle QR', err);
            showToast({ message: 'Could not process QR. Please try again.', type: 'error' });
        }
    };

    const QuickAction = ({ icon: LucideIcon, label, onPress, color }: any) => (
        <Pressable
            onPress={() => {
                if (isPastView) return;
                hapticLight();
                onPress();
            }}
            disabled={isPastView}
            sx={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: isPastView ? 0.5 : 1,
            }}
        >
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.tertiary,
                    marginBottom: Theme.spacing.sm,
                }}
            >
                <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
            </Box>
            <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 12, fontWeight: '700' }}>
                {isDemoMode ? `(${t('demoMode.simulationAlert')}) ${label}` : label}
            </Text>
        </Pressable>
    );

    const StatCard = ({ icon: LucideIcon, label, value }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden',
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
                    opacity: 0.1,
                }}
            >
                <LucideIcon color={colors.text} size={80} />
            </Box>
        </Box>
    );

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary, gap: Theme.spacing.xl }}>
            {isDemoMode && <SandboxBanner />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Theme.spacing.lg }}>
                <Animated.View entering={FadeInDown.delay(50)}>
                    <VStack sx={{ gap: 4, marginBottom: Theme.spacing.md, marginTop: Theme.spacing.sm }}>
                        <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.sm }}>
                            {t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
                        </Text>
                    </VStack>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(75)}>
                    <TemporalNavigator />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100)}>
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
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(150)}>
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
                                navigation.getParent()?.navigate('Library');
                            }}
                            color={Theme.colors.amberGlow}
                        />
                        <QuickAction
                            icon={MessageCircle}
                            label={t('teacher.actions.principalEcho') || 'Principal Echo'}
                            onPress={() => setIsFeedbackModalOpen(true)}
                            color={Theme.colors.emberRed}
                        />
                        <QuickAction
                            icon={ClipboardList}
                            label="My Echoes"
                            onPress={() => setShowEchoHistory(true)}
                            color={colors.action}
                        />
                        <QuickAction
                            icon={Wind}
                            label={t('self.breathing') || 'Breathing'}
                            onPress={() => setIsBreathingOpen(true)}
                            color={colors.success}
                        />
                    </HStack>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)}>
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
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(250)}>
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.lg }}>
                                {t('classroom.yourClassrooms') || 'Your Classrooms'}
                            </Heading>
                        </HStack>

                        <ClassroomList
                            onClassroomPress={(classroom) => {
                                hapticLight();
                                navigation.navigate('Classroom' as any, {
                                    screen: 'TeacherClassroomDashboard',
                                    params: {
                                        classroomId: classroom.id,
                                        classroomName: classroom.name,
                                    },
                                });
                            }}
                            onDataLoaded={handleClassroomsLoaded}
                            isNested={true}
                            refreshTrigger={refreshTrigger}
                            emptyContent={
                                <PositiveInvitation
                                    context="classroom"
                                    title={isDemoMode ? 'Create Your First Sanctuary' : undefined}
                                    description={isDemoMode ? 'Ready to lead your first classroom? Generate a sanctuary for your students to begin their journey.' : undefined}
                                    actionLabel={isDemoMode ? 'Create My First Classroom' : undefined}
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
                                }}
                            />
                        )}
                    </VStack>
                </Animated.View>
            </ScrollView>

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                mode={modalMode}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
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

            <TeacherEchoHistoryModal
                visible={showEchoHistory}
                teacherId={userId || ''}
                onClose={() => setShowEchoHistory(false)}
            />

            <TeacherAdminPortalModal
                visible={isAdminModalOpen}
                title={t('teacher.admin.portal') || 'Administrative Portal'}
                onClose={() => setIsAdminModalOpen(false)}
                onAction={(action) => {
                    console.log('Admin Action:', action);
                    if (action === 'Attendance' && classrooms.length > 0) {
                        setIsAdminModalOpen(false);
                        navigation.navigate('Attendance', {
                            classroomId: classrooms[0].id,
                            classroomName: classrooms[0].name,
                        });
                    }
                }}
            />

            <Modal
                visible={isBreathingOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsBreathingOpen(false)}
            >
                <Box flex={1} sx={{ backgroundColor: colors.primary }}>
                    <Box
                        sx={{
                            paddingTop: 50,
                            paddingBottom: Theme.spacing.md,
                            paddingHorizontal: Theme.spacing.md,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="lg" color={colors.text}>
                                {t('self.breathingReset') || 'Breathing Reset'}
                            </Heading>
                            <TouchableOpacity
                                onPress={() => {
                                    hapticLight();
                                    setIsBreathingOpen(false);
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
                    <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
                        <BreathGuide
                            onComplete={() => {
                                showToast({ message: 'Well done. Take this peace into your next class.', type: 'success' });
                                setIsBreathingOpen(false);
                            }}
                        />
                    </ScrollView>
                </Box>
            </Modal>
        </VStack>
    );
}

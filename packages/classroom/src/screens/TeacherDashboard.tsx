import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { Box, Heading, HStack, SandboxBanner, ScrollView, Theme, useThemedColors } from '@repo/ui';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Wind, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassroomStackParamList, useWorkspaceLayoutSync } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { BreathGuide } from '@repo/self';
import { TeacherAdminPortalModal, TeacherEchoHistoryModal, TeacherFeedbackModal } from '@repo/people';
import { CreateClassroomModal } from '../components';
import { TeacherWorkspaceShell } from '../components/teacher/TeacherWorkspaceShell';
import { ScannerModal } from '@repo/scanner-kit';
import { useTeacherWorkspaceShell } from '../workspace/useTeacherWorkspaceShell';
import {
    type TeacherDashboardCapabilityKey,
    type TeacherDashboardSurface,
    type TeacherDashboardSurfaceId,
    useTeacherDashboardSurfaces,
} from '../workspace/useTeacherDashboardSurfaces';

interface TeacherDashboardProps {
    onRefresh?: () => void;
    schoolId?: string;
    userId?: string;
}

export default function TeacherDashboard({ onRefresh, schoolId, userId }: TeacherDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const nav: any = navigation;
    const colors = useThemedColors();
    const {
        isDemoMode,
        stats,
        modalMode,
        refreshTrigger,
        isCreateModalOpen,
        isFeedbackModalOpen,
        isAdminModalOpen,
        isBreathingOpen,
        showEchoHistory,
        isScannerOpen,
        openCreateFlow,
        setIsCreateModalOpen,
        setIsFeedbackModalOpen,
        setIsAdminModalOpen,
        setIsBreathingOpen,
        setShowEchoHistory,
        setIsScannerOpen,
        handleClassroomsLoaded,
        handleScan,
        handleAdminAction,
        completeBreathingReset,
        bumpRefresh,
        hapticLight,
        isGuest,
        isPastView,
    } = useTeacherWorkspaceShell(nav as any, onRefresh);

    const dashboardSurfaces = useTeacherDashboardSurfaces({
        colors,
        isDemoMode,
        isGuest,
        isPastView,
        stats,
        refreshTrigger,
        openCreateFlow,
        setIsScannerOpen,
        setIsAdminModalOpen,
        setIsFeedbackModalOpen,
        setShowEchoHistory,
        setIsBreathingOpen,
        onOpenLibrary: () => {
            navigation.getParent()?.navigate('Library' as never);
        },
        handleClassroomsLoaded,
        onOpenClassroom: (classroom) => {
            hapticLight();
            navigation.navigate('Classroom' as any, {
                screen: 'TeacherClassroomDashboard',
                params: {
                    classroomId: classroom.id,
                    classroomName: classroom.name,
                },
            });
        },
    });

    const { layout } = useWorkspaceLayoutSync<
        TeacherDashboardSurfaceId,
        TeacherDashboardCapabilityKey,
        TeacherDashboardSurface
    >({
        workspaceId: 'teacher-dashboard',
        userId: userId || 'teacher-dashboard-guest',
        surfaces: dashboardSurfaces,
        enableRemoteSync: false,
    });

    if (!layout) {
        return <Box style={{ flex: 1, backgroundColor: colors.primary }} />;
    }

    if (isDemoMode) {
        // demo check logic shifted to WorkspaceCanvas if needed
    }

    return (
        <Box style={{ flex: 1, backgroundColor: colors.primary }}>
            {isDemoMode ? <SandboxBanner /> : null}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: Theme.spacing.lg,
                    gap: Theme.spacing.lg,
                    paddingBottom: Theme.spacing.xl * 2,
                }}
            >
                <Animated.View entering={FadeInDown.delay(50)}>
                    <TeacherWorkspaceShell
                        surfaces={dashboardSurfaces as any}
                        layout={layout}
                        title="Teacher Workspace"
                        subtitle={t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
                        stats={stats}
                        isDemoMode={isDemoMode}
                    />
                </Animated.View>
            </ScrollView>
            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                mode={modalMode}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={bumpRefresh}
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
                onAction={handleAdminAction}
            />
            <Modal
                visible={isBreathingOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsBreathingOpen(false)}
            >
                <Box style={{ flex: 1, backgroundColor: colors.primary }}>
                    <Box
                        style={{
                            paddingTop: 50,
                            paddingBottom: Theme.spacing.md,
                            paddingHorizontal: Theme.spacing.md,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Heading size="lg" style={{ color: colors.text }}>
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
                        <BreathGuide onComplete={completeBreathingReset} />
                    </ScrollView>
                </Box>
            </Modal>
        </Box>
    );
}

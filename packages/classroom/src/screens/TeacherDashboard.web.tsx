import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { Box, Heading, HStack, SandboxBanner, ScrollView, Text, Theme, useThemedColors, WorkspaceCanvas } from '@repo/ui';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Wind, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassroomStackParamList, useWorkspaceLayoutSync } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { BreathGuide } from '@repo/self';
import { TeacherAdminPortalModal, TeacherEchoHistoryModal, TeacherFeedbackModal } from '@repo/people';
import { CreateClassroomModal } from '../components';
import { ScannerModal } from '@repo/scanner-kit';
import { useTeacherWorkspaceShell } from '../workspace/useTeacherWorkspaceShell';
import { useTeacherDashboardSurfaces } from '../workspace/useTeacherDashboardSurfaces';

interface TeacherDashboardProps {
    onRefresh?: () => void;
    schoolId?: string;
    userId?: string;
}

export default function TeacherDashboardWeb({ onRefresh, schoolId, userId }: TeacherDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
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
    } = useTeacherWorkspaceShell(navigation as any, onRefresh);

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

    const { layout, surfaces, setSurfaceHidden, setSurfacePinned, setSurfaceZone } = useWorkspaceLayoutSync({
        workspaceId: 'teacher-dashboard',
        userId: userId || 'teacher-dashboard-web-guest',
        surfaces: dashboardSurfaces,
        enableRemoteSync: false,
    });

    const findSurfaceDefinition = (surfaceId: string) =        dashboardSurfaces.find((candidate) => candidate.surfaceId === surfaceId);

    if (!layout) {
        return <Box sx={{ flex: 1, backgroundColor: colors.primary }} />;
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}            {isDemoMode ? <SandboxBanner /> : null}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: Theme.spacing.lg,
                    gap: Theme.spacing.lg,
                    paddingBottom: Theme.spacing.xl * 2,
                }}
                            <Animated.View entering={FadeInDown.delay(50)}                    <WorkspaceCanvas
                        surfaces={dashboardSurfaces}
                        layout={layout}
                        title="Teacher Workspace"
                        subtitle={t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
                        renderSurfaceContent={(surface) =                            findSurfaceDefinition(surface.surfaceId)?.content ?? null
                        }
                        getSurfaceSubtitle={(surface) =                            findSurfaceDefinition(surface.surfaceId)?.subtitle
                        }
                        getSurfaceSummary={(surface) =                            findSurfaceDefinition(surface.surfaceId)?.summary
                        }
                        getSurfaceTemporalLabel={(surface) =                            findSurfaceDefinition(surface.surfaceId)?.temporalLabel
                        }
                        getSurfaceMetadata={(surface) =                            findSurfaceDefinition(surface.surfaceId)?.metadata
                        }
                        onToggleHidden={(surface) => setSurfaceHidden(surface.surfaceId, !surface.hidden)}
                        renderSurfaceActions={(surface) => {
                            const resolved = surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId);
                            if (!resolved) return null;

                            return (
                                <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}                                    <TouchableOpacity
                                        onPress={() => setSurfacePinned(resolved.surfaceId, !resolved.pinned)}
                                        style={{
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.full,
                                            backgroundColor: 'rgba(42, 35, 24, 0.06)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(42, 35, 24, 0.08)',
                                        }}
                                                                            <Text sx={{ fontSize: 12, fontWeight: '600', color: Theme.colors.inkTruth }}                                            {resolved.pinned ? 'Unpin' : 'Pin'}
                                        </Text                                    </TouchableOpacity                                    <TouchableOpacity
                                        onPress={() =                                            setSurfaceZone(
                                                resolved.surfaceId,
                                                resolved.zone === 'work' ? 'today' : resolved.zone === 'today' ? 'outlook' : 'work'
                                            )
                                        }
                                        style={{
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.full,
                                            backgroundColor: 'rgba(42, 35, 24, 0.06)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(42, 35, 24, 0.08)',
                                        }}
                                                                            <Text sx={{ fontSize: 12, fontWeight: '600', color: Theme.colors.inkTruth }}                                            Move zone
                                        </Text                                    </TouchableOpacity                                </HStack                            );
                        }}
                    /                </Animated.View            </ScrollView
            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                mode={modalMode}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={bumpRefresh}
            /
            <ScannerModal
                visible={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                title="Join Classroom"
                accentColor={Theme.colors.sanctuarySaffron}
            /
            <TeacherFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                schoolId={schoolId || ''}
                teacherId={userId || ''}
            /
            <TeacherEchoHistoryModal
                visible={showEchoHistory}
                teacherId={userId || ''}
                onClose={() => setShowEchoHistory(false)}
            /
            <TeacherAdminPortalModal
                visible={isAdminModalOpen}
                title={t('teacher.admin.portal') || 'Administrative Portal'}
                onClose={() => setIsAdminModalOpen(false)}
                onAction={handleAdminAction}
            /
            <Modal
                visible={isBreathingOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsBreathingOpen(false)}
                            <Box flex={1} sx={{ backgroundColor: colors.primary }}                    <Box
                        sx={{
                            paddingTop: 50,
                            paddingBottom: Theme.spacing.md,
                            paddingHorizontal: Theme.spacing.md,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                                            <HStack justifyContent="space-between" alignItems="center"                            <Heading size="lg" color={colors.text}                                {t('self.breathingReset') || 'Breathing Reset'}
                            </Heading                            <TouchableOpacity
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
                                                            <X size={24} color={colors.text} /                            </TouchableOpacity                        </HStack                    </Box                    <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}                        <BreathGuide onComplete={completeBreathingReset} /                    </ScrollView                </Box            </Modal        </Box    );
}

import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box, SandboxBanner, Text, Theme, WorkspaceCanvas, hapticLight, useRegisterFAB, useThemedColors } from '@repo/ui';
import { ClassroomStackParamList, useFeatureAccess, useStore, useTemporalStore, useWorkspaceLayoutSync } from '@repo/core';
import { useStudentWorkspaceData } from '../workspace/useStudentWorkspaceData';
import { useStudentDashboardSurfaces } from '../workspace/useStudentDashboardSurfaces';

interface StudentDashboardProps {
    onRefresh?: () => void;
    schoolId?: string;
    userId?: string;
    forceDemo?: boolean;
}

export default function StudentDashboardWeb({ forceDemo, userId }: StudentDashboardProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const showToast = useStore((state: any) => state.showToast);
    const { isGuest } = useFeatureAccess();
    const { isPastView } = useTemporalStore();
    const colors = useThemedColors();
    const { isDemoExperience, stats } = useStudentWorkspaceData(forceDemo);

    useRegisterFAB({
        tabType: 'classroom',
        visible: false,
    });

    const dashboardSurfaces = useStudentDashboardSurfaces({
        colors,
        isGuest,
        isPastView,
        isDemoExperience,
        stats,
        onOpenLibrary: () => navigation.navigate('Library' as any),
        onOpenCommunity: () => navigation.navigate('Community' as any),
        onOpenRewards: () => {
            hapticLight();
            showToast(t('common.comingSoon') || 'Rewards are blossoming soon!', 'info');
        },
        onOpenTimetable: () => {
            hapticLight();
            navigation.navigate('Self' as any);
        },
        onOpenBreathing: () => {
            hapticLight();
            const { setBreathingOpen } = useStore.getState();
            setBreathingOpen(true);
        },
        onOpenClassroom: (classroom) => {
            hapticLight();
            navigation.navigate('Classroom' as any, {
                screen: 'StudentClassroomDashboard',
                params: {
                    classroomId: classroom.id,
                    classroomName: classroom.name,
                },
            });
        },
        onOpenGuestAuth: () => {
            hapticLight();
            navigation.navigate('Auth' as any);
        },
    });

    const { layout, surfaces, setSurfaceHidden, setSurfacePinned, setSurfaceZone } = useWorkspaceLayoutSync({
        workspaceId: 'student-dashboard',
        userId: userId || 'student-dashboard-web-guest',
        surfaces: dashboardSurfaces,
        enableRemoteSync: false,
    });

    const findSurfaceDefinition = (surfaceId: string) =>
        dashboardSurfaces.find((candidate) => candidate.surfaceId === surfaceId);

    if (!layout) {
        return <Box sx={{ flex: 1, backgroundColor: colors.primary }} />;
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
            {isDemoExperience ? <SandboxBanner /> : null}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: Theme.spacing.lg }}
            >
                <Animated.View entering={FadeInDown.duration(400)}>
                    <WorkspaceCanvas
                        surfaces={dashboardSurfaces}
                        layout={layout}
                        title={t('classroom.studentDashboardHeading') || 'Your Learning Journey'}
                        subtitle={t('classroom.studentDashboardIntro') || 'Step into your sanctuaries and grow with love.'}
                        renderSurfaceContent={(surface) =>
                            findSurfaceDefinition(surface.surfaceId)?.content ?? null
                        }
                        getSurfaceSubtitle={(surface) =>
                            findSurfaceDefinition(surface.surfaceId)?.subtitle
                        }
                        getSurfaceSummary={(surface) =>
                            findSurfaceDefinition(surface.surfaceId)?.summary
                        }
                        getSurfaceTemporalLabel={(surface) =>
                            findSurfaceDefinition(surface.surfaceId)?.temporalLabel
                        }
                        getSurfaceMetadata={(surface) =>
                            findSurfaceDefinition(surface.surfaceId)?.metadata
                        }
                        onToggleHidden={(surface) => setSurfaceHidden(surface.surfaceId, !surface.hidden)}
                        renderSurfaceActions={(surface) => {
                            const resolved = surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId);
                            if (!resolved) return null;

                            return (
                                <Box sx={{ flexDirection: 'row', gap: Theme.spacing.sm, flexWrap: 'wrap' }}>
                                    <TouchableOpacity
                                        onPress={() => setSurfacePinned(resolved.surfaceId, !resolved.pinned)}
                                        style={{
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.full,
                                            backgroundColor: 'rgba(42, 35, 24, 0.06)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(42, 35, 24, 0.08)',
                                        }}
                                    >
                                        <Text sx={{ fontSize: 12, fontWeight: '600', color: Theme.colors.inkTruth }}>
                                            {resolved.pinned ? 'Unpin' : 'Pin'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setSurfaceZone(
                                                resolved.surfaceId,
                                                resolved.zone === 'work' ? 'today' : resolved.zone === 'today' ? 'private' : 'work'
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
                                    >
                                        <Text sx={{ fontSize: 12, fontWeight: '600', color: Theme.colors.inkTruth }}>
                                            Move zone
                                        </Text>
                                    </TouchableOpacity>
                                </Box>
                            );
                        }}
                    />
                </Animated.View>
            </ScrollView>
        </Box>
    );
}

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClassroomStackParamList } from '@repo/core';
import { useFeatureAccess } from '@repo/core/hooks';
import { useStore, useTemporalStore } from '@repo/core/logic';
import { useWorkspaceLayoutSync } from '@repo/core/native';

import SandboxBanner from '@repo/ui/components/SandboxBanner';
import { WorkspaceCanvas } from '@repo/ui/components/workspace/WorkspaceCanvas';
import { useThemedColors } from '@repo/ui/hooks';
import { Box } from '@repo/ui/primitives';
import { HStack, Text } from '@repo/ui/primitives';
import { FadeInDown } from 'react-native-reanimated';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { AnimatedView, Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useTranslation } from 'react-i18next';
import { useStudentDashboardSurfaces } from '../workspace/useStudentDashboardSurfaces';
import { useStudentWorkspaceData } from '../workspace/useStudentWorkspaceData';

interface StudentDashboardProps {
  onRefresh?: () => void;
  schoolId?: string;
  userId?: string;
  forceDemo?: boolean;
}

export default function StudentDashboard({ forceDemo, userId }: StudentDashboardProps) {
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

  const { layout, surfaces, setSurfaceHidden, setSurfacePinned, setSurfaceZone } =
    useWorkspaceLayoutSync({
      workspaceId: 'student-dashboard',
      userId: userId || 'student-dashboard-guest',
      surfaces: dashboardSurfaces,
      enableRemoteSync: false,
    });

  if (!layout) {
    return <Box className="flex-1 bg-phase-canvas" />;
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      {isDemoExperience ? <SandboxBanner /> : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <AnimatedView entering={FadeInDown.duration(400)}>
          <WorkspaceCanvas
            surfaces={dashboardSurfaces}
            layout={layout}
            title={t('classroom.studentDashboardHeading') || 'Your Learning Journey'}
            subtitle={
              t('classroom.studentDashboardIntro') ||
              'Step into your sanctuaries and grow with love.'
            }
            renderSurfaceContent={(surface) =>
              surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId)?.content ??
              null
            }
            getSurfaceSubtitle={(surface) =>
              surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId)?.subtitle
            }
            getSurfaceSummary={(surface) =>
              surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId)?.summary
            }
            getSurfaceTemporalLabel={(surface) =>
              surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId)?.temporalLabel
            }
            getSurfaceMetadata={(surface) =>
              surfaces.find((candidate) => candidate.surfaceId === surface.surfaceId)
                ?.metadata as any
            }
            onToggleHidden={(surface) => setSurfaceHidden(surface.surfaceId, !surface.hidden)}
            renderSurfaceActions={(surface) => {
              const resolved = surfaces.find(
                (candidate) => candidate.surfaceId === surface.surfaceId,
              );
              if (!resolved) return null;

              return (
                <HStack className="flex-wrap gap-2">
                  <Pressable
                    onPress={() => setSurfacePinned(resolved.surfaceId, !resolved.pinned)}
                    className="rounded-full border border-phase-border/40 bg-phase-surface-secondary px-4 py-2"
                  >
                    <Text className="text-xs font-semibold text-phase-text-primary">
                      {resolved.pinned ? 'Unpin' : 'Pin'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setSurfaceZone(
                        resolved.surfaceId,
                        resolved.zone === 'work'
                          ? 'today'
                          : resolved.zone === 'today'
                            ? 'private'
                            : 'work',
                      )
                    }
                    className="rounded-full border border-phase-border/40 bg-phase-surface-secondary px-4 py-2"
                  >
                    <Text className="text-xs font-semibold text-phase-text-primary">Move zone</Text>
                  </Pressable>
                </HStack>
              );
            }}
          />
        </AnimatedView>
      </ScrollView>
    </Box>
  );
}

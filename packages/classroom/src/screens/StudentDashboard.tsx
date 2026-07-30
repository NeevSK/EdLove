import { useIsGuest } from '@repo/core/hooks';
import { useStore, useTemporalStore } from '@repo/core/logic';
import { useWorkspaceLayoutSync } from '@repo/core/native';

import SandboxBanner from '@repo/ui/components/SandboxBanner';
import { WorkspaceCanvas } from '@repo/ui/components/workspace/WorkspaceCanvas';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { useThemedColors } from '@repo/ui/hooks';
import { AnimatedView, Box, HStack, Pressable, ScrollView, Text } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FadeInDown } from 'react-native-reanimated';
import { useStudentDashboardSurfaces } from '@repo/classroom/workspace/useStudentDashboardSurfaces';
import { useStudentWorkspaceData } from '@repo/classroom/workspace/useStudentWorkspaceData';

interface StudentDashboardProps {
  onRefresh?: () => void;
  schoolId?: string;
  userId?: string;
  forceDemo?: boolean;
}

export default function StudentDashboard({ forceDemo, userId }: StudentDashboardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const showToast = useStore((state: any) => state.showToast);
  const isGuest = useIsGuest();
  const { isPastView } = useTemporalStore();
  const _colors = useThemedColors();
  const { isDemoExperience, stats } = useStudentWorkspaceData(forceDemo);

  useRegisterFAB({
    tabType: 'classroom',
    visible: false,
  });

  const dashboardSurfaces = useStudentDashboardSurfaces({
    isGuest,
    isPastView,
    isDemoExperience,
    stats,
    onOpenLibrary: () => router.push('/library'),
    onOpenCommunity: () => router.push('/community'),
    onOpenRewards: () => {
      hapticLight();
      showToast(t('common.comingSoon') || 'Rewards are blossoming soon!', 'info');
    },
    onOpenTimetable: () => {
      hapticLight();
      router.push('/self');
    },
    onOpenBreathing: () => {
      hapticLight();
      const { setBreathingOpen } = useStore.getState();
      setBreathingOpen(true);
    },
    onOpenClassroom: (classroom) => {
      hapticLight();
      router.push({
        pathname: '/self',
        params: {
          classroomId: classroom.id,
          classroomName: classroom.name,
        },
      });
    },
    onOpenGuestAuth: () => {
      hapticLight();
      router.push('/auth');
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

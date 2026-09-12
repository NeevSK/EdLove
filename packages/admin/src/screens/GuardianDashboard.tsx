import {
  resolveWorkspaceSwitcherTargets,
  useDomainFeature,
  usePermissions,
  usePerspectiveSwitch,
  useStore,
} from '@repo/core/logic';
import type { WorkspaceSwitcherTarget } from '@repo/core/types';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Button, ButtonText, Text } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  GuardianWorkspaceCanvas,
  type GuardianWorkspaceSurface,
  type GuardianWorkspaceSurfaceId,
  useGuardianWorkspaceCanvasSurfaces,
  useGuardianWorkspaceLayout,
} from '@repo/admin/guardian/useGuardianWorkspaceCanvas';
import { useGuardianWorkspaceData } from '@repo/admin/guardian/useGuardianWorkspaceData';
import { GuardianDashboardScreen } from '@repo/admin/screens/GuardianDashboardScreen';

type GuardianResolvedSurface = GuardianWorkspaceSurface & {
  surfaceId: GuardianWorkspaceSurfaceId;
  zone: string;
  hidden: boolean;
  pinned: boolean;
};

export default function GuardianDashboard() {
  const router = useRouter();
  const { can } = usePermissions();
  const { result: guardianFeature } = useDomainFeature('guardian-workspace');
  const user = useStore((state) => state.user);
  const { availablePerspectives, switchPerspective, activePerspective } = usePerspectiveSwitch();
  const { dashboard, isLoading, error, refreshData } = useGuardianWorkspaceData(user?.id || '');

  const workspaceTargets = React.useMemo(
    () =>
      resolveWorkspaceSwitcherTargets({
        currentWorkspace: 'guardian',
        canManageFounderDashboard: can('manage', 'FounderDashboard'),
        canManageAdminDashboard: can('manage', 'AdminDashboard'),
        canManagePrincipalDashboard: can('manage', 'PrincipalDashboard'),
        canManageGuardianDashboard: can('manage', 'GuardianDashboard'),
        canManageTeacherDashboard: can('manage', 'TeacherDashboard'),
        canManageStudentDashboard: can('manage', 'StudentDashboard'),
        hasPrimaryInstitution: Boolean(user?.school_id),
        hasMountedGuardianWorkspace: true,
        availablePerspectives,
        activePerspectiveId: activePerspective.id,
      }),
    [can, user?.school_id, availablePerspectives, activePerspective.id],
  );

  const handleWorkspaceTarget = React.useCallback(
    async (target: WorkspaceSwitcherTarget) => {
      if (!target.enabled) return;

      if (target.perspectiveId) {
        await switchPerspective(target.perspectiveId);
      }

      if (target.id === 'founder') {
        router.push('/workspace');
        return;
      }

      if (target.id === 'principal' && user?.school_id) {
        router.push('/workspace');
        return;
      }

      if (target.id === 'teacher' || target.id === 'student') {
        router.push('/workspace');
      }
    },
    [router, user?.school_id, switchPerspective],
  );

  const handleOpenStudentsRoom = React.useCallback(() => {
    router.push('/workspace/guardian/students');
  }, [router]);

  const handleOpenStudent = React.useCallback(
    (studentId?: string, studentName?: string) => {
      if (studentId) {
        router.push({
          pathname: '/workspace/guardian/[studentId]',
          params: { studentId, studentName: studentName || '' },
        });
        return;
      }

      router.push('/workspace/guardian/students');
    },
    [router],
  );

  const handleOpenLibrary = React.useCallback(() => {
    router.push('/library');
  }, [router]);

  const surfaces = useGuardianWorkspaceCanvasSurfaces({
    schoolName: user?.organization_name || null,
    dashboard: dashboard || {
      guardianId: user?.id || 'guardian-workspace-preview',
      students: [],
      notifications: [],
      upcomingEvents: [],
      recentActivity: [],
    },
    workspaceTargets,
    onSelectWorkspaceTarget: handleWorkspaceTarget,
    onOpenStudent: (student) => {
      handleOpenStudent(student.studentId, student.name);
    },
    onOpenNotification: (notification) => {
      void notification;
      router.push('/workspace/guardian/notifications');
    },
    onOpenEvent: (event) => {
      void event;
      router.push('/workspace/guardian/events');
    },
    onOpenCommunity: () => router.push('/community'),
    onOpenLibrary: handleOpenLibrary,
  });

  const workspace = useGuardianWorkspaceLayout(user?.id, surfaces);

  const handleOpenSurface = React.useCallback(
    (surface: GuardianResolvedSurface) => {
      if (
        surface.surfaceId === 'children' ||
        surface.surfaceId === 'attendance_watch' ||
        surface.surfaceId === 'learning_pulse'
      ) {
        handleOpenStudentsRoom();
        return;
      }

      if (surface.surfaceId === 'school_feed') {
        router.push('/workspace/guardian/notifications');
        return;
      }

      if (surface.surfaceId === 'upcoming_events') {
        router.push('/workspace/guardian/events');
        return;
      }

      if (surface.surfaceId === 'communication_bridge') {
        router.push('/workspace/guardian/bridge');
        return;
      }

      if (surface.surfaceId === 'workspace_switcher' && workspaceTargets[0]) {
        handleWorkspaceTarget(workspaceTargets[0]);
      }
    },
    [handleOpenStudentsRoom, handleWorkspaceTarget, router, workspaceTargets],
  );

  if (!user?.id) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-phaseText-secondary">
            Guardian workspace needs an authenticated guardian context before it can open.
          </Text>
        </Box>
      </ScreenWrapper>
    );
  }

  if (!guardianFeature.permitted) {
    return (
      <GuardianDashboardScreen
        guardianId={user.id}
        onStudentPress={(student) => handleOpenStudent(student.studentId, student.name)}
        onNotificationPress={(_notification) => router.push('/workspace/guardian/notifications')}
        onEventPress={(_event) => router.push('/workspace/guardian/events')}
      />
    );
  }

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-canvas">
        <Text className="text-phaseText-secondary text-base">Loading dashboard...</Text>
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-canvas p-5">
        <Text className="text-phase-danger text-base font-semibold text-center">
          {error || 'Failed to load dashboard'}
        </Text>
        <Button
          variant="outline"
          onPress={() => void refreshData()}
          className="mt-5 border-phase-danger/30"
          accessibilityLabel="Retry loading guardian dashboard"
        >
          <ButtonText className="text-phase-danger font-bold">Try again</ButtonText>
        </Button>
      </Box>
    );
  }

  if (!workspace.isHydrated || !workspace.layout) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-phaseText-secondary">
            Preparing your guardian workspace canvas...
          </Text>
        </Box>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false} noTopInset>
      <Box className="flex-1 bg-phase-canvas px-4 py-4">
        <GuardianWorkspaceCanvas
          layout={workspace.layout}
          surfaces={workspace.surfaces}
          schoolName={user.organization_name || null}
          onOpenSurface={handleOpenSurface}
          onToggleHidden={(surfaceId, hidden) => workspace.setSurfaceHidden(surfaceId, hidden)}
          onTogglePinned={(surfaceId, pinned) => workspace.setSurfacePinned(surfaceId, pinned)}
          onMoveToNextZone={(surfaceId, zone) => workspace.setSurfaceZone(surfaceId, zone)}
        />
      </Box>
    </ScreenWrapper>
  );
}

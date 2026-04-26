import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  type GuardianStackParamList,
  resolveWorkspaceSwitcherTargets,
  usePermissions,
  useStore,
  type WorkspaceSwitcherTarget,
} from '@repo/core';
import { Box, ScreenWrapper, Text } from '@repo/ui';
import React from 'react';
import {
  GuardianWorkspaceCanvas,
  type GuardianWorkspaceSurface,
  type GuardianWorkspaceSurfaceId,
  useGuardianWorkspaceCanvasSurfaces,
  useGuardianWorkspaceData,
  useGuardianWorkspaceLayout,
} from '../guardian';
import { GuardianDashboardScreen } from './GuardianDashboardScreen';

type GuardianResolvedSurface = GuardianWorkspaceSurface & {
  surfaceId: GuardianWorkspaceSurfaceId;
  zone: string;
  hidden: boolean;
  pinned: boolean;
};

export default function GuardianDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();
  const { can, flags } = usePermissions();
  const user = useStore((state) => state.user);
  const { dashboard, isLoading, error } = useGuardianWorkspaceData(user?.id || '');

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
      }),
    [can, user?.school_id],
  );

  const handleWorkspaceTarget = React.useCallback(
    (target: WorkspaceSwitcherTarget) => {
      if (!target.enabled) return;

      if (target.id === 'founder') {
        navigation.navigate('FounderDashboard');
        return;
      }

      if (target.id === 'principal' && user?.school_id) {
        navigation.navigate('PrincipalDashboard', {
          schoolId: user.school_id,
          userId: user.id,
        });
        return;
      }

      if (target.id === 'teacher' || target.id === 'student') {
        navigation.getParent()?.navigate('Classroom' as never);
      }
    },
    [navigation, user?.id, user?.school_id],
  );

  const handleOpenStudentsRoom = React.useCallback(() => {
    navigation.navigate('GuardianStudents');
  }, [navigation]);

  const handleOpenStudent = React.useCallback(
    (studentId?: string, studentName?: string) => {
      if (studentId) {
        navigation.navigate('GuardianStudentDetail', {
          studentId,
          studentName,
        });
        return;
      }

      navigation.navigate('GuardianStudents');
    },
    [navigation],
  );

  const handleOpenLibrary = React.useCallback(() => {
    navigation.getParent()?.navigate('Library' as never);
  }, [navigation]);

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
      navigation.navigate('GuardianNotifications');
    },
    onOpenEvent: (event) => {
      void event;
      navigation.navigate('GuardianEvents');
    },
    onOpenCommunity: () => navigation.navigate('GuardianCommunicationBridge'),
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
        navigation.navigate('GuardianNotifications');
        return;
      }

      if (surface.surfaceId === 'upcoming_events') {
        navigation.navigate('GuardianEvents');
        return;
      }

      if (surface.surfaceId === 'communication_bridge') {
        navigation.navigate('GuardianCommunicationBridge');
        return;
      }

      if (surface.surfaceId === 'workspace_switcher' && workspaceTargets[0]) {
        handleWorkspaceTarget(workspaceTargets[0]);
      }
    },
    [handleOpenStudentsRoom, handleWorkspaceTarget, navigation, workspaceTargets],
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

  if (!flags.isGuardianWorkspaceEnabled) {
    return (
      <GuardianDashboardScreen
        guardianId={user.id}
        onStudentPress={(student) => handleOpenStudent(student.studentId, student.name)}
        onNotificationPress={(_notification) => navigation.navigate('GuardianNotifications')}
        onEventPress={(_event) => navigation.navigate('GuardianEvents')}
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

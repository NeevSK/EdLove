import { usePermissions, usePerspectiveSwitch } from '@repo/core/logic';
import { workRoomPlanOf } from '@repo/core/logic/floor';
import { isLocalGuestSessionId } from '@repo/core/native/localGuestSession';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { EmptyState, ErrorState, WaitingSign } from '@repo/ui/components/native';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { WorkFloor } from '@/components/workspace/WorkFloor';
import { resolveWorkspaceRoute } from '@/lib/workspace/routeResolution';

export { RouteErrorBoundary as ErrorBoundary };

/** States sit on the world's own floor, never on a painted page. */
const STATE = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 24,
} as const;

export default function WorkspaceDispatcher() {
  const { context } = usePermissions();
  const { activePerspective } = usePerspectiveSwitch();
  const loading = useCedarDecisionStore((state) => state.isLoading);
  const permissionError = useCedarDecisionStore((state) => state.error);
  const permissionSnapshotLoaded = useCedarDecisionStore((state) => state.snapshotLoaded);
  const loadDecisions = useCedarDecisionStore((state) => state.loadDecisions);
  const routeResolution = resolveWorkspaceRoute({
    userId: context.userId,
    capacity: context.activeBond?.capacity ?? context.primaryCapacity,
    contextClassroomId: context.classroomId,
    requestedClassroomId: '',
    permissionSnapshotLoaded,
    isPermissionLoading: loading,
    permissionError,
    isLocalGuest: isLocalGuestSessionId(context.userId),
    perspectiveKind: activePerspective.kind,
    perspectiveId: activePerspective.id,
  });

  const retryPermissionResolution = () => {
    if (context.userId) {
      void loadDecisions(context.userId, context.activeBond?.id);
    }
  };

  if (routeResolution.kind === 'loading') {
    return (
      <View style={STATE}>
        <WaitingSign size={48} />
      </View>
    );
  }

  if (routeResolution.kind === 'retryable-error') {
    return (
      <View style={STATE}>
        <ErrorState
          title="Workspace access needs attention"
          message={routeResolution.message}
          retry={{ label: 'Try again', onPress: retryPermissionResolution }}
        />
      </View>
    );
  }

  if (routeResolution.kind === 'permission-denied') {
    return (
      <View style={STATE}>
        <ErrorState title="Workspace access is unavailable" message={routeResolution.message} />
      </View>
    );
  }

  if (routeResolution.kind === 'empty') {
    return (
      <View style={STATE}>
        <EmptyState title="Workspace capability unavailable" message={routeResolution.message} />
      </View>
    );
  }

  if (routeResolution.target.kind === 'commercial') {
    return (
      <Redirect
        href={{
          pathname: '/workspace/commercial/[batchId]',
          params: { batchId: routeResolution.target.perspectiveId || 'active' },
        }}
      />
    );
  }

  // Opt-in: the floor engine draws the role's work room. Off by default, so
  // the room below stays exactly as it was until it is switched on.
  const workPlan =
    process.env.EXPO_PUBLIC_WORK_FLOOR === '1'
      ? workRoomPlanOf(context.activeBond?.capacity ?? context.primaryCapacity)
      : undefined;
  if (workPlan) {
    return (
      <WorkFloor plan={workPlan} userId={context.userId} perspectiveId={activePerspective.id} />
    );
  }

  return (
    <View style={STATE}>
      <ErrorState
        title="Workspace capability unavailable"
        message="This workspace capability is not active in the current API foundation. No changes were made to your account or data."
      />
    </View>
  );
}

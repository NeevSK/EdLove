import { usePermissions, usePerspectiveSwitch } from '@repo/core/logic';
import { roomCatalogOf } from '@repo/core/logic/floor';
import { isLocalGuestSessionId } from '@repo/core/native/localGuestSession';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Card, EmptyState, ErrorState, WaitingSign } from '@repo/ui/components/native';
import { type Href, Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { APP_CATALOG } from '@/boot/registerAppCatalog';
import { RoomFloor } from '@/components/floor/RoomFloor';
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
  const router = useRouter();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  // Opt-in: the floor engine draws the work room from its catalog. Off by
  // default, so the room below stays as it was until it is switched on.
  const catalog = useMemo(
    () =>
      process.env.EXPO_PUBLIC_WORK_FLOOR === '1'
        ? roomCatalogOf(APP_CATALOG, 'workspace', capacity, 'mobile')
        : null,
    [capacity],
  );
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

  if (catalog) {
    return (
      <RoomFloor
        catalog={catalog}
        userId={context.userId}
        perspectiveId={activePerspective.id}
        renderPiece={(p) => {
          const to = catalog.features.find((f) => f.id === p.id)?.routes?.mobile;
          return <Card title={p.label} onPress={to ? () => router.push(to as Href) : undefined} />;
        }}
      />
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

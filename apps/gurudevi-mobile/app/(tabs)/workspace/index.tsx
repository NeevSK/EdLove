import { usePermissions } from '@repo/core/logic';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { Center, Pressable, Text } from '@repo/ui/primitives';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { resolveWorkspaceRoute } from '@/lib/workspace/routeResolution';

export { RouteErrorBoundary as ErrorBoundary };

export default function WorkspaceDispatcher() {
  const { context } = usePermissions();
  const { classroomId: requestedClassroomId, classroomName } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const loading = useCedarDecisionStore((state) => state.isLoading);
  const permissionError = useCedarDecisionStore((state) => state.error);
  const permissionSnapshotLoaded = useCedarDecisionStore((state) => state.snapshotLoaded);
  const loadDecisions = useCedarDecisionStore((state) => state.loadDecisions);
  const selectedClassroomId =
    typeof requestedClassroomId === 'string' ? requestedClassroomId.trim() : '';
  const selectedClassroomName = typeof classroomName === 'string' ? classroomName : undefined;
  const routeResolution = resolveWorkspaceRoute({
    userId: context.userId,
    capacity: context.activeBond?.capacity ?? context.primaryCapacity,
    contextClassroomId: context.classroomId,
    requestedClassroomId: selectedClassroomId,
    ...(selectedClassroomName ? { requestedClassroomName: selectedClassroomName } : {}),
    permissionSnapshotLoaded,
    isPermissionLoading: loading,
    permissionError,
  });

  const retryPermissionResolution = () => {
    if (context.userId) {
      void loadDecisions(context.userId, context.activeBond?.id);
    }
  };

  if (routeResolution.kind === 'loading') {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandPulse size={32} accessibilityLabel="Loading workspace" />
      </Center>
    );
  }

  if (routeResolution.kind === 'retryable-error') {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandedErrorState
          title="Workspace access needs attention"
          message={routeResolution.message}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry workspace access"
            accessibilityHint="Retries restoring permissions for the current workspace"
            onPress={retryPermissionResolution}
            className="rounded-full bg-phase-primary px-5 py-3"
          >
            <Text className="font-semibold text-phase-world">Try again</Text>
          </Pressable>
        </BrandedErrorState>
      </Center>
    );
  }

  if (routeResolution.kind === 'permission-denied') {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandedErrorState
          title="Workspace access is unavailable"
          message={routeResolution.message}
        />
      </Center>
    );
  }

  if (routeResolution.kind === 'empty') {
    return (
      <Center className="flex-1 bg-phase-canvas px-6">
        <BrandedEmptyState title="No classroom selected" message={routeResolution.message} />
      </Center>
    );
  }

  if (routeResolution.target.kind === 'founder') {
    return <Redirect href="/workspace/founder" />;
  }
  if (routeResolution.target.kind === 'principal') {
    return <Redirect href="/workspace/principal" />;
  }
  if (routeResolution.target.kind === 'guardian') {
    return <Redirect href="/workspace/guardian" />;
  }

  if (routeResolution.target.kind === 'classroom') {
    const selectedClassroomId = routeResolution.target.classroomId;

    if (routeResolution.target.audience === 'student') {
      return (
        <Redirect
          href={{
            pathname: '/workspace/classroom/student/[classroomId]',
            params: {
              classroomId: selectedClassroomId,
              ...(routeResolution.target.classroomName
                ? { classroomName: routeResolution.target.classroomName }
                : {}),
            },
          }}
        />
      );
    }

    return (
      <Redirect
        href={{
          pathname: '/workspace/classroom/[classroomId]',
          params: {
            classroomId: selectedClassroomId,
            ...(routeResolution.target.classroomName
              ? { classroomName: routeResolution.target.classroomName }
              : {}),
          },
        }}
      />
    );
  }

  return <Redirect href="/workspace/classroom" />;
}

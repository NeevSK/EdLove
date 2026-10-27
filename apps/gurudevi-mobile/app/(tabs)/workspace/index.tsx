import { usePermissions, usePerspectiveSwitch } from '@repo/core/logic';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { Center, Pressable, Text } from '@repo/ui/primitives';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { resolveWorkspaceRoute } from '@/lib/workspace/routeResolution';

export { RouteErrorBoundary as ErrorBoundary };

export default function WorkspaceDispatcher() {
  const router = useRouter();
  const { context } = usePermissions();
  const { activePerspective } = usePerspectiveSwitch();
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
        <BrandedEmptyState title="No classroom selected" message={routeResolution.message}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter classroom invitation code"
            onPress={() => router.push('/workspace/classroom')}
            className="mt-4 rounded-full bg-phase-primary px-6 py-3.5 shadow-sm active:opacity-90"
          >
            <Text className="font-bold text-white text-sm">Join Classroom Sanctuary</Text>
          </Pressable>
        </BrandedEmptyState>
      </Center>
    );
  }

  if (routeResolution.target.kind === 'founder') {
    return <Redirect href="/workspace/founder" />;
  }
  if (routeResolution.target.kind === 'principal') {
    return <Redirect href="/workspace/principal" />;
  }
  if (routeResolution.target.kind === 'admin') {
    return <Redirect href="/workspace/admin" />;
  }
  if (routeResolution.target.kind === 'section-head') {
    return <Redirect href="/workspace/section-head" />;
  }
  if (routeResolution.target.kind === 'grade-head') {
    return <Redirect href="/workspace/grade-head" />;
  }
  if (routeResolution.target.kind === 'guardian') {
    return <Redirect href="/workspace/guardian" />;
  }
  if (routeResolution.target.kind === 'personal') {
    return <Redirect href="/workspace/classroom" />;
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

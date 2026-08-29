import { usePermissions } from '@repo/core/logic';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { Center, Heading, Pressable, Text } from '@repo/ui/primitives';
import { resolveBlockingScreenState } from '@repo/ui/state/screenState';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function WorkspaceDispatcher() {
  const { context } = usePermissions();
  const { classroomId: requestedClassroomId, classroomName } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const loading = useCedarDecisionStore((state) => state.isLoading);
  const permissionError = useCedarDecisionStore((state) => state.error);
  const loadDecisions = useCedarDecisionStore((state) => state.loadDecisions);

  const retryPermissionResolution = () => {
    if (!context.userId) return;
    void loadDecisions(context.userId, context.activeBond?.id);
  };
  const screenState = resolveBlockingScreenState({
    hasContent: false,
    isLoading: loading,
    error: permissionError,
  });

  if (screenState === 'loading') {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandPulse size={32} accessibilityLabel="Loading workspace" />
      </Center>
    );
  }

  if (screenState === 'error') {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandedErrorState
          title="Workspace access needs attention"
          message="We could not restore the permissions for this workspace. Your local data is safe."
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

  const capacity = context.activeBond?.capacity || context.primaryCapacity;
  const selectedClassroomId =
    typeof requestedClassroomId === 'string' ? requestedClassroomId.trim() : '';
  const selectedClassroomName = typeof classroomName === 'string' ? classroomName : undefined;

  if (capacity === 'founder') {
    return <Redirect href="/workspace/founder" />;
  }
  if (capacity === 'principal') {
    return <Redirect href="/workspace/principal" />;
  }
  if (capacity === 'student') {
    if (selectedClassroomId) {
      return (
        <Redirect
          href={{
            pathname: '/workspace/classroom/student/[classroomId]',
            params: { classroomId: selectedClassroomId, classroomName: selectedClassroomName },
          }}
        />
      );
    }

    if (context.classroomId) {
      return <Redirect href={`/workspace/classroom/student/${context.classroomId}`} />;
    }

    return (
      <Center className="flex-1 bg-phase-canvas p-6">
        <Heading className="text-phase-text-primary text-xl text-center">
          No classroom selected
        </Heading>
        <Text className="text-phase-text-secondary text-center mt-2">
          Your student access is active, but no classroom is available to open yet.
        </Text>
      </Center>
    );
  }
  if (capacity === 'guardian') {
    return <Redirect href="/workspace/guardian" />;
  }

  if (selectedClassroomId) {
    return (
      <Redirect
        href={{
          pathname: '/workspace/classroom/[classroomId]',
          params: { classroomId: selectedClassroomId, classroomName: selectedClassroomName },
        }}
      />
    );
  }

  // Default fallback for teachers, gradeHeads, sectionHeads, or unassigned roles is the Classroom list
  return <Redirect href="/workspace/classroom" />;
}

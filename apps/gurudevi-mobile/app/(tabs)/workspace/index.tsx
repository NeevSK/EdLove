import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { usePermissions } from '@repo/core/logic';
import { Center, Heading, Spinner, Text } from '@repo/ui/primitives';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function WorkspaceDispatcher() {
  const { context } = usePermissions();
  const { classroomId: requestedClassroomId, classroomName } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const loading = useCedarDecisionStore((state: any) => state.isLoading);

  if (loading) {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <Spinner />
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

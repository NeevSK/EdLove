import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { usePermissions } from '@repo/core/logic';
import { Center, Spinner } from '@repo/ui/primitives';
import { Redirect } from 'expo-router';

export default function WorkspaceDispatcher() {
  const { context } = usePermissions();
  const loading = useCedarDecisionStore((state: any) => state.isLoading);

  if (loading) {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <Spinner />
      </Center>
    );
  }

  const capacity = context.activeBond?.capacity || context.primaryCapacity;

  if (capacity === 'founder') {
    return <Redirect href="/workspace/founder" />;
  }
  if (capacity === 'principal') {
    return <Redirect href="/workspace/principal" />;
  }
  if (capacity === 'student') {
    return <Redirect href={`/workspace/classroom/student/${context.classroomId || 'default'}`} />;
  }
  if (capacity === 'guardian') {
    return <Redirect href="/workspace/guardian" />;
  }

  // Default fallback for teachers, gradeHeads, sectionHeads, or unassigned roles is the Classroom list
  return <Redirect href="/workspace/classroom" />;
}

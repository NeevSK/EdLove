import { GradebookScreen } from '@repo/classroom/gradebook';
import { usePermissions } from '@repo/core/logic';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function GradebookRoute() {
  const { classroomId = '' } = useLocalSearchParams<{ classroomId?: string }>();
  const { context } = usePermissions();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;

  if (capacity === 'student') {
    return (
      <Redirect
        href={{
          pathname: '/workspace/classroom/student/[classroomId]',
          params: { classroomId },
        }}
      />
    );
  }

  return <GradebookScreen classroomId={classroomId} />;
}

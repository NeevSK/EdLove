import { TeacherClassroomDashboard } from '@repo/classroom/teacher';
import { usePermissions } from '@repo/core/logic';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function TeacherClassroomDashboardRoute() {
  const { classroomId } = useLocalSearchParams<{ classroomId: string }>();
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

  return <TeacherClassroomDashboard />;
}

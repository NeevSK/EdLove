import { StudentClassroomDashboard } from '@repo/classroom/student';
import { usePermissions } from '@repo/core/logic';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function StudentClassroomDashboardRoute() {
  const { classroomId } = useLocalSearchParams<{ classroomId: string }>();
  const { context } = usePermissions();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;

  if (capacity === 'teacher' || capacity === 'gradeHead' || capacity === 'sectionHead') {
    return (
      <Redirect
        href={{
          pathname: '/workspace/classroom/[classroomId]',
          params: { classroomId },
        }}
      />
    );
  }

  return <StudentClassroomDashboard />;
}

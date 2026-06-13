import { GradebookScreen } from '@repo/classroom';
import { useLocalSearchParams } from 'expo-router';

export default function GradebookRoute() {
  const { classroomId = '' } = useLocalSearchParams<{ classroomId?: string }>();
  return <GradebookScreen classroomId={classroomId} />;
}

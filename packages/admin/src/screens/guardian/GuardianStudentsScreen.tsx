import { useStore } from '@repo/core/logic';
import { Box, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';

import { useGuardianWorkspaceData } from '../../guardian';
import { GuardianRoomShell } from './GuardianRoomShell';

export default function GuardianStudentsScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const { dashboard } = useGuardianWorkspaceData(user?.id || '');

  const students = dashboard?.students || [];

  return (
    <GuardianRoomShell
      eyebrow="Linked, learners"
      title="Family, learner room"
      description="A, focused view, of every, linked learner, so the, family can, move from awareness into, support without, losing the, school-home, bridge."
      stats={[
        { label: 'Children', value: students.length },
        {
          label: 'Avg, attendance',
          value: students.length
            ? `${Math.round(students.reduce((sum, student) => sum + student.attendance.percentage, 0) / students.length)}%`
            : '0%',
        },
      ]}
      onBack={() => safeBack('/workspace')}
    >
      <ScrollView className="flex-1">
        <VStack className="gap-3 pb-8">
          {students.map((student) => (
            <Pressable
              key={student.studentId}
              onPress={() => router.push('/workspace')}
              className="active:opacity-80"
            >
              <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
                <VStack className="gap-2">
                  <Text className="text-[16px] font-bold text-phaseText-primary">
                    {student.name}
                  </Text>
                  <Text className="text-[12px] text-phaseText-secondary">
                    Grade {student.grade} - {student.classroom}
                  </Text>
                  <Text className="text-[12px] text-phaseText-secondary">
                    Attendance {student.attendance.percentage.toFixed(0)}% - Average{' '}
                    {Math.round(student.grades.average || 0)}%
                  </Text>
                </VStack>
              </Box>
            </Pressable>
          ))}
        </VStack>
      </ScrollView>
    </GuardianRoomShell>
  );
}

import { useAuthStore } from '@repo/core/store';
import { useScaffoldDismissal } from '@repo/core/hooks';
import { useEffect } from 'react';

import { FireflyMascot } from '@repo/ui';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { Box, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';

import { useGuardianWorkspaceData } from '@repo/admin/guardian/useGuardianWorkspaceData';
import { GuardianRoomShell } from '@repo/admin/screens/guardian/GuardianRoomShell';

export default function GuardianStudentsScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { dashboard } = useGuardianWorkspaceData(user?.id || '');

  const students = dashboard?.students || [];

  const { isDismissed: isLinkScaffoldDismissed, completeScaffold: completeLinkScaffold } =
    useScaffoldDismissal('guardian_first_link_scaffold', 1);

  useEffect(() => {
    if (students.length > 0 && !isLinkScaffoldDismissed) {
      completeLinkScaffold();
    }
  }, [students.length, isLinkScaffoldDismissed, completeLinkScaffold]);

  return (
    <GuardianRoomShell
      eyebrow="Linked Learners"
      title="Family Learner Room"
      description="A focused view of every linked learner, so the family can move from awareness into support without losing the school-home bridge."
      stats={[
        { label: 'Children', value: students.length },
        {
          label: 'Avg Attendance',
          value: students.length
            ? `${Math.round(students.reduce((sum, student) => sum + student.attendance.percentage, 0) / students.length)}%`
            : '0%',
        },
      ]}
      onBack={() => safeBack('/workspace')}
    >
      <ScrollView className="flex-1">
        <VStack className="gap-3 pb-8">
          {students.length === 0 ? (
            <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite p-8 items-center mt-4">
              <FireflyMascot size={72} mode="glowing" role="guide" />
              <VStack className="gap-2 items-center mt-5">
                <Text className="text-lg font-black text-phaseText-primary text-center">
                  Link Your Child's Sanctuary Badge
                </Text>
                <Text className="text-xs text-phaseText-secondary text-center max-w-[280px] leading-5">
                  Connect with your child's classroom by scanning their student QR desk pass or entering their badge token to begin receiving daily homework, attendance, and somatic check-ins.
                </Text>
              </VStack>
              <Box className="w-full mt-6">
                <SanctuaryButton
                  onPress={() => router.push('/qr')}
                  size="md"
                  className="w-full"
                >
                  Scan Child QR Pass
                </SanctuaryButton>
              </Box>
            </Box>
          ) : (
            students.map((student) => (
              <Pressable
                key={student.studentId}
                onPress={() => router.push({ pathname: '/workspace/guardian/[studentId]', params: { studentId: student.studentId, studentName: student.name } })}
                accessibilityRole="button"
                accessibilityLabel={`Open guardian workspace for ${student.name}`}
                accessibilityHint="Returns to the guardian workspace"
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
            ))
          )}
        </VStack>
      </ScrollView>
    </GuardianRoomShell>
  );
}

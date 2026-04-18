import React, { useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { GuardianStackParamList } from '@repo/core';
import { Box, ScrollView, Text, VStack } from '@repo/ui';
import { useStore } from '@repo/core';
import { useGuardianWorkspaceData } from '../../guardian';
import { GuardianRoomShell } from './GuardianRoomShell';

export default function GuardianStudentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<GuardianStackParamList, 'GuardianStudentDetail'>>();
  const user = useStore((state) => state.user);
  const { dashboard } = useGuardianWorkspaceData(user?.id || '');

  const student = useMemo(
    () => dashboard?.students.find((item) => item.studentId === route.params.studentId),
    [dashboard?.students, route.params.studentId],
  );

  return (
    <GuardianRoomShell eyebrow="Learner detail"
      title={route.params.studentName || student?.name || 'Linked learner'}
      description="A guardian-facing learner room with the essentials: attendance, rhythm, recent grade signal, and upcoming study commitments."
      stats={[
        { label: 'Attendance', value: student ? `${Math.round(student.attendance.percentage)}%` : '--' },
        { label: 'Average', value: student ? `${Math.round(student.grades.average || 0)}%` : '--' },
        { label: 'Assignments', value: student?.upcomingAssignments.length || 0 }
      ]}
      onBack={() => navigation.goBack()}>
      <ScrollView className="flex-1">
        <VStack className="gap-4 pb-8">
          <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
            <VStack className="gap-2">
              <Text className="text-[14px] font-bold text-phaseText-primary">Attendance, rhythm</Text>
              <Text className="text-[12px] text-phaseText-secondary">
                {student
                  ? `${student.attendance.present} present - ${student.attendance.absent} absent - ${student.attendance.late} late`
                  : 'No, attendance snapshot, is available, yet.'}
              </Text>
            </VStack>
          </Box>

          <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
            <VStack className="gap-3">
              <Text className="text-[14px] font-bold text-phaseText-primary">Recent, grade signal</Text>
              {(student?.grades.latest || []).length > 0 ? (
                student?.grades.latest.slice(0, 4).map((grade) => (
                  <Box key={`${grade.subject}-${grade.date}`} className="rounded-2xl bg-silk px-4 py-3">
                    <Text className="text-[13px] font-semibold text-phaseText-primary">{grade.subject}</Text>
                    <Text className="text-[12px] text-phaseText-secondary">
                      {grade.grade}
                      {grade.percentage ? ` - ${Math.round(grade.percentage)}%` : ''}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text className="text-[12px] text-phaseText-secondary">
                  No, published grade, entries are, visible for this learner, yet.
                </Text>
              )}
            </VStack>
          </Box>

          <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
            <VStack className="gap-3">
              <Text className="text-[14px] font-bold text-phaseText-primary">Upcoming, study commitments</Text>
              {(student?.upcomingAssignments || []).length > 0 ? (
                student?.upcomingAssignments.map((assignment) => (
                  <Box key={assignment.id} className="rounded-2xl bg-silk px-4 py-3">
                    <Text className="text-[13px] font-semibold text-phaseText-primary">{assignment.title}</Text>
                    <Text className="text-[12px] text-phaseText-secondary">
                      {assignment.subject} - due {new Intl.DateTimeFormat('en-LK', { month: 'short', day: 'numeric' }).format(new Date(assignment.dueDate))}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text className="text-[12px] text-phaseText-secondary">
                  No, upcoming assignments, are visible, right now.
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </GuardianRoomShell>
  );
}


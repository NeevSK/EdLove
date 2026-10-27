import AttendanceSheet from '@repo/classroom/components/AttendanceSheet';
import { api } from '@repo/core/api/client';
import type { StudentAttendance } from '@repo/core/logic';
import { useActorSnapshot } from '@repo/core/hooks/useActorSnapshot';
import {
  createAttendanceSessionActor,
  executeFetchAttendanceRosterEffect,
} from '@repo/classroom/machines/attendanceSessionMachine';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Box, Button, ButtonText, Text } from '@repo/ui/primitives';
import { useCallback, useEffect, useMemo } from 'react';

interface AttendanceViewProps {
  classroomId: string;
}

export default function AttendanceView({ classroomId }: AttendanceViewProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);
  const actor = useMemo(
    () => createAttendanceSessionActor({ classroomId, date: today }),
    [classroomId, today],
  );
  const snapshot = useActorSnapshot(actor);
  const { students, error: loadError } = snapshot.context;
  const isLoading = snapshot.value === 'loading';

  const fetchStudents = useCallback(async () => {
    await executeFetchAttendanceRosterEffect(actor, {
      classroomId,
      date: today,
      fetchRoster: (cId) => api.classroomStudents.getAll(cId),
      fetchSnapshot: (cId, d) => api.attendance.getClassroomAttendanceSnapshot(cId, d),
    });
  }, [actor, classroomId, today]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
    actor.send({ type: 'FETCH_SUCCESS', students: updatedAttendance });
  };

  if (isLoading) {
    return (
      <Box className="flex-1 p-8 items-center">
        <BrandPulse size={28} tintColor="#F6BF8C" accessibilityLabel="Loading attendance roster" />
        <Text className="text-typography-500 mt-4">Loading class list...</Text>
      </Box>
    );
  }

  if (students.length === 0 && !isLoading) {
    if (loadError) {
      return (
        <Box className="flex-1 p-8 items-center gap-4">
          <Text className="text-emberRed text-center">{loadError}</Text>
          <Button
            variant="outline"
            onPress={() => void fetchStudents()}
            accessibilityLabel="Retry loading attendance roster"
          >
            <ButtonText>Try again</ButtonText>
          </Button>
        </Box>
      );
    }
    return (
      <Box className="flex-1 p-8 items-center">
        <Text className="text-typography-500">No students found in this classroom.</Text>
      </Box>
    );
  }

  return (
    <AttendanceSheet
      classroomId={classroomId}
      initialStudents={students}
      onAttendanceChange={handleAttendanceChange}
    />
  );
}

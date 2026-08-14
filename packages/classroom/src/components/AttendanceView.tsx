import AttendanceSheet from '@repo/classroom/components/AttendanceSheet';
import { api } from '@repo/core/api/client';
import type { AttendanceStatus, StudentAttendance } from '@repo/core/logic';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Box, Text } from '@repo/ui/primitives';
import { useCallback, useEffect, useState } from 'react';

interface AttendanceViewProps {
  classroomId: string;
}

type RosterStudent = {
  id: string;
  student_id?: string | null;
  full_name?: string | null;
  roll_number?: string | null;
};

export default function AttendanceView({ classroomId }: AttendanceViewProps) {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Load student roster and any already-saved attendance for today in parallel
      const [roster, snapshot] = await Promise.all([
        api.classroomStudents.getAll(classroomId),
        api.attendance.getClassroomAttendanceSnapshot(classroomId, today || '').catch(() => ({
          records: [] as { student_id: string; status: AttendanceStatus }[],
        })),
      ]);

      // Build a lookup map: student_id → saved status
      const savedStatus = new Map<string, AttendanceStatus>(
        (snapshot.records as { student_id: string; status: AttendanceStatus }[]).map((r) => [
          r.student_id,
          r.status,
        ]),
      );

      const typedRoster = roster as RosterStudent[];

      const attendanceData: StudentAttendance[] = typedRoster.map((student) => ({
        id: student.id,
        student_id: student.student_id || student.id,
        full_name: student.full_name || 'Unknown Student',
        roll_number: student.roll_number || null,
        // Restore saved status; default to 'present' for unmarked students
        status: savedStatus.get(student.student_id || student.id) ?? 'present',
      }));

      setStudents(attendanceData);
    } catch (_error) {
      console.error('Failed to load student list');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
    setStudents(updatedAttendance);
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

import { useRoute } from '@react-navigation/native';
import { academicCyclesAPI, api, growthSignalsAPI } from '@repo/core/api';
import { useSafeMutation } from '@repo/core/hooks';
import { type AttendanceStatus, type StudentAttendance, useStore } from '@repo/core/logic';
import { generateIdempotencyKey, getCurrentTimestamp } from '@repo/core/utils';
import { Box, Button, ButtonText, Spinner, Text, VStack } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';

import { useCallback, useEffect, useState } from 'react';
import AttendanceSheet from '../components/AttendanceSheet';

type AttendanceScreenRouteProp = {
  key: string;
  name: 'Attendance';
  params: {
    classroomId: string;
    classroomName: string;
  };
};

export default function AttendanceScreen() {
  const route = useRoute<AttendanceScreenRouteProp>();
  const { classroomId } = route.params;

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Load student roster and any already-saved attendance for today in parallel
      const [roster, snapshot] = await Promise.all([
        api['classroomStudents'].getAll(classroomId),
        api['attendance'].getClassroomAttendanceSnapshot(classroomId, today || '').catch(() => ({
          records: [] as { student_id: string; status: AttendanceStatus }[],
        })),
      ]);

      // Build a lookup map: student_id -> saved status
      const savedStatus = new Map<string, AttendanceStatus>(
        (snapshot.records as { student_id: string; status: AttendanceStatus }[]).map((r) => [
          r.student_id,
          r.status,
        ]),
      );

      const attendanceData: StudentAttendance[] = (roster as any[]).map((student) => ({
        id: student.id,
        student_id: student.student_id || student.id,
        full_name: student.full_name || 'Unknown Student',
        roll_number: student.roll_number || null,
        // Restore saved status; default to 'present' for unmarked students
        status: (savedStatus.get(student.student_id || student.id) as any) ?? 'present',
      })) as StudentAttendance[];

      setStudents(attendanceData);
    } catch (_err) {
      setError('Failed to load student list');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  const schoolId = useStore((state) => state.schoolId);
  const academicCycleId = useStore((state) => state.academicCycleId);
  const setAcademicCycleId = useStore((state) => state.setAcademicCycleId);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const syncCycle = async () => {
      if (schoolId && !academicCycleId) {
        const cycle = await academicCyclesAPI.getCurrent(schoolId);
        if (cycle) setAcademicCycleId(cycle.id);
      }
    };
    syncCycle();
  }, [schoolId, academicCycleId, setAcademicCycleId]);

  const showToast = useStore((state) => state.showToast);
  const currentUser = useStore((state) => state.user);

  const saveMutation = useSafeMutation(
    async (updatedAttendance: StudentAttendance[]) => {
      const now = getCurrentTimestamp();
      const records = updatedAttendance.map((s) => ({
        classroom_id: classroomId,
        student_id: s.student_id,
        status: s.status,
        date: new Date().toISOString().split('T')[0] || '',
        occurred_at: now,
        academic_cycle_id: academicCycleId, // Tagging with academic cycle
      }));
      return api['attendance'].batchRecord(records, {
        actorId: currentUser?.id,
        reason: 'daily_roll_call',
        accessKind: 'teacher_marking',
        idempotencyKey: generateIdempotencyKey('attendance'), // Idempotency protection
      });
    },
    {
      onSuccess: () => {
        hapticSuccess();
        showToast('Attendance saved successfully', 'success');
        // Growth signal  fire-and-forget
        if (currentUser?.id) {
          growthSignalsAPI.emitSilent({
            user_id: currentUser.id,
            event_type: 'attendance_marked',
            event_metadata: { classroom_id: classroomId },
          });
        }
      },
      onError: (err: any) => {
        showToast(err.message || 'Failed to save attendance', 'error');
      },
    },
  );

  const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
    setStudents(updatedAttendance);
  };

  const handleSave = () => {
    saveMutation.mutate(students);
  };

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-surface-primary">
        <Spinner color="#F6BF8C" />
        <Text className="text-phase-text-secondary mt-4 font-black">Loading class list...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-surface-primary p-6">
        <Text className="text-emberRed font-black text-center">{error}</Text>
      </Box>
    );
  }

  return (
    <VStack className="flex-1 bg-phase-surface-primary">
      <AttendanceSheet
        classroomId={classroomId}
        initialStudents={students}
        onAttendanceChange={handleAttendanceChange}
      />
      <Box className="p-4 bg-phase-surface-primary pb-10 border-t border-phase-border">
        <Button
          onPress={handleSave}
          disabled={saveMutation.isLoading}
          className="bg-sanctuarySaffron rounded-[24px] h-[56px] justify-center"
        >
          <ButtonText className="text-white font-black">
            {saveMutation.isLoading ? 'Syncing...' : 'Complete Marking'}
          </ButtonText>
        </Button>
      </Box>
    </VStack>
  );
}

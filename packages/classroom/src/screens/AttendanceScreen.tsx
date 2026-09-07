import AttendanceSheet from '@repo/classroom/components/AttendanceSheet';
import { academicCyclesAPI, api, growthSignalsAPI } from '@repo/core/api/client';
import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { useSafeMutation } from '@repo/core/hooks';
import { type AttendanceStatus, type StudentAttendance, useStore } from '@repo/core/logic';
import { generateIdempotencyKey, getCurrentTimestamp } from '@repo/core/utils';
import { BrandPulse } from '@repo/ui';
import { useAppStoreReview } from '@repo/ui/hooks';
import { Box, Button, ButtonText, Text, VStack } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import { Observe } from 'expo-observe';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function AttendanceScreen() {
  const { classroomId = '' } = useLocalSearchParams<{ classroomId?: string }>();
  const { triggerReview } = useAppStoreReview();

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!classroomId) {
        setError('No classroom selected');
        setStudents([]);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // The register is local until the explicit batch save below. This keeps
      // one idempotent write path and avoids saving each swipe twice.
      // Offline-first: try server snapshot, fallback to local PowerSync Drizzle (<500ms reads).
      let roster: unknown;
      let snapshot: { records: unknown[] } = { records: [] };
      try {
        [roster, snapshot] = await Promise.all([
          api.classroomStudents.getAll(classroomId),
          api.attendance.getClassroomAttendanceSnapshot(classroomId, today || ''),
        ]);
      } catch (e) {
        // Offline fallback via Drizzle (PowerSync) — never block TTI
        try {
          if (Platform.OS !== 'web') {
            const db = getDrizzleDB() as unknown as { execute: (sql: string, params?: unknown[]) => Promise<{ rows?: unknown[] }> };
            const local = await db.execute('SELECT student_id, status FROM attendance WHERE classroom_id = ? AND date = ?', [
              classroomId,
              today,
            ]);
            snapshot = { records: local?.rows ?? [] };
            // roster fallback: use local classroom_students if available
            if (!roster) {
              const r = await db.execute('SELECT student_id as student_id, id, full_name, roll_number FROM classroom_students WHERE classroom_id = ?', [
                classroomId,
              ]);
              roster = r?.rows ?? [];
            }
            try {
              (Observe as unknown as { logEvent: (n: string, o?: unknown) => void }).logEvent('attendance_offline_fallback', {
                attributes: { classroomId },
              } as unknown as never);
            } catch {}
          }
        } catch {}
        // if still no roster, rethrow to show error
        if (!roster) throw e;
      }

      // Build a lookup map: student_id -> saved status
      const savedStatus = new Map<string, AttendanceStatus>(
        (snapshot.records as { student_id: string; status: AttendanceStatus }[]).map((r) => [
          r.student_id,
          r.status,
        ]),
      );

      const attendanceData: StudentAttendance[] = (roster as any[]).flatMap((student) => {
        const studentId = student.student_id || student.id;
        if (!studentId || !student.full_name) return [];

        return [
          {
            id: student.id,
            student_id: studentId,
            full_name: student.full_name,
            roll_number: student.roll_number || null,
            // Unmarked students begin present locally; only the explicit batch save persists it.
            status: (savedStatus.get(studentId) as AttendanceStatus) ?? 'present',
          } satisfies StudentAttendance,
        ];
      });

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
      const today = new Date().toISOString().split('T')[0] || '';
      const records = updatedAttendance.map((s) => ({
        classroom_id: classroomId,
        student_id: s.student_id,
        status: s.status,
        date: today,
        occurred_at: now,
        academic_cycle_id: academicCycleId, // Tagging with academic cycle
      }));
      const idempotencyKey = generateIdempotencyKey('attendance');
      try {
        return await api.attendance.batchRecord(records, {
          actorId: currentUser?.id,
          reason: 'daily_roll_call',
          accessKind: 'teacher_marking',
          idempotencyKey,
        });
      } catch (e) {
        // Offline: queue locally via PowerSync and backgroundSync (expose as offline success)
        if (Platform.OS !== 'web') {
          try {
            const db = getDrizzleDB() as unknown as { execute: (sql: string, params?: unknown[]) => Promise<unknown> };
            for (const r of records) {
              await db.execute(
                'INSERT OR REPLACE INTO attendance (id, classroom_id, student_id, status, date, occurred_at, academic_cycle_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [`att_${r.student_id}_${today}`, r.classroom_id, r.student_id, r.status, r.date, r.occurred_at, r.academic_cycle_id ?? null],
              );
            }
            try {
              (Observe as unknown as { logEvent: (n: string, o?: unknown) => void }).logEvent('attendance_offline_queued', {
                attributes: { classroomId, count: String(records.length) },
              } as unknown as never);
            } catch {}
            // store idempotencyKey for backgroundSync dedup (already generated)
            return { queuedOffline: true, idempotencyKey } as unknown as never;
          } catch {}
        }
        throw e;
      }
    },
    {
      onSuccess: (data: unknown) => {
        hapticSuccess();
        const isQueued = (data as { queuedOffline?: boolean })?.queuedOffline;
        showToast(isQueued ? 'Saved offline — will sync when online' : 'Attendance saved successfully', 'success');
        // Growth signal  fire-and-forget
        if (currentUser?.id) {
          growthSignalsAPI.emitSilent({
            user_id: currentUser.id,
            event_type: 'attendance_marked',
            event_metadata: { classroom_id: classroomId },
          });
        }
        void triggerReview('attendance_marked', { minActions: 2, probability: 0.5 });
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
        <BrandPulse size={28} accessibilityLabel="Loading classroom roster" />
        <Text className="text-phase-text-secondary mt-4 font-black">
          Loading classroom roster...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-surface-primary p-6 gap-4">
        <Text className="text-emberRed font-black text-center">{error}</Text>
        <Button
          variant="outline"
          onPress={() => void fetchStudents()}
          accessibilityLabel="Retry loading attendance roster"
          accessibilityHint="Attempts to load the classroom roster again"
        >
          <ButtonText>Try again</ButtonText>
        </Button>
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
          disabled={saveMutation.isLoading || students.length === 0}
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

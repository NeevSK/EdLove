import AttendanceSheet from '@repo/classroom/components/AttendanceSheet';
import {
  loadGradeClassRegister,
  localDate,
  PICK_GRADE_CLASS_NOTICE,
  SHADOW_STUDENT_NOTICE,
  saveGradeClassRegister,
} from '@repo/classroom/logic/gradeClassRegister';
import { attendanceAPI } from '@repo/core/api/attendance';
import { academicCyclesAPI, growthSignalsAPI } from '@repo/core/api/client';
import { useSafeMutation } from '@repo/core/hooks';
import { type AttendanceStatus, type StudentAttendance, useStore } from '@repo/core/logic';
import { resolveGradeClassFromClassroom } from '@repo/core/logic/classroomResolver';
import { parseInstitutionalQR, ScannerModal } from '@repo/scanner-kit';
import { BrandPulse } from '@repo/ui';
import { useAppStoreReview } from '@repo/ui/hooks';
import { Box, Button, ButtonText, Text, VStack } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

type GradeClassOption = { id: string; name: string };

export default function AttendanceScreen() {
  // Model A: the register belongs to a grade class (grade_classes.id).
  // If a legacy `classroomId` is passed, resolveGradeClassFromClassroom bridges to gradeClassId.
  const { gradeClassId: gradeClassParam = '', classroomId = '' } = useLocalSearchParams<{
    gradeClassId?: string;
    classroomId?: string;
  }>();
  const { triggerReview } = useAppStoreReview();
  const schoolId = useStore((state) => state.schoolId);
  const isOnline = useStore((state) => state.isOnline);
  const academicCycleId = useStore((state) => state.academicCycleId);
  const setAcademicCycleId = useStore((state) => state.setAcademicCycleId);

  const [selectedGradeClassId, setSelectedGradeClassId] = useState<string | undefined>(undefined);
  const gradeClassId = selectedGradeClassId ?? gradeClassParam;
  const [gradeClasses, setGradeClasses] = useState<GradeClassOption[] | null>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [excludedWithoutAccount, setExcludedWithoutAccount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [attendanceDate] = useState(() => localDate());
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const execute = async () => {
      try {
        let activeId = gradeClassId;
        if (!activeId && classroomId) {
          const resolved = await resolveGradeClassFromClassroom(classroomId, schoolId ?? undefined);
          if (resolved && resolved !== classroomId) {
            activeId = resolved;
            if (!cancelled) setSelectedGradeClassId(resolved);
          }
        }
        if (!activeId) {
          const options = await attendanceAPI.getMyGradeClasses();
          if (cancelled) return;
          setGradeClasses(options.map((option) => ({ id: option.id, name: option.name })));
          setStudents([]);
          return;
        }
        const register = await loadGradeClassRegister(activeId, attendanceDate);
        if (cancelled) return;
        setStudents(register.students);
        setExcludedWithoutAccount(register.excludedWithoutAccount);
      } catch (_err) {
        if (cancelled) return;
        setError(
          gradeClassId || classroomId
            ? 'Failed to load the class register'
            : 'Failed to load your classes',
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void execute();
    return () => {
      cancelled = true;
    };
  }, [gradeClassId, classroomId, attendanceDate, reloadToken, schoolId]);

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
    // Variables are self-contained so an offline save can be replayed from the outbox
    // by MUTATION_REGISTRY.batchRecordAttendance without this screen's closure.
    async (payload: {
      gradeClassId?: string;
      classroomId?: string;
      schoolId?: string;
      date: string;
      students: StudentAttendance[];
    }) => {
      let activeId = payload.gradeClassId;
      if (!activeId && payload.classroomId) {
        activeId = await resolveGradeClassFromClassroom(payload.classroomId, payload.schoolId);
      }
      if (!activeId) throw new Error('No class selected for this register');
      return saveGradeClassRegister(activeId, payload.date, payload.students);
    },
    {
      mutationKey: 'batchRecordAttendance',
      scope: 'classroom',
      mutationType: 'CREATE',
      onSuccess: () => {
        hapticSuccess();
        showToast('Attendance saved', 'success');
        if (currentUser?.id) {
          growthSignalsAPI.emitSilent({
            user_id: currentUser.id,
            event_type: 'attendance_marked',
            event_metadata: { grade_class_id: selectedGradeClassId ?? gradeClassId ?? classroomId },
          });
        }
        void triggerReview('attendance_marked', { minActions: 2, probability: 0.5 });
      },
      onError: (err: any) => {
        showToast(
          err?.message
            ? `Attendance not saved: ${err.message}`
            : 'Attendance not saved. Check your connection and try again.',
          'error',
        );
      },
    },
  );

  const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
    setStudents(updatedAttendance);
  };

  const handleScanBadge = useCallback(
    (scannedToken: string) => {
      const parsed = parseInstitutionalQR(scannedToken);
      if (parsed && (parsed.kind === 'attendance' || parsed.kind === 'student_id')) {
        const studentId = parsed.studentId;
        const target = students.find((s) => s.student_id === studentId || s.id === studentId);
        if (target) {
          hapticSuccess();
          const updated = students.map((s) =>
            s.id === target.id ? { ...s, status: 'present' as AttendanceStatus } : s,
          );
          setStudents(updated);
          showToast(`Marked ${target.full_name} present`, 'success');
        } else {
          showToast('Student badge is not on this class register', 'error');
        }
      } else {
        showToast('Unrecognized student or attendance badge', 'error');
      }
    },
    [students, showToast],
  );

  const handleSave = () => {
    saveMutation.mutate({
      gradeClassId: gradeClassId || undefined,
      classroomId: classroomId || undefined,
      schoolId: schoolId ?? undefined,
      date: attendanceDate,
      students,
    });
  };

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-surface-primary">
        <BrandPulse size={28} accessibilityLabel="Loading class register" />
        <Text className="text-phase-text-secondary mt-4 font-black">Loading class register...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-surface-primary p-6 gap-4">
        <Text className="text-emberRed font-black text-center">{error}</Text>
        <Button
          variant="outline"
          onPress={retry}
          accessibilityLabel="Retry loading attendance register"
          accessibilityHint="Attempts to load the class register again"
        >
          <ButtonText>Try again</ButtonText>
        </Button>
      </Box>
    );
  }

  if (!gradeClassId) {
    return (
      <VStack className="flex-1 bg-phase-surface-primary p-6 gap-4">
        <Text className="text-phase-text-secondary">{PICK_GRADE_CLASS_NOTICE}</Text>
        {(gradeClasses ?? []).length === 0 ? (
          <Text className="text-phase-text-secondary font-black">
            No classes are assigned to you for the current academic year.
          </Text>
        ) : (
          (gradeClasses ?? []).map((option) => (
            <Button
              key={option.id}
              variant="outline"
              onPress={() => setSelectedGradeClassId(option.id)}
              accessibilityLabel={`Open the ${option.name} register`}
            >
              <ButtonText>{option.name}</ButtonText>
            </Button>
          ))
        )}
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 bg-phase-surface-primary">
      {!isOnline && (
        <Box className="bg-phase-canvas border-b border-phase-border px-4 py-2 flex-row items-center justify-between">
          <Text className="text-xs text-phase-text-secondary font-medium">
            Offline: attendance can't be saved until you're back online
          </Text>
          <Box className="w-2 h-2 rounded-full bg-templeGold" />
        </Box>
      )}
      <Box className="px-4 py-2 border-b border-phase-border">
        <Text className="text-xs text-phase-text-secondary">
          {SHADOW_STUDENT_NOTICE}
        </Text>
      </Box>
      <AttendanceSheet
        classroomId={gradeClassId}
        initialStudents={students}
        onAttendanceChange={handleAttendanceChange}
        onScanBadgePress={() => setIsScannerOpen(true)}
      />
      <ScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(token) => {
          handleScanBadge(token);
          setIsScannerOpen(false);
        }}
        title="Scan Student Badge"
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

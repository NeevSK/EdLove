import AttendanceSheet from '@repo/classroom/components/AttendanceSheet';
import {
  loadGradeClassRegister,
  localDate,
  PICK_GRADE_CLASS_NOTICE,
  SHADOW_STUDENT_NOTICE,
  saveGradeClassRegister,
} from '@repo/classroom/logic/gradeClassRegister';
import { academicCyclesAPI, growthSignalsAPI } from '@repo/core/api/client';
import { useSafeMutation } from '@repo/core/hooks';
import { showToast } from '@repo/core/lib/feedback';
import { type AttendanceStatus, type StudentAttendance } from '@repo/core/logic';
import { resolveGradeClassFromClassroom } from '@repo/core/logic/classroomResolver';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useAuthStore, useTenantStore } from '@repo/core/store';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { parseInstitutionalQR, ScannerModal } from '@repo/scanner-kit';
import { BrandPulse } from '@repo/ui';
import { useAppStoreReview } from '@repo/ui/hooks';
import { Box, Button, ButtonText, Text, VStack } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import { ObserveInteractiveMarker } from 'expo-observe';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useScopedAttendanceRegister } from '../hooks/useScopedAttendanceRegister';

type GradeClassOption = { id: string; name: string };

export default function AttendanceScreen() {
  // Model A: the register belongs to a grade class (grade_classes.id).
  // If a legacy `classroomId` is passed, resolveGradeClassFromClassroom bridges to gradeClassId.
  const { gradeClassId: gradeClassParam = '', classroomId = '' } = useLocalSearchParams<{
    gradeClassId?: string;
    classroomId?: string;
  }>();
  const { triggerReview } = useAppStoreReview();
  const schoolId = useScopeSessionStore((state) =>
    !state.isTransitioning && state.snapshot?.activePerspective.kind === 'institutional'
      ? state.snapshot.activePerspective.schoolId
      : null,
  );
  const { status: networkStatus, isOnline } = useOfflineStatus();
  const academicCycleId = useTenantStore((state) => state.academicCycleId);
  const setAcademicCycleId = useTenantStore((state) => state.setAcademicCycleId);

  const currentUser = useAuthStore((state) => state.user);

  const [selectedGradeClassId, setSelectedGradeClassId] = useState<string | undefined>(undefined);
  const gradeClassId = selectedGradeClassId ?? gradeClassParam;
  const [gradeClasses, setGradeClasses] = useState<GradeClassOption[] | null>(null);
  const [gradeClassesProjectionIdentity, setGradeClassesProjectionIdentity] = useState<
    string | null
  >(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [studentProjectionIdentity, setStudentProjectionIdentity] = useState<string | null>(null);
  const [excludedWithoutAccount, setExcludedWithoutAccount] = useState(0);
  const [isResolvingLegacyClassroom, setIsResolvingLegacyClassroom] = useState(
    Boolean(classroomId && !gradeClassParam),
  );
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [attendanceDate] = useState(() => localDate());
  const [reloadToken, setReloadToken] = useState(0);
  const registerRead = useScopedAttendanceRegister(gradeClassId || undefined, attendanceDate);
  const hasCurrentStudentProjection =
    studentProjectionIdentity !== null && studentProjectionIdentity === registerRead.identity;
  const activeStudents = hasCurrentStudentProjection ? students : [];
  const hasCurrentGradeClassProjection =
    gradeClassesProjectionIdentity !== null &&
    gradeClassesProjectionIdentity === registerRead.classesIdentity;
  const activeGradeClasses = hasCurrentGradeClassProjection ? (gradeClasses ?? []) : [];

  const retry = useCallback(() => {
    setError(null);
    setReloadToken((prev) => prev + 1);
    void (gradeClassId
      ? registerRead.registerQuery.refetch()
      : registerRead.classesQuery.refetch());
  }, [gradeClassId, registerRead.classesQuery, registerRead.registerQuery]);

  useEffect(() => {
    setStudents([]);
    setStudentProjectionIdentity(null);
    setExcludedWithoutAccount(0);
  }, [registerRead.identity]);

  useEffect(() => {
    setGradeClasses([]);
    setGradeClassesProjectionIdentity(null);
  }, [registerRead.classesIdentity]);

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
        if (!activeId) return;
      } catch (_err) {
        if (cancelled) return;
        setError(
          gradeClassId || classroomId
            ? 'Failed to load the class register'
            : 'Failed to load your classes',
        );
      } finally {
        if (!cancelled) setIsResolvingLegacyClassroom(false);
      }
    };
    void execute();
    return () => {
      cancelled = true;
    };
  }, [gradeClassId, classroomId, reloadToken, schoolId]);

  useEffect(() => {
    if (!registerRead.scope) {
      setError('Attendance is unavailable until the active school scope is ready.');
      return;
    }
    if (!gradeClassId) {
      if (registerRead.classesQuery.isPending) return;
      if (registerRead.classesQuery.error) {
        setError('Failed to load your classes');
      } else {
        setGradeClasses(
          registerRead.gradeClasses.map((option) => ({ id: option.id, name: option.name })),
        );
        setGradeClassesProjectionIdentity(registerRead.classesIdentity);
        setStudents([]);
        setError(null);
      }
      return;
    }
    if (registerRead.registerQuery.isPending) return;
    if (registerRead.registerQuery.error || !registerRead.register) {
      setError('Failed to load the class register');
      return;
    }
    setStudents(registerRead.register.students);
    setStudentProjectionIdentity(registerRead.identity);
    setExcludedWithoutAccount(registerRead.register.excludedWithoutAccount);
    setError(null);
  }, [
    gradeClassId,
    registerRead.classesQuery.error,
    registerRead.classesQuery.isPending,
    registerRead.classesIdentity,
    registerRead.gradeClasses,
    registerRead.register,
    registerRead.registerQuery.error,
    registerRead.registerQuery.isPending,
    registerRead.identity,
    registerRead.scope,
  ]);

  const isLoading =
    isResolvingLegacyClassroom ||
    (registerRead.scope !== null &&
      (gradeClassId ? registerRead.registerQuery.isPending : registerRead.classesQuery.isPending));

  useEffect(() => {
    const syncCycle = async () => {
      if (schoolId && !academicCycleId) {
        const cycle = await academicCyclesAPI.getCurrent(schoolId);
        if (cycle) setAcademicCycleId(cycle.id);
      }
    };
    syncCycle();
  }, [schoolId, academicCycleId, setAcademicCycleId]);

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
        void registerRead.invalidateRegister();
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
    if (!hasCurrentStudentProjection) return;
    setStudents(updatedAttendance);
  };

  const handleScanBadge = useCallback(
    (scannedToken: string) => {
      const parsed = parseInstitutionalQR(scannedToken);
      if (parsed && (parsed.kind === 'attendance' || parsed.kind === 'student_id')) {
        const studentId = parsed.studentId;
        if (!hasCurrentStudentProjection) return;
        const target = activeStudents.find((s) => s.student_id === studentId || s.id === studentId);
        if (target) {
          hapticSuccess();
          const updated = activeStudents.map((s) =>
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
    [activeStudents, hasCurrentStudentProjection, showToast],
  );

  const handleSave = () => {
    if (!hasCurrentStudentProjection) return;
    saveMutation.mutate({
      gradeClassId: gradeClassId || undefined,
      classroomId: classroomId || undefined,
      schoolId: schoolId ?? undefined,
      date: attendanceDate,
      students: activeStudents,
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

  if (!registerRead.scope) {
    return (
      <Box className="flex-1 justify-center items-center bg-phase-surface-primary p-6">
        <Text className="text-emberRed font-black text-center">
          Attendance is unavailable until the active school scope is ready.
        </Text>
      </Box>
    );
  }

  if (!gradeClassId) {
    return (
      <VStack className="flex-1 bg-phase-surface-primary p-6 gap-4">
        <Text className="text-phase-text-secondary">{PICK_GRADE_CLASS_NOTICE}</Text>
        {activeGradeClasses.length === 0 ? (
          <Text className="text-phase-text-secondary font-black">
            No classes are assigned to you for the current academic year.
          </Text>
        ) : (
          activeGradeClasses.map((option) => (
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
      <ObserveInteractiveMarker
        params={{ entry_surface: 'classroom-attendance', student_count: activeStudents.length }}
      />
      {networkStatus === 'offline' && (
        <Box className="bg-phase-canvas border-b border-phase-border px-4 py-2 flex-row items-center justify-between">
          <Text className="text-xs text-phase-text-secondary font-medium">
            Offline mode: records will save to local outbox and sync automatically
          </Text>
          <Box className="w-2 h-2 rounded-full bg-templeGold" />
        </Box>
      )}

      <Box className="px-4 py-2 border-b border-phase-border">
        <Text className="text-xs text-phase-text-secondary">{SHADOW_STUDENT_NOTICE}</Text>
      </Box>
      <AttendanceSheet
        classroomId={gradeClassId}
        initialStudents={activeStudents}
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
          disabled={
            saveMutation.isLoading || activeStudents.length === 0 || !hasCurrentStudentProjection
          }
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

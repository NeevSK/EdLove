import { attendanceAPI, type GradeClassOption } from '@repo/core/api/attendance';
import {
  abortableQueryRead,
  type QueryScope,
  scopedQueryKey,
} from '@repo/core/lib/clientStateFoundation';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { loadGradeClassRegister, type Register } from '../logic/gradeClassRegister';

type NativeAttendanceScope = Readonly<{
  queryScope: QueryScope;
  entityId: string;
  perspectiveId: string;
}>;

export function resolveNativeAttendanceScope(
  snapshot: {
    principalId: string | null;
    tenantId: string | null;
    activeBond: { id: string } | null;
    activePerspective: { id: string };
  } | null,
): NativeAttendanceScope | null {
  const principalId = snapshot?.principalId?.trim() || null;
  const bondId = snapshot?.activeBond?.id.trim() || null;
  const entityId = snapshot?.tenantId?.trim() || null;
  const perspectiveId = snapshot?.activePerspective.id.trim() || null;
  if (!principalId || !bondId || !entityId || !perspectiveId) return null;
  return {
    queryScope: { principalId, bondId, tenantId: entityId, perspectiveId },
    entityId,
    perspectiveId,
  };
}

export const nativeAttendanceCache = {
  gradeClasses: (scope: NativeAttendanceScope) =>
    scopedQueryKey(scope.queryScope, [
      'classroom',
      'attendance',
      'entity',
      scope.entityId,
      'grade-classes',
    ] as const),
  register: (scope: NativeAttendanceScope, gradeClassId: string, date: string) =>
    scopedQueryKey(scope.queryScope, [
      'classroom',
      'attendance',
      'entity',
      scope.entityId,
      'grade-class-register',
      gradeClassId,
      date,
    ] as const),
};

function shouldRetryAttendanceRead(failureCount: number, error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  if (/unauthori[sz]ed|forbidden|scope/i.test(message)) return false;
  return failureCount < 2;
}

/** Scoped remote reads for the native register; drafts and writes stay outside Query. */
export function useScopedAttendanceRegister(gradeClassId: string | undefined, date: string) {
  const queryClient = useQueryClient();
  const snapshot = useScopeSessionStore((state) => state.snapshot);
  const transitioning = useScopeSessionStore((state) => state.isTransitioning);
  const scope = useMemo(
    () => (transitioning ? null : resolveNativeAttendanceScope(snapshot)),
    [snapshot, transitioning],
  );
  const classesKey = useMemo(
    () =>
      scope
        ? nativeAttendanceCache.gradeClasses(scope)
        : (['classroom', 'attendance', 'disabled-grade-classes'] as const),
    [scope],
  );
  const registerKey = useMemo(
    () =>
      scope && gradeClassId
        ? nativeAttendanceCache.register(scope, gradeClassId, date)
        : (['classroom', 'attendance', 'disabled-register'] as const),
    [date, gradeClassId, scope],
  );
  const classesQuery = useQuery({
    queryKey: classesKey,
    queryFn: ({ signal }) =>
      abortableQueryRead(signal, () => attendanceAPI.getMyGradeClasses()),
    enabled: scope !== null && !gradeClassId,
    retry: shouldRetryAttendanceRead,
    staleTime: 30_000,
  });
  const registerQuery = useQuery({
    queryKey: registerKey,
    queryFn: ({ signal }) => {
      if (!gradeClassId) throw new Error('A grade class is required to load attendance.');
      return abortableQueryRead(signal, () => loadGradeClassRegister(gradeClassId, date));
    },
    enabled: scope !== null && Boolean(gradeClassId),
    retry: shouldRetryAttendanceRead,
    staleTime: 15_000,
  });
  const invalidateRegister = useCallback(async () => {
    if (!scope || !gradeClassId) return;
    await queryClient.invalidateQueries({ queryKey: registerKey, exact: true });
  }, [gradeClassId, queryClient, registerKey, scope]);

  return {
    scope,
    classesIdentity: scope
      ? `${scope.queryScope.principalId}:${scope.queryScope.bondId}:${scope.entityId}:${scope.perspectiveId}`
      : null,
    identity:
      scope && gradeClassId
        ? `${scope.queryScope.principalId}:${scope.queryScope.bondId}:${scope.entityId}:${scope.perspectiveId}:${gradeClassId}:${date}`
        : null,
    gradeClasses: (classesQuery.data ?? []) as readonly GradeClassOption[],
    register: (registerQuery.data ?? null) as Register | null,
    classesQuery,
    registerQuery,
    invalidateRegister,
  };
}

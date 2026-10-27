'use client';

import { type QueryScope, scopedQueryKey } from '@repo/core/lib/clientStateFoundation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { WorkspaceClassroom, WorkspaceStudent } from '../../workspace/attendance';
import { workspaceHexagonalService } from '../adapters/workspace/workspaceHexagonalService';

/** Facts supplied by the authorized Workspace entry, not inferred client state. */
export type WorkspaceAttendanceReadScope = Readonly<{
  principalId: string;
  bondId: string;
  entityId: string;
}>;

type ResolvedWorkspaceAttendanceScope = Readonly<{
  queryScope: QueryScope;
  entityId: string;
}>;

export function resolveWorkspaceAttendanceReadScope(
  input: WorkspaceAttendanceReadScope | null,
): ResolvedWorkspaceAttendanceScope | null {
  if (!input) return null;
  const principalId = input.principalId.trim();
  const bondId = input.bondId.trim();
  const entityId = input.entityId.trim();
  if (!principalId || !bondId || !entityId) return null;
  return { queryScope: { principalId, bondId }, entityId };
}

/**
 * One workspace-owned cache contract. Scope facts prefix every private key;
 * entity, class and date remain explicit resource coordinates.
 */
export const workspaceAttendanceCache = {
  classrooms: (scope: ResolvedWorkspaceAttendanceScope) =>
    scopedQueryKey(scope.queryScope, [
      'workspace',
      'attendance',
      'entity',
      scope.entityId,
      'grade-classes',
    ] as const),
  roster: (scope: ResolvedWorkspaceAttendanceScope, classroomId: string, date: string) =>
    scopedQueryKey(scope.queryScope, [
      'workspace',
      'attendance',
      'entity',
      scope.entityId,
      'grade-class-roster',
      classroomId,
      date,
    ] as const),
};

function shouldRetryWorkspaceRead(failureCount: number, error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  if (/secure session has ended|current scope cannot access/i.test(message)) return false;
  return failureCount < 2;
}

export type UseWorkspaceDomainOptions = Readonly<{
  scope: WorkspaceAttendanceReadScope | null;
  classroom: WorkspaceClassroom | null;
  date: string;
  enabled: boolean;
}>;

/**
 * The single Workspace read boundary. It owns only remote classroom/roster
 * lifecycles; durable drafts and attendance commands remain in their domain
 * boundaries and are deliberately not copied into the Query cache.
 */
export function useWorkspaceDomain({
  scope: inputScope,
  classroom,
  date,
  enabled,
}: UseWorkspaceDomainOptions) {
  const queryClient = useQueryClient();
  const scope = useMemo(
    () => resolveWorkspaceAttendanceReadScope(inputScope),
    [inputScope?.bondId, inputScope?.entityId, inputScope?.principalId],
  );
  const admitted = enabled && scope !== null;
  const classroomsKey = useMemo(
    () =>
      scope
        ? workspaceAttendanceCache.classrooms(scope)
        : (['workspace', 'attendance', 'disabled-classrooms'] as const),
    [scope],
  );
  const rosterKey = useMemo(
    () =>
      scope && classroom
        ? workspaceAttendanceCache.roster(scope, classroom.id, date)
        : (['workspace', 'attendance', 'disabled-roster'] as const),
    [classroom, date, scope],
  );

  const classroomsQuery = useQuery({
    queryKey: classroomsKey,
    queryFn: ({ signal }) => {
      if (!scope) throw new Error('The selected classroom scope is unavailable.');
      return workspaceHexagonalService.getClassrooms(scope.queryScope.principalId, signal);
    },
    enabled: admitted,
    retry: shouldRetryWorkspaceRead,
    staleTime: 30_000,
  });
  const rosterQuery = useQuery({
    queryKey: rosterKey,
    queryFn: ({ signal }) => {
      if (!scope || !classroom) throw new Error('The selected classroom scope is unavailable.');
      return workspaceHexagonalService.getAttendanceRoster(
        classroom,
        date,
        scope.queryScope.principalId,
        signal,
      );
    },
    enabled: admitted && classroom !== null,
    retry: shouldRetryWorkspaceRead,
    staleTime: 15_000,
  });
  const invalidateRoster = useCallback(async () => {
    if (!scope || !classroom) return;
    await queryClient.invalidateQueries({ queryKey: rosterKey, exact: true });
  }, [classroom, queryClient, rosterKey, scope]);

  return {
    scope,
    classrooms: classroomsQuery.data ?? ([] as readonly WorkspaceClassroom[]),
    students: rosterQuery.data ?? ([] as readonly WorkspaceStudent[]),
    classroomsQuery,
    rosterQuery,
    invalidateRoster,
  };
}

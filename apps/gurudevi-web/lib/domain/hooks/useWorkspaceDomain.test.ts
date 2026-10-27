import { disposeQueryScope } from '@repo/core/lib/clientStateFoundation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAttendanceRoster: vi.fn(),
  getClassrooms: vi.fn(),
}));

vi.mock('../adapters/workspace/workspaceHexagonalService', () => ({
  workspaceHexagonalService: {
    getAttendanceRoster: mocks.getAttendanceRoster,
    getClassrooms: mocks.getClassrooms,
  },
}));

import {
  loadAccountAttendanceDraft,
  saveAccountAttendanceDraft,
  type WorkspaceStudent,
} from '../../workspace/attendance';
import {
  resolveWorkspaceAttendanceReadScope,
  useWorkspaceDomain,
  workspaceAttendanceCache,
} from './useWorkspaceDomain';

const student: WorkspaceStudent = {
  id: 'enrollment-1',
  studentId: 'student-1',
  name: 'Mina',
  rollNumber: 1,
  status: 'late',
};
const classroom = { id: 'grade-5a', name: '5A', subject: null };

afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

function queryWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('workspace domain scoped attendance reads', () => {
  it('partitions roster keys by principal, bond, entity, grade class, and date', () => {
    const base = resolveWorkspaceAttendanceReadScope({
      principalId: 'principal-a',
      bondId: 'bond-a',
      entityId: 'school-a',
    });
    const otherPrincipal = resolveWorkspaceAttendanceReadScope({
      principalId: 'principal-b',
      bondId: 'bond-a',
      entityId: 'school-a',
    });
    const otherBond = resolveWorkspaceAttendanceReadScope({
      principalId: 'principal-a',
      bondId: 'bond-b',
      entityId: 'school-a',
    });
    const otherEntity = resolveWorkspaceAttendanceReadScope({
      principalId: 'principal-a',
      bondId: 'bond-a',
      entityId: 'school-b',
    });
    if (!base || !otherPrincipal || !otherBond || !otherEntity) throw new Error('scope missing');

    const key = workspaceAttendanceCache.roster(base, 'grade-5a', '2026-10-24');
    expect(key).not.toEqual(
      workspaceAttendanceCache.roster(otherPrincipal, 'grade-5a', '2026-10-24'),
    );
    expect(key).not.toEqual(workspaceAttendanceCache.roster(otherBond, 'grade-5a', '2026-10-24'));
    expect(key).not.toEqual(workspaceAttendanceCache.roster(otherEntity, 'grade-5a', '2026-10-24'));
    expect(key).not.toEqual(workspaceAttendanceCache.roster(base, 'grade-5b', '2026-10-24'));
    expect(key).not.toEqual(workspaceAttendanceCache.roster(base, 'grade-5a', '2026-10-25'));
  });

  it('disposes only the outgoing scoped roster and preserves its durable draft', async () => {
    const scope = resolveWorkspaceAttendanceReadScope({
      principalId: 'principal-a',
      bondId: 'bond-a',
      entityId: 'school-a',
    });
    const neighboringScope = resolveWorkspaceAttendanceReadScope({
      principalId: 'principal-b',
      bondId: 'bond-b',
      entityId: 'school-b',
    });
    if (!scope || !neighboringScope) throw new Error('scope missing');
    const rosterKey = workspaceAttendanceCache.roster(scope, 'grade-5a', '2026-10-24');
    const neighboringKey = workspaceAttendanceCache.roster(
      neighboringScope,
      'grade-5a',
      '2026-10-24',
    );
    const queryClient = new QueryClient();
    queryClient.setQueryData(rosterKey, [student]);
    queryClient.setQueryData(neighboringKey, [student]);
    saveAccountAttendanceDraft(
      {
        accountId: 'principal-a',
        bondId: 'bond-a',
        entityId: 'school-a',
        classroomId: 'grade-5a',
        date: '2026-10-24',
      },
      [student],
    );

    await disposeQueryScope(queryClient, scope.queryScope);

    expect(queryClient.getQueryData(rosterKey)).toBeUndefined();
    expect(queryClient.getQueryData(neighboringKey)).toEqual([student]);
    expect(
      loadAccountAttendanceDraft({
        accountId: 'principal-a',
        bondId: 'bond-a',
        entityId: 'school-a',
        classroomId: 'grade-5a',
        date: '2026-10-24',
      })?.marks,
    ).toEqual({ 'student-1': 'late' });
  });

  it('cancels an outgoing scope load before it can populate an incoming scope', async () => {
    let firstSignal: AbortSignal | undefined;
    const firstScope = { principalId: 'principal-a', bondId: 'bond-a', entityId: 'school-a' };
    const secondScope = { principalId: 'principal-b', bondId: 'bond-b', entityId: 'school-b' };
    mocks.getClassrooms.mockImplementation(
      (_subjectId: string, signal?: AbortSignal) =>
        new Promise((_resolve, reject) => {
          if (!firstSignal) firstSignal = signal;
          signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = renderHook(
      ({ scope }) =>
        useWorkspaceDomain({ scope, classroom: null, date: '2026-10-24', enabled: true }),
      { initialProps: { scope: firstScope }, wrapper: queryWrapper(queryClient) },
    );
    await waitFor(() => expect(mocks.getClassrooms).toHaveBeenCalledTimes(1));
    rerender({ scope: secondScope });
    await waitFor(() => expect(mocks.getClassrooms).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(firstSignal?.aborted).toBe(true));
  });

  it('forwards cancellation through the workspace service for roster reads', async () => {
    mocks.getClassrooms.mockResolvedValue([classroom]);
    mocks.getAttendanceRoster.mockImplementation(
      (_classroom: unknown, _date: string, _subjectId: string, signal?: AbortSignal) =>
        new Promise((_resolve, reject) =>
          signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          ),
        ),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { unmount } = renderHook(
      () =>
        useWorkspaceDomain({
          scope: { principalId: 'principal-a', bondId: 'bond-a', entityId: 'school-a' },
          classroom,
          date: '2026-10-24',
          enabled: true,
        }),
      { wrapper: queryWrapper(queryClient) },
    );
    await waitFor(() => expect(mocks.getAttendanceRoster).toHaveBeenCalledTimes(1));
    unmount();
  });
});

import { describe, expect, it } from 'vitest';
import { resolveWorkspaceRoute } from '@/lib/workspace/routeResolution';

const resolvedStudentInput = {
  userId: 'user-1',
  capacity: 'student' as const,
  contextClassroomId: 'classroom-1',
  requestedClassroomId: '',
  permissionSnapshotLoaded: true,
  isPermissionLoading: false,
  permissionError: null,
};

describe('workspace route resolution', () => {
  it('keeps a resolved role route available during a background permission refresh', () => {
    expect(resolveWorkspaceRoute({ ...resolvedStudentInput, isPermissionLoading: true })).toEqual({
      kind: 'role-ready',
      target: { kind: 'classroom', classroomId: 'classroom-1', audience: 'student' },
      isRefreshing: true,
      refreshError: null,
    });
  });

  it('preserves a resolved route when a background refresh fails', () => {
    expect(
      resolveWorkspaceRoute({ ...resolvedStudentInput, permissionError: 'network unavailable' }),
    ).toMatchObject({
      kind: 'role-ready',
      target: { kind: 'classroom', classroomId: 'classroom-1', audience: 'student' },
      isRefreshing: false,
      refreshError: 'network unavailable',
    });
  });

  it('distinguishes unresolved loading, retryable verification failure, denied access, and empty student access', () => {
    expect(
      resolveWorkspaceRoute({
        ...resolvedStudentInput,
        permissionSnapshotLoaded: false,
        isPermissionLoading: true,
      }).kind,
    ).toBe('loading');
    expect(
      resolveWorkspaceRoute({
        ...resolvedStudentInput,
        permissionSnapshotLoaded: false,
        permissionError: 'network unavailable',
      }).kind,
    ).toBe('retryable-error');
    expect(resolveWorkspaceRoute({ ...resolvedStudentInput, capacity: null }).kind).toBe(
      'permission-denied',
    );
    expect(
      resolveWorkspaceRoute({ ...resolvedStudentInput, capacity: 'unsupported-role' }).kind,
    ).toBe('permission-denied');
    expect(resolveWorkspaceRoute({ ...resolvedStudentInput, contextClassroomId: null }).kind).toBe(
      'empty',
    );
  });

  it('retains an explicit classroom selection and its role-specific destination', () => {
    expect(
      resolveWorkspaceRoute({
        ...resolvedStudentInput,
        requestedClassroomId: 'classroom-2',
        requestedClassroomName: 'Maths',
      }),
    ).toMatchObject({
      kind: 'role-ready',
      target: {
        kind: 'classroom',
        classroomId: 'classroom-2',
        classroomName: 'Maths',
        audience: 'student',
      },
    });
  });

  it.each([
    ['parent', 'guardian'],
    ['assistantPrincipal', 'principal'],
    ['admin', 'principal'],
    ['gradeHead', 'principal'],
    ['sectionHead', 'principal'],
    ['developer', 'founder'],
  ] as const)('normalizes %s to the existing %s workspace target', (capacity, target) => {
    expect(resolveWorkspaceRoute({ ...resolvedStudentInput, capacity })).toMatchObject({
      kind: 'role-ready',
      target: { kind: target },
    });
  });
});

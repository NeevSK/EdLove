import { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';

export type WorkspaceRouteTarget =
  | { kind: 'founder' }
  | { kind: 'principal' }
  | { kind: 'guardian' }
  | { kind: 'classroom-list' }
  | {
      kind: 'classroom';
      classroomId: string;
      classroomName?: string;
      audience: 'student' | 'staff';
    };

export type WorkspaceRouteResolution =
  | { kind: 'loading' }
  | { kind: 'retryable-error'; message: string }
  | { kind: 'permission-denied'; message: string }
  | { kind: 'empty'; message: string }
  | {
      kind: 'role-ready';
      target: WorkspaceRouteTarget;
      isRefreshing: boolean;
      refreshError: string | null;
    };

export type WorkspaceRouteResolutionInput = {
  userId: string | null;
  capacity: string | null;
  contextClassroomId: string | null;
  requestedClassroomId: string;
  requestedClassroomName?: string;
  permissionSnapshotLoaded: boolean;
  isPermissionLoading: boolean;
  permissionError: string | null;
};

const permissionResolutionFailure =
  'We could not verify access to this workspace. Check your connection and try again.';

export function resolveWorkspaceRoute({
  userId,
  capacity,
  contextClassroomId,
  requestedClassroomId,
  requestedClassroomName,
  permissionSnapshotLoaded,
  isPermissionLoading,
  permissionError,
}: WorkspaceRouteResolutionInput): WorkspaceRouteResolution {
  if (!userId) {
    return {
      kind: 'permission-denied',
      message: 'Sign in with an account that has workspace access to continue.',
    };
  }

  if (!permissionSnapshotLoaded) {
    if (permissionError) {
      return { kind: 'retryable-error', message: permissionResolutionFailure };
    }

    if (isPermissionLoading) {
      return { kind: 'loading' };
    }

    return { kind: 'retryable-error', message: permissionResolutionFailure };
  }

  const resolvedCapacity = CapacitySchema.safeParse(capacity);
  if (!resolvedCapacity.success) {
    return {
      kind: 'permission-denied',
      message: 'This account does not have an active workspace role.',
    };
  }

  const backgroundStatus = {
    isRefreshing: isPermissionLoading,
    refreshError: permissionError,
  };

  if (resolvedCapacity.data === 'founder') {
    return { kind: 'role-ready', target: { kind: 'founder' }, ...backgroundStatus };
  }

  if (resolvedCapacity.data === 'principal') {
    return { kind: 'role-ready', target: { kind: 'principal' }, ...backgroundStatus };
  }

  if (resolvedCapacity.data === 'guardian') {
    return { kind: 'role-ready', target: { kind: 'guardian' }, ...backgroundStatus };
  }

  if (resolvedCapacity.data === 'student') {
    const classroomId = requestedClassroomId || contextClassroomId;
    if (!classroomId) {
      return {
        kind: 'empty',
        message: 'Your student access is active, but no classroom is available to open yet.',
      };
    }

    return {
      kind: 'role-ready',
      target: {
        kind: 'classroom',
        classroomId,
        ...(requestedClassroomName ? { classroomName: requestedClassroomName } : {}),
        audience: 'student',
      },
      ...backgroundStatus,
    };
  }

  if (requestedClassroomId) {
    return {
      kind: 'role-ready',
      target: {
        kind: 'classroom',
        classroomId: requestedClassroomId,
        ...(requestedClassroomName ? { classroomName: requestedClassroomName } : {}),
        audience: 'staff',
      },
      ...backgroundStatus,
    };
  }

  return { kind: 'role-ready', target: { kind: 'classroom-list' }, ...backgroundStatus };
}

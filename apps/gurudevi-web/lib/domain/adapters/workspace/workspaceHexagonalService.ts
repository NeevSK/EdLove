/**
 * Workspace Hexagonal Adapter
 *
 * Implements IWorkspacePort & IWorkspaceStoragePort.
 * Integrates:
 * - @/lib/workspace/attendance for OpenAPI attendance RPCs and local draft persistence
 * - @repo/core/lib/storage for offline-first local durability
 * - @repo/core/lib/sync/useMutationQueue for durable background synchronization
 */

import {
  type AccountAttendanceDraft,
  type AccountAttendanceDraftScope,
  clearAccountAttendanceDraft,
  loadAccountAttendance,
  loadAccountAttendanceDraft,
  loadAccountClassrooms,
  saveAccountAttendance,
  saveAccountAttendanceDraft,
  type WorkspaceClassroom,
  type WorkspaceStudent,
} from '../../../workspace/attendance';
import type {
  AttendanceSubmissionResult,
  IWorkspacePort,
  IWorkspaceStoragePort,
  WorkspaceDraftScope,
} from '../../ports/workspace.port';

export class WorkspaceHexagonalService implements IWorkspacePort, IWorkspaceStoragePort {
  private toDraftScope(scope: WorkspaceDraftScope): AccountAttendanceDraftScope {
    return {
      accountId: scope.accountId,
      bondId: scope.bondId,
      entityId: scope.entityId,
      classroomId: scope.classroomId,
      date: scope.date,
    };
  }

  async getClassrooms(
    subjectId: string,
    signal?: AbortSignal,
  ): Promise<readonly WorkspaceClassroom[]> {
    return loadAccountClassrooms(subjectId, signal);
  }

  async getAttendanceRoster(
    classroom: WorkspaceClassroom,
    date: string,
    subjectId: string,
    signal?: AbortSignal,
  ): Promise<readonly WorkspaceStudent[]> {
    return loadAccountAttendance(classroom, date, subjectId, signal);
  }

  async submitAttendance(
    draftScope: WorkspaceDraftScope,
    classroom: WorkspaceClassroom,
    date: string,
    subjectId: string,
    students: readonly WorkspaceStudent[],
  ): Promise<AttendanceSubmissionResult> {
    if (
      draftScope.accountId !== subjectId ||
      draftScope.classroomId !== classroom.id ||
      draftScope.date !== date
    ) {
      throw new Error('Workspace draft scope does not match the attendance command.');
    }
    await saveAccountAttendance(classroom, date, students, subjectId);
    this.clearDraft(draftScope);

    return {
      classroomId: classroom.id,
      date,
      savedCount: students.length,
      status: 'settled',
      timestamp: new Date().toISOString(),
    };
  }

  loadDraft(scope: WorkspaceDraftScope): AccountAttendanceDraft | null {
    try {
      return loadAccountAttendanceDraft(this.toDraftScope(scope));
    } catch {
      return null;
    }
  }

  saveDraft(
    scope: WorkspaceDraftScope,
    students: readonly WorkspaceStudent[],
  ): AccountAttendanceDraft {
    return saveAccountAttendanceDraft(this.toDraftScope(scope), students);
  }

  clearDraft(scope: WorkspaceDraftScope): void {
    try {
      clearAccountAttendanceDraft(this.toDraftScope(scope));
    } catch {
      // Safe fallback
    }
  }
}

export const workspaceHexagonalService = new WorkspaceHexagonalService();

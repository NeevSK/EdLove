/**
 * Hexagonal Workspace Port
 *
 * Grounded in monorepo substrate contracts:
 * - @repo/classroom attendance domain
 * - @repo/core offline resilience & durable local draft outbox
 */

import type {
  AccountAttendanceDraft,
  AttendanceStatus,
  WorkspaceClassroom,
  WorkspaceStudent,
} from '../../workspace/attendance';

export interface AttendanceSubmissionResult {
  classroomId: string;
  date: string;
  savedCount: number;
  status: 'settled' | 'queued_offline';
  timestamp: string;
}

export type WorkspaceDraftScope = Readonly<{
  accountId: string;
  bondId: string;
  entityId: string;
  classroomId: string;
  date: string;
}>;

/** Inbound Port Driving Workspace Attendance UI */
export interface IWorkspacePort {
  getClassrooms(subjectId: string, signal?: AbortSignal): Promise<readonly WorkspaceClassroom[]>;
  getAttendanceRoster(
    classroom: WorkspaceClassroom,
    date: string,
    subjectId: string,
    signal?: AbortSignal,
  ): Promise<readonly WorkspaceStudent[]>;
  submitAttendance(
    draftScope: WorkspaceDraftScope,
    classroom: WorkspaceClassroom,
    date: string,
    subjectId: string,
    students: readonly WorkspaceStudent[],
  ): Promise<AttendanceSubmissionResult>;
}

/** Outbound Port for Durable Attendance Storage */
export interface IWorkspaceStoragePort {
  loadDraft(scope: WorkspaceDraftScope): AccountAttendanceDraft | null;
  saveDraft(
    scope: WorkspaceDraftScope,
    students: readonly WorkspaceStudent[],
  ): AccountAttendanceDraft;
  clearDraft(scope: WorkspaceDraftScope): void;
}

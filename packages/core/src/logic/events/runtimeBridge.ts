import type {
  SchoolAttendanceRecordedPayload,
  SchoolClassroomCreatedPayload,
  SchoolGradePublishedPayload,
  SyncMutationQueuedPayload,
  WellbeingMoodLoggedPayload,
} from './producers';

export interface WorkflowEventBridge {
  sendSchoolClassroomCreated?: (payload: SchoolClassroomCreatedPayload) => Promise<unknown>;
  sendSchoolAttendanceRecorded?: (payload: SchoolAttendanceRecordedPayload) => Promise<unknown>;
  sendSchoolGradePublished?: (payload: SchoolGradePublishedPayload) => Promise<unknown>;
  sendSyncMutationQueued?: (payload: SyncMutationQueuedPayload) => Promise<unknown>;
  sendWellbeingMoodLogged?: (payload: WellbeingMoodLoggedPayload) => Promise<unknown>;
}

let workflowEventBridge: WorkflowEventBridge | null = null;

export const injectWorkflowEventBridge = (bridge: WorkflowEventBridge) => {
  workflowEventBridge = bridge;
};

export const getWorkflowEventBridge = () => workflowEventBridge;

export async function emitSchoolGradePublishedFromBridge(payload: SchoolGradePublishedPayload) {
  if (!workflowEventBridge?.sendSchoolGradePublished) return;
  await workflowEventBridge.sendSchoolGradePublished(payload);
}

export async function emitSchoolClassroomCreatedFromBridge(payload: SchoolClassroomCreatedPayload) {
  if (!workflowEventBridge?.sendSchoolClassroomCreated) return;
  await workflowEventBridge.sendSchoolClassroomCreated(payload);
}

import { replayAssignmentSubmission } from '@repo/core/api/assignmentCommands';
import { attendanceAPI } from '@repo/core/api/attendance';
import { api } from '@repo/core/api/client';
import { deviceTrustAPI } from '@repo/core/api/deviceTrust';
import { orpcClient } from '@repo/core/api/orpcClient';
import { resolveGradeClassFromClassroom } from '@repo/core/logic/classroomResolver';

/**
 * Mutation Registry
 *
 * Maps serializable string keys (e.g. 'createPost') to actual async functions.
 * Born in the apps/gurudevi-mobile, now healed and moved to @repo/core.
 */

type MutationExecutionContext = Readonly<{
  idempotencyKey: string;
  commandId?: string;
  userId?: string;
}>;
type MutationFunction = (variables: any, context?: MutationExecutionContext) => Promise<any>;

function requireIdempotencyKey(context: MutationExecutionContext | undefined): string {
  if (!context?.idempotencyKey) {
    throw new Error('Queued mutation execution requires an idempotency key.');
  }
  return context.idempotencyKey;
}

export const MUTATION_REGISTRY: Record<string, MutationFunction> = {
  'assignment.submit': (variables, context) => replayAssignmentSubmission(variables, context ?? {}),
  'classroom.attendance.batchRecord': async (vars) => {
    const rows = vars?.rows ?? (Array.isArray(vars) ? vars : []);
    return api.attendance.batchRecord(rows);
  },
  // Community

  createPost: async (vars) => {
    // Core API doesn't have community directly, it's injected
    // In this resonant version, we assume 'api' has been unified.
    // If community is a separate package, this handler serves as the bridge.
    return (api as any).community.createPost(vars, vars.author_id, vars.capacity, vars.school_id);
  },

  // Inventory
  createInventoryRequest: async (vars) => {
    return api.inventory.createRequest(vars);
  },

  // Resources
  createResource: async (vars) => {
    return api.resources.create(vars);
  },
  toggleResourcePin: async (vars) => {
    return api.resources.togglePin(vars.id, vars.isPinned);
  },
  deleteResource: async (vars) => {
    return api.resources.delete(vars);
  },

  // Self/Wellbeing (Outbox mutations routed securely via Hono Gateway)
  saveJournalEntry: async (vars, context) => {
    // Encapsulate and route legacy outbox write securely through our PowerSync endpoint
    try {
      await orpcClient.sync.uploadBatch({
        body: {
          idempotencyKey: requireIdempotencyKey(context),
          crud: [
            {
              id: vars.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : 'temp-id'),
              op: 'PUT',
              table: 'fire_journal',
              opData: vars,
            },
          ],
        },
      });
    } catch (error) {
      throw new Error('Failed to sync outbox journal entry', { cause: error });
    }
    return true;
  },
  saveDecision: async (vars, context) => {
    // Encapsulate and route legacy outbox write securely through our PowerSync endpoint
    try {
      await orpcClient.sync.uploadBatch({
        body: {
          idempotencyKey: requireIdempotencyKey(context),
          crud: [
            {
              id: vars.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : 'temp-id'),
              op: 'PUT',
              table: 'mood_logs',
              opData: vars,
            },
          ],
        },
      });
    } catch (error) {
      throw new Error('Failed to sync outbox decision journal', { cause: error });
    }
    return true;
  },

  logMood: async (vars) => {
    try {
      await orpcClient.self.logMood({
        body: {
          mood_score: vars.mood_score,
          mood: vars.mood,
          note: vars.note,
        },
      });
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sync mood log', { cause: error });
    }
  },
  burnJournal: async (vars) => {
    try {
      await orpcClient.self.burnJournal({
        body: { content: vars.content },
      });
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sync burned journal entry', { cause: error });
    }
  },
  saveThoughtRecord: async (vars) => {
    try {
      await orpcClient.self.saveThoughtRecord({
        body: {
          thought: vars.thought,
          situation: vars.situation,
          emotion: vars.emotion,
          trap_ids: vars.trap_ids,
          evidence_for: vars.evidence_for,
          evidence_against: vars.evidence_against,
          reframe: vars.reframe,
          mood_before: vars.mood_before,
          mood_after: vars.mood_after,
          post_outcome: vars.post_outcome,
          follow_up: vars.follow_up,
        },
      });
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sync thought record', { cause: error });
    }
  },
  completeThoughtRecordFollowUp: async (vars) => {
    try {
      await orpcClient.self.completeThoughtRecordFollowUp({
        params: { id: vars.id },
        body: {
          post_outcome: vars.post_outcome,
          follow_up: vars.follow_up,
        },
      });
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sync thought record follow-up', { cause: error });
    }
  },

  // Classroom (Upstreamed from mobile)
  createStudent: async (vars) => {
    return api.students.create(vars);
  },
  updateAttendance: async (vars) => {
    // The server writes daily_attendance keyed by grade_classes.id only. A legacy item
    // carrying a classrooms.id is mapped to one of the caller's grade classes, or fails
    // loudly (dead letter) rather than landing in a guessed class.
    let gradeClassId: string | undefined = vars.gradeClassId;
    if (!gradeClassId && vars.classroomId) {
      gradeClassId = await resolveGradeClassFromClassroom(vars.classroomId, vars.schoolId);
    }
    if (!gradeClassId) {
      throw new Error('Queued attendance has no grade class to write to.');
    }
    return api.attendance.upsertAttendanceRecord(
      gradeClassId,
      vars.studentId,
      vars.status,
      vars.date,
    );
  },
  batchRecordAttendance: async (vars) => {
    // Queued by AttendanceScreen when the register is saved offline.
    // Shape: { gradeClassId?, classroomId?, schoolId?, date, students: StudentAttendance[] }.
    if (Array.isArray(vars) || !vars?.date || !Array.isArray(vars?.students)) {
      throw new Error('Legacy batchRecordAttendance item has no class or date; cannot replay.');
    }
    let gradeClassId: string | undefined = vars.gradeClassId;
    if (!gradeClassId && vars.classroomId) {
      gradeClassId = await resolveGradeClassFromClassroom(vars.classroomId, vars.schoolId);
    }
    if (!gradeClassId) {
      throw new Error('Queued attendance has no grade class to write to.');
    }
    const rows = (vars.students as Array<{ student_id?: string | null; status: string }>)
      .filter((student) => Boolean(student.student_id))
      .map((student) => ({
        gradeClassId: gradeClassId as string,
        studentId: student.student_id as string,
        status: student.status,
        date: vars.date as string,
      }));
    if (rows.length === 0) return [];
    return attendanceAPI.batchRecord(rows as any);
  },
  updateStudent: async (vars) => {
    return api.students.update(vars.id, vars.updates);
  },

  // Device security
  logDeviceAuditEvent: async (vars) => {
    return deviceTrustAPI.performLogAuditEventIntent(vars);
  },
  unlinkDevice: async (vars) => {
    return deviceTrustAPI.performUnlinkMyDeviceIntent(vars);
  },
  revokeSecuritySession: async (vars) => {
    return deviceTrustAPI.performRevokeMySecuritySessionIntent(vars);
  },
  revokeOtherSecuritySessions: async (vars) => {
    return deviceTrustAPI.performRevokeMyOtherSecuritySessionsIntent(vars);
  },
  revokeCurrentInstallSecuritySessions: async (vars) => {
    return deviceTrustAPI.performRevokeMyInstallSecuritySessionsIntent(vars);
  },
};

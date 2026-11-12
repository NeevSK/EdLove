import { runEffect } from '@repo/core/effect';
import type { ClassroomRef, CoordinationGap } from '../schemas/agentContracts.schema';
import { checkSectionReliefGapsEffect, detectAttendanceGapsEffect } from './reliefAgent.adapter';

export * from '../schemas/agentContracts.schema';
export * from './reliefAgent.adapter';

/**
 * Promise-bridged execution boundary for discovering staff relief gaps.
 * Suitable for React components, background sync jobs, and external clients.
 * Domain errors are logged and converted to APIError at the boundary.
 */
export async function runReliefAudit(
  schoolId: string,
  sectionId?: string,
): Promise<CoordinationGap[]> {
  return runEffect(checkSectionReliefGapsEffect(schoolId, sectionId), 'RELIEF_AUDIT_FAILED');
}

/**
 * Promise-bridged execution boundary for auditing pending classroom attendance.
 * Suitable for React components, background sync jobs, and external clients.
 */
export async function runAttendanceAudit(
  classrooms: ClassroomRef[],
  today: string,
): Promise<CoordinationGap[]> {
  return runEffect(detectAttendanceGapsEffect(classrooms, today), 'ATTENDANCE_AUDIT_FAILED');
}

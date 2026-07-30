import type { ScopeRef } from '@repo/core/types/Tenancy';

export type CapabilityKey =
  | 'platform.observe.all'
  | 'platform.override.support'
  | 'tenant.read'
  | 'tenant.manage'
  | 'school.read'
  | 'school.manage'
  | 'school.forest.read'
  | 'school.people.read'
  | 'school.people.manage'
  | 'school.calendar.read'
  | 'school.calendar.manage'
  | 'school.reporting.read'
  | 'school.reporting.export'
  | 'school.inventory.read'
  | 'school.inventory.manage'
  | 'classroom.read.assigned'
  | 'classroom.read.school'
  | 'classroom.create'
  | 'classroom.manage.own'
  | 'classroom.resources.manage'
  | 'attendance.student.read'
  | 'attendance.student.take'
  | 'attendance.staff.read'
  | 'attendance.staff.manage'
  | 'assignment.create'
  | 'assignment.submit'
  | 'leave.request.self'
  | 'leave.review.school'
  | 'student.record.read.self'
  | 'student.record.read.school'
  | 'guardian.link.read'
  | (string & {});

export interface CapabilityResource {
  schoolId?: string | null;
  ownerUserId?: string | null;
  sectionId?: string | null;
  gradeId?: string | null;
  classroomId?: string | null;
  studentId?: string | null;
  scope?: ScopeRef | null;
}

export interface PolicyDecision {
  capability: CapabilityKey;
  action?: string;
  allowed: boolean;
  reason?: string;
  scope?: ScopeRef;
}

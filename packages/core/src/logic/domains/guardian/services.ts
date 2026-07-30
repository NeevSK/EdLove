import { APIError } from '@repo/core/types/API';
import type {
  GuardianDashboard,
  GuardianIdentity,
  GuardianNotificationSettings,
  GuardianPermissionConfig,
  GuardianProfileCreate,
  GuardianVerificationDocument,
  StudentGuardianRelationship,
} from '@repo/core/logic/schemas/guardian.schema';
import type { GuardianRepository } from '@repo/core/logic/domains/guardian/ports';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ATTENDANCE_WINDOW_DAYS = 30;
const TIMELINE_EXCLUSIONS = [
  'teacher_private_notes',
  'draft_grades',
  'admin_internal_records',
] as const;
const _TIMELINE_INCLUDES = ['attendance', 'grades'] as const;
const OFFICIAL_RECORD_TYPES = ['attendance', 'grades'] as const;
const PROJECTION_TYPES = ['assignments', 'notifications', 'events'] as const;

function toIsoDate(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function buildDashboardPolicy(asOf: string): GuardianDashboard['policy'] {
  return {
    asOf,
    timelineVisibility: 'official_records_only',
    summaryMode: 'bounded_windows',
    officialRecordTypes: [...OFFICIAL_RECORD_TYPES],
    projectionTypes: [...PROJECTION_TYPES],
    excludedData: [...TIMELINE_EXCLUSIONS],
  };
}

function canReadGuardianCategory(
  permissions: GuardianPermissionConfig[],
  category: GuardianPermissionConfig['category'],
): boolean {
  const categoryPermissions = permissions.filter((permission) => permission.category === category);

  if (categoryPermissions.length === 0) {
    return true;
  }

  return categoryPermissions.some((permission) => permission.level !== 'none');
}

function applyGuardianRelationshipPolicy(
  dashboard: GuardianDashboard,
  relationships: StudentGuardianRelationship[],
): GuardianDashboard {
  const relationshipByStudentId = new Map(
    relationships
      .filter((relationship) => relationship.is_active)
      .map((relationship) => [relationship.student_id, relationship] as const),
  );

  return {
    ...dashboard,
    students: dashboard.students.flatMap((student) => {
      const relationship = relationshipByStudentId.get(student.studentId);

      if (!relationship) {
        return [];
      }

      const permissions = (relationship.permissions as unknown as GuardianPermissionConfig[]) ?? [];
      const sectionVisibility = {
        attendance: canReadGuardianCategory(permissions, 'attendance'),
        grades: canReadGuardianCategory(permissions, 'grades'),
        reports: canReadGuardianCategory(permissions, 'reports'),
        assignments: true,
      };

      return [
        {
          ...student,
          attendance: sectionVisibility.attendance
            ? student.attendance
            : {
                present: 0,
                absent: 0,
                late: 0,
                total: 0,
                percentage: 0,
              },
          grades: sectionVisibility.grades
            ? student.grades
            : {
                latest: [],
                average: 0,
              },
          sectionVisibility,
        },
      ];
    }),
  };
}

function applyGuardianTemporalPolicy(
  dashboard: GuardianDashboard,
  now: Date = new Date(),
): GuardianDashboard {
  const asOf = now.toISOString();
  const attendanceStartsAt = new Date(
    now.getTime() - ATTENDANCE_WINDOW_DAYS * DAY_IN_MS,
  ).toISOString();

  return {
    ...dashboard,
    students: dashboard.students.map((student) => {
      const gradeDates = student.grades.latest.map((grade) => toIsoDate(grade.date, asOf));
      const assignmentDates = student.upcomingAssignments.map((assignment) =>
        toIsoDate(assignment.dueDate, asOf),
      );
      const latestGradeDate = gradeDates.length > 0 ? gradeDates[0]! : asOf;
      const earliestGradeDate = gradeDates.length > 0 ? gradeDates[gradeDates.length - 1]! : asOf;
      const latestAssignmentDate =
        assignmentDates.length > 0
          ? assignmentDates.reduce((max, value) => (value > max ? value : max), assignmentDates[0]!)
          : asOf;

      return {
        ...student,
        summaryWindows: {
          attendance: {
            kind: 'rolling_window',
            label: 'Last 30 days attendance',
            startsAt: attendanceStartsAt,
            endsAt: asOf,
            asOf,
          },
          grades: {
            kind: 'latest_snapshot',
            label: 'Latest guardian-visible grades',
            startsAt: earliestGradeDate,
            endsAt: latestGradeDate,
            asOf,
          },
          assignments: {
            kind: 'upcoming_projection',
            label: 'Upcoming assignments',
            startsAt: asOf,
            endsAt: latestAssignmentDate,
            asOf,
          },
        },
        timelinePolicy: {
          visibility: 'official_records_only',
          includes: [
            ...(student.sectionVisibility?.attendance === false ? [] : ['attendance' as const]),
            ...(student.sectionVisibility?.grades === false ? [] : ['grades' as const]),
          ],
          excludes: [...TIMELINE_EXCLUSIONS],
        },
      };
    }),
    policy: buildDashboardPolicy(asOf),
  };
}

export interface GuardianServices {
  createProfile(data: GuardianProfileCreate): Promise<GuardianIdentity>;
  getProfile(guardianId: string): Promise<GuardianIdentity>;
  verifyGuardian(guardianId: string, documents: GuardianVerificationDocument[]): Promise<void>;
  updateProfile(guardianId: string, updates: Partial<GuardianIdentity>): Promise<GuardianIdentity>;
  linkGuardianToStudent(
    guardianId: string,
    studentId: string,
    relationshipType: GuardianIdentity['relationship_type'],
    schoolId?: string,
  ): Promise<StudentGuardianRelationship>;
  updatePermissions(
    guardianId: string,
    studentId: string,
    permissions: GuardianPermissionConfig[],
  ): Promise<void>;
  terminateRelationship(guardianId: string, studentId: string): Promise<void>;
  getStudents(guardianId: string): Promise<GuardianDashboard['students']>;
  getStudentGuardians(studentId: string): Promise<GuardianIdentity[]>;
  getDashboard(guardianId: string): Promise<GuardianDashboard>;
  updateNotificationSettings(
    guardianId: string,
    settings: GuardianNotificationSettings,
  ): Promise<void>;
}

export const createGuardianServices = (repository: GuardianRepository): GuardianServices => ({
  createProfile: (data) => repository.createGuardianProfile(data),
  async getProfile(guardianId) {
    const profile = await repository.getGuardianProfile(guardianId);
    if (!profile) {
      throw new APIError('Guardian profile not found', 'NOT_FOUND');
    }
    return profile;
  },
  verifyGuardian: (guardianId, documents) => repository.verifyGuardian(guardianId, documents),
  updateProfile: (guardianId, updates) => repository.updateGuardianProfile(guardianId, updates),
  linkGuardianToStudent: (guardianId, studentId, relationshipType, schoolId) =>
    repository.linkGuardianToStudent(guardianId, studentId, relationshipType, schoolId),
  updatePermissions: (guardianId, studentId, permissions) =>
    repository.updateGuardianPermissions(guardianId, studentId, permissions),
  terminateRelationship: (guardianId, studentId) =>
    repository.terminateGuardianRelationship(guardianId, studentId),
  async getStudents(guardianId) {
    const dashboard = await repository.getGuardianDashboard(guardianId);
    const relationships = await repository.getGuardianRelationships(guardianId);
    return applyGuardianTemporalPolicy(applyGuardianRelationshipPolicy(dashboard, relationships))
      .students;
  },
  getStudentGuardians: (studentId) => repository.getStudentGuardians(studentId),
  async getDashboard(guardianId) {
    const dashboard = await repository.getGuardianDashboard(guardianId);
    const relationships = await repository.getGuardianRelationships(guardianId);
    return applyGuardianTemporalPolicy(applyGuardianRelationshipPolicy(dashboard, relationships));
  },
  updateNotificationSettings: (guardianId, settings) =>
    repository.updateGuardianNotificationSettings(guardianId, settings),
});

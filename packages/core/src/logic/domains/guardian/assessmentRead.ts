/**
 * Local, fail-closed contract for guardian assessment reads.
 *
 * The current student_guardian_relationships table has no permission column,
 * so callers must provide an explicit permission grant from a trusted local
 * source. A row that only contains the current database columns is denied.
 */

const VALID_RELATIONSHIP_TYPES = new Set(['parent', 'legal_guardian', 'other']);
const ALLOWED_GRADE_PERMISSION_LEVELS = new Set(['read', 'admin']);
const ALLOWED_GRADE_PERMISSION_SCOPES = new Set(['all_students', 'assigned_students']);

export type GuardianAssessmentRelationship = {
  student_id: string;
  guardian_id: string;
  relationship_type: string;
  permissions?: readonly GuardianAssessmentPermission[];
};

export type GuardianAssessmentPermission = {
  category: 'grades' | string;
  level: 'none' | 'read' | 'write' | 'admin' | string;
  scope: 'all_students' | 'assigned_students' | 'specific_students' | string;
};

export type StudentGradeReadRow = {
  student_id: string;
  publication_state: string | null;
  published_at: string | null;
  subject?: string | null;
  grade?: string | null;
  percentage?: number | null;
  graded_at?: string | null;
  assessment_type?: string | null;
};

export type GuardianAssessmentResult = {
  subject?: string;
  grade?: string;
  percentage?: number;
  date?: string;
  type?: string;
};

export type GuardianAssessmentReadAuditEvent = {
  event: 'guardian_assessment_read';
  actor_id: string;
  student_id: string;
  outcome: 'allowed' | 'denied';
  reason:
    | 'allowed'
    | 'no_relationship'
    | 'invalid_relationship'
    | 'permission_missing'
    | 'permission_denied'
    | 'no_published_results';
  result_count: number;
  occurred_at: string;
};

export type GuardianAssessmentReadDependencies = {
  loadRelationships: (
    guardianId: string,
    studentId: string,
  ) => Promise<readonly GuardianAssessmentRelationship[]>;
  loadGrades: (studentId: string) => Promise<readonly StudentGradeReadRow[]>;
  writeAudit: (event: GuardianAssessmentReadAuditEvent) => Promise<void>;
  now?: () => string;
};

function hasExplicitGradeReadPermission(
  permissions: readonly GuardianAssessmentPermission[] | undefined,
): boolean {
  if (!permissions) return false;

  return permissions.some(
    (permission) =>
      permission.category === 'grades' &&
      ALLOWED_GRADE_PERMISSION_LEVELS.has(permission.level) &&
      ALLOWED_GRADE_PERMISSION_SCOPES.has(permission.scope),
  );
}

function isValidRelationship(
  relationship: GuardianAssessmentRelationship | undefined,
  guardianId: string,
  studentId: string,
): boolean {
  return Boolean(
    relationship &&
      relationship.guardian_id === guardianId &&
      relationship.student_id === studentId &&
      VALID_RELATIONSHIP_TYPES.has(relationship.relationship_type),
  );
}

function minimizeGrade(row: StudentGradeReadRow): GuardianAssessmentResult {
  const result: GuardianAssessmentResult = {};
  if (row.subject != null) result.subject = row.subject;
  if (row.grade != null) result.grade = row.grade;
  if (row.percentage != null) result.percentage = row.percentage;
  if (row.graded_at != null) result.date = row.graded_at;
  if (row.assessment_type != null) result.type = row.assessment_type;
  return result;
}

export function createGuardianAssessmentReadService({
  loadRelationships,
  loadGrades,
  writeAudit,
  now = () => new Date().toISOString(),
}: GuardianAssessmentReadDependencies) {
  return async function readPublishedAssessments(
    guardianId: string,
    studentId: string,
  ): Promise<readonly GuardianAssessmentResult[]> {
    const relationships = await loadRelationships(guardianId, studentId);
    const relationship = relationships.find(
      (candidate) => candidate.guardian_id === guardianId && candidate.student_id === studentId,
    );

    let outcome: GuardianAssessmentReadAuditEvent['outcome'] = 'denied';
    let reason: GuardianAssessmentReadAuditEvent['reason'];
    let results: readonly GuardianAssessmentResult[] = [];

    if (!relationship) {
      reason = 'no_relationship';
    } else if (!isValidRelationship(relationship, guardianId, studentId)) {
      reason = 'invalid_relationship';
    } else if (!hasExplicitGradeReadPermission(relationship.permissions)) {
      reason = relationship.permissions ? 'permission_denied' : 'permission_missing';
    } else {
      const publishedGrades = (await loadGrades(studentId)).filter(
        (row) =>
          row.student_id === studentId &&
          row.publication_state === 'published' &&
          row.published_at != null,
      );
      results = publishedGrades.map(minimizeGrade);
      if (results.length > 0) {
        outcome = 'allowed';
        reason = 'allowed';
      } else {
        reason = 'no_published_results';
      }
    }

    await writeAudit({
      event: 'guardian_assessment_read',
      actor_id: guardianId,
      student_id: studentId,
      outcome,
      reason,
      result_count: results.length,
      occurred_at: now(),
    });

    return results;
  };
}

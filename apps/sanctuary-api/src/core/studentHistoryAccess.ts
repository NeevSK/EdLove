import { z } from 'zod';

/**
 * Per-school scope for attendance.getStudentHistory, stored in
 * schools.student_history_access (jsonb, '{}' = these strict defaults).
 * Unknown keys are ignored and an invalid value falls back to its default, so a bad
 * setting can only make access stricter than the school intended, never wider than
 * the maximum below.
 *
 * Fixed (not configurable): the student always sees their own history; pending or
 * revoked guardians never do; anyone without one of these relationships is denied.
 */
const leaderCapacity = z.enum(['section_head', 'grade_head']);

const schema = z.object({
  /** 'verified' = verified guardians see their ward's history in this school. */
  guardians: z.enum(['verified', 'none']).catch('verified').default('verified'),
  /** Teachers (not class teacher) of a class the student is actively enrolled in. */
  subjectTeachers: z.enum(['own_class', 'none']).catch('own_class').default('own_class'),
  /** Class teachers: the student's whole history in this school, or only their class. */
  classTeachers: z
    .enum(['school_history', 'own_class'])
    .catch('school_history')
    .default('school_history'),
  /** Extra leader capacities beyond principal that see every student in the school. */
  leaderCapacities: z.array(leaderCapacity).catch([]).default([]),
});

export type StudentHistoryAccess = z.infer<typeof schema>;

export function parseStudentHistoryAccess(value: unknown): StudentHistoryAccess {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return schema.parse(input);
}

export const DEFAULT_STUDENT_HISTORY_ACCESS = parseStudentHistoryAccess({});

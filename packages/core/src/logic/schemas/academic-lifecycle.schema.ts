import {
  AcademicCycleSchema,
  GradeClassSchema,
  GradeLevelSchema,
  TermSchema,
} from '@repo/core/logic/schemas/grade-domain.schema';
import { z } from 'zod';

const uuid = z.uuid();
const auditTimestamp = z.iso.datetime();
const calendarDate = z.iso.date();

const AuditFieldsSchema = z.object({
  created_by: uuid,
  updated_by: uuid.nullable().optional(),
  created_at: auditTimestamp,
  updated_at: auditTimestamp,
});

export const AcademicCycleLeadershipRoleSchema = z.enum([
  'principal',
  'section_head',
  'grade_head',
]);

export const AcademicCycleLeadershipAssignmentStatusSchema = z.enum([
  'active',
  'completed',
  'ended',
]);

/** Historical leadership assignment scoped to one academic cycle. */
export const AcademicCycleLeadershipAssignmentSchema = z
  .object({
    id: uuid,
    school_id: uuid,
    academic_cycle_id: uuid,
    assignee_id: uuid,
    role: AcademicCycleLeadershipRoleSchema,
    section_id: uuid.nullable().optional(),
    grade_level_id: uuid.nullable().optional(),
    effective_from: auditTimestamp,
    effective_to: auditTimestamp.nullable().optional(),
    status: AcademicCycleLeadershipAssignmentStatusSchema,
  })
  .merge(AuditFieldsSchema)
  .superRefine((assignment, context) => {
    if (assignment.effective_to && assignment.effective_to < assignment.effective_from) {
      context.addIssue({
        code: 'custom',
        path: ['effective_to'],
        message: 'Leadership assignment must end on or after it starts',
      });
    }

    if (assignment.role === 'principal' && (assignment.section_id || assignment.grade_level_id)) {
      context.addIssue({
        code: 'custom',
        path: ['role'],
        message: 'Principal assignments cannot be scoped to a section or grade level',
      });
    }

    if (assignment.role === 'section_head' && !assignment.section_id) {
      context.addIssue({
        code: 'custom',
        path: ['section_id'],
        message: 'Section head assignments require a section',
      });
    }

    if (assignment.role === 'grade_head' && !assignment.grade_level_id) {
      context.addIssue({
        code: 'custom',
        path: ['grade_level_id'],
        message: 'Grade head assignments require a grade level',
      });
    }
  });

export const GradeClassSubjectStatusSchema = z.enum(['active', 'archived']);

/** A subject or instructional context offered by a class during a term. */
export const GradeClassSubjectSchema = z
  .object({
    id: uuid,
    grade_class_id: uuid,
    term_id: uuid,
    subject_context: z.string().trim().min(1),
    status: GradeClassSubjectStatusSchema,
  })
  .merge(AuditFieldsSchema);

/** Validates the cross-record containment and ordering of one cycle’s terms. */
export const AcademicCycleWithTermsSchema = z
  .object({
    cycle: AcademicCycleSchema,
    terms: z.array(TermSchema),
  })
  .superRefine(({ cycle, terms }, context) => {
    const sequences = new Set<number>();
    terms.forEach((term, index) => {
      if (term.academic_cycle_id !== cycle.id) {
        context.addIssue({
          code: 'custom',
          path: ['terms', index, 'academic_cycle_id'],
          message: 'Term must belong to the containing academic cycle',
        });
      }
      if (sequences.has(term.sequence)) {
        context.addIssue({
          code: 'custom',
          path: ['terms', index, 'sequence'],
          message: 'Term sequence must be unique within an academic cycle',
        });
      }
      sequences.add(term.sequence);
      if (term.starts_at < cycle.starts_at || term.ends_at > cycle.ends_at) {
        context.addIssue({
          code: 'custom',
          path: ['terms', index],
          message: 'Term must be contained within the academic cycle dates',
        });
      }
    });
  });

/** Validates GradeLevel -> GradeClass -> GradeClassSubject/Term containment. */
export const GradeClassSubjectContextSchema = z
  .object({
    grade_level: GradeLevelSchema,
    grade_class: GradeClassSchema,
    term: TermSchema,
    subject: GradeClassSubjectSchema,
  })
  .superRefine(({ grade_level, grade_class, term, subject }, context) => {
    if (grade_class.grade_level_id !== grade_level.id) {
      context.addIssue({
        code: 'custom',
        path: ['grade_class', 'grade_level_id'],
        message: 'Grade class must belong to the containing grade level',
      });
    }
    if (term.academic_cycle_id !== grade_class.academic_cycle_id) {
      context.addIssue({
        code: 'custom',
        path: ['term', 'academic_cycle_id'],
        message: 'Term must belong to the grade class academic cycle',
      });
    }
    if (subject.grade_class_id !== grade_class.id) {
      context.addIssue({
        code: 'custom',
        path: ['subject', 'grade_class_id'],
        message: 'Subject context must belong to the containing grade class',
      });
    }
    if (subject.term_id !== term.id) {
      context.addIssue({
        code: 'custom',
        path: ['subject', 'term_id'],
        message: 'Subject context must belong to the containing term',
      });
    }
  });

export const DailyAttendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused']);

/** One student’s daily attendance record; session detail may refine it. */
export const DailyAttendanceSchema = z
  .object({
    id: uuid,
    student_id: uuid,
    school_id: uuid,
    grade_class_id: uuid,
    academic_cycle_id: uuid,
    attendance_date: calendarDate,
    status: DailyAttendanceStatusSchema,
    note: z.string().nullable().optional(),
    recorded_by: uuid,
  })
  .merge(AuditFieldsSchema);

export const AttendanceSessionKindSchema = z.enum(['lesson', 'arrival', 'departure']);

/** A lesson, arrival, or departure observation attached to a daily record. */
export const AttendanceSessionSchema = z
  .object({
    id: uuid,
    daily_attendance_id: uuid,
    student_id: uuid,
    grade_class_id: uuid,
    academic_cycle_id: uuid,
    term_id: uuid.nullable().optional(),
    session_kind: AttendanceSessionKindSchema,
    teacher_id: uuid.nullable().optional(),
    subject_context: z.string().trim().min(1).nullable().optional(),
    session_at: auditTimestamp,
    status: DailyAttendanceStatusSchema,
    recorded_by: uuid,
  })
  .merge(AuditFieldsSchema)
  .superRefine((session, context) => {
    if (session.session_kind === 'lesson' && !session.teacher_id) {
      context.addIssue({
        code: 'custom',
        path: ['teacher_id'],
        message: 'Lesson attendance requires the covering teacher',
      });
    }
    if (session.session_kind === 'lesson' && !session.subject_context) {
      context.addIssue({
        code: 'custom',
        path: ['subject_context'],
        message: 'Lesson attendance requires a subject context',
      });
    }
  });

export type AcademicCycleLeadershipRole = z.infer<typeof AcademicCycleLeadershipRoleSchema>;
export type AcademicCycleLeadershipAssignment = z.infer<
  typeof AcademicCycleLeadershipAssignmentSchema
>;
export type AcademicCycleWithTerms = z.infer<typeof AcademicCycleWithTermsSchema>;
export type GradeClassSubject = z.infer<typeof GradeClassSubjectSchema>;
export type GradeClassSubjectContext = z.infer<typeof GradeClassSubjectContextSchema>;
export type DailyAttendanceStatus = z.infer<typeof DailyAttendanceStatusSchema>;
export type DailyAttendance = z.infer<typeof DailyAttendanceSchema>;
export type AttendanceSessionKind = z.infer<typeof AttendanceSessionKindSchema>;
export type AttendanceSession = z.infer<typeof AttendanceSessionSchema>;

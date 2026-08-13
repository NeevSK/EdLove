import { z } from 'zod';

const uuid = z.uuid();
const auditTimestamp = z.iso.datetime();

const AuditFieldsSchema = z.object({
  created_by: uuid,
  updated_by: uuid.nullable().optional(),
  created_at: auditTimestamp,
  updated_at: auditTimestamp,
});

export const AcademicCycleStatusSchema = z.enum([
  'planned',
  'active',
  'completed',
  'archived',
]);

export const AcademicCycleSchema = z
  .object({
    id: uuid,
    school_id: uuid,
    name: z.string().trim().min(1),
    starts_at: auditTimestamp,
    ends_at: auditTimestamp,
    status: AcademicCycleStatusSchema,
  })
  .merge(AuditFieldsSchema)
  .superRefine((cycle, context) => {
    if (cycle.ends_at <= cycle.starts_at) {
      context.addIssue({
        code: 'custom',
        path: ['ends_at'],
        message: 'Academic cycle must end after it starts',
      });
    }
  });

export const TermKindSchema = z.enum(['term', 'semester']);

export const TermSchema = z
  .object({
    id: uuid,
    academic_cycle_id: uuid,
    name: z.string().trim().min(1),
    term_kind: TermKindSchema,
    sequence: z.number().int().min(1),
    starts_at: auditTimestamp,
    ends_at: auditTimestamp,
  })
  .merge(AuditFieldsSchema)
  .superRefine((term, context) => {
    if (term.ends_at <= term.starts_at) {
      context.addIssue({
        code: 'custom',
        path: ['ends_at'],
        message: 'Term must end after it starts',
      });
    }
  });

export const GradeLevelSchema = z
  .object({
    id: uuid,
    section_id: uuid,
    grade_number: z.number().int().min(1).max(13),
    label: z.string().trim().min(1).nullable().optional(),
  })
  .merge(AuditFieldsSchema);

export const GradeClassStatusSchema = z.enum(['active', 'archived']);

export const GradeClassSchema = z
  .object({
    id: uuid,
    grade_level_id: uuid,
    academic_cycle_id: uuid,
    name: z.string().trim().min(1),
    status: GradeClassStatusSchema,
  })
  .merge(AuditFieldsSchema);

export const GradeClassTeacherAssignmentStatusSchema = z.enum([
  'active',
  'completed',
  'ended',
]);

/** A historical teacher assignment is explicitly role- and subject-scoped. */
export const GradeClassTeacherAssignmentSchema = z
  .object({
    id: uuid,
    grade_class_id: uuid,
    teacher_id: uuid,
    academic_cycle_id: uuid,
    role: z.string().trim().min(1),
    subject_context: z.string().trim().min(1),
    effective_from: auditTimestamp,
    effective_to: auditTimestamp.nullable().optional(),
    status: GradeClassTeacherAssignmentStatusSchema,
  })
  .merge(AuditFieldsSchema)
  .superRefine((assignment, context) => {
    if (assignment.effective_to && assignment.effective_to < assignment.effective_from) {
      context.addIssue({
        code: 'custom',
        path: ['effective_to'],
        message: 'Assignment must end on or after it starts',
      });
    }
  });

export const GradeMarkPublicationStateSchema = z.enum(['draft', 'published']);

/** General letter grades intentionally exclude plus/minus variants. */
export const GradeMarkLetterGradeSchema = z
  .string()
  .regex(/^[A-Z]+$/, 'Letter grade must contain uppercase letters only');

export const GradeMarkSchema = z
  .object({
    id: uuid,
    student_id: uuid,
    school_id: uuid,
    grade_class_id: uuid,
    academic_cycle_id: uuid,
    term_id: uuid.nullable().optional(),
    subject_id: uuid,
    assignment_id: uuid.nullable().optional(),
    submission_id: uuid.nullable().optional(),
    marks_earned: z.number().finite().min(0),
    max_points: z.number().finite().positive(),
    percentage: z.number().finite().min(0).max(100),
    gpa: z.number().finite().min(0).max(5),
    letter_grade: GradeMarkLetterGradeSchema,
    publication_state: GradeMarkPublicationStateSchema,
    graded_by: uuid,
    graded_at: auditTimestamp,
    published_by: uuid.nullable().optional(),
    published_at: auditTimestamp.nullable().optional(),
    feedback: z.string().nullable().optional(),
    idempotency_key: z.string().trim().min(1).nullable().optional(),
  })
  .extend({
    created_at: auditTimestamp,
    updated_at: auditTimestamp,
  })
  .superRefine((mark, context) => {
    if (mark.marks_earned > mark.max_points) {
      context.addIssue({
        code: 'too_big',
        origin: 'number',
        maximum: mark.max_points,
        inclusive: true,
        path: ['marks_earned'],
        message: 'Marks earned cannot exceed max points',
      });
    }
  });

export const GradeMarkCollectionSchema = z.array(GradeMarkSchema);

export function selectGuardianVisibleGradeMarks(marks: GradeMark[]): GradeMark[] {
  return marks.filter((mark) => mark.publication_state === 'published');
}

export type AcademicCycleContract = z.infer<typeof AcademicCycleSchema>;
export type Term = z.infer<typeof TermSchema>;
export type GradeLevel = z.infer<typeof GradeLevelSchema>;
export type GradeClass = z.infer<typeof GradeClassSchema>;
export type GradeClassTeacherAssignment = z.infer<
  typeof GradeClassTeacherAssignmentSchema
>;
export type GradeMarkPublicationState = z.infer<typeof GradeMarkPublicationStateSchema>;
export type GradeMark = z.infer<typeof GradeMarkSchema>;

import {
  annotateGradesWithPublicationState,
  GRADE_LIFECYCLE_ACTIONS,
  type GradeLifecycleAuditRow,
  type GradePublicationSnapshot,
  selectLatestPublishedSnapshots,
} from '../lib/gradePublication';
import { emitSchoolGradePublishedFromBridge } from '../logic/events/runtimeBridge';
import type {
  ClassroomGradingSettings,
  Grade,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  PublishedStudentGradesSnapshot,
  SchoolGradingCompletion,
} from '../logic/schemas/grading.schema';
import { educational, audit } from '../logic/managers/factory';
import { gradingProjectionServices } from './runtimes/gradingProjection.runtime';

type GradingAuditContext = {
  actorId?: string;
  reason?: string;
  accessKind?: 'teacher_authoring' | 'institutional_read' | 'institutional_export';
};

const logGradingAudit = async ({
  action,
  entityId,
  executorId,
  metadata,
}: {
  action: string;
  entityId: string;
  executorId?: string;
  metadata?: Record<string, unknown>;
}) => {
  if (!executorId) return;

  await audit.log({
    action,
    entity_id: entityId,
    target_id: entityId,
    entity_type: 'grade',
    executor_id: executorId,
    metadata: metadata ?? {},
  });
};

const getGradeLifecycleRows = async (gradeIds: string[]): Promise<GradeLifecycleAuditRow[]> => {
  if (gradeIds.length === 0) return [];

  return audit.getLogs({
    entityType: 'grade',
    actions: [...GRADE_LIFECYCLE_ACTIONS],
    limit: 100, // Reasonable limit for lifecycle tracking
  }).then(logs => logs.filter(log => gradeIds.includes(log.entity_id)) as unknown as GradeLifecycleAuditRow[]);
};

const getAnnotatedGrades = async (grades: Grade[]): Promise<GradePublicationSnapshot[]> => {
  const rows = await getGradeLifecycleRows(grades.map((grade) => grade.id));
  return annotateGradesWithPublicationState(grades, rows);
};

const buildPublicationSnapshot = ({
  grade,
  publishedAt,
  publishedBy,
  action,
}: {
  grade: Grade;
  publishedAt: Date | string;
  publishedBy?: string;
  action: 'grade_published' | 'grade_revised' | 'grade_overridden';
}) => ({
  ...grade,
  publication_state: 'published' as const,
  published_at: publishedAt,
  published_by: publishedBy ?? null,
  publication_action: action,
});

export const gradingAPI = {
  /**
   * @authority create Grade
   */
  async saveGradeDraft(
    studentId: string,
    classroomId: string,
    marks: number,
    assignmentId?: string,
    feedback?: string,
    auditCtx?: GradingAuditContext,
  ): Promise<Grade> {
    const existing = (await educational.grading.getClassroomGrades(classroomId)).find(
      (grade) =>
        grade.student_id === studentId && (grade.assignment_id ?? null) === (assignmentId ?? null),
    );

    const saved = await educational.grading.submitGrade(
      studentId,
      classroomId,
      marks,
      assignmentId,
      feedback,
    );

    await logGradingAudit({
      action: 'grade_draft_saved',
      entityId: saved.id,
      executorId: auditCtx?.actorId,
      metadata: {
        snapshot: {
          ...saved,
          publication_state: 'draft',
          published_at: null,
          published_by: null,
          publication_action: 'grade_draft_saved',
        },
        publicationState: 'draft',
        classroomId,
        studentId,
        assignmentId: assignmentId ?? null,
        previousMarks: existing?.marks ?? null,
        nextMarks: marks,
        reason: auditCtx?.reason ?? null,
        accessKind: auditCtx?.accessKind ?? 'teacher_authoring',
      },
    });

    return {
      ...saved,
      publication_state: 'draft',
      published_at: null,
      published_by: null,
      publication_action: 'grade_draft_saved',
    } as Grade;
  },

  /**
   * @authority publish Grade
   */
  async publishGrade(gradeId: string, auditCtx?: GradingAuditContext): Promise<Grade> {
    const grade = await educational.grading.getById(gradeId);
    const publishedAt = new Date();

    await logGradingAudit({
      action: 'grade_published',
      entityId: grade.id,
      executorId: auditCtx?.actorId,
      metadata: {
        snapshot: buildPublicationSnapshot({
          grade,
          publishedAt,
          publishedBy: auditCtx?.actorId,
          action: 'grade_published',
        }),
        publicationState: 'published',
        publishedAt,
        publishedBy: auditCtx?.actorId ?? null,
        classroomId: grade.classroom_id,
        studentId: grade.student_id,
        assignmentId: grade.assignment_id ?? null,
        reason: auditCtx?.reason ?? 'grade_publish',
        accessKind: auditCtx?.accessKind ?? 'teacher_authoring',
      },
    });

    const publishedGrade: Grade = {
      ...grade,
      publication_state: 'published',
      published_at: publishedAt,
      published_by: auditCtx?.actorId ?? null,
      publication_action: 'grade_published',
    } as Grade;

    void emitSchoolGradePublishedFromBridge({
      ...publishedGrade,
      correlationId: grade.id,
      causationId: grade.id,
      tenantId: undefined,
    }).catch((error) => {
      console.warn('Failed to emit school/grade.published event', error);
    });

    return publishedGrade;
  },

  /**
   * @authority update Grade
   */
  async revisePublishedGrade(
    gradeId: string,
    marks: number,
    feedback?: string,
    auditCtx?: GradingAuditContext,
  ): Promise<Grade> {
    const previous = await educational.grading.getById(gradeId);
    const revised = await educational.grading.reviseGrade(gradeId, marks, feedback);
    const publishedAt = new Date();

    await logGradingAudit({
      action: 'grade_revised',
      entityId: revised.id,
      executorId: auditCtx?.actorId,
      metadata: {
        snapshot: buildPublicationSnapshot({
          grade: revised,
          publishedAt,
          publishedBy: auditCtx?.actorId,
          action: 'grade_revised',
        }),
        publicationState: 'published',
        publishedAt,
        publishedBy: auditCtx?.actorId ?? null,
        classroomId: revised.classroom_id,
        studentId: revised.student_id,
        assignmentId: revised.assignment_id ?? null,
        previousMarks: previous.marks,
        nextMarks: revised.marks,
        reason: auditCtx?.reason ?? 'grade_revision',
        accessKind: auditCtx?.accessKind ?? 'teacher_authoring',
      },
    });

    return {
      ...revised,
      publication_state: 'published',
      published_at: publishedAt,
      published_by: auditCtx?.actorId ?? null,
      publication_action: 'grade_revised',
    } as Grade;
  },

  /**
   * @authority override Grade
   */
  async overrideGrade(
    gradeId: string,
    marks: number,
    feedback?: string,
    auditCtx?: GradingAuditContext,
  ): Promise<Grade> {
    const previous = await educational.grading.getById(gradeId);
    const overridden = await educational.grading.reviseGrade(gradeId, marks, feedback);
    const publishedAt = new Date();

    await logGradingAudit({
      action: 'grade_overridden',
      entityId: overridden.id,
      executorId: auditCtx?.actorId,
      metadata: {
        snapshot: buildPublicationSnapshot({
          grade: overridden,
          publishedAt,
          publishedBy: auditCtx?.actorId,
          action: 'grade_overridden',
        }),
        publicationState: 'published',
        publishedAt,
        publishedBy: auditCtx?.actorId ?? null,
        classroomId: overridden.classroom_id,
        studentId: overridden.student_id,
        assignmentId: overridden.assignment_id ?? null,
        previousMarks: previous.marks,
        nextMarks: overridden.marks,
        reason: auditCtx?.reason ?? 'grade_override',
        accessKind: auditCtx?.accessKind ?? 'institutional_read',
      },
    });

    return {
      ...overridden,
      publication_state: 'published',
      published_at: publishedAt,
      published_by: auditCtx?.actorId ?? null,
      publication_action: 'grade_overridden',
    } as Grade;
  },

  /**
   * @authority read Grade
   */
  async getGradebookSnapshot(classroomId: string, viewDate: string): Promise<GradebookSnapshot> {
    const [grades, gradingSettings] = await Promise.all([
      educational.grading.getClassroomGrades(classroomId),
      educational.grading.getGradingSettings(classroomId),
    ]);
    const annotated = await getAnnotatedGrades(grades);

    return {
      classroomId,
      viewDate,
      grades: annotated.filter((grade) => grade.updated_at <= new Date(`${viewDate}T23:59:59.999Z`)),
      gradingSettings,
    };
  },

  /**
   * @authority read Grade
   */
  async getStudentGradeTimeline(
    studentId: string,
    options?: {
      classroomId?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<Grade[]> {
    const grades = await getAnnotatedGrades(
      await educational.grading.getReportCard(studentId),
    );
    return grades.filter((grade) => {
      if (options?.classroomId && grade.classroom_id !== options.classroomId) return false;
      if (options?.fromDate && grade.updated_at < new Date(`${options.fromDate}T00:00:00.000Z`)) return false;
      if (options?.toDate && grade.updated_at > new Date(`${options.toDate}T23:59:59.999Z`)) return false;
      return true;
    });
  },

  /**
   * @authority read Grade
   */
  async getPublishedStudentGrades(
    studentId: string,
    viewDate: string,
    options?: { classroomId?: string },
  ): Promise<PublishedStudentGradesSnapshot> {
    const grades = await educational.grading.getReportCard(studentId);
    const lifecycleRows = await getGradeLifecycleRows(grades.map((grade) => grade.id));
    const published = selectLatestPublishedSnapshots(lifecycleRows).filter((grade) => {
      if (grade.student_id !== studentId) return false;
      if (options?.classroomId && grade.classroom_id !== options.classroomId) return false;
      const publishedAt = grade.published_at ?? grade.updated_at;
      return publishedAt <= new Date(`${viewDate}T23:59:59.999Z`);
    });

    return {
      studentId,
      viewDate,
      grades: published,
    } as PublishedStudentGradesSnapshot;
  },

  /**
   * @authority read Grade
   */
  async getSchoolGradingCompletion(
    schoolId: string,
    viewDate: string,
    auditCtx?: GradingAuditContext,
  ): Promise<SchoolGradingCompletion> {
    const result = await gradingProjectionServices.getSchoolGradingCompletion(schoolId, viewDate);

    await logGradingAudit({
      action: 'grading_completion_read',
      entityId: schoolId,
      executorId: auditCtx?.actorId,
      metadata: {
        schoolId,
        viewDate,
        reason: auditCtx?.reason ?? null,
        accessKind: auditCtx?.accessKind ?? 'institutional_read',
      },
    });

    return result;
  },

  /**
   * @authority read Grade
   */
  async getSchoolPublishedGradingCompletion(
    schoolId: string,
    viewDate: string,
    auditCtx?: GradingAuditContext,
  ): Promise<PublishedSchoolGradingCompletion> {
    const result = await gradingProjectionServices.getSchoolPublishedGradingCompletion(
      schoolId,
      viewDate,
    );

    await logGradingAudit({
      action: 'grading_published_completion_read',
      entityId: schoolId,
      executorId: auditCtx?.actorId,
      metadata: {
        schoolId,
        viewDate,
        reason: auditCtx?.reason ?? null,
        accessKind: auditCtx?.accessKind ?? 'institutional_read',
      },
    });

    return result;
  },

  /**
   * @authority read Classroom
   */
  async getGradingSettings(classroomId: string): Promise<ClassroomGradingSettings> {
    return educational.grading.getGradingSettings(classroomId);
  },

  /**
   * @authority update Classroom
   */
  async updateGradingSettings(
    classroomId: string,
    settings: Partial<ClassroomGradingSettings>,
  ): Promise<ClassroomGradingSettings> {
    return educational.grading.updateGradingSettings(classroomId, settings);
  },

  /**
   * @authority delete Grade
   */
  async deleteGrade(gradeId: string): Promise<void> {
    await logGradingAudit({
      action: 'grade_deleted',
      entityId: gradeId,
    });
    return educational.grading.deleteGrade(gradeId);
  },
};

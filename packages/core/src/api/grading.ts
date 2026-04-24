import {
  annotateGradesWithPublicationState,
  GRADE_LIFECYCLE_ACTIONS,
  type GradeLifecycleAuditRow,
  type GradePublicationSnapshot,
  selectLatestPublishedSnapshots,
} from '../lib/gradePublication';
import type {
  ClassroomGradingSettings,
  Grade,
  GradebookSnapshot,
  PublishedSchoolGradingCompletion,
  PublishedStudentGradesSnapshot,
  SchoolGradingCompletion,
} from '../logic/schemas/grading.schema';
import { educationalServices } from '../native/runtimes/educational.runtime';
import { gradingProjectionServices } from '../native/runtimes/gradingProjection.runtime';
import { supabase } from '../native/supabase';
import { gradingContract } from './grading.contract';

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

  const { error } = await supabase.from('audit_logs').insert({
    action,
    entity_id: entityId,
    target_id: entityId,
    entity_type: 'grade',
    executor_id: executorId,
    metadata: metadata ?? {},
  });

  if (error) {
    console.warn('Failed to record grading audit event', error);
  }
};

const getGradeLifecycleRows = async (gradeIds: string[]): Promise<GradeLifecycleAuditRow[]> => {
  if (gradeIds.length === 0) return [];

  const { data, error } = await supabase
    .from('audit_logs')
    .select('action, entity_id, created_at, metadata')
    .eq('entity_type', 'grade')
    .in('entity_id', gradeIds)
    .in('action', [...GRADE_LIFECYCLE_ACTIONS]);

  if (error) {
    console.warn('Failed to fetch grade lifecycle rows', error);
    return [];
  }

  return (data ?? []) as GradeLifecycleAuditRow[];
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
  publishedAt: string;
  publishedBy?: string;
  action: 'grade_published' | 'grade_revised' | 'grade_overridden';
}) => ({
  ...grade,
  publication_state: 'published' as const,
  published_at: publishedAt,
  published_by: publishedBy ?? null,
  publication_action: action,
});

const getCurrentViewDate = () => new Date().toISOString().slice(0, 10);

export const gradingAPI = {
  /**
   * @authority create Grade
   * @deprecated Prefer saveGradeDraft for explicit temporal authoring semantics.
   */
  async saveGradeDraft(
    studentId: string,
    classroomId: string,
    marks: number,
    assignmentId?: string,
    feedback?: string,
    audit?: GradingAuditContext,
  ): Promise<Grade> {
    const existing = (await educationalServices.grading.getClassroomGrades(classroomId)).find(
      (grade) =>
        grade.student_id === studentId && (grade.assignment_id ?? null) === (assignmentId ?? null),
    );

    const saved = await educationalServices.grading.submitGrade(
      studentId,
      classroomId,
      marks,
      assignmentId,
      feedback,
    );

    await logGradingAudit({
      action: 'grade_draft_saved',
      entityId: saved.id,
      executorId: audit?.actorId,
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
        reason: audit?.reason ?? null,
        accessKind: audit?.accessKind ?? 'teacher_authoring',
      },
    });

    return {
      ...saved,
      publication_state: 'draft',
      published_at: null,
      published_by: null,
      publication_action: 'grade_draft_saved',
    };
  },

  /**
   * @authority create Grade
   */
  async submitGrade(
    studentId: string,
    classroomId: string,
    marks: number,
    assignmentId?: string,
    feedback?: string,
    audit?: GradingAuditContext,
  ): Promise<Grade> {
    return gradingAPI.saveGradeDraft(studentId, classroomId, marks, assignmentId, feedback, audit);
  },

  /**
   * @authority publish Grade
   */
  async publishGrade(gradeId: string, audit?: GradingAuditContext): Promise<Grade> {
    const grade = await educationalServices.grading.getById(gradeId);
    const publishedAt = new Date().toISOString();

    await logGradingAudit({
      action: 'grade_published',
      entityId: grade.id,
      executorId: audit?.actorId,
      metadata: {
        snapshot: buildPublicationSnapshot({
          grade,
          publishedAt,
          publishedBy: audit?.actorId,
          action: 'grade_published',
        }),
        publicationState: 'published',
        publishedAt,
        publishedBy: audit?.actorId ?? null,
        classroomId: grade.classroom_id,
        studentId: grade.student_id,
        assignmentId: grade.assignment_id ?? null,
        reason: audit?.reason ?? 'grade_publish',
        accessKind: audit?.accessKind ?? 'teacher_authoring',
      },
    });

    return {
      ...grade,
      publication_state: 'published',
      published_at: publishedAt,
      published_by: audit?.actorId ?? null,
      publication_action: 'grade_published',
    };
  },

  /**
   * @authority update Grade
   */
  async revisePublishedGrade(
    gradeId: string,
    marks: number,
    feedback?: string,
    audit?: GradingAuditContext,
  ): Promise<Grade> {
    const previous = await educationalServices.grading.getById(gradeId);
    const revised = await educationalServices.grading.reviseGrade(gradeId, marks, feedback);
    const publishedAt = new Date().toISOString();

    await logGradingAudit({
      action: 'grade_revised',
      entityId: revised.id,
      executorId: audit?.actorId,
      metadata: {
        snapshot: buildPublicationSnapshot({
          grade: revised,
          publishedAt,
          publishedBy: audit?.actorId,
          action: 'grade_revised',
        }),
        publicationState: 'published',
        publishedAt,
        publishedBy: audit?.actorId ?? null,
        classroomId: revised.classroom_id,
        studentId: revised.student_id,
        assignmentId: revised.assignment_id ?? null,
        previousMarks: previous.marks,
        nextMarks: revised.marks,
        reason: audit?.reason ?? 'grade_revision',
        accessKind: audit?.accessKind ?? 'teacher_authoring',
      },
    });

    return {
      ...revised,
      publication_state: 'published',
      published_at: publishedAt,
      published_by: audit?.actorId ?? null,
      publication_action: 'grade_revised',
    };
  },

  /**
   * @authority override Grade
   */
  async overrideGrade(
    gradeId: string,
    marks: number,
    feedback?: string,
    audit?: GradingAuditContext,
  ): Promise<Grade> {
    const previous = await educationalServices.grading.getById(gradeId);
    const overridden = await educationalServices.grading.reviseGrade(gradeId, marks, feedback);
    const publishedAt = new Date().toISOString();

    await logGradingAudit({
      action: 'grade_overridden',
      entityId: overridden.id,
      executorId: audit?.actorId,
      metadata: {
        snapshot: buildPublicationSnapshot({
          grade: overridden,
          publishedAt,
          publishedBy: audit?.actorId,
          action: 'grade_overridden',
        }),
        publicationState: 'published',
        publishedAt,
        publishedBy: audit?.actorId ?? null,
        classroomId: overridden.classroom_id,
        studentId: overridden.student_id,
        assignmentId: overridden.assignment_id ?? null,
        previousMarks: previous.marks,
        nextMarks: overridden.marks,
        reason: audit?.reason ?? 'grade_override',
        accessKind: audit?.accessKind ?? 'institutional_read',
      },
    });

    return {
      ...overridden,
      publication_state: 'published',
      published_at: publishedAt,
      published_by: audit?.actorId ?? null,
      publication_action: 'grade_overridden',
    };
  },

  /**
   * @authority read Grade
   * @deprecated Prefer getPublishedStudentGrades or getStudentGradeTimeline depending on consumer.
   */
  async getReportCard(studentId: string): Promise<Grade[]> {
    return gradingAPI.getStudentGradeTimeline(studentId);
  },

  /**
   * @authority read Grade
   * @deprecated Prefer getGradebookSnapshot for temporal classroom reads.
   */
  async getClassroomGrades(classroomId: string): Promise<Grade[]> {
    const snapshot = await gradingAPI.getGradebookSnapshot(classroomId, getCurrentViewDate());
    return snapshot.grades;
  },

  /**
   * @authority read Grade
   */
  async getGradebookSnapshot(classroomId: string, viewDate: string): Promise<GradebookSnapshot> {
    const [grades, gradingSettings] = await Promise.all([
      educationalServices.grading.getClassroomGrades(classroomId),
      educationalServices.grading.getGradingSettings(classroomId),
    ]);
    const annotated = await getAnnotatedGrades(grades);

    return {
      classroomId,
      viewDate,
      grades: annotated.filter((grade) => grade.updated_at <= `${viewDate}T23:59:59.999Z`),
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
      await educationalServices.grading.getReportCard(studentId),
    );
    return grades.filter((grade) => {
      if (options?.classroomId && grade.classroom_id !== options.classroomId) return false;
      if (options?.fromDate && grade.updated_at < `${options.fromDate}T00:00:00.000Z`) return false;
      if (options?.toDate && grade.updated_at > `${options.toDate}T23:59:59.999Z`) return false;
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
    const grades = await educationalServices.grading.getReportCard(studentId);
    const lifecycleRows = await getGradeLifecycleRows(grades.map((grade) => grade.id));
    const published = selectLatestPublishedSnapshots(lifecycleRows).filter((grade) => {
      if (grade.student_id !== studentId) return false;
      if (options?.classroomId && grade.classroom_id !== options.classroomId) return false;
      const publishedAt = grade.published_at ?? grade.updated_at;
      return publishedAt <= `${viewDate}T23:59:59.999Z`;
    });

    return {
      studentId,
      viewDate,
      grades: published,
    };
  },

  /**
   * @authority read Grade
   */
  async getSchoolGradingCompletion(
    schoolId: string,
    viewDate: string,
    audit?: GradingAuditContext,
  ): Promise<SchoolGradingCompletion> {
    const result = await gradingProjectionServices.getSchoolGradingCompletion(schoolId, viewDate);

    await logGradingAudit({
      action: 'grading_completion_read',
      entityId: schoolId,
      executorId: audit?.actorId,
      metadata: {
        schoolId,
        viewDate,
        reason: audit?.reason ?? null,
        accessKind: audit?.accessKind ?? 'institutional_read',
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
    audit?: GradingAuditContext,
  ): Promise<PublishedSchoolGradingCompletion> {
    const result = await gradingProjectionServices.getSchoolPublishedGradingCompletion(
      schoolId,
      viewDate,
    );

    await logGradingAudit({
      action: 'grading_published_completion_read',
      entityId: schoolId,
      executorId: audit?.actorId,
      metadata: {
        schoolId,
        viewDate,
        reason: audit?.reason ?? null,
        accessKind: audit?.accessKind ?? 'institutional_read',
      },
    });

    return result;
  },

  /**
   * @authority read Classroom
   */
  async getGradingSettings(classroomId: string): Promise<ClassroomGradingSettings> {
    return educationalServices.grading.getGradingSettings(classroomId);
  },

  /**
   * @authority update Classroom
   */
  async updateGradingSettings(
    classroomId: string,
    settings: Partial<ClassroomGradingSettings>,
  ): Promise<ClassroomGradingSettings> {
    return educationalServices.grading.updateGradingSettings(classroomId, settings);
  },

  /**
   * @authority delete Grade
   */
  async deleteGrade(gradeId: string): Promise<void> {
    await logGradingAudit({
      action: 'grade_deleted',
      entityId: gradeId,
    });
    return educationalServices.grading.deleteGrade(gradeId);
  },
};

void gradingContract;

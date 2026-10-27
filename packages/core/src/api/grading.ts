import { gradingProjectionServices } from '@repo/core/api/runtimes/gradingProjection.runtime';
import { readLocalFirst, writeLocalFirst } from '@repo/core/api/dataGateway';
import { orpcClient } from '@repo/core/api/orpcClient';
import { GradeMarkSchema } from '@repo/core/logic/schemas/grade-domain.schema';
import { APIError } from '@repo/core/types/API';
import { z } from 'zod';

/**
 * GRADING API (Sovereign RPC Proxy)
 *
 * @deprecated Prefer direct use of `orpcClient.grading.*` or domain hooks (`useGradebook`).
 * Retained for backward-compatible call sites under the Strangler Fig migration protocol.
 */

type StudentGradeMarkScope = {
  studentId: string;
  schoolId: string;
  academicCycleId: string;
  termId?: string;
  subjectId?: string;
};

type GradeMarkSubmission = StudentGradeMarkScope & {
  gradeClassId: string;
  termId: string;
  subjectId: string;
  marksEarned: number;
  maxPoints: number;
  assignmentId?: string;
  submissionId?: string;
  idempotencyKey?: string;
  feedback?: string;
};

const gradeMarkCollectionSchema = z.array(GradeMarkSchema);
type GradebookLifecycleScope = Omit<StudentGradeMarkScope, 'studentId'> & { gradeClassId: string };

function parseGradeMarkResponse(payload: unknown, action: string) {
  const parsed = GradeMarkSchema.safeParse(payload);
  if (!parsed.success) {
    throw new APIError(
      `${action}: Sanctuary returned an invalid GradeMark`,
      'INVALID_GRADE_MARK_RESPONSE',
    );
  }
  return parsed.data;
}

/**
 * @deprecated Use `orpcClient.grading` or `useGradebook` directly.
 */
export const gradingAPI = {
  async getGradebookSnapshot(scope: GradebookLifecycleScope, _viewDate?: string) {
    if (!scope.schoolId || !scope.academicCycleId || !scope.gradeClassId) {
      throw new APIError(
        'Gradebook snapshot requires schoolId, academicCycleId, and gradeClassId',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    const cacheKey = `gradebook:snapshot:${scope.schoolId}:${scope.academicCycleId}:${scope.gradeClassId}:${scope.termId ?? 'all'}:${scope.subjectId ?? 'all'}`;
    const result = await readLocalFirst<{ gradeMarks: any[]; gradingSettings: any }>({
      key: cacheKey,
      ttl: 60 * 60 * 1000,
      fetchRemote: async () => {
        const gradeMarks = await orpcClient.grading.getClassroomGrades({
          query: {
            schoolId: scope.schoolId,
            academicCycleId: scope.academicCycleId,
            gradeClassId: scope.gradeClassId,
            ...(scope.termId ? { termId: scope.termId } : {}),
            ...(scope.subjectId ? { subjectId: scope.subjectId } : {}),
          },
        });

        const gradingSettings = await orpcClient.grading.getGradingSettings({
          params: { classroomId: scope.gradeClassId },
        });

        return {
          gradeMarks,
          gradingSettings,
        };
      },
    });

    return result ?? { gradeMarks: [], gradingSettings: null };
  },

  async updateGradingSettings(classroomId: string, settings: any) {
    return orpcClient.grading.updateGradingSettings({
      params: { classroomId },
      body: { grading_mode: settings.grading_mode, show_ranks: settings.show_ranks },
    });
  },

  async saveGradeDraft(input: GradeMarkSubmission, _auditCtx?: any) {
    if (
      !input.schoolId ||
      !input.academicCycleId ||
      !input.gradeClassId ||
      !input.termId ||
      !input.subjectId
    ) {
      throw new APIError(
        'Saving a GradeMark requires the complete academic lifecycle context',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    return parseGradeMarkResponse(
      await orpcClient.grading.submitGrade({ body: input }),
      'Failed to save GradeMark draft',
    );
  },

  async publishGrade(gradeId: string, _auditCtx?: any) {
    if (!gradeId) {
      throw new APIError('Publishing a GradeMark requires its id', 'MISSING_GRADEMARK_ID');
    }

    return parseGradeMarkResponse(
      await orpcClient.grading.publishGrade({ params: { id: gradeId } }),
      'Failed to publish GradeMark',
    );
  },
  /**
   * [LOUD-FAILURE] Renamed from getReportCard.
   */
  async fetchStudentReport(scope: StudentGradeMarkScope) {
    if (!scope.studentId || !scope.schoolId || !scope.academicCycleId) {
      throw new APIError(
        'Fetching a report card requires studentId, schoolId, and academicCycleId',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    const payload = await orpcClient.grading.getReportCard({
      query: {
        studentId: scope.studentId,
        schoolId: scope.schoolId,
        academicCycleId: scope.academicCycleId,
        ...(scope.termId ? { termId: scope.termId } : {}),
        ...(scope.subjectId ? { subjectId: scope.subjectId } : {}),
      },
    });
    const parsed = gradeMarkCollectionSchema.safeParse(payload);
    if (!parsed.success) {
      throw new APIError(
        'Failed to fetch report card: Sanctuary returned invalid GradeMarks',
        'INVALID_GRADE_MARK_RESPONSE',
      );
    }
    return parsed.data;
  },

  /**
   * [LOUD-FAILURE] Renamed from submitGrade.
   */
  async recordAcademicMark(params: GradeMarkSubmission) {
    if (
      !params.schoolId ||
      !params.academicCycleId ||
      !params.gradeClassId ||
      !params.termId ||
      !params.subjectId
    ) {
      throw new APIError(
        'Submitting a GradeMark requires the complete academic lifecycle context',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    return writeLocalFirst(params, {
      queueKey: `grading:record:${params.gradeClassId}:${params.studentId}:${params.subjectId}:${params.termId}`,
      optimistic: {
        id: `opt_${Date.now()}`,
        student_id: params.studentId,
        school_id: params.schoolId,
        academic_cycle_id: params.academicCycleId,
        grade_class_id: params.gradeClassId,
        term_id: params.termId,
        subject_id: params.subjectId,
        marks_earned: params.marksEarned,
        max_points: params.maxPoints,
        percentage: (params.marksEarned / params.maxPoints) * 100,
        gpa: (params.marksEarned / params.maxPoints) * 4,
        letter_grade: 'A',
        publication_state: 'draft',
        graded_by: 'local_teacher',
        graded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      enqueueLocal: async (_payload) => {
        // Enqueue to local outbox mutation queue
      },
      commitRemote: async (body) => {
        return parseGradeMarkResponse(
          await orpcClient.grading.submitGrade({ body }),
          'Failed to submit GradeMark',
        );
      },
    });
  },

  /**
   * [LOUD-FAILURE] Renamed from publishGrade.
   */
  async finalizeAcademicRecord(id: string) {
    if (!id) {
      throw new APIError('Publishing a GradeMark requires its id', 'MISSING_GRADEMARK_ID');
    }

    return parseGradeMarkResponse(
      await orpcClient.grading.publishGrade({ params: { id } }),
      'Failed to publish GradeMark',
    );
  },

  async getSchoolPublishedGradingCompletion(
    schoolId: string,
    viewDate: string,
    _options?: any,
  ) {
    return gradingProjectionServices.getSchoolPublishedGradingCompletion(schoolId, viewDate);
  },
};

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_GRADEBOOK_ROSTER } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'gradebook',
  ghostMethods: ['getRoster'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_GRADEBOOK_ROSTER,
});

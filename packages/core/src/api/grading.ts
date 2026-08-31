import { orpcClient } from '@repo/core/api/orpcClient';
import { GradeMarkSchema } from '@repo/core/logic/schemas/grade-domain.schema';
import { APIError } from '@repo/core/types/API';
import { z } from 'zod';

/**
 * GRADING API (Sovereign RPC Proxy)
 *
 * This module siphons Grading requests to the Sanctuary API.
 * [BREAKING] Renamed methods to enforce Sovereign naming standards.
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

export const gradingAPI = {
  async getGradebookSnapshot(scope: GradebookLifecycleScope, _viewDate?: string) {
    if (!scope.schoolId || !scope.academicCycleId || !scope.gradeClassId) {
      throw new APIError(
        'Gradebook snapshot requires schoolId, academicCycleId, and gradeClassId',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

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

    return parseGradeMarkResponse(
      await orpcClient.grading.submitGrade({ body: params }),
      'Failed to submit GradeMark',
    );
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
};

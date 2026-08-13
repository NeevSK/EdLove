import { APIError } from '@repo/core/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { GradeMarkSchema } from '@repo/core/logic/schemas/grade-domain.schema';
import { z } from 'zod';

/**
 * GRADING API (Sovereign RPC Proxy)
 *
 * This module siphons Grading requests to the Sanctuary API.
 * [BREAKING] Renamed methods to enforce Sovereign naming standards.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

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

async function parseGradeMarkResponse(response: Response, action: string) {
  if (!response.ok) {
    throw new APIError(`${action}: ${response.statusText || 'request failed'}`, response.status.toString());
  }

  const payload: unknown = await response.json();
  const parsed = GradeMarkSchema.safeParse(payload);
  if (!parsed.success) {
    throw new APIError(`${action}: Sanctuary returned an invalid GradeMark`, 'INVALID_GRADE_MARK_RESPONSE');
  }
  return parsed.data;
}

export const gradingAPI = {
  async getGradebookSnapshot(
    scope: GradebookLifecycleScope,
    _viewDate?: string,
  ) {
    if (!scope.schoolId || !scope.academicCycleId || !scope.gradeClassId) {
      throw new APIError(
        'Gradebook snapshot requires schoolId, academicCycleId, and gradeClassId',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    const response = await (client.api as any).grading.classroom.$get({
      query: {
        schoolId: scope.schoolId,
        academicCycleId: scope.academicCycleId,
        gradeClassId: scope.gradeClassId,
        ...(scope.termId ? { termId: scope.termId } : {}),
        ...(scope.subjectId ? { subjectId: scope.subjectId } : {}),
      },
    });
    if (!response.ok) {
      throw new APIError('Failed to fetch GradeMark snapshot', response.status.toString());
    }
    const gradeMarks = gradeMarkCollectionSchema.parse(await response.json());

    const { data: settingsData } = await supabase
      .from('classroom_grading_settings')
      .select('*')
      .eq('classroom_id', scope.gradeClassId)
      .maybeSingle();

    const gradingSettings = settingsData || {
      classroom_id: scope.gradeClassId,
      grading_mode: 'both',
      show_ranks: true,
    };

    return {
      gradeMarks,
      gradingSettings,
    };
  },

  async updateGradingSettings(classroomId: string, settings: any) {
    const { data, error } = await supabase
      .from('classroom_grading_settings')
      .upsert({ classroom_id: classroomId, ...settings })
      .select()
      .single();

    if (error) throw new APIError('Failed to update grading settings', error.code);
    return data;
  },

  async saveGradeDraft(input: GradeMarkSubmission, _auditCtx?: any) {
    if (!input.schoolId || !input.academicCycleId || !input.gradeClassId || !input.termId || !input.subjectId) {
      throw new APIError(
        'Saving a GradeMark requires the complete academic lifecycle context',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    const response = await (client.api as any).grading.$post({
      json: input,
    });
    return parseGradeMarkResponse(response, 'Failed to save GradeMark draft');
  },

  async publishGrade(gradeId: string, _auditCtx?: any) {
    if (!gradeId) {
      throw new APIError('Publishing a GradeMark requires its id', 'MISSING_GRADEMARK_ID');
    }

    const response = await (client.api as any).grading[':id'].publish.$post({
      param: { id: gradeId },
    });
    return parseGradeMarkResponse(response, 'Failed to publish GradeMark');
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

    const res = await (client.api as any).grading['report-card'].$get({
      query: {
        studentId: scope.studentId,
        schoolId: scope.schoolId,
        academicCycleId: scope.academicCycleId,
        ...(scope.termId ? { termId: scope.termId } : {}),
        ...(scope.subjectId ? { subjectId: scope.subjectId } : {}),
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch report card', res.status.toString());
    }

    const payload = gradeMarkCollectionSchema.safeParse(await res.json());
    if (!payload.success) {
      throw new APIError('Failed to fetch report card: Sanctuary returned invalid GradeMarks', 'INVALID_GRADE_MARK_RESPONSE');
    }
    return payload.data;
  },

  /**
   * [LOUD-FAILURE] Renamed from submitGrade.
   */
  async recordAcademicMark(params: GradeMarkSubmission) {
    if (!params.schoolId || !params.academicCycleId || !params.gradeClassId || !params.termId || !params.subjectId) {
      throw new APIError(
        'Submitting a GradeMark requires the complete academic lifecycle context',
        'MISSING_GRADEMARK_LIFECYCLE_CONTEXT',
      );
    }

    const res = await (client.api as any).grading.$post({
      json: params,
    });

    return parseGradeMarkResponse(res, 'Failed to submit GradeMark');
  },

  /**
   * [LOUD-FAILURE] Renamed from publishGrade.
   */
  async finalizeAcademicRecord(id: string) {
    if (!id) {
      throw new APIError('Publishing a GradeMark requires its id', 'MISSING_GRADEMARK_ID');
    }

    const res = await (client.api as any).grading[':id'].publish.$post({
      param: { id },
    });
    return parseGradeMarkResponse(res, 'Failed to publish GradeMark');
  },
};

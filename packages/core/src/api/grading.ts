import { calculateRanks, marksToGPA } from '@/lib/grading';
import { APIError } from '@/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@/api/base';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase } from '@/api/supabase';

/**
 * GRADING API (Sovereign RPC Proxy)
 *
 * This module siphons Grading requests to the Sanctuary API.
 * [BREAKING] Renamed methods to enforce Sovereign naming standards.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const gradingAPI = {
  async getGradebookSnapshot(classroomId: string, _viewDate?: string) {
    const { data: gradesData, error: gradesError } = await supabase
      .from('grades')
      .select('*')
      .eq('classroom_id', classroomId);

    if (gradesError) throw new APIError('Failed to fetch snapshot grades', gradesError.code);

    const { data: settingsData } = await supabase
      .from('classroom_grading_settings')
      .select('*')
      .eq('classroom_id', classroomId)
      .maybeSingle();

    const gradingSettings = settingsData || {
      classroom_id: classroomId,
      grading_mode: 'both',
      show_ranks: true,
    };

    const gradesWithRanks = calculateRanks(gradesData || []);

    return {
      grades: gradesWithRanks,
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

  async saveGradeDraft(
    studentId: string,
    classroomId: string,
    marks: number,
    assignmentId?: string,
    feedback?: string,
    _auditCtx?: any,
  ) {
    const { grade, gpa } = marksToGPA(marks);
    const { data, error } = await supabase
      .from('grades')
      .upsert({
        student_id: studentId,
        classroom_id: classroomId,
        assignment_id: assignmentId || null,
        marks,
        grade,
        gpa,
        feedback: feedback || null,
        graded_by: (await supabase.auth.getSession()).data.session?.user?.id || 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw new APIError('Failed to save draft grade', error.code);
    return data;
  },

  async publishGrade(gradeId: string, _auditCtx?: any) {
    const { data, error } = await supabase
      .from('grades')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', gradeId)
      .select()
      .single();

    if (error) throw new APIError('Failed to publish grade', error.code);
    return data;
  },
  /**
   * [LOUD-FAILURE] Renamed from getReportCard.
   */
  async fetchStudentReport(studentId: string) {
    const res = await (client.api as any).grading['report-card'].$get({
      query: { studentId },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch report card', res.status.toString());
    }

    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from submitGrade.
   */
  async recordAcademicMark(params: {
    studentId: string;
    classroomId: string;
    marks: number;
    assignmentId?: string;
    feedback?: string;
  }) {
    const res = await (client.api as any).grading.$post({
      json: params,
    });

    if (!res.ok) {
      throw new APIError('Failed to submit grade', res.status.toString());
    }

    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from publishGrade.
   */
  async finalizeAcademicRecord(id: string) {
    const res = await (client.api as any).grading[':id'].publish.$post({
      param: { id },
    });

    if (!res.ok) {
      throw new APIError('Failed to publish grade', res.status.toString());
    }

    return await res.json();
  },
};

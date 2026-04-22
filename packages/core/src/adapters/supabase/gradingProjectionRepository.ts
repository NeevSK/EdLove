import {
  type PublishedSchoolGradingCompletion,
  PublishedSchoolGradingCompletionSchema,
  type SchoolGradingCompletion,
  SchoolGradingCompletionSchema,
} from '../../api/schemas/grading.schema';
import type { GradingProjectionRepository } from '../../domains/gradingProjection/ports';
import { selectLatestPublishedSnapshots } from '../../lib/gradePublication';
import { supabase } from '../../lib/supabase';

export const supabaseGradingProjectionRepository: GradingProjectionRepository = {
  async getSchoolGradingCompletion(
    schoolId: string,
    viewDate: string,
  ): Promise<SchoolGradingCompletion> {
    try {
      const { data: classrooms, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('school_id', schoolId);

      if (classroomsError || !classrooms) {
        return SchoolGradingCompletionSchema.parse({
          schoolId,
          viewDate,
          totalClassrooms: 0,
          classroomsWithGrades: 0,
          classroomsWithoutGrades: 0,
          gradedEntries: 0,
        });
      }

      const classroomIds = classrooms.map((row) => row.id);
      if (classroomIds.length === 0) {
        return SchoolGradingCompletionSchema.parse({
          schoolId,
          viewDate,
          totalClassrooms: 0,
          classroomsWithGrades: 0,
          classroomsWithoutGrades: 0,
          gradedEntries: 0,
        });
      }

      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('classroom_id, updated_at')
        .in('classroom_id', classroomIds)
        .lte('updated_at', `${viewDate}T23:59:59.999Z`);

      if (gradesError) {
        throw gradesError;
      }

      const gradesData = grades ?? [];
      const classroomsWithGrades = new Set(gradesData.map((row) => row.classroom_id)).size;

      return SchoolGradingCompletionSchema.parse({
        schoolId,
        viewDate,
        totalClassrooms: classroomIds.length,
        classroomsWithGrades,
        classroomsWithoutGrades: classroomIds.length - classroomsWithGrades,
        gradedEntries: gradesData.length,
      });
    } catch (error) {
      console.error('[gradingProjection] getSchoolGradingCompletion unexpected:', error);
      return SchoolGradingCompletionSchema.parse({
        schoolId,
        viewDate,
        totalClassrooms: 0,
        classroomsWithGrades: 0,
        classroomsWithoutGrades: 0,
        gradedEntries: 0,
      });
    }
  },
  async getSchoolPublishedGradingCompletion(
    schoolId: string,
    viewDate: string,
  ): Promise<PublishedSchoolGradingCompletion> {
    try {
      const { data: classrooms, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('school_id', schoolId);

      if (classroomsError || !classrooms) {
        return PublishedSchoolGradingCompletionSchema.parse({
          schoolId,
          viewDate,
          totalClassrooms: 0,
          classroomsWithPublishedGrades: 0,
          classroomsWithoutPublishedGrades: 0,
          publishedEntries: 0,
        });
      }

      const classroomIds = classrooms.map((row) => row.id);
      if (classroomIds.length === 0) {
        return PublishedSchoolGradingCompletionSchema.parse({
          schoolId,
          viewDate,
          totalClassrooms: 0,
          classroomsWithPublishedGrades: 0,
          classroomsWithoutPublishedGrades: 0,
          publishedEntries: 0,
        });
      }

      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('id')
        .in('classroom_id', classroomIds);

      if (gradesError || !grades || grades.length === 0) {
        return PublishedSchoolGradingCompletionSchema.parse({
          schoolId,
          viewDate,
          totalClassrooms: classroomIds.length,
          classroomsWithPublishedGrades: 0,
          classroomsWithoutPublishedGrades: classroomIds.length,
          publishedEntries: 0,
        });
      }

      const gradeIds = grades.map((row) => row.id);
      const { data: auditRows, error: auditError } = await supabase
        .from('audit_logs')
        .select('action, entity_id, created_at, metadata')
        .eq('entity_type', 'grade')
        .in('entity_id', gradeIds)
        .lte('created_at', `${viewDate}T23:59:59.999Z`);

      if (auditError) {
        throw auditError;
      }

      const publishedSnapshots = selectLatestPublishedSnapshots(auditRows ?? []);
      const classroomsWithPublishedGrades = new Set(
        publishedSnapshots.map((grade) => grade.classroom_id),
      ).size;

      return PublishedSchoolGradingCompletionSchema.parse({
        schoolId,
        viewDate,
        totalClassrooms: classroomIds.length,
        classroomsWithPublishedGrades,
        classroomsWithoutPublishedGrades: classroomIds.length - classroomsWithPublishedGrades,
        publishedEntries: publishedSnapshots.length,
      });
    } catch (error) {
      console.error('[gradingProjection] getSchoolPublishedGradingCompletion unexpected:', error);
      return PublishedSchoolGradingCompletionSchema.parse({
        schoolId,
        viewDate,
        totalClassrooms: 0,
        classroomsWithPublishedGrades: 0,
        classroomsWithoutPublishedGrades: 0,
        publishedEntries: 0,
      });
    }
  },
};

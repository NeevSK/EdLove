import type {
  PublishedSchoolGradingCompletion,
  SchoolGradingCompletion,
} from '@repo/core/logic/schemas/grading.schema';

export interface GradingProjectionRepository {
  getSchoolGradingCompletion(schoolId: string, viewDate: string): Promise<SchoolGradingCompletion>;
  getSchoolPublishedGradingCompletion(
    schoolId: string,
    viewDate: string,
  ): Promise<PublishedSchoolGradingCompletion>;
}

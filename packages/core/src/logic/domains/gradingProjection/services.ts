import type {
  PublishedSchoolGradingCompletion,
  SchoolGradingCompletion,
} from '@repo/core/logic/schemas/grading.schema';
import type { GradingProjectionRepository } from '@repo/core/logic/domains/gradingProjection/ports';

export interface GradingProjectionServices {
  getSchoolGradingCompletion(schoolId: string, viewDate: string): Promise<SchoolGradingCompletion>;
  getSchoolPublishedGradingCompletion(
    schoolId: string,
    viewDate: string,
  ): Promise<PublishedSchoolGradingCompletion>;
}

export function createGradingProjectionServices(
  repository: GradingProjectionRepository,
): GradingProjectionServices {
  return {
    getSchoolGradingCompletion: (schoolId, viewDate) =>
      repository.getSchoolGradingCompletion(schoolId, viewDate),
    getSchoolPublishedGradingCompletion: (schoolId, viewDate) =>
      repository.getSchoolPublishedGradingCompletion(schoolId, viewDate),
  };
}

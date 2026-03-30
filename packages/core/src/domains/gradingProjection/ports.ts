import type { PublishedSchoolGradingCompletion, SchoolGradingCompletion } from '../../api/schemas/grading.schema';

export interface GradingProjectionRepository {
    getSchoolGradingCompletion(schoolId: string, viewDate: string): Promise<SchoolGradingCompletion>;
    getSchoolPublishedGradingCompletion(schoolId: string, viewDate: string): Promise<PublishedSchoolGradingCompletion>;
}

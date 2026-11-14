import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { classrooms, schools } from '@repo/core/adapters/powersync/schema';
import { eq } from 'drizzle-orm';

/**
 * Retrieves dynamic attributes for a resource from the local SQLite/PowerSync cache.
 *
 * This leaf module is shared by platform-specific permission evaluators so native
 * resolution never selects an evaluator as its own dependency.
 */
export async function getLocalResourceAttributes(
  resourceType: string,
  resourceId: string,
): Promise<Record<string, unknown>> {
  const db = getDrizzleDB();

  try {
    switch (resourceType) {
      case 'Classroom': {
        const record = await db.query.classrooms.findFirst({
          where: eq(classrooms.id, resourceId),
        });
        return {
          school_id: record?.schoolId || '',
          teacher_id: record?.teacherId || '',
          grade_id: record?.gradeId || '',
          section_id: record?.sectionId || '',
        };
      }
      case 'School': {
        const record = await db.query.schools.findFirst({
          where: eq(schools.id, resourceId),
        });
        return {
          subscription_tier: record?.subscriptionTier || 'FREE',
          is_active: record?.isActive ?? true,
        };
      }
      default:
        return {};
    }
  } catch (error) {
    console.warn(
      `[LocalEvaluator] Failed to fetch dynamic attributes for ${resourceType}::${resourceId}:`,
      error,
    );
    return {};
  }
}

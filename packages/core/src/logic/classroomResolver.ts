import { classroomsAPI } from '@repo/core/api/classrooms';
import { orpcClient } from '@repo/core/api/orpcClient';

/**
 * Bi-directional classroom <-> grade_class resolver cache
 */
const classroomGradeClassCache = new Map<string, string>();

/**
 * Resolves a GradeClass ID from a legacy Classroom ID, choosing only among the grade
 * classes the caller may mark (getMyGradeClasses): an exact id match, or the one class
 * whose name matches the classroom's name. Returns '' when it cannot tell, so the
 * caller shows the class picker instead of writing to a guessed class.
 */
export async function resolveGradeClassFromClassroom(
  classroomId: string,
  _schoolId?: string,
): Promise<string> {
  if (!classroomId) return '';

  const cached = classroomGradeClassCache.get(classroomId);
  if (cached) return cached;

  try {
    const gradeClasses = await orpcClient.attendance.getMyGradeClasses({});
    if (Array.isArray(gradeClasses) && gradeClasses.length > 0) {
      // 1. Check if classroomId is already a valid grade_class ID
      const directMatch = gradeClasses.find((gc) => gc.id === classroomId);
      if (directMatch) {
        classroomGradeClassCache.set(classroomId, directMatch.id);
        return directMatch.id;
      }

      // 2. Fetch classroom details to match by name
      try {
        const classroom = await classroomsAPI.getById(classroomId);
        if (classroom?.name) {
          const wanted = classroom.name.trim().toLowerCase();
          const nameMatches = gradeClasses.filter((gc) => gc.name.trim().toLowerCase() === wanted);
          const nameMatch = nameMatches.length === 1 ? nameMatches[0] : undefined;
          if (nameMatch) {
            classroomGradeClassCache.set(classroomId, nameMatch.id);
            return nameMatch.id;
          }
        }
      } catch {
        // Fall through
      }

      // No "only class" fallback: a subject classroom (e.g. Science 7) is not the
      // teacher's register just because they have one grade class.
    }
  } catch {
    // Unresolved: never echo the classroom id back as if it were a grade class id.
  }

  return '';
}

/**
 * Clears the resolution cache (useful during user logout or school switch).
 */
export function clearClassroomResolutionCache(): void {
  classroomGradeClassCache.clear();
}

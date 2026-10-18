import { classroomsAPI } from '@repo/core/api/classrooms';
import { orpcClient } from '@repo/core/api/orpcClient';

/**
 * Bi-directional classroom <-> grade_class resolver cache
 */
const classroomGradeClassCache = new Map<string, string>();

/**
 * Resolves a GradeClass ID from a legacy Classroom ID.
 * If the ID is already a GradeClass ID or cannot be resolved, falls back gracefully.
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
          const nameMatch = gradeClasses.find(
            (gc) => gc.name.trim().toLowerCase() === classroom.name.trim().toLowerCase(),
          );
          if (nameMatch) {
            classroomGradeClassCache.set(classroomId, nameMatch.id);
            return nameMatch.id;
          }
        }
      } catch {
        // Fall through
      }

      // 3. If there is exactly one grade class available, map to it
      if (gradeClasses.length === 1 && gradeClasses[0]?.id) {
        classroomGradeClassCache.set(classroomId, gradeClasses[0].id);
        return gradeClasses[0].id;
      }
    }
  } catch {
    // Return original identifier on error
  }

  return classroomId;
}

/**
 * Clears the resolution cache (useful during user logout or school switch).
 */
export function clearClassroomResolutionCache(): void {
  classroomGradeClassCache.clear();
}

import { classroomsAPI } from '@repo/core/api/classrooms';
import { orpcClient } from '@repo/core/api/orpcClient';

/**
 * Bi-directional classroom <-> grade_class resolver cache
 */
const classroomGradeClassCache = new Map<string, string>();

/**
 * Resolves a GradeClass ID from a legacy Classroom ID, choosing only among the grade
 * classes the caller may mark (getMyGradeClasses):
 * 1. the id is already one of those grade classes;
 * 2. the classroom's explicit link (#149 classroom_grade_classes): used when exactly one
 *    linked class is one the caller may mark; a linked classroom never falls back to
 *    name matching;
 * 3. classrooms with no links: the one class whose name matches the classroom's name.
 * Returns '' when it cannot tell, so the caller shows the class picker instead of
 * writing to a guessed class.
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

      // 2. Explicit link first. If the links cannot be read (older server, offline),
      // fall through to the name match exactly as before.
      let links: Array<{ grade_class_id: string }> | null = null;
      try {
        links = await orpcClient.attendance.getClassroomLinks({ query: { classroomId } });
      } catch {
        links = null;
      }
      if (Array.isArray(links) && links.length > 0) {
        const markable = new Set(gradeClasses.map((gc) => gc.id));
        const usable = [...new Set(links.map((link) => link.grade_class_id))].filter((id) =>
          markable.has(id),
        );
        const [only] = usable;
        if (usable.length === 1 && only) {
          classroomGradeClassCache.set(classroomId, only);
          return only;
        }
        // Linked, but not to exactly one class this caller marks: let them pick.
        return '';
      }

      // 3. Unlinked classroom: match by name
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

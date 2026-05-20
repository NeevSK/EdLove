import { identityAPI } from '../api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import { checkLocalPermission } from '../logic/permissions/localEvaluator';
import { APIError } from '../types/API';

/**
 * requireAuth  Ensures the user is authenticated.
 */
export async function requireAuth() {
  const identity = await identityAPI.identifyActiveCitizen();
  const userId = identity?.id;
  if (!userId) {
    throw new APIError('Not authenticated', 'UNAUTHENTICATED');
  }
  return userId;
}

/**
 * requireClassroomAccess  Ensures the user has a specific capability for a classroom.
 */
export async function requireClassroomAccess(classroomId: string, capability: string) {
  const userId = await requireAuth();

  // Fetch classroom context for POA check
  const { data: classroom, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
    .from('classrooms')
    .select('teacher_id, school_id')
    .eq('id', classroomId)
    .single();

  if (error || !classroom) {
    throw new APIError('Classroom not found', 'NOT_FOUND');
  }

  const isAllowed = await checkLocalPermission({
    action: capability as any,
    resourceType: 'Classroom',
    resourceId: classroomId,
    userContext: {
      userId,
      schoolId: classroom.school_id || undefined,
    },
  });

  if (!isAllowed) {
    throw new APIError(`Unauthorized: Missing ${capability} for classroom`, 'FORBIDDEN');
  }

  return { userId, classroom };
}

/**
 * requireTeacherAccess  Ensures the user is a teacher (and optionally has school context).
 */
export async function requireTeacherAccess(schoolId?: string) {
  const userId = await requireAuth();

  const isAllowed = await checkLocalPermission({
    action: 'read',
    resourceType: 'TeacherProfile',
    resourceId: userId,
    userContext: {
      userId,
      schoolId: schoolId || undefined,
    },
  });

  if (!isAllowed) {
    throw new APIError('Unauthorized: Teacher access required', 'FORBIDDEN');
  }

  return userId;
}

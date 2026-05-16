import { identityAPI } from '../api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import { composeUserAbilities } from '../logic/permissions/composer';
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

  const ability = composeUserAbilities({
    user_id: userId,
    school_id: classroom.school_id!,
  });

  if (
    !ability.can(capability as any, 'Classroom', {
      id: classroomId,
      teacher_id: classroom.teacher_id,
      school_id: classroom.school_id,
    } as any)
  ) {
    throw new APIError(`Unauthorized: Missing ${capability} for classroom`, 'FORBIDDEN');
  }

  return { userId, classroom };
}

/**
 * requireTeacherAccess  Ensures the user is a teacher (and optionally has school context).
 */
export async function requireTeacherAccess(schoolId?: string) {
  const userId = await requireAuth();
  const ability = composeUserAbilities({ user_id: userId, school_id: schoolId });

  if (!ability.can('read', 'TeacherProfile')) {
    throw new APIError('Unauthorized: Teacher access required', 'FORBIDDEN');
  }

  return userId;
}

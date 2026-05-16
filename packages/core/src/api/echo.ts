import { APIError } from '../types/API';
import { identityAPI } from './identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

export interface StudentEcho {
  id: string;
  classroom_id: string;
  school_id: string;
  student_id: string;
  content: string;
  is_anonymous: boolean;
  is_read: boolean;
  teacher_response?: string;
  responded_by?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export const echoAPI = {
  /**
   * Send an echo (feedback) from a student to their class teacher.
   */
  async sendEcho(echo: {
    classroom_id: string;
    school_id?: string;
    content: string;
    is_anonymous: boolean;
  }): Promise<StudentEcho> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_echo_feedback')
      .insert([
        {
          ...echo,
          student_id: identity.id,
          is_read: false,
        },
      ])
      .select('*')
      .single();

    if (error) throw new APIError('Failed to send echo', error.code, error);
    return data as StudentEcho;
  },

  /**
   * Fetch echoes for a student (their own feedback history).
   */
  async getMyEchoes(): Promise<StudentEcho[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_echo_feedback')
      .select('*')
      .eq('student_id', identity.id)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch your echoes', error.code, error);
    return (data || []) as StudentEcho[];
  },

  /**
   * Fetch echoes for a classroom (Unified for student and teacher context).
   */
  async getEchoesByClassroom(classroomId: string): Promise<any[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    // Check if teacher for this classroom (simplified check for now)
    const { data: classData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classrooms')
      .select('teacher_id')
      .eq('id', classroomId)
      .single();

    const isTeacher = classData?.teacher_id === identity.id;

    let query = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_echo_feedback')
      .select(`
                *,
                student:users!classroom_echo_feedback_student_id_fkey(full_name, avatar_url)
            `)
      .eq('classroom_id', classroomId);

    if (!isTeacher) {
      // Students only see their own echoes
      query = query.eq('student_id', identity.id);
    }

    const { data, error } = await query
      .order('is_read', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch classroom echoes', error.code, error);

    return (data || []).map((echo: any) => ({
      ...echo,
      student_name: echo.is_anonymous ? 'Anonymous Soul' : echo.student?.full_name,
      student_avatar: echo.is_anonymous ? null : echo.student?.avatar_url,
    }));
  },

  /**
   * Fetch echoes for a teacher (feedback from their students).
   */
  async getTeacherEchoes(classroomId: string): Promise<StudentEcho[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_echo_feedback')
      .select(`
                *,
                student:users!classroom_echo_feedback_student_id_fkey(full_name, avatar_url)
            `)
      .eq('classroom_id', classroomId)
      .order('is_read', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch student echoes', error.code, error);

    // Handle anonymity in the API layer for safety
    return (data || []).map((echo: any) => ({
      ...echo,
      student_name: echo.is_anonymous ? 'Anonymous Soul' : echo.student?.full_name,
      student_avatar: echo.is_anonymous ? null : echo.student?.avatar_url,
    })) as (StudentEcho & { student_name: string; student_avatar?: string })[];
  },

  /**
   * Respond to an echo (Teacher action).
   */
  async respondToEcho(echoId: string, response: string): Promise<StudentEcho> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_echo_feedback')
      .update({
        teacher_response: response,
        responded_by: identity.id,
        responded_at: new Date().toISOString(),
        is_read: true,
      })
      .eq('id', echoId)
      .select('*')
      .single();

    if (error) throw new APIError('Failed to respond to echo', error.code, error);
    return data as StudentEcho;
  },

  /**
   * Mark an echo as read without responding.
   */
  async markAsRead(echoId: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_echo_feedback')
      .update({ is_read: true })
      .eq('id', echoId);

    if (error) throw new APIError('Failed to mark echo as read', error.code, error);
  },
};

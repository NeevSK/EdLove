import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { handleAPIError } from '@repo/core/logic';

export interface TeacherSentEcho {
  id: string;
  category: string;
  content: string;
  priority: string;
  is_read: boolean;
  principal_response?: string;
  responded_at?: string;
  created_at: string;
}

export const teacherFeedbackAPI = {
  async submitTeacherFeedback(input: {
    schoolId: string;
    teacherId: string;
    category: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from('school_echo_feedback').insert({
        school_id: input.schoolId,
        teacher_id: input.teacherId,
        source: 'teacher',
        category: input.category,
        content: input.content,
        priority: input.priority,
        is_read: false,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      handleAPIError(error);
      return false;
    }
  },

  async listSentEchoes(teacherId: string, limit = 10): Promise<TeacherSentEcho[]> {
    if (!teacherId) return [];

    const { data, error } = await supabase
      .from('school_echo_feedback')
      .select(
        'id, category, content, priority, is_read, principal_response, responded_at, created_at',
      )
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleAPIError(error);
      return [];
    }

    return (data ?? []) as TeacherSentEcho[];
  },
};

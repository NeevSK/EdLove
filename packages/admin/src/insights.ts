import { supabase } from '@repo/core';

export interface GradeProgress {
  grade: string;
  coverage: number;
  is_reform: boolean;
  last_updated: string;
}

export interface FeedbackEcho {
  id: string;
  school_id: string;
  source: 'teacher' | 'student';
  category: 'support' | 'morale' | 'facility' | 'recognition';
  content: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  principal_response?: string;
  responded_by?: string;
  responded_at?: string;
}

export const insightsAPI = {
  async listCurriculumProgress(schoolId: string): Promise<GradeProgress[]> {
    const { data, error } = await supabase
      .from('curriculum_progress')
      .select('*')
      .eq('school_id', schoolId)
      .order('grade', { ascending: true });

    if (error) throw error;
    return (data ?? []) as GradeProgress[];
  },

  async listFeedbackEchoes(schoolId: string, limit = 5, viewDate?: string): Promise<FeedbackEcho[]> {
    let query = supabase
      .from('school_echo_feedback')
      .select('*')
      .eq('school_id', schoolId);

    if (viewDate) {
      query = query.lte('created_at', `${viewDate}T23:59:59.999Z`);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

    if (error) throw error;
    return (data ?? []) as FeedbackEcho[];
  },

  async markEchoRead(id: string): Promise<void> {
    const { error } = await supabase.from('school_echo_feedback').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  async replyToEcho(id: string, principalId: string, response: string): Promise<string> {
    const respondedAt = new Date().toISOString();
    const { error } = await supabase
      .from('school_echo_feedback')
      .update({
        principal_response: response,
        responded_by: principalId,
        responded_at: respondedAt,
        is_read: true,
      })
      .eq('id', id);

    if (error) throw error;
    return respondedAt;
  },
};

import type { SupabaseClient } from '@supabase/supabase-js';

export const createStatsRepository = (supabase: SupabaseClient) => ({
  async getTeacherStats(teacherId: string) {
    const { data, error } = await supabase.rpc('get_teacher_stats', {
      p_teacher_id: teacherId,
    });
    if (error) {
      const { count: classroomCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);
      return {
        classrooms: classroomCount || 0,
        students: 0,
        active_lessons: 0,
      };
    }
    return data;
  },
});

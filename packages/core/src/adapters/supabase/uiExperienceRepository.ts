import { applyTemporalFilter } from '@repo/core/logic/utils/temporalUtils';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface JourneyEventRecord {
  id: string;
  timestamp: string;
  type: 'mood' | 'journal' | 'growth' | 'reward' | 'moment' | 'impact' | 'system';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  accentColor?: string;
}

export interface StudentGoalRecord {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  target_date: string;
}

export interface SnapshotMomentRecord {
  id: string;
  user_id: string;
  resonance_date: string;
  label: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PendingAttendanceItem {
  classroomId: string;
  classroomName: string;
}

export interface PendingGradingItem {
  assignmentId: string;
  assignmentTitle: string;
  classroomId: string;
  classroomName: string;
  ungradedCount: number;
}

export interface HeatmapItem {
  date: string;
  intensity: number;
  count: number;
}

export interface UIExperienceRepository {
  getMoodJourneyEvents(userId: string): Promise<JourneyEventRecord[]>;
  getJournalJourneyEvents(userId: string): Promise<JourneyEventRecord[]>;
  getGrowthJourneyEvents(userId: string): Promise<JourneyEventRecord[]>;
  getRewardJourneyEvents(userId: string): Promise<JourneyEventRecord[]>;
  getMomentJourneyEvents(userId: string): Promise<JourneyEventRecord[]>;
  getStudentGoals(userId: string): Promise<StudentGoalRecord[]>;
  createSnapshotMoment(input: {
    userId: string;
    resonanceDate: string;
    label: string;
    metadata: Record<string, unknown>;
  }): Promise<SnapshotMomentRecord>;
  getPendingActions(teacherId: string): Promise<{
    attendancePending: PendingAttendanceItem[];
    gradingPending: PendingGradingItem[];
  }>;
  getTemporalHeatmap(userId: string, range: { start: string; end: string }): Promise<HeatmapItem[]>;
}

export const createSupabaseUIExperienceRepository = (
  supabase: SupabaseClient,
): UIExperienceRepository => ({
  async getMoodJourneyEvents(userId: string): Promise<JourneyEventRecord[]> {
    let query = supabase.from('mood_logs').select('*').eq('user_id', userId);
    query = applyTemporalFilter(query, {
      column: 'created_at',
      mode: 'event_time',
      capability: 'event_stream',
    });

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch mood journey events', error.code, error);

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: item.created_at,
      type: 'mood',
      title: `Mood: ${item.mood_type}`,
      description: item.note,
      accentColor: '#F6BF8C',
    }));
  },

  async getJournalJourneyEvents(userId: string): Promise<JourneyEventRecord[]> {
    let query = supabase.from('journal_entries').select('*').eq('user_id', userId);
    query = applyTemporalFilter(query, {
      column: 'created_at',
      mode: 'event_time',
      capability: 'event_stream',
    });

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch journal journey events', error.code, error);

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: item.created_at,
      type: 'journal',
      title: item.title || 'Reflection',
      description: item.content?.slice(0, 60),
      accentColor: '#F0DBC4',
    }));
  },

  async getGrowthJourneyEvents(userId: string): Promise<JourneyEventRecord[]> {
    let query = supabase.from('growth_milestones').select('*').eq('user_id', userId);
    query = applyTemporalFilter(query, {
      column: 'created_at',
      mode: 'event_time',
      capability: 'event_stream',
    });

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch growth journey events', error.code, error);

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: item.created_at,
      type: 'growth',
      title: item.title,
      description: item.description,
      accentColor: '#688B58',
    }));
  },

  async getRewardJourneyEvents(userId: string): Promise<JourneyEventRecord[]> {
    const { data, error } = await supabase
      .from('user_rewards_versions')
      .select('id, operation, recorded_at, snapshot')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (error) throw new APIError('Failed to fetch reward journey events', error.code, error);

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: item.recorded_at,
      type: 'reward',
      title: `Rewards: ${item.operation}`,
      metadata: (item.snapshot as Record<string, unknown>) || {},
      accentColor: '#D4843A',
    }));
  },

  async getMomentJourneyEvents(userId: string): Promise<JourneyEventRecord[]> {
    const { data, error } = await supabase
      .from('whispered_moments')
      .select('id, moment_key, moment_name_en, moment_name_si, awarded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (error) throw new APIError('Failed to fetch moment journey events', error.code, error);

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: item.awarded_at,
      type: 'moment',
      title: item.moment_name_en || item.moment_key,
      accentColor: '#93785B',
    }));
  },

  async getStudentGoals(userId: string): Promise<StudentGoalRecord[]> {
    const { data, error } = await supabase
      .from('student_goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true });

    if (error) throw new APIError('Failed to fetch student goals', error.code, error);
    return data || [];
  },

  async createSnapshotMoment(input: {
    userId: string;
    resonanceDate: string;
    label: string;
    metadata: Record<string, unknown>;
  }): Promise<SnapshotMomentRecord> {
    const { data, error } = await supabase
      .from('snapshot_moments')
      .insert([
        {
          user_id: input.userId,
          resonance_date: input.resonanceDate,
          label: input.label,
          metadata: {
            ...input.metadata,
            captured_at: new Date().toISOString(),
          },
        },
      ])
      .select()
      .single();

    if (error) throw new APIError('Failed to create snapshot moment', error.code, error);
    return data;
  },

  async getPendingActions(teacherId: string): Promise<{
    attendancePending: PendingAttendanceItem[];
    gradingPending: PendingGradingItem[];
  }> {
    const maxItems = 5;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayEnd = `${today}T23:59:59`;

    const { data: classrooms, error: clsErr } = await supabase
      .from('classrooms')
      .select('id, name')
      .eq('teacher_id', teacherId)
      .limit(20);

    if (clsErr || !classrooms?.length) {
      return { attendancePending: [], gradingPending: [] };
    }

    const classroomIds = classrooms.map((c) => c.id);

    const { data: markedToday } = await supabase
      .from('attendance')
      .select('classroom_id')
      .in('classroom_id', classroomIds)
      .eq('date', today);

    const markedIds = new Set((markedToday ?? []).map((r: any) => r.classroom_id));
    const attendancePending = classrooms
      .filter((c) => !markedIds.has(c.id))
      .slice(0, maxItems)
      .map((c) => ({ classroomId: c.id, classroomName: c.name }));

    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, classroom_id, due_date')
      .in('classroom_id', classroomIds)
      .lte('due_date', todayEnd)
      .limit(30);

    if (!assignments?.length) {
      return { attendancePending, gradingPending: [] };
    }

    const assignmentIds = assignments.map((a) => a.id);
    const { data: ungraded } = await supabase
      .from('submissions')
      .select('assignment_id')
      .in('assignment_id', assignmentIds)
      .is('graded_at', null);

    if (!ungraded?.length) {
      return { attendancePending, gradingPending: [] };
    }

    const countMap: Record<string, number> = {};
    for (const s of ungraded) {
      countMap[s.assignment_id] = (countMap[s.assignment_id] ?? 0) + 1;
    }

    const clsMap: Record<string, string> = {};
    for (const c of classrooms) clsMap[c.id] = c.name;

    const gradingPending = assignments
      .filter((a) => countMap[a.id])
      .slice(0, maxItems)
      .map((a) => ({
        assignmentId: a.id,
        assignmentTitle: a.title,
        classroomId: a.classroom_id,
        classroomName: clsMap[a.classroom_id] ?? '',
        ungradedCount: countMap[a.id] ?? 0,
      }));

    return { attendancePending, gradingPending };
  },

  async getTemporalHeatmap(
    userId: string,
    range: { start: string; end: string },
  ): Promise<HeatmapItem[]> {
    const [moodRes, journalRes] = await Promise.all([
      supabase
        .from('mood_logs')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', range.start)
        .lte('created_at', range.end),
      supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', range.start)
        .lte('created_at', range.end),
    ]);

    const countsByDate: Record<string, number> = {};
    const process = (items: Array<{ created_at: string }>) => {
      for (const item of items) {
        const day = item.created_at.split('T')[0] || item.created_at;
        countsByDate[day] = (countsByDate[day] || 0) + 1;
      }
    };

    process((moodRes.data || []) as Array<{ created_at: string }>);
    process((journalRes.data || []) as Array<{ created_at: string }>);

    return Object.entries(countsByDate).map(([date, count]) => ({
      date,
      count,
      intensity: Math.min(Math.ceil(count / 2), 4),
    }));
  },
});

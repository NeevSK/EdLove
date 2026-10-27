'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '../supabase/browser';

export interface TeacherProfessionalRecord {
  id: string;
  academic_year: string;
  designation: string;
  school_name?: string;
  subjects: string[];
  classrooms_count: number;
  students_count: number;
  achievements: string[];
}

interface TeacherProfessionalHistoryRow {
  id: string;
  academic_year: string;
  designation: string;
  school: { name: string } | null;
  subjects: string[] | null;
  classrooms_count: number | null;
  students_count: number | null;
  achievements: string[] | null;
}

/** Browser-native read seam for the Self teaching-history card. */
export function useTeacherProfessionalHistory(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-professional-history', teacherId],
    enabled: Boolean(teacherId),
    queryFn: async (): Promise<TeacherProfessionalRecord[]> => {
      if (!teacherId) return [];
      const supabase = createBrowserSupabaseClient();
      if (!supabase)
        throw new Error(
          'Professional history is unavailable while browser authentication is unconfigured.',
        );

      const { data, error } = await supabase
        .from('teacher_professional_records')
        .select('*, school:schools(name)')
        .eq('teacher_id', teacherId)
        .order('academic_year', { ascending: false });
      if (error) throw new Error('Unable to load professional history.');

      return ((data ?? []) as TeacherProfessionalHistoryRow[]).map((record) => ({
        id: record.id,
        academic_year: record.academic_year,
        designation: record.designation,
        school_name: record.school?.name,
        subjects: record.subjects ?? [],
        classrooms_count: record.classrooms_count ?? 0,
        students_count: record.students_count ?? 0,
        achievements: record.achievements ?? [],
      }));
    },
  });
}
